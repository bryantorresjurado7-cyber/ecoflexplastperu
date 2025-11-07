import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Obtener parámetros de la URL
    const url = new URL(req.url)
    const categoria = url.searchParams.get('categoria')
    const activo = url.searchParams.get('activo') ?? 'true'
    const destacado = url.searchParams.get('destacado')
    const limit = url.searchParams.get('limit')

    // Construir la consulta base
    let query = supabaseClient
      .from('productos_db')
      .select('*')

    // Filtrar por activo (por defecto solo activos)
    if (activo === 'true') {
      query = query.eq('activo', true)
    } else if (activo === 'false') {
      query = query.eq('activo', false)
    }

    // Mapear categorías de URL a categorías de Supabase (definir antes de usar)
    const categoriaMap: Record<string, string> = {
      'zuncho': 'zunchos',
      'esquinero': 'esquineros',
      'burbupack': 'burbupack',
      'manga': 'mangas',
      'accesorio': 'accesorios'
    }
    
    // Filtrar por categoría si se proporciona
    if (categoria) {
      const categoriaSupabase = categoriaMap[categoria.toLowerCase()] || categoria.toLowerCase()
      console.log('🔵 [Edge Function] Categoría recibida:', categoria)
      console.log('🔵 [Edge Function] Categoría mapeada para Supabase:', categoriaSupabase)
      query = query.eq('categoria', categoriaSupabase)
    } else {
      console.log('🔵 [Edge Function] Sin filtro de categoría - cargando todos los productos')
    }

    // Filtrar por destacado si se proporciona
    if (destacado) {
      query = query.eq('destacado', destacado === 'true')
    }

    // Ordenar
    query = query
      .order('destacado', { ascending: false })
      .order('nombre', { ascending: true })

    // Limitar resultados si se proporciona
    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum)
      }
    }

    // Ejecutar la consulta
    console.log('🔵 [Edge Function] Ejecutando query...')
    const { data, error } = await query

    if (error) {
      console.error('🔴 [Edge Function] Error en la consulta:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Error al consultar la base de datos',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🟢 [Edge Function] Productos obtenidos:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('🟢 [Edge Function] Primeros 3 productos:', data.slice(0, 3).map(p => ({ nombre: p.nombre, categoria: p.categoria })))
    }

    // Respuesta exitosa
    const categoriaMapeada = categoria ? categoriaMap[categoria.toLowerCase()] || categoria.toLowerCase() : 'todas'
    return new Response(
      JSON.stringify({
        success: true,
        categoria: categoria || 'todas',
        categoria_mapeada: categoriaMapeada,
        total_registros: data?.length || 0,
        datos: data || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error en la función:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

