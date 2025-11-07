// Edge Function para CRUD completo de cotizaciones con paginación
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
    
    // Extraer el path correctamente (después de /functions/v1/crud-cotizaciones/)
    const pathParts = url.pathname.split('/').filter(p => p)
    const functionIndex = pathParts.findIndex(p => p === 'crud-cotizaciones')
    const path = functionIndex >= 0 ? pathParts.slice(functionIndex + 1).join('/') : ''
    
    console.log('Path extraído:', path, 'URL completa:', url.pathname)

    // ============================================
    // GET - Listar cotizaciones con paginación
    // ============================================
    if (method === 'GET' && path === 'cotizaciones') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const offset = (page - 1) * limit
      const estado = url.searchParams.get('estado')

      console.log('📋 GET - Listando cotizaciones, página:', page, 'limit:', limit)
      
      // Hacer JOIN con la tabla cliente para obtener datos del cliente
      // Usamos left join para incluir cotizaciones sin cliente
      let query = supabaseClient
        .from('cotizacion')
        .select(`
          *,
          cliente (
            id_cliente,
            nombre,
            email,
            telefono,
            descripcion,
            direccion
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (estado) {
        query = query.eq('estado', estado)
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Error en query:', error)
        throw error
      }
      
      console.log('✅ Cotizaciones encontradas:', data?.length || 0)

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
    // GET - Obtener una cotización por ID
    // ============================================
    if (method === 'GET' && path.startsWith('cotizaciones/')) {
      const idCotizacion = path.replace('cotizaciones/', '')

      console.log('📋 GET - Obteniendo cotización por ID:', idCotizacion)
      
      // Primero obtener la cotización básica para ver si tiene id_vendedor
      const { data: cotizacionBasica, error: errorBasica } = await supabaseClient
        .from('cotizacion')
        .select('*')
        .eq('id_cotizacion', idCotizacion)
        .single()

      if (errorBasica) {
        console.error('❌ Error obteniendo cotización básica:', errorBasica)
        throw errorBasica
      }

      console.log('✅ Cotización básica obtenida:', {
        id_cotizacion: cotizacionBasica.id_cotizacion,
        id_cliente: cotizacionBasica.id_cliente,
        id_vendedor: cotizacionBasica.id_vendedor
      })

      // Obtener cliente si existe
      let clienteData = null
      if (cotizacionBasica.id_cliente) {
        const { data: cliente, error: errorCliente } = await supabaseClient
          .from('cliente')
          .select('id_cliente, nombre, email, telefono, descripcion, direccion')
          .eq('id_cliente', cotizacionBasica.id_cliente)
          .maybeSingle()
        
        if (errorCliente) {
          console.warn('⚠️ Error obteniendo cliente:', errorCliente)
        } else {
          clienteData = cliente
          console.log('✅ Cliente obtenido:', cliente?.nombre || 'N/A')
        }
      }

      // Intentar obtener vendedor solo si existe id_vendedor y no es null
      let vendedorData = null
      if (cotizacionBasica.id_vendedor) {
        try {
          const { data: vendedor, error: errorVendedor } = await supabaseClient
            .from('vendedor')
            .select('*')
            .eq('id_vendedor', cotizacionBasica.id_vendedor)
            .maybeSingle()
          
          if (errorVendedor) {
            console.warn('⚠️ Error obteniendo vendedor:', errorVendedor.message)
            console.log('⚠️ Esto puede ser normal si la tabla vendedor no existe o está vacía')
          } else if (vendedor) {
            vendedorData = {
              id_vendedor: vendedor.id_vendedor,
              nombre: vendedor.nombre || 'N/A',
              email: vendedor.email || 'N/A',
              telefono: vendedor.telefono || 'N/A'
            }
            console.log('✅ Vendedor obtenido:', vendedorData.nombre)
          } else {
            console.log('ℹ️ No se encontró vendedor con ID:', cotizacionBasica.id_vendedor)
          }
        } catch (err) {
          console.warn('⚠️ Excepción al obtener vendedor (continuando):', err)
          // Continuar sin vendedor
        }
      } else {
        console.log('ℹ️ La cotización no tiene vendedor asignado (id_vendedor es null)')
      }

      const cotizacion = {
        ...cotizacionBasica,
        cliente: clienteData,
        vendedor: vendedorData
      }
      
      // Obtener detalles de productos
      const { data: detalles, error: errorDetalles } = await supabaseClient
        .from('detalle_cotizacion')
        .select(`
          *,
          producto:productos_db (
            id,
            nombre,
            codigo,
            precio_unitario
          )
        `)
        .eq('id_cotizacion', idCotizacion)
      
      if (errorDetalles) {
        console.error('⚠️ Error obteniendo detalles (continuando):', errorDetalles)
      }
      
      const data = {
        ...cotizacion,
        detalles: detalles || []
      }
      
      console.log('✅ Cotización obtenida con', detalles?.length || 0, 'productos')

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // ============================================
    // POST - Crear nueva cotización
    // ============================================
    if (method === 'POST' && path === 'cotizaciones') {
      console.log('📝 POST - Creando nueva cotización')
      const body = await req.json()
      console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2))
      
      // Paso 1: Buscar o crear cliente
      let idCliente = null
      if (body.cliente_numero_documento && body.cliente_tipo_documento) {
        console.log('🔍 Buscando cliente por documento:', {
          tipo: body.cliente_tipo_documento,
          numero: body.cliente_numero_documento
        })
        
        const { data: clienteExistente, error: errorCliente } = await supabaseClient
          .from('cliente')
          .select('id_cliente')
          .eq('tipo_documento', body.cliente_tipo_documento)
          .eq('numero_documento', body.cliente_numero_documento)
          .eq('estado', true)
          .maybeSingle()
        
        if (errorCliente) {
          console.error('❌ Error buscando cliente:', errorCliente)
        } else if (clienteExistente) {
          idCliente = clienteExistente.id_cliente
          console.log('✅ Cliente encontrado:', idCliente)
        } else {
          // Crear nuevo cliente
          console.log('➕ Creando nuevo cliente...')
          const nuevoCliente = {
            nombre: body.cliente_nombre,
            email: body.cliente_email,
            telefono: body.cliente_telefono || null,
            descripcion: body.cliente_empresa || null,
            direccion: body.cliente_direccion || null,
            tipo_documento: body.cliente_tipo_documento,
            numero_documento: body.cliente_numero_documento,
            estado: true
          }
          
          const { data: clienteCreado, error: errorCrear } = await supabaseClient
            .from('cliente')
            .insert(nuevoCliente)
            .select('id_cliente')
            .single()
          
          if (errorCrear) {
            console.error('❌ Error creando cliente:', errorCrear)
          } else {
            idCliente = clienteCreado.id_cliente
            console.log('✅ Cliente creado:', idCliente)
          }
        }
      }
      
      // Paso 2: Generar número de cotización (formato: COT-YYYYMMDD-XXXX)
      const fecha = new Date()
      const fechaStr = fecha.toISOString().split('T')[0].replace(/-/g, '')
      const { count } = await supabaseClient
        .from('cotizacion')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_emision', fecha.toISOString().split('T')[0])
      
      const numeroSecuencia = ((count || 0) + 1).toString().padStart(4, '0')
      const numeroCotizacion = `COT-${fechaStr}-${numeroSecuencia}`
      console.log('📄 Número de cotización generado:', numeroCotizacion)
      
      // Paso 3: Calcular totales
      const productos = body.productos || []
      const subtotal = productos.reduce((sum: number, p: any) => 
        sum + (Number(p.precio_unitario) * Number(p.cantidad)), 0)
      
      // Usar el IGV enviado desde el frontend, o calcularlo si no se envía
      const igv = body.igv !== undefined ? Number(body.igv) : (subtotal * 0.18)
      const descuento = body.descuento || 0
      const total = subtotal + igv - descuento
      
      console.log('💰 Totales calculados:', { subtotal, igv, descuento, total })
      
      // Paso 4: Insertar cotización
      const fechaEmision = fecha.toISOString().split('T')[0]
      const fechaVencimiento = body.fecha_vencimiento || 
        new Date(fecha.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 días
      
      const cotizacionData = {
        id_cliente: idCliente,
        numero_cotizacion: numeroCotizacion,
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento,
        estado: body.estado || 'pendiente',
        subtotal: subtotal,
        descuento: descuento,
        igv: igv,
        total: total,
        observaciones: body.observaciones || null,
        auditoria: 'Sistema'
      }

      console.log('📊 Datos a insertar en cotizacion:', JSON.stringify(cotizacionData, null, 2))

      const { data: cotizacionCreada, error: errorCotizacion } = await supabaseClient
        .from('cotizacion')
        .insert(cotizacionData)
        .select()
        .single()

      if (errorCotizacion) {
        console.error('❌ Error al insertar cotización:', errorCotizacion)
        console.error('Detalles del error:', JSON.stringify(errorCotizacion, null, 2))
        throw errorCotizacion
      }
      
      console.log('✅ Cotización creada exitosamente:', cotizacionCreada.id_cotizacion)
      
      // Paso 5: Insertar productos en detalle_cotizacion
      if (productos.length > 0 && cotizacionCreada.id_cotizacion) {
        console.log('📦 Insertando productos en detalle_cotizacion...')
        
        const detallesData = productos.map((p: any) => ({
          id_cotizacion: cotizacionCreada.id_cotizacion,
          id_producto: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          subtotal: Number(p.precio_unitario) * Number(p.cantidad),
          descuento: 0,
          observaciones: null,
          auditoria: 'Sistema'
        }))
        
        console.log('📋 Detalles a insertar:', JSON.stringify(detallesData, null, 2))
        
        const { data: detallesCreados, error: errorDetalles } = await supabaseClient
          .from('detalle_cotizacion')
          .insert(detallesData)
          .select()
        
        if (errorDetalles) {
          console.error('❌ Error al insertar detalles:', errorDetalles)
          // No lanzamos error aquí, solo logueamos, porque la cotización ya se creó
        } else {
          console.log('✅ Productos insertados exitosamente:', detallesCreados?.length)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            ...cotizacionCreada,
            productos: productos
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    }

    // ============================================
    // PUT - Actualizar cotización
    // ============================================
    if (method === 'PUT' && path.startsWith('cotizaciones/')) {
      const idCotizacion = path.replace('cotizaciones/', '')
      console.log('📝 PUT - ID recibido:', idCotizacion)
      console.log('📝 PUT - Path completo:', path)
      
      const body = await req.json()
      console.log('📦 Body recibido:', JSON.stringify(body, null, 2))
      
      const { productos, ...cotizacionData } = body
      
      // Paso 1: Actualizar cliente si se proporciona
      let idCliente = null
      if (body.cliente_numero_documento && body.cliente_tipo_documento) {
        const { data: clienteExistente } = await supabaseClient
          .from('cliente')
          .select('id_cliente')
          .eq('tipo_documento', body.cliente_tipo_documento)
          .eq('numero_documento', body.cliente_numero_documento)
          .eq('estado', true)
          .maybeSingle()
        
        if (clienteExistente) {
          idCliente = clienteExistente.id_cliente
          // Actualizar datos del cliente
          await supabaseClient
            .from('cliente')
            .update({
              nombre: body.cliente_nombre,
              email: body.cliente_email,
              telefono: body.cliente_telefono || null,
              descripcion: body.cliente_empresa || null,
              direccion: body.cliente_direccion || null
            })
            .eq('id_cliente', idCliente)
        } else {
          // Crear nuevo cliente
          const nuevoCliente = {
            nombre: body.cliente_nombre,
            email: body.cliente_email,
            telefono: body.cliente_telefono || null,
            descripcion: body.cliente_empresa || null,
            direccion: body.cliente_direccion || null,
            tipo_documento: body.cliente_tipo_documento,
            numero_documento: body.cliente_numero_documento,
            estado: true
          }
          
          const { data: clienteCreado } = await supabaseClient
            .from('cliente')
            .insert(nuevoCliente)
            .select('id_cliente')
            .single()
          
          if (clienteCreado) {
            idCliente = clienteCreado.id_cliente
          }
        }
        
        if (idCliente) {
          cotizacionData.id_cliente = idCliente
        }
      }
      
      // Paso 2: Preparar datos de actualización
      const updateData: any = {
        updated_at: new Date().toISOString()
      }
      
      if (idCliente) updateData.id_cliente = idCliente
      if (body.estado) {
        const estadosPermitidos = ['pendiente', 'en_proceso', 'completada', 'cancelada']
        if (estadosPermitidos.includes(body.estado)) {
          updateData.estado = body.estado
        }
      }
      if (body.total !== undefined) updateData.total = body.total
      if (body.subtotal !== undefined) updateData.subtotal = body.subtotal
      if (body.descuento !== undefined) updateData.descuento = body.descuento
      if (body.igv !== undefined) updateData.igv = body.igv
      if (body.observaciones !== undefined) updateData.observaciones = body.observaciones
      if (body.fecha_vencimiento) updateData.fecha_vencimiento = body.fecha_vencimiento

      console.log('📊 Datos a actualizar:', JSON.stringify(updateData, null, 2))
      console.log('🔍 Buscando cotización con id_cotizacion:', idCotizacion)

      // Paso 3: Actualizar cotización
      const { data, error } = await supabaseClient
        .from('cotizacion')
        .update(updateData)
        .eq('id_cotizacion', idCotizacion)
        .select(`
          *,
          cliente (
            id_cliente,
            nombre,
            email,
            telefono,
            descripcion,
            direccion
          )
        `)
        .single()

      if (error) {
        console.error('❌ Error actualizando cotización:', error)
        console.error('Detalles del error:', JSON.stringify(error, null, 2))
        throw error
      }
      
      // Paso 4: Actualizar detalles (productos) si se proporcionan
      if (productos && Array.isArray(productos)) {
        console.log('📦 Actualizando detalles de productos...')
        
        // Eliminar detalles existentes
        await supabaseClient
          .from('detalle_cotizacion')
          .delete()
          .eq('id_cotizacion', idCotizacion)
        
        // Insertar nuevos detalles
        if (productos.length > 0) {
          const detallesData = productos.map((p: any) => ({
            id_cotizacion: idCotizacion,
            id_producto: p.id,
            cantidad: p.cantidad,
            precio_unitario: p.precio_unitario,
            subtotal: p.subtotal || (p.precio_unitario * p.cantidad),
            descuento: 0
          }))
          
          const { error: errorDetalles } = await supabaseClient
            .from('detalle_cotizacion')
            .insert(detallesData)
          
          if (errorDetalles) {
            console.error('❌ Error actualizando detalles:', errorDetalles)
            throw errorDetalles
          }
          
          console.log('✅ Detalles actualizados:', detallesData.length, 'productos')
        }
      }
      
      console.log('✅ Cotización actualizada exitosamente:', data?.id_cotizacion)

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // ============================================
    // DELETE - Eliminar cotización
    // ============================================
    if (method === 'DELETE' && path.startsWith('cotizaciones/')) {
      const idCotizacion = path.replace('cotizaciones/', '')

      console.log('🗑️ DELETE - Eliminando cotización:', idCotizacion)
      
      const { error } = await supabaseClient
        .from('cotizacion')
        .delete()
        .eq('id_cotizacion', idCotizacion)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Cotización eliminada' }),
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

