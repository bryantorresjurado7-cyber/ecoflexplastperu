import { supabase } from '../lib/supabase'

/**
 * Servicio para gestionar órdenes de producción desde Supabase
 */

const produccionService = {
  /**
   * Cargar todas las órdenes de producción
   */
  async loadProducciones(filters = {}) {
    try {
      let query = supabase
      .from('produccion')
      .select(`
        *,
        producto:productos_db (
          id,
          nombre,
          codigo,
          categoria
        )
      `)
        .order('fecha_produccion', { ascending: false })
        .order('created_at', { ascending: false })
      
      // Aplicar filtros
      if (filters.estado && filters.estado !== 'all') {
        query = query.eq('estado', filters.estado)
      }
      
      if (filters.fechaDesde) {
        query = query.gte('fecha_produccion', filters.fechaDesde)
      }
      
      if (filters.fechaHasta) {
        query = query.lte('fecha_produccion', filters.fechaHasta)
      }
      
      if (filters.search) {
        query = query.or(`codigo_produccion.ilike.%${filters.search}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error cargando producciones:', error)
      return { data: [], error: error.message }
    }
  },

  /**
   * Cargar una orden de producción por ID
   */
  async loadProduccion(id) {
    try {
      const { data, error } = await supabase
      .from('produccion')
      .select(`
        *,
        producto:productos_db (
          id,
          nombre,
          codigo,
          categoria,
          precio_unitario
        )
      `)
        .eq('id_produccion', id)
        .single()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error cargando producción:', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Crear nueva orden de producción
   */
  async createProduccion(produccionData) {
    try {
      // Generar código de producción automático
      if (!produccionData.codigo_produccion) {
        const fecha = new Date()
        const fechaStr = fecha.toISOString().split('T')[0].replace(/-/g, '')
        
        const { count } = await supabase
          .from('produccion')
          .select('*', { count: 'exact', head: true })
          .gte('fecha_produccion', fecha.toISOString().split('T')[0])
        
        const numeroSecuencia = ((count || 0) + 1).toString().padStart(4, '0')
        produccionData.codigo_produccion = `PROD-${fechaStr}-${numeroSecuencia}`
      }
      
      // Calcular costo total si no está definido
      if (!produccionData.costo_total && produccionData.cantidad_planificada && produccionData.costo_unitario) {
        produccionData.costo_total = Number(produccionData.cantidad_planificada) * Number(produccionData.costo_unitario)
      }
      
      const { data, error } = await supabase
        .from('produccion')
        .insert([produccionData])
        .select()
        .single()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error creando producción:', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Actualizar orden de producción
   */
  async updateProduccion(id, produccionData) {
    try {
      // Recalcular costo total si cambian cantidad o costo unitario
      if ((produccionData.cantidad_planificada !== undefined || produccionData.costo_unitario !== undefined)) {
        const { data: current } = await supabase
          .from('produccion')
          .select('cantidad_planificada, costo_unitario')
          .eq('id_produccion', id)
          .single()
        
        const cantidad = produccionData.cantidad_planificada ?? current?.cantidad_planificada ?? 0
        const costoUnit = produccionData.costo_unitario ?? current?.costo_unitario ?? 0
        produccionData.costo_total = Number(cantidad) * Number(costoUnit)
      }
      
      produccionData.updated_at = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('produccion')
        .update(produccionData)
        .eq('id_produccion', id)
        .select()
        .single()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error actualizando producción:', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Eliminar orden de producción
   */
  async deleteProduccion(id) {
    try {
      const { error } = await supabase
        .from('produccion')
        .delete()
        .eq('id_produccion', id)
      
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      console.error('Error eliminando producción:', error)
      return { error: error.message }
    }
  },

  /**
   * Obtener estadísticas de producción
   */
  async getProduccionStats() {
    try {
      const { count: total } = await supabase
        .from('produccion')
        .select('*', { count: 'exact', head: true })
      
      const { count: pendientes } = await supabase
        .from('produccion')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')
      
      const { count: enProceso } = await supabase
        .from('produccion')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'en_proceso')
      
      const { count: completadas } = await supabase
        .from('produccion')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completada')
      
      return {
        data: {
          total: total || 0,
          pendientes: pendientes || 0,
          enProceso: enProceso || 0,
          completadas: completadas || 0
        },
        error: null
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return {
        data: { total: 0, pendientes: 0, enProceso: 0, completadas: 0 },
        error: error.message
      }
    }
  }
}

export default produccionService

