// Edge Function para CRUD completo de pedidos con paginación
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // Inicializar cliente de Supabase con SERVICE_ROLE_KEY para bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const url = new URL(req.url)
    const method = req.method
    
    // Extraer el path correctamente (después de /functions/v1/crud-pedidos/)
    const pathParts = url.pathname.split('/').filter(p => p)
    const functionIndex = pathParts.findIndex(p => p === 'crud-pedidos')
    const path = functionIndex >= 0 ? pathParts.slice(functionIndex + 1).join('/') : ''
    
    console.log('Path extraído:', path, 'URL completa:', url.pathname)

    // ============================================
    // GET - Listar pedidos con paginación
    // ============================================
    if (method === 'GET' && path === 'pedidos') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const offset = (page - 1) * limit
      const estado = url.searchParams.get('estado')
      const idCliente = url.searchParams.get('id_cliente')

      let query = supabaseClient
        .from('pedido')
        .select(`
          *,
          cliente:cliente(
            id_cliente,
            nombre,
            email,
            telefono
          ),
          cotizacion:cotizacion(
            id_cotizacion,
            total,
            fecha_emision
          )
        `, { count: 'exact' })

      // Filtros
      if (estado) {
        query = query.eq('estado_pedido', estado)
      }
      if (idCliente) {
        query = query.eq('id_cliente', idCliente)
      }

      // Ordenar por fecha más reciente
      query = query.order('created_at', { ascending: false })

      // Paginación
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          data,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit),
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // ============================================
    // GET - Obtener pedido por ID
    // ============================================
    if (method === 'GET' && path.startsWith('pedidos/')) {
      const idPedido = path.replace('pedidos/', '')

      const { data: pedido, error: errorPedido } = await supabaseClient
        .from('pedido')
        .select(`
          *,
          cliente:cliente(*),
          cotizacion:cotizacion(*),
          detalles:detalle_pedido(
            *,
            producto:productos_db(
              id,
              nombre,
              categoria,
              precio_unitario
            )
          )
        `)
        .eq('id_pedido', idPedido)
        .single()

      if (errorPedido) throw errorPedido

      return new Response(
        JSON.stringify({ success: true, data: pedido }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // ============================================
    // POST - Crear pedido
    // ============================================
    if (method === 'POST' && path === 'pedidos') {
      const body = await req.json()
      const { detalles, ...pedidoData } = body

      // Validaciones
      if (!pedidoData.id_cliente) {
        throw new Error('id_cliente es requerido')
      }
      if (!pedidoData.fecha_entrega) {
        throw new Error('fecha_entrega es requerido')
      }

      // Calcular totales si no se proporcionan
      if (!pedidoData.total && detalles) {
        const subtotal = detalles.reduce((sum: number, d: any) => 
          sum + (d.cantidad * d.precio_unitario), 0
        )
        const impuesto = subtotal * (pedidoData.impuesto_porcentaje || 0.18)
        pedidoData.subtotal = subtotal
        pedidoData.total_impuesto = impuesto
        pedidoData.total = subtotal + impuesto
      }

      // Insertar pedido
      const { data: pedido, error: errorPedido } = await supabaseClient
        .from('pedido')
        .insert(pedidoData)
        .select()
        .single()

      if (errorPedido) throw errorPedido

      // Insertar detalles si existen
      if (detalles && detalles.length > 0) {
        const detallesData = detalles.map((d: any) => ({
          id_pedido: pedido.id_pedido,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.cantidad * d.precio_unitario,
        }))

        const { error: errorDetalles } = await supabaseClient
          .from('detalle_pedido')
          .insert(detallesData)

        if (errorDetalles) throw errorDetalles
      }

      return new Response(
        JSON.stringify({ success: true, data: pedido }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    }

    // ============================================
    // PUT - Actualizar pedido
    // ============================================
    if (method === 'PUT' && path.startsWith('pedidos/')) {
      const idPedido = path.replace('pedidos/', '')
      const body = await req.json()
      const { detalles, ...pedidoData } = body

      // Actualizar pedido
      const { data: pedido, error: errorPedido } = await supabaseClient
        .from('pedido')
        .update(pedidoData)
        .eq('id_pedido', idPedido)
        .select()
        .single()

      if (errorPedido) throw errorPedido

      // Actualizar detalles si se proporcionan
      if (detalles) {
        // Eliminar detalles existentes
        await supabaseClient
          .from('detalle_pedido')
          .delete()
          .eq('id_pedido', idPedido)

        // Insertar nuevos detalles
        if (detalles.length > 0) {
          const detallesData = detalles.map((d: any) => ({
            id_pedido: pedido.id_pedido,
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.cantidad * d.precio_unitario,
          }))

          const { error: errorDetalles } = await supabaseClient
            .from('detalle_pedido')
            .insert(detallesData)

          if (errorDetalles) throw errorDetalles
        }
      }

      return new Response(
        JSON.stringify({ success: true, data: pedido }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // ============================================
    // DELETE - Eliminar pedido
    // ============================================
    if (method === 'DELETE' && path.startsWith('pedidos/')) {
      const idPedido = path.replace('pedidos/', '')

      const { error } = await supabaseClient
        .from('pedido')
        .delete()
        .eq('id_pedido', idPedido)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Pedido eliminado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Ruta no encontrada' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

