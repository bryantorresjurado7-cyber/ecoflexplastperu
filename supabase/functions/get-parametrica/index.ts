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
    const tipoParametro = url.searchParams.get('tipo_parametro')
    const estado = url.searchParams.get('estado') || 'true'

    // Validar que se proporcione el tipo de parámetro
    if (!tipoParametro) {
      return new Response(
        JSON.stringify({ 
          error: 'El parámetro tipo_parametro es requerido',
          ejemplo: '/get-parametrica?tipo_parametro=tipo_documento'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construir la consulta
    let query = supabaseClient
      .from('parametrica')
      .select('*')
      .eq('tipo_parametro', tipoParametro)

    // Agregar filtro de estado si se proporciona
    if (estado !== 'all') {
      const estadoBoolean = estado === 'true'
      query = query.eq('estado', estadoBoolean)
    }

    // Ordenar por orden y luego por created_at descendente (más reciente primero)
    // Esto nos permite tomar el más reciente cuando hay duplicados
    query = query.order('orden', { ascending: true })
                 .order('created_at', { ascending: false })

    // Ejecutar la consulta
    const { data, error } = await query

    if (error) {
      console.error('Error en la consulta:', error)
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

    console.log('Total registros recibidos de BD:', data?.length || 0)

    // Filtrar duplicados basándose en codigo_parametro (mantener el más reciente)
    // Como ya ordenamos por created_at descendente, el primer registro que encontramos será el más reciente
    let datosUnicos = []
    if (data && data.length > 0) {
      const visto = new Map()
      
      for (const registro of data) {
        const codigo = registro.codigo_parametro || registro.codigo || registro.valor
        if (codigo && !visto.has(codigo)) {
          visto.set(codigo, registro)
          datosUnicos.push(registro)
        } else if (!codigo) {
          // Si no tiene codigo, usar id_parametrica como fallback
          const id = registro.id_parametrica || registro.id
          if (id && !visto.has(id)) {
            visto.set(id, registro)
            datosUnicos.push(registro)
          }
        }
      }
      
      console.log('Registros únicos después de filtrar:', datosUnicos.length)
      console.log('Códigos únicos encontrados:', Array.from(visto.keys()))
    }
    
    const datosFinales = datosUnicos.length > 0 ? datosUnicos : (data || [])

    // Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        tipo_parametro: tipoParametro,
        estado: estado,
        total_registros: datosFinales?.length || 0,
        datos: datosFinales || []
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
