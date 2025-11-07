// Edge Function para CRUD completo de producto_insumos
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

serve(async (req) => {
  // Manejar CORS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
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
    const pathParts = url.pathname.split('/').filter(p => p)
    const functionIndex = pathParts.findIndex(p => p === 'crud-producto-insumos')
    const path = functionIndex >= 0 ? pathParts.slice(functionIndex + 1).join('/') : ''

    // ============================================
    // GET - Listar insumos de un producto
    // ============================================
    if (method === 'GET' && (path === '' || path.startsWith('producto/'))) {
      const idProducto = path.replace('producto/', '')
      
      if (idProducto) {
        // Obtener insumos de un producto específico con información del insumo
        const { data, error } = await supabaseClient
          .from('producto_insumos')
          .select(`
            *,
            insumo:insumos (
              id_insumo,
              codigo_insumo,
              nombre,
              unidad_medida,
              stock_disponible,
              stock_minimo,
              costo_unitario,
              categoria,
              activo
            )
          `)
          .eq('id_producto', idProducto)
          .order('orden', { ascending: true })
        
        if (error) throw error
        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } else {
        return new Response(
          JSON.stringify({ success: false, message: 'ID de producto requerido' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    // ============================================
    // GET - Obtener todos los insumos disponibles
    // ============================================
    if (method === 'GET' && path === 'insumos') {
      const { data, error } = await supabaseClient
        .from('insumos')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ============================================
    // GET - Obtener un producto_insumo por ID
    // ============================================
    if (method === 'GET' && path.startsWith('id/')) {
      const id = path.replace('id/', '')
      const { data, error } = await supabaseClient
        .from('producto_insumos')
        .select(`
          *,
          insumo:insumos (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ============================================
    // POST - Crear producto_insumo (agregar insumo a producto)
    // ============================================
    if (method === 'POST' && path === '') {
      const body = await req.json()
      
      // Validar campos requeridos
      if (!body.id_producto || !body.id_insumo) {
        return new Response(
          JSON.stringify({ success: false, message: 'id_producto e id_insumo son requeridos' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Obtener información del insumo para validar unidad de medida
      const { data: insumo, error: errorInsumo } = await supabaseClient
        .from('insumos')
        .select('unidad_medida')
        .eq('id_insumo', body.id_insumo)
        .single()
      
      if (errorInsumo || !insumo) {
        return new Response(
          JSON.stringify({ success: false, message: 'Insumo no encontrado' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      // Si no se proporciona unidad_medida, usar la del insumo
      const unidadMedida = body.unidad_medida || insumo.unidad_medida

      // Validar que la unidad de medida coincida
      if (unidadMedida !== insumo.unidad_medida) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `La unidad de medida debe ser ${insumo.unidad_medida}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const insertData: any = {
        id_producto: body.id_producto,
        id_insumo: body.id_insumo,
        cantidad_requerida: parseFloat(body.cantidad_requerida) || 1,
        unidad_medida: unidadMedida,
        orden: parseInt(body.orden) || 0,
        es_obligatorio: body.es_obligatorio !== undefined ? body.es_obligatorio : true,
        observaciones: body.observaciones || null
      }

      const { data, error } = await supabaseClient
        .from('producto_insumos')
        .insert(insertData)
        .select(`
          *,
          insumo:insumos (*)
        `)
        .single()
      
      if (error) {
        // Si es error de duplicado
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ success: false, message: 'Este insumo ya está agregado a este producto' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
          )
        }
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      )
    }

    // ============================================
    // PUT - Actualizar producto_insumo
    // ============================================
    if (method === 'PUT' && path.startsWith('id/')) {
      const id = path.replace('id/', '')
      const body = await req.json()
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (body.cantidad_requerida !== undefined) {
        updateData.cantidad_requerida = parseFloat(body.cantidad_requerida)
      }
      if (body.unidad_medida !== undefined) updateData.unidad_medida = body.unidad_medida
      if (body.orden !== undefined) updateData.orden = parseInt(body.orden)
      if (body.es_obligatorio !== undefined) updateData.es_obligatorio = body.es_obligatorio
      if (body.observaciones !== undefined) updateData.observaciones = body.observaciones

      // Si se cambia unidad_medida, validar que coincida con el insumo
      if (body.unidad_medida) {
        const { data: productoInsumo } = await supabaseClient
          .from('producto_insumos')
          .select('id_insumo')
          .eq('id', id)
          .single()
        
        if (productoInsumo) {
          const { data: insumo } = await supabaseClient
            .from('insumos')
            .select('unidad_medida')
            .eq('id_insumo', productoInsumo.id_insumo)
            .single()
          
          if (insumo && body.unidad_medida !== insumo.unidad_medida) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: `La unidad de medida debe ser ${insumo.unidad_medida}` 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }
        }
      }

      const { data, error } = await supabaseClient
        .from('producto_insumos')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          insumo:insumos (*)
        `)
        .single()
      
      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ============================================
    // DELETE - Eliminar producto_insumo
    // ============================================
    if (method === 'DELETE' && path.startsWith('id/')) {
      const id = path.replace('id/', '')
      
      const { error } = await supabaseClient
        .from('producto_insumos')
        .delete()
        .eq('id', id)
      
      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Insumo eliminado del producto' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Ruta no encontrada
    return new Response(
      JSON.stringify({ success: false, message: 'Ruta no encontrada' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  } catch (error) {
    console.error('Error en crud-producto-insumos:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

