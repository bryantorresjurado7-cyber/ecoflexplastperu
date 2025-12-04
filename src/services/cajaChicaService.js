import { supabase } from '../lib/supabase'

export const cajaChicaService = {
    // 1. Panel Principal
    getResumen: async () => {
        // En una implementación real, esto vendría de una vista o consulta compleja
        // Por ahora simulamos o hacemos consultas básicas
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        try {
            // Saldo actual (sum of all ingresos - sum of all egresos approved)
            // Esto es costoso de calcular cada vez, idealmente se guarda en una tabla de saldos
            // Simularemos con datos dummy si no hay tablas, pero intentaremos consultar

            const { data: movimientos, error } = await supabase
                .from('caja_chica_movimientos')
                .select('*')

            if (error) throw error

            const saldoActual = movimientos?.reduce((acc, curr) => {
                if (curr.tipo === 'ingreso') return acc + curr.monto
                if (curr.tipo === 'egreso' && curr.estado === 'aprobado') return acc - curr.monto
                return acc
            }, 0) || 0

            const ingresosMes = movimientos?.filter(m => m.tipo === 'ingreso' && m.fecha >= startOfMonth)
                .reduce((acc, curr) => acc + curr.monto, 0) || 0

            const egresosMes = movimientos?.filter(m => m.tipo === 'egreso' && m.estado === 'aprobado' && m.fecha >= startOfMonth)
                .reduce((acc, curr) => acc + curr.monto, 0) || 0

            return {
                saldoActual,
                ingresosMes,
                egresosMes,
                alertas: [] // Implementar lógica de alertas
            }
        } catch (error) {
            console.error('Error getting resumen:', error)
            return { saldoActual: 0, ingresosMes: 0, egresosMes: 0, alertas: [] }
        }
    },

    // 2 & 3. Movimientos (Ingresos y Egresos)
    getMovimientos: async (filters = {}) => {
        let query = supabase
            .from('caja_chica_movimientos')
            .select(`
        *,
        responsable:admin_profiles!responsable_id(nombre, email),
        aprobador:admin_profiles!aprobado_por(nombre)
      `)
            .order('fecha', { ascending: false })

        if (filters.tipo) query = query.eq('tipo', filters.tipo)
        if (filters.estado) query = query.eq('estado', filters.estado)
        if (filters.fechaInicio) query = query.gte('fecha', filters.fechaInicio)
        if (filters.fechaFin) query = query.lte('fecha', filters.fechaFin)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    createMovimiento: async (movimiento) => {
        const { data, error } = await supabase
            .from('caja_chica_movimientos')
            .insert([movimiento])
            .select()
        if (error) throw error
        return data[0]
    },

    updateMovimiento: async (id, updates) => {
        const { data, error } = await supabase
            .from('caja_chica_movimientos')
            .update(updates)
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    // 4. Aprobaciones
    aprobarGasto: async (id, aprobadorId, comentarios) => {
        const { data, error } = await supabase
            .from('caja_chica_movimientos')
            .update({
                estado: 'aprobado',
                aprobado_por: aprobadorId,
                fecha_aprobacion: new Date().toISOString(),
                comentarios_aprobacion: comentarios
            })
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    rechazarGasto: async (id, aprobadorId, comentarios) => {
        const { data, error } = await supabase
            .from('caja_chica_movimientos')
            .update({
                estado: 'rechazado',
                aprobado_por: aprobadorId,
                fecha_aprobacion: new Date().toISOString(),
                comentarios_aprobacion: comentarios
            })
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    // 7. Configuración
    getConfig: async () => {
        const { data, error } = await supabase
            .from('caja_chica_config')
            .select('*')
            .single()
        if (error) return null // Return default config if not found
        return data
    },

    updateConfig: async (config) => {
        // Upsert
        const { data, error } = await supabase
            .from('caja_chica_config')
            .upsert([config])
            .select()
        if (error) throw error
        return data[0]
    },

    // 8. Arqueo
    createArqueo: async (arqueo) => {
        const { data, error } = await supabase
            .from('caja_chica_arqueos')
            .insert([arqueo])
            .select()
        if (error) throw error
        return data[0]
    },

    getArqueos: async () => {
        const { data, error } = await supabase
            .from('caja_chica_arqueos')
            .select('*')
            .order('fecha_cierre', { ascending: false })
        if (error) throw error
        return data
    }
}

export default cajaChicaService
