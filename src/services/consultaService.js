import { supabase } from '../lib/supabase.js'

// URL base para edge functions
const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

/**
 * Servicio para gestionar consultas en la tabla detalle_consulta
 */

/**
 * Crear una nueva consulta usando la edge function
 * Esta función crea automáticamente el cliente/proveedor si no existe
 * @param {Object} consultaData - Datos de la consulta desde el formulario
 * @param {string} consultaData.tipoRelacion - 'cliente' o 'proveedor'
 * @param {string} consultaData.tipoDocumento - 'DNI', 'RUC', 'CE', 'PAS'
 * @param {string} consultaData.numeroDocumento - Número de documento
 * @param {string} consultaData.nombre - Nombre completo
 * @param {string} consultaData.email - Email
 * @param {string} consultaData.telefono - Teléfono
 * @param {string} consultaData.mensaje - Mensaje de la consulta
 * @param {string} consultaData.tipoConsulta - Código del tipo de consulta
 * @param {string} consultaData.descripcionTipoConsulta - Descripción completa del tipo
 * @param {string} consultaData.asunto - Asunto (opcional)
 * @returns {Promise<Object>} - Resultado de la inserción
 */
export async function crearConsulta(consultaData) {
  try {
    const url = `${SUPABASE_URL}/functions/v1/create-detalle-consulta`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipoRelacion: consultaData.tipoRelacion,
        tipoDocumento: consultaData.tipoDocumento,
        numeroDocumento: consultaData.numeroDocumento,
        nombre: consultaData.nombre,
        email: consultaData.email,
        telefono: consultaData.telefono,
        mensaje: consultaData.mensaje,
        tipoConsulta: consultaData.tipoConsulta,
        descripcionTipoConsulta: consultaData.descripcionTipoConsulta,
        asunto: consultaData.asunto || null,
        prioridad: consultaData.prioridad || 'Media'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al crear consulta')
    }

    return { success: true, data: result.datos, error: null }
  } catch (error) {
    console.error('Error creando consulta:', error)
    return { success: false, data: null, error: error.message }
  }
}

/**
 * Obtener consultas
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<Object>} - Lista de consultas
 */
export async function obtenerConsultas(options = {}) {
  try {
    let query = supabase
      .from('detalle_consulta')
      .select('*')
      .eq('estado', true)

    // Aplicar filtros si existen
    if (options.id_cliente) {
      query = query.eq('id_cliente', options.id_cliente)
    }
    
    if (options.id_proveedor) {
      query = query.eq('id_proveedor', options.id_proveedor)
    }

    if (options.estado_consulta) {
      query = query.eq('estado_consulta', options.estado_consulta)
    }

    // Ordenar por fecha de creación descendente
    query = query.order('created_at', { ascending: false })

    // Limitar resultados si se especifica
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data, error: null }
  } catch (error) {
    console.error('Error obteniendo consultas:', error)
    return { success: false, data: [], error: error.message }
  }
}

/**
 * Actualizar estado de una consulta
 * @param {string} id - ID de la consulta
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} - Resultado de la actualización
 */
export async function actualizarConsulta(id, updates) {
  try {
    const { data, error } = await supabase
      .from('detalle_consulta')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id_detalle_consulta', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { success: true, data, error: null }
  } catch (error) {
    console.error('Error actualizando consulta:', error)
    return { success: false, data: null, error: error.message }
  }
}

/**
 * Agregar respuesta a una consulta
 * @param {string} id - ID de la consulta
 * @param {string} respuesta - Texto de la respuesta
 * @returns {Promise<Object>} - Resultado de la actualización
 */
export async function responderConsulta(id, respuesta) {
  try {
    const { data, error } = await supabase
      .from('detalle_consulta')
      .update({
        respuesta: respuesta,
        fecha_respuesta: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id_detalle_consulta', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { success: true, data, error: null }
  } catch (error) {
    console.error('Error respondiendo consulta:', error)
    return { success: false, data: null, error: error.message }
  }
}

