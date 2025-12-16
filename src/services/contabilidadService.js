import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Servicio para gestionar el módulo de Contabilidad
 * Incluye: Cajas, Movimientos, Gastos Fijos, Gastos Variables e Ingresos
 */
export const contabilidadService = {
  // =============================================
  // CAJAS
  // =============================================
  
  /**
   * Obtener todas las cajas con filtros opcionales
   */
  getCajas: async (filters = {}) => {
    try {
      let query = supabase
        .from('contabilidad_caja')
        .select('*')
        .order('anio', { ascending: false })
        .order('mes', { ascending: false })
      
      if (filters.mes !== undefined) {
        query = query.eq('mes', filters.mes)
      }
      if (filters.anio !== undefined) {
        query = query.eq('anio', filters.anio)
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado)
      }
      
      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getCajas:', error)
      return { data: null, error }
    }
  },

  /**
   * Obtener una caja por ID con sus movimientos
   */
  getCajaById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('contabilidad_caja')
        .select(`
          *,
          movimientos:contabilidad_movimiento(*)
        `)
        .eq('id_caja', id)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getCajaById:', error)
      return { data: null, error }
    }
  },

  /**
   * Crear una nueva caja
   */
  createCaja: async (cajaData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const newCaja = {
        nombre: cajaData.nombre,
        descripcion: cajaData.descripcion || null,
        mes: cajaData.mes,
        anio: cajaData.anio,
        monto_inicial: cajaData.monto_inicial || 0,
        monto_actual: cajaData.monto_inicial || 0,
        estado: 'abierta',
        created_by: user?.id || null,
        auditoria: user?.email || 'system'
      }
      
      const { data, error } = await supabase
        .from('contabilidad_caja')
        .insert([newCaja])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error createCaja:', error)
      return { data: null, error }
    }
  },

  /**
   * Actualizar una caja
   */
  updateCaja: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('contabilidad_caja')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        })
        .eq('id_caja', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updateCaja:', error)
      return { data: null, error }
    }
  },

  /**
   * Eliminar una caja (y sus movimientos por CASCADE)
   */
  deleteCaja: async (id) => {
    try {
      const { error } = await supabase
        .from('contabilidad_caja')
        .delete()
        .eq('id_caja', id)
      
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleteCaja:', error)
      return { success: false, error }
    }
  },

  /**
   * Cerrar una caja
   */
  cerrarCaja: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('contabilidad_caja')
        .update({
          estado: 'cerrada',
          fecha_cierre: new Date().toISOString(),
          cerrado_por: user?.id || null,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        })
        .eq('id_caja', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error cerrarCaja:', error)
      return { data: null, error }
    }
  },

  // =============================================
  // MOVIMIENTOS
  // =============================================
  
  /**
   * Obtener movimientos de una caja
   */
  getMovimientos: async (idCaja, filters = {}) => {
    try {
      let query = supabase
        .from('contabilidad_movimiento')
        .select('*')
        .eq('id_caja', idCaja)
        .order('fecha', { ascending: true })
        .order('created_at', { ascending: true })
      
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters.fechaInicio) {
        query = query.gte('fecha', filters.fechaInicio)
      }
      if (filters.fechaFin) {
        query = query.lte('fecha', filters.fechaFin)
      }
      
      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getMovimientos:', error)
      return { data: null, error }
    }
  },

  /**
   * Crear un nuevo movimiento
   */
  createMovimiento: async (movimientoData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const newMovimiento = {
        id_caja: movimientoData.id_caja,
        tipo: movimientoData.tipo,
        categoria: movimientoData.categoria || null,
        descripcion: movimientoData.descripcion,
        monto: parseFloat(movimientoData.monto) || 0,
        fecha: movimientoData.fecha || new Date().toISOString().split('T')[0],
        tipo_documento: movimientoData.tipo_documento || 'BOLETA',
        numero_documento: movimientoData.numero_documento || null,
        observaciones: movimientoData.observaciones || null,
        created_by: user?.id || null,
        auditoria: user?.email || 'system'
      }
      
      const { data, error } = await supabase
        .from('contabilidad_movimiento')
        .insert([newMovimiento])
        .select()
        .single()
      
      if (error) throw error
      
      // Actualizar monto_actual de la caja
      await contabilidadService.recalcularSaldoCaja(movimientoData.id_caja)
      
      return { data, error: null }
    } catch (error) {
      console.error('Error createMovimiento:', error)
      return { data: null, error }
    }
  },

  /**
   * Actualizar un movimiento
   */
  updateMovimiento: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Primero obtenemos el movimiento actual para saber la caja
      const { data: movActual } = await supabase
        .from('contabilidad_movimiento')
        .select('id_caja')
        .eq('id_movimiento', id)
        .single()
      
      const { data, error } = await supabase
        .from('contabilidad_movimiento')
        .update({
          ...updates,
          monto: updates.monto ? parseFloat(updates.monto) : undefined,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        })
        .eq('id_movimiento', id)
        .select()
        .single()
      
      if (error) throw error
      
      // Recalcular saldo de la caja
      if (movActual?.id_caja) {
        await contabilidadService.recalcularSaldoCaja(movActual.id_caja)
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error updateMovimiento:', error)
      return { data: null, error }
    }
  },

  /**
   * Eliminar un movimiento
   */
  deleteMovimiento: async (id) => {
    try {
      // Primero obtenemos el movimiento para saber la caja
      const { data: movimiento } = await supabase
        .from('contabilidad_movimiento')
        .select('id_caja')
        .eq('id_movimiento', id)
        .single()
      
      const { error } = await supabase
        .from('contabilidad_movimiento')
        .delete()
        .eq('id_movimiento', id)
      
      if (error) throw error
      
      // Recalcular saldo de la caja
      if (movimiento?.id_caja) {
        await contabilidadService.recalcularSaldoCaja(movimiento.id_caja)
      }
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleteMovimiento:', error)
      return { success: false, error }
    }
  },

  /**
   * Recalcular el saldo actual de una caja
   */
  recalcularSaldoCaja: async (idCaja) => {
    try {
      // Obtener la caja
      const { data: caja } = await supabase
        .from('contabilidad_caja')
        .select('monto_inicial')
        .eq('id_caja', idCaja)
        .single()
      
      // Obtener todos los movimientos
      const { data: movimientos } = await supabase
        .from('contabilidad_movimiento')
        .select('tipo, monto')
        .eq('id_caja', idCaja)
      
      const totalIngresos = movimientos?.filter(m => m.tipo === 'ingreso')
        .reduce((acc, m) => acc + parseFloat(m.monto), 0) || 0
      
      const totalEgresos = movimientos?.filter(m => m.tipo === 'egreso')
        .reduce((acc, m) => acc + parseFloat(m.monto), 0) || 0
      
      const montoActual = (parseFloat(caja?.monto_inicial) || 0) + totalIngresos - totalEgresos
      
      await supabase
        .from('contabilidad_caja')
        .update({ monto_actual: montoActual })
        .eq('id_caja', idCaja)
      
      return { montoActual, totalIngresos, totalEgresos }
    } catch (error) {
      console.error('Error recalcularSaldoCaja:', error)
      return null
    }
  },

  // =============================================
  // GASTOS (TABLA UNIFICADA)
  // =============================================
  
  /**
   * Obtener gastos con filtros (tabla unificada)
   */
  getGastos: async (filters = {}) => {
    try {
      let query = supabase
        .from('contabilidad_gasto')
        .select('*')
        .order('fecha', { ascending: false })
      
      if (filters.tipo_gasto) {
        query = query.eq('tipo_gasto', filters.tipo_gasto)
      }
      if (filters.mes !== undefined) {
        query = query.eq('mes', filters.mes + 1) // Ajustar porque JS usa 0-11
      }
      if (filters.anio !== undefined) {
        query = query.eq('anio', filters.anio)
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado)
      }
      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria)
      }
      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }
      
      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getGastos:', error)
      return { data: null, error }
    }
  },

  /**
   * Obtener un gasto por ID
   */
  getGastoById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('contabilidad_gasto')
        .select('*')
        .eq('id_gasto', id)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getGastoById:', error)
      return { data: null, error }
    }
  },

  /**
   * Crear gasto (fijo o variable)
   */
  createGasto: async (gastoData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const fecha = gastoData.fecha ? new Date(gastoData.fecha) : new Date()
      
      const newGasto = {
        tipo_gasto: gastoData.tipo_gasto,
        nombre: gastoData.nombre,
        descripcion: gastoData.descripcion || null,
        categoria: gastoData.categoria || 'otros',
        monto: parseFloat(gastoData.monto) || 0,
        moneda: gastoData.moneda || 'PEN',
        monto_original: gastoData.monto_original ? parseFloat(gastoData.monto_original) : null,
        tipo_cambio: gastoData.tipo_cambio ? parseFloat(gastoData.tipo_cambio) : null,
        fecha: gastoData.fecha || new Date().toISOString().split('T')[0],
        mes: fecha.getMonth() + 1,
        anio: fecha.getFullYear(),
        dia_vencimiento: gastoData.dia_vencimiento || null,
        es_recurrente: gastoData.es_recurrente || false,
        activo: gastoData.activo !== false,
        id_caja: gastoData.id_caja || null,
        tipo_documento: gastoData.tipo_documento || 'BOLETA',
        numero_documento: gastoData.numero_documento || null,
        proveedor: gastoData.proveedor || null,
        comprobante_url: gastoData.comprobante_url || null,
        estado: gastoData.estado || 'pendiente',
        fecha_pago: gastoData.fecha_pago || null,
        created_by: user?.id || null,
        auditoria: user?.email || 'system'
      }
      
      const { data, error } = await supabase
        .from('contabilidad_gasto')
        .insert([newGasto])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error createGasto:', error)
      return { data: null, error }
    }
  },

  /**
   * Actualizar gasto
   */
  updateGasto: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Si se actualiza la fecha, actualizar también mes y anio
      if (updates.fecha) {
        const fecha = new Date(updates.fecha)
        updates.mes = fecha.getMonth() + 1
        updates.anio = fecha.getFullYear()
      }
      
      const { data, error } = await supabase
        .from('contabilidad_gasto')
        .update({
          ...updates,
          monto: updates.monto ? parseFloat(updates.monto) : undefined,
          monto_original: updates.monto_original ? parseFloat(updates.monto_original) : undefined,
          tipo_cambio: updates.tipo_cambio ? parseFloat(updates.tipo_cambio) : undefined,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        })
        .eq('id_gasto', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updateGasto:', error)
      return { data: null, error }
    }
  },

  /**
   * Eliminar gasto
   */
  deleteGasto: async (id) => {
    try {
      const { error } = await supabase
        .from('contabilidad_gasto')
        .delete()
        .eq('id_gasto', id)
      
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleteGasto:', error)
      return { success: false, error }
    }
  },

  /**
   * Marcar gasto como pagado
   */
  marcarGastoPagado: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('contabilidad_gasto')
        .update({
          estado: 'pagado',
          fecha_pago: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        })
        .eq('id_gasto', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error marcarGastoPagado:', error)
      return { data: null, error }
    }
  },

  /**
   * Obtener gastos fijos (legacy compatibility)
   */
  getGastosFijos: async (soloActivos = true) => {
    try {
      let query = supabase
        .from('contabilidad_gasto')
        .select('*')
        .eq('tipo_gasto', 'fijo')
        .order('dia_vencimiento', { ascending: true })
      
      if (soloActivos) {
        query = query.eq('activo', true)
      }
      
      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getGastosFijos:', error)
      return { data: null, error }
    }
  },

  /**
   * Obtener gastos variables con filtros (legacy compatibility)
   */
  getGastosVariables: async (filters = {}) => {
    try {
      let query = supabase
        .from('contabilidad_gasto')
        .select('*')
        .eq('tipo_gasto', 'variable')
        .order('fecha', { ascending: false })
      
      if (filters.mes !== undefined && filters.anio !== undefined) {
        query = query.eq('mes', filters.mes + 1).eq('anio', filters.anio)
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado)
      }
      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria)
      }
      
      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getGastosVariables:', error)
      return { data: null, error }
    }
  },

  /**
   * Crear gasto fijo (legacy compatibility)
   */
  createGastoFijo: async (gastoData) => {
    return contabilidadService.createGasto({
      ...gastoData,
      tipo_gasto: 'fijo',
      es_recurrente: true
    })
  },

  /**
   * Crear gasto variable (legacy compatibility)
   */
  createGastoVariable: async (gastoData) => {
    return contabilidadService.createGasto({
      ...gastoData,
      tipo_gasto: 'variable'
    })
  },

  /**
   * Actualizar gasto fijo (legacy)
   */
  updateGastoFijo: async (id, updates) => {
    return contabilidadService.updateGasto(id, updates)
  },

  /**
   * Actualizar gasto variable (legacy)
   */
  updateGastoVariable: async (id, updates) => {
    return contabilidadService.updateGasto(id, updates)
  },

  /**
   * Eliminar gasto fijo (legacy)
   */
  deleteGastoFijo: async (id) => {
    return contabilidadService.deleteGasto(id)
  },

  /**
   * Eliminar gasto variable (legacy)
   */
  deleteGastoVariable: async (id) => {
    return contabilidadService.deleteGasto(id)
  },
  // =============================================
  // INGRESOS
  // =============================================
  
  /**
   * Obtener ingresos con filtros
   */
  getIngresos: async (filters = {}) => {
    try {
      let query = supabase
        .from('contabilidad_ingreso')
        .select(`
          *,
          cliente:cliente(nombre, numero_documento)
        `)
        .order('fecha', { ascending: false })
      
      if (filters.mes !== undefined && filters.anio !== undefined) {
        const startDate = `${filters.anio}-${String(filters.mes + 1).padStart(2, '0')}-01`
        const endDate = new Date(filters.anio, filters.mes + 1, 0).toISOString().split('T')[0]
        query = query.gte('fecha', startDate).lte('fecha', endDate)
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado)
      }
      if (filters.metodo_pago) {
        query = query.eq('metodo_pago', filters.metodo_pago)
      }
      
      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getIngresos:', error)
      return { data: null, error }
    }
  },

  /**
   * Crear ingreso
   */
  createIngreso: async (ingresoData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('contabilidad_ingreso')
        .insert([{
          ...ingresoData,
          monto: parseFloat(ingresoData.monto) || 0,
          created_by: user?.id || null,
          auditoria: user?.email || 'system'
        }])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error createIngreso:', error)
      return { data: null, error }
    }
  },

  /**
   * Actualizar ingreso
   */
  updateIngreso: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('contabilidad_ingreso')
        .update({
          ...updates,
          monto: updates.monto ? parseFloat(updates.monto) : undefined,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        })
        .eq('id_ingreso', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updateIngreso:', error)
      return { data: null, error }
    }
  },

  /**
   * Eliminar ingreso
   */
  deleteIngreso: async (id) => {
    try {
      const { error } = await supabase
        .from('contabilidad_ingreso')
        .delete()
        .eq('id_ingreso', id)
      
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleteIngreso:', error)
      return { success: false, error }
    }
  },

  // =============================================
  // REPORTES Y ESTADISTICAS
  // =============================================
  
  /**
   * Obtener resumen financiero del mes
   */
  getResumenMes: async (mes, anio) => {
    try {
      const startDate = `${anio}-${String(mes + 1).padStart(2, '0')}-01`
      const endDate = new Date(anio, mes + 1, 0).toISOString().split('T')[0]
      
      // Obtener movimientos del mes
      const { data: movimientos } = await supabase
        .from('contabilidad_movimiento')
        .select('tipo, monto')
        .gte('fecha', startDate)
        .lte('fecha', endDate)
      
      // Obtener gastos del mes (tabla unificada)
      const { data: gastos } = await supabase
        .from('contabilidad_gasto')
        .select('monto, estado, tipo_gasto')
        .eq('mes', mes + 1)
        .eq('anio', anio)
      
      // Obtener ingresos del mes
      const { data: ingresos } = await supabase
        .from('contabilidad_ingreso')
        .select('monto, estado')
        .gte('fecha', startDate)
        .lte('fecha', endDate)
      
      // Calcular totales
      const totalIngresosCaja = movimientos?.filter(m => m.tipo === 'ingreso')
        .reduce((acc, m) => acc + parseFloat(m.monto), 0) || 0
      
      const totalEgresosCaja = movimientos?.filter(m => m.tipo === 'egreso')
        .reduce((acc, m) => acc + parseFloat(m.monto), 0) || 0
      
      const totalGastosFijos = gastos?.filter(g => g.tipo_gasto === 'fijo')
        .reduce((acc, g) => acc + parseFloat(g.monto), 0) || 0
      
      const totalGastosVariables = gastos?.filter(g => g.tipo_gasto === 'variable')
        .reduce((acc, g) => acc + parseFloat(g.monto), 0) || 0
      
      const gastosPagados = gastos?.filter(g => g.estado === 'pagado')
        .reduce((acc, g) => acc + parseFloat(g.monto), 0) || 0
      
      const totalIngresos = ingresos?.reduce((acc, i) => acc + parseFloat(i.monto), 0) || 0
      const ingresosCobrados = ingresos?.filter(i => i.estado === 'cobrado')
        .reduce((acc, i) => acc + parseFloat(i.monto), 0) || 0
      
      return {
        data: {
          mes,
          anio,
          caja: {
            ingresos: totalIngresosCaja,
            egresos: totalEgresosCaja,
            balance: totalIngresosCaja - totalEgresosCaja
          },
          gastos: {
            fijos: totalGastosFijos,
            variables: totalGastosVariables,
            total: totalGastosFijos + totalGastosVariables,
            pagados: gastosPagados,
            pendientes: (totalGastosFijos + totalGastosVariables) - gastosPagados
          },
          ingresos: {
            total: totalIngresos,
            cobrados: ingresosCobrados,
            pendientes: totalIngresos - ingresosCobrados
          },
          balanceGeneral: totalIngresosCaja + ingresosCobrados - totalEgresosCaja - gastosPagados
        },
        error: null
      }
    } catch (error) {
      console.error('Error getResumenMes:', error)
      return { data: null, error }
    }
  },

  /**
   * Obtener categorías de gastos desde paramétrica
   */
  getCategoriasGastos: async () => {
    try {
      const { data, error } = await supabase
        .from('parametrica')
        .select('codigo_parametro, descripcion, valor')
        .eq('tipo_parametro', 'categoria_gasto')
        .eq('estado', true)
        .order('orden', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getCategoriasGastos:', error)
      return { data: null, error }
    }
  },

  /**
   * Obtener categorías de ingresos desde paramétrica
   */
  getCategoriasIngresos: async () => {
    try {
      const { data, error } = await supabase
        .from('parametrica')
        .select('codigo_parametro, descripcion, valor')
        .eq('tipo_parametro', 'categoria_ingreso')
        .eq('estado', true)
        .order('orden', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getCategoriasIngresos:', error)
      return { data: null, error }
    }
  }
}

export default contabilidadService
