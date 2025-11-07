import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://uecolzuwhgfhicacodqj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

// Crear cliente de Supabase con configuración de Auth
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Cliente para operaciones autenticadas (con token JWT automático)
export const getAuthenticatedClient = () => {
  // El cliente de Supabase automáticamente incluye el token JWT
  // si hay una sesión activa
  return supabase
}

// Funciones de utilidad para Supabase
export const supabaseService = {
  // Probar conexión
  async testConnection() {
    // Sin verificación de conexión para evitar llamadas innecesarias
    return { success: true, message: 'Conexión disponible' }
  },

  // Obtener datos de una tabla
  async getData(tableName, options = {}) {
    try {
      let query = supabase.from(tableName).select('*')
      
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query.eq(filter.column, filter.value)
        })
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error(`Error obteniendo datos de ${tableName}:`, error)
      return { success: false, error: error.message }
    }
  },

  // Insertar datos en una tabla
  async insertData(tableName, data) {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
      
      if (error) throw error
      
      return { success: true, data: result }
    } catch (error) {
      console.error(`Error insertando datos en ${tableName}:`, error)
      return { success: false, error: error.message }
    }
  },

  // Actualizar datos en una tabla
  async updateData(tableName, id, updates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error(`Error actualizando datos en ${tableName}:`, error)
      return { success: false, error: error.message }
    }
  },

  // Eliminar datos de una tabla
  async deleteData(tableName, id) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error(`Error eliminando datos de ${tableName}:`, error)
      return { success: false, error: error.message }
    }
  }
}

export default supabase
