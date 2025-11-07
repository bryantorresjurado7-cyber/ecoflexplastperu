import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const url = new URL(req.url)
    const method = req.method
    const path = url.pathname.split('/').filter(Boolean)

    // GET - Listar todas las maquinarias o obtener una por ID
    if (method === 'GET') {
      const id = url.searchParams.get('id')
      
      if (id) {
        // Obtener una maquinaria por ID
        const { data, error } = await supabaseClient
          .from('maquinarias')
          .select('*')
          .eq('id_maquinaria', id)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else {
        // Listar todas las maquinarias
        const { data, error } = await supabaseClient
          .from('maquinarias')
          .select('*')
          .order('nombre', { ascending: true })

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // POST - Crear nueva maquinaria
    if (method === 'POST') {
      const body = await req.json()
      
      // Validaciones
      if (!body.codigo_maquinaria || !body.nombre) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Código y nombre son requeridos' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Validar estado
      const estadosValidos = ['activa', 'inactiva', 'mantenimiento', 'reparacion']
      if (body.estado && !estadosValidos.includes(body.estado)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Verificar que el código no exista
      const { data: existing } = await supabaseClient
        .from('maquinarias')
        .select('id_maquinaria')
        .eq('codigo_maquinaria', body.codigo_maquinaria)
        .single()

      if (existing) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Ya existe una maquinaria con este código' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Preparar datos
      const maquinariaData = {
        codigo_maquinaria: body.codigo_maquinaria,
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        marca: body.marca || null,
        modelo: body.modelo || null,
        numero_serie: body.numero_serie || null,
        estado: body.estado || 'activa',
        ubicacion: body.ubicacion || null,
        fecha_adquisicion: body.fecha_adquisicion || null,
        fecha_ultimo_mantenimiento: body.fecha_ultimo_mantenimiento || null,
        proximo_mantenimiento: body.proximo_mantenimiento || null,
        observaciones: body.observaciones || null,
        auditoria: body.auditoria || 'Sistema',
        created_by: user.id,
        updated_by: user.id
      }

      const { data, error } = await supabaseClient
        .from('maquinarias')
        .insert([maquinariaData])
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // PUT - Actualizar maquinaria
    if (method === 'PUT') {
      const body = await req.json()
      const id = url.searchParams.get('id')

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID es requerido' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Validar estado si se proporciona
      const estadosValidos = ['activa', 'inactiva', 'mantenimiento', 'reparacion']
      if (body.estado && !estadosValidos.includes(body.estado)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Si se actualiza el código, verificar que no exista en otra maquinaria
      if (body.codigo_maquinaria) {
        const { data: existing } = await supabaseClient
          .from('maquinarias')
          .select('id_maquinaria')
          .eq('codigo_maquinaria', body.codigo_maquinaria)
          .neq('id_maquinaria', id)
          .single()

        if (existing) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Ya existe otra maquinaria con este código' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
      }

      // Preparar datos de actualización
      const updateData: any = {
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }

      // Solo actualizar campos que se proporcionen
      if (body.codigo_maquinaria !== undefined) updateData.codigo_maquinaria = body.codigo_maquinaria
      if (body.nombre !== undefined) updateData.nombre = body.nombre
      if (body.descripcion !== undefined) updateData.descripcion = body.descripcion || null
      if (body.marca !== undefined) updateData.marca = body.marca || null
      if (body.modelo !== undefined) updateData.modelo = body.modelo || null
      if (body.numero_serie !== undefined) updateData.numero_serie = body.numero_serie || null
      if (body.estado !== undefined) updateData.estado = body.estado
      if (body.ubicacion !== undefined) updateData.ubicacion = body.ubicacion || null
      if (body.fecha_adquisicion !== undefined) updateData.fecha_adquisicion = body.fecha_adquisicion || null
      if (body.fecha_ultimo_mantenimiento !== undefined) updateData.fecha_ultimo_mantenimiento = body.fecha_ultimo_mantenimiento || null
      if (body.proximo_mantenimiento !== undefined) updateData.proximo_mantenimiento = body.proximo_mantenimiento || null
      if (body.observaciones !== undefined) updateData.observaciones = body.observaciones || null

      const { data, error } = await supabaseClient
        .from('maquinarias')
        .update(updateData)
        .eq('id_maquinaria', id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // DELETE - Eliminar maquinaria
    if (method === 'DELETE') {
      const id = url.searchParams.get('id')

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID es requerido' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Verificar si la maquinaria está siendo usada en alguna producción
      const { data: producciones } = await supabaseClient
        .from('produccion')
        .select('id_produccion')
        .eq('id_maquinaria', id)
        .limit(1)

      if (producciones && producciones.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No se puede eliminar la maquinaria porque está siendo utilizada en órdenes de producción' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const { error } = await supabaseClient
        .from('maquinarias')
        .delete()
        .eq('id_maquinaria', id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Maquinaria eliminada correctamente' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Método no permitido' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

