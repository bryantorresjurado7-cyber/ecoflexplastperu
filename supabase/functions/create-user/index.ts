import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear cliente Supabase
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

    // Verificar que el usuario esté autenticado
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario tenga permisos de admin
    const { data: profile } = await supabaseClient
      .from('admin_profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.rol !== 'admin' && profile.rol !== 'super_admin')) {
      return new Response(
        JSON.stringify({ error: 'No tiene permisos para crear usuarios' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener datos del request
    const { email, password, nombre, apellido, rol, activo } = await req.json()

    if (!email || !password || !nombre || !rol) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear usuario en auth.users usando Admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        apellido: apellido || '',
        rol
      }
    })

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear perfil en admin_profiles
    // Primero intentamos sin email, por si la tabla no tiene ese campo
    const profileInsert: any = {
      id: newUser.user.id,
      nombre,
      apellido: apellido || null,
      rol,
      activo: activo !== undefined ? activo : true
    }
    
    // Solo agregar email si existe el campo en la tabla
    // Intentamos agregarlo, pero si falla, lo intentamos sin email
    const { data: profileData, error: profileError } = await supabaseClient
      .from('admin_profiles')
      .insert({
        ...profileInsert,
        email: newUser.user.email
      })
      .select()
      .single()

    if (profileError) {
      // Si falla con email, intentar sin email
      console.error('Error al crear perfil con email:', JSON.stringify(profileError, null, 2))
      
      // Intentar sin email
      const { data: profileDataRetry, error: profileErrorRetry } = await supabaseClient
        .from('admin_profiles')
        .insert(profileInsert)
        .select()
        .single()

      if (profileErrorRetry) {
        // Si falla crear el perfil, eliminar el usuario de auth
        console.error('Error al crear perfil sin email:', JSON.stringify(profileErrorRetry, null, 2))
        await supabaseClient.auth.admin.deleteUser(newUser.user.id)
        
        // Devolver error detallado
        const errorDetails: any = {
          error: 'Database error creating new user',
          message: profileErrorRetry.message,
          code: profileErrorRetry.code,
          hint: profileErrorRetry.hint,
          details: profileErrorRetry.details
        }
        
        // Si el primer error también tiene información útil, incluirla
        if (profileError.message !== profileErrorRetry.message) {
          errorDetails.firstError = {
            message: profileError.message,
            code: profileError.code,
            hint: profileError.hint
          }
        }
        
        return new Response(
          JSON.stringify(errorDetails),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Retornar el perfil creado sin email
      return new Response(
        JSON.stringify({ 
          success: true,
          user: { ...profileDataRetry, email: newUser.user.email },
          warning: 'Perfil creado sin campo email (campo no existe en la tabla)'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: profileData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error inesperado en create-user:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error inesperado',
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

