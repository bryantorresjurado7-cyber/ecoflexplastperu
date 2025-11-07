import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Crear cliente de Supabase con service role key para bypassear RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'SUPABASE_SERVICE_ROLE_KEY no está configurado en los secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    )

    // Obtener parámetros de la URL
    const url = new URL(req.url)
    const tipoDocumento = url.searchParams.get('tipo_documento')
    const numeroDocumento = url.searchParams.get('numero_documento')

    // Validar parámetros requeridos
    if (!tipoDocumento || !numeroDocumento) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Los parámetros tipo_documento y numero_documento son requeridos',
          ejemplo: '/get-cliente?tipo_documento=DNI&numero_documento=12345678'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Limpiar número de documento (sin espacios, mantener formato original)
    const numeroLimpio = numeroDocumento.trim()

    // Construir la consulta - buscar con todos los filtros desde el inicio
    let { data, error } = await supabaseClient
      .from('cliente')
      .select('*')
      .eq('tipo_documento', tipoDocumento)
      .eq('numero_documento', numeroLimpio)
      .eq('estado', true)
      .maybeSingle()

    console.log('[get-cliente] Resultado primera búsqueda:', { data: data ? 'encontrado' : 'no encontrado', error })

    // Si no encontramos, intentar solo con número de documento (puede ser problema de formato)
    if (!data && (!error || error.code === 'PGRST116')) {
      console.log('[get-cliente] Intentando búsqueda solo por número...')
      const { data: dataSimple, error: errorSimple } = await supabaseClient
        .from('cliente')
        .select('*')
        .eq('numero_documento', numeroLimpio)
        .maybeSingle()
      
      console.log('[get-cliente] Resultado búsqueda simple:', { data: dataSimple ? 'encontrado' : 'no encontrado', error: errorSimple })
      
      if (dataSimple && !errorSimple) {
        // Validar tipo y estado manualmente
        if (dataSimple.tipo_documento === tipoDocumento && dataSimple.estado === true) {
          data = dataSimple
          error = null
        }
      }
    }

    if (error) {
      console.error('Error en la consulta:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: error.message,
          detalles: error
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Cliente no encontrado',
          tipo_documento,
          numero_documento: numeroLimpio
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Retornar respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true,
        datos: data,
        tipo_documento,
        numero_documento: numeroLimpio
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error en get-cliente:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

