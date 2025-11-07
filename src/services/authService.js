import { supabase } from '../lib/supabase'

export const authService = {
  // Login de usuario con Supabase Auth
  async login(email, password) {
    try {
      // Autenticar con Supabase Auth (maneja contraseñas hasheadas automáticamente)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) {
        console.error('Error de autenticación:', authError)
        return { 
          success: false, 
          error: authError.message === 'Invalid login credentials' 
            ? 'Usuario o contraseña incorrectos' 
            : authError.message 
        }
      }
      
      if (!authData.user || !authData.session) {
        return { success: false, error: 'No se pudo iniciar sesión' }
      }
      
      // Obtener perfil de admin desde esquema admin
      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .eq('activo', true)
        .single()
      
      if (profileError || !profile) {
        // Si no existe perfil, cerrar sesión
        await supabase.auth.signOut()
        return { success: false, error: 'Usuario no autorizado como administrador' }
      }
      
      // Actualizar último acceso
      await supabase
        .from('admin_profiles')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', authData.user.id)
      
      // El token JWT ya viene en authData.session
      const token = authData.session.access_token
      
      // Guardar token y datos de usuario
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        nombre: profile.nombre,
        apellido: profile.apellido,
        rol: profile.rol
      }))
      
      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nombre: profile.nombre,
          apellido: profile.apellido,
          rol: profile.rol
        },
        token
      }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: error.message }
    }
  },
  
  // Logout
  async logout() {
    try {
      // Cerrar sesión en Supabase Auth
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error al cerrar sesión:', error)
      }
      
      // Limpiar localStorage
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      
      return { success: true }
    } catch (error) {
      console.error('Error en logout:', error)
      return { success: false, error: error.message }
    }
  },
  
  // Verificar sesión actual
  async verifySession() {
    try {
      // Verificar sesión con Supabase Auth
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Limpiar datos locales si no hay sesión
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        return { success: false, error: 'No hay sesión activa' }
      }
      
      // Verificar que el usuario tiene perfil de admin
      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', session.user.id)
        .eq('activo', true)
        .single()
      
      if (profileError || !profile) {
        await this.logout()
        return { success: false, error: 'Usuario no autorizado' }
      }
      
      const user = {
        id: session.user.id,
        email: session.user.email,
        nombre: profile.nombre,
        apellido: profile.apellido,
        rol: profile.rol
      }
      
      // Actualizar localStorage si es necesario
      localStorage.setItem('admin_token', session.access_token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      
      return {
        success: true,
        user,
        token: session.access_token
      }
    } catch (error) {
      console.error('Error verificando sesión:', error)
      return { success: false, error: error.message }
    }
  },
  
  // Obtener usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem('admin_user')
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },
  
  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('admin_token')
  },
  
  // Cambiar contraseña
  async changePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, message: 'Contraseña actualizada correctamente' }
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      return { success: false, error: error.message }
    }
  },
  
  // Obtener token JWT actual
  getToken() {
    return localStorage.getItem('admin_token')
  }
}

export default authService
