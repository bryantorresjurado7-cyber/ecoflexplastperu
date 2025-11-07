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
   * Crear nuevo usuario
   * Primero crea el usuario en auth.users, luego el perfil en admin_profiles
   */
  async createUsuario(usuarioData) {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session) {
        throw new Error('No hay sesión activa')
      }

      // Llamar a Edge Function para crear usuario
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: usuarioData.email,
          password: usuarioData.password,
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido || '',
          rol: usuarioData.rol || 'operario',
          activo: usuarioData.activo !== undefined ? usuarioData.activo : true
        }
      })

      if (error) throw error
      if (data.error) throw new Error(data.error)

      return { data: data.user, error: null }
    } catch (error) {
      console.error('Error creando usuario:', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Actualizar usuario
   */
  async updateUsuario(id, usuarioData) {
    try {
      // Actualizar perfil en admin_profiles
      const updateData = {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido || null,
        rol: usuarioData.rol,
        activo: usuarioData.activo !== undefined ? usuarioData.activo : true,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('admin_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error

      // Si se proporciona una nueva contraseña, actualizarla
      if (usuarioData.password && usuarioData.password.trim() !== '') {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session) {
          throw new Error('No hay sesión activa')
        }

        const { error: passwordError } = await supabase.functions.invoke('update-user-password', {
          body: {
            userId: id,
            newPassword: usuarioData.password
          }
        })

        if (passwordError) {
          console.error('Error actualizando contraseña:', passwordError)
          // No lanzamos error, solo lo registramos
        }
      }

      return { data, error: null }
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
      // Primero eliminar el perfil
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .delete()
        .eq('id', id)
      
      if (profileError) throw profileError

      // Luego eliminar el usuario de auth (usando Edge Function)
      const { data: session } = await supabase.auth.getSession()
      if (session?.session) {
        const { error: authError } = await supabase.functions.invoke('delete-user', {
          body: { userId: id }
        })

        if (authError) {
          console.error('Error eliminando usuario de auth:', authError)
          // No lanzamos error, solo lo registramos
        }
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

