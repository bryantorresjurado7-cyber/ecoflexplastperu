import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getAppUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_APP_URL || 'https://ecoflexplastperu.com'
  }
  return 'http://localhost:5173'
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    redirectTo: `${getAppUrl()}/admin/login`
  }
})

export const getAuthenticatedClient = () => {
  return supabase
}

export const supabaseService = {
  async testConnection() {
    return { success: true, message: 'Conexión disponible' }
  },

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
