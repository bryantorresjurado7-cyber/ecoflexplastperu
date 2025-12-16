import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

/**
 * Servicio para gestionar usuarios del sistema
 */
const usuariosService = {
  /**
   * Cargar todos los usuarios
   */
  async loadUsuarios(filters = {}) {
    try {
      let query = supabase
        .from('admin_profiles')
        .select('*')
        .order('nombre', { ascending: true })

      if (filters.rol && filters.rol !== 'all') {
        query = query.eq('rol', filters.rol)
      }

      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }

      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%,apellido.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      return { data: [], error: error.message }
    }
  },

  /**
   * Cargar un usuario por ID
   */
  async loadUsuario(id) {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error cargando usuario:', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Crear nuevo usuario usando Edge Functions (Primary) o SignUp (Backup)
   */
  async createUsuario(usuarioData) {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session) {
        throw new Error('No hay sesión activa')
      }

      // 1. Preparar datos para Edge Function
      const STANDARD_ROLES = ['operario', 'supervisor', 'control_calidad', 'admin', 'super_admin']
      const isCustomRole = !STANDARD_ROLES.includes(usuarioData.rol)

      // La Edge Function valida roles, así que usamos uno estándar para la creación inicial
      const roleToCreate = isCustomRole ? 'operario' : (usuarioData.rol || 'operario')
      const cleanEmail = (usuarioData.email || '').replace(/\s/g, '').toLowerCase()

      console.log('Creando usuario con Edge Function "create-user" (Método Preferido)...')

      // 2. Invocar Edge Function
      // Nota: Si la Edge Function usa supabase.auth.admin.createUser internamente, esto funcionará incluso si los signups públicos están deshabilitados.
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: cleanEmail,
          password: usuarioData.password,
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido || '',
          rol: roleToCreate,
          activo: !!usuarioData.activo // Aseguramos booleano
        }
      })

      if (error) {
        console.error('Edge Function Error:', error)
        // Fallback IMPORTANTE: Si falla la función (ej. 400), intentamos signUp directo
        console.log('Edge Function falló. Intentando fallback a signUp (Puede fallar si registro público está deshabilitado)...')
        return await this.createUsuarioFallback(usuarioData, cleanEmail)
      }

      // 3. Manejar respuesta exitosa
      const newUser = data?.user || data
      if (!newUser?.id) {
        // A veces la función devuelve { user: {...} } o directo el user
        if (data?.id) return this.handleCustomRoleUpdate(data, isCustomRole, usuarioData.rol);

        // Si llegamos aquí, algo raro pasó con el retorno
        throw new Error('La función no devolvió un usuario válido')
      }

      return await this.handleCustomRoleUpdate(newUser, isCustomRole, usuarioData.rol);

    } catch (error) {
      console.error('Error creando usuario:', error)
      return { data: null, error: error.message }
    }
  },

  // Helper para actualizar rol personalizado si es necesario
  async handleCustomRoleUpdate(user, isCustomRole, targetRole) {
    try {
      if (isCustomRole && user.id) {
        await supabase
          .from('admin_profiles')
          .update({ rol: targetRole })
          .eq('id', user.id)

        user.rol = targetRole
      }
      return { data: user, error: null }
    } catch (e) {
      console.error('Error actualizando rol custom:', e)
      return { data: user, error: null } // Retornamos éxito parcial
    }
  },

  // Método auxiliar de fallback para signUp directo (Cliente Temporal)
  async createUsuarioFallback(usuarioData, cleanEmail) {
    try {
      const TEMP_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
      const TEMP_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

      const tempClient = createClient(TEMP_URL, TEMP_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      })

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: cleanEmail,
        password: usuarioData.password,
        options: {
          data: {
            nombre: usuarioData.nombre,
            apellido: usuarioData.apellido || '',
            rol: usuarioData.rol,
            activo: usuarioData.activo
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const profileData = {
          id: authData.user.id,
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido || '',
          email: cleanEmail,
          rol: usuarioData.rol,
          activo: usuarioData.activo !== undefined ? usuarioData.activo : true
        }
        // Insertamos perfil y retornamos
        const { error: profileError } = await supabase.from('admin_profiles').upsert(profileData)

        if (profileError) console.error('Error creando perfil (Fallback):', profileError)

        return { data: authData.user, error: null }
      }
      return { data: null, error: 'No se pudo crear el usuario (Fallback sin datos)' }
    } catch (e) {
      console.error('Fallback Error:', e)
      if (e.message && e.message.includes('Email address is invalid')) {
        return { data: null, error: 'Error: El registro público de emails está desactivado en Supabase y la Edge Function falló. Contacte al administrador.' }
      }
      return { data: null, error: e.message || 'Error desconocido creando usuario' }
    }
  },

  /**
   * Actualizar usuario
   */
  async updateUsuario(id, usuarioData) {
    try {
      // 1. Actualizar perfil visual
      const updateData = {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido || null,
        rol: usuarioData.rol,
        activo: usuarioData.activo !== undefined ? usuarioData.activo : true
      }

      const { data, error } = await supabase
        .from('admin_profiles')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) throw error

      // Manejo de respuesta vacía (RLS)
      if (!data || data.length === 0) {
        console.warn('Update exitoso pero sin datos retornados')
      }

      // 2. Actualizar Password via Edge Function (si aplica)
      if (usuarioData.password && usuarioData.password.trim() !== '') {
        console.log('Actualizando password via Edge Function...')
        const { error: fnError } = await supabase.functions.invoke('update-user-password', {
          body: {
            userId: id,
            newPassword: usuarioData.password
          }
        })

        if (fnError) {
          console.error('Error actualizando password:', fnError)
        }
      }

      return { data: data ? data[0] : { id, ...updateData }, error: null }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Eliminar usuario
   */
  async deleteUsuario(id) {
    try {
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .delete()
        .eq('id', id)

      if (profileError) throw profileError

      const { data: session } = await supabase.auth.getSession()
      if (session?.session) {
        const { error: authError } = await supabase.functions.invoke('delete-user', {
          body: { userId: id }
        })
        if (authError) console.error('Error eliminando auth:', authError)
      }

      return { error: null }
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      return { error: error.message }
    }
  },

  /**
   * Activar/Desactivar usuario
   */
  async toggleActivo(id, activo) {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .update({ activo: !activo })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error cambiando estado:', error)
      return { data: null, error: error.message }
    }
  }
}

export default usuariosService
