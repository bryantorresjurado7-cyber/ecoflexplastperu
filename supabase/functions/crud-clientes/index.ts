// Edge Function para CRUD completo de clientes con paginación y búsqueda
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
    const functionIndex = pathParts.findIndex(p => p === 'crud-clientes')
    const path = functionIndex >= 0 ? pathParts.slice(functionIndex + 1).join('/') : ''

    // ============================================
    // GET - Listar clientes con paginación y búsqueda
    // ============================================
    if (method === 'GET' && (path === 'clientes' || path === '')) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const q = url.searchParams.get('q')?.trim()
      const offset = (page - 1) * limit
      
      let query = supabaseClient.from('cliente').select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      
      // Búsqueda por nombre, email, teléfono o número de documento
      if (q && q.length > 0) {
        query = query.or(`nombre.ilike.%${q}%,email.ilike.%${q}%,telefono.ilike.%${q}%,numero_documento.ilike.%${q}%`)
      }
      
      const { data, error, count } = await query.range(offset, offset + limit - 1)
      if (error) throw error
      return new Response(
        JSON.stringify({
          success: true,
          data,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ============================================
    // GET - Obtener cliente por ID
    // ============================================
    if (method === 'GET' && path.startsWith('clientes/')) {
      const id_cliente = path.replace('clientes/', '')
      const { data, error } = await supabaseClient
        .from('cliente')
        .select('*')
        .eq('id_cliente', id_cliente)
        .single()
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ============================================
    // POST - Crear cliente
    // ============================================
    if (method === 'POST' && (path === 'clientes' || path === '')) {
      const body = await req.json()
      const insertData: any = {
        nombre: body.nombre,
        tipo_documento: body.tipo_documento || 'DNI',
        numero_documento: body.numero_documento || null,
        direccion: body.direccion || null,
        telefono: body.telefono || null,
        email: body.email || null,
        descripcion: body.descripcion || null,
        auditoria: body.auditoria || 'Auto',
        estado: body.estado !== undefined ? body.estado : true,
      }
      const { data, error } = await supabaseClient.from('cliente').insert(insertData).select().single()
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      )
    }

    // ============================================
    // PUT - Actualizar cliente
    // ============================================
    if (method === 'PUT' && path.startsWith('clientes/')) {
      const id_cliente = path.replace('clientes/', '')
      const body = await req.json()
      const updateData: any = { updated_at: new Date().toISOString() }
      if (body.nombre !== undefined) updateData.nombre = body.nombre
      if (body.tipo_documento !== undefined) updateData.tipo_documento = body.tipo_documento
      if (body.numero_documento !== undefined) updateData.numero_documento = body.numero_documento
      if (body.direccion !== undefined) updateData.direccion = body.direccion
      if (body.telefono !== undefined) updateData.telefono = body.telefono
      if (body.email !== undefined) updateData.email = body.email
      if (body.descripcion !== undefined) updateData.descripcion = body.descripcion
      if (body.auditoria !== undefined) updateData.auditoria = body.auditoria
      if (body.estado !== undefined) updateData.estado = body.estado
      const { data, error } = await supabaseClient
        .from('cliente')
        .update(updateData)
        .eq('id_cliente', id_cliente)
        .select()
        .single()
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ============================================
    // DELETE - Eliminar cliente
    // ============================================
    if (method === 'DELETE' && path.startsWith('clientes/')) {
      const id_cliente = path.replace('clientes/', '')
      const { error } = await supabaseClient
        .from('cliente')
        .delete()
        .eq('id_cliente', id_cliente)
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true, message: 'Cliente eliminado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Ruta no encontrada
    return new Response(
      JSON.stringify({ success: false, message: 'Ruta no encontrada' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
