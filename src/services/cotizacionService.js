// URL base para edge functions
const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

/**
 * Crear una nueva cotización usando el edge function crud-cotizaciones
 * @param {Object} cotizacionData - Datos de la cotización
 * @param {string} cotizacionData.cliente_tipo_documento - Tipo de documento del cliente
 * @param {string} cotizacionData.cliente_numero_documento - Número de documento del cliente
 * @param {string} cotizacionData.cliente_nombre - Nombre del cliente
 * @param {string} cotizacionData.cliente_email - Email del cliente
 * @param {string} cotizacionData.cliente_telefono - Teléfono del cliente
 * @param {string} [cotizacionData.cliente_empresa] - Empresa del cliente (opcional)
 * @param {string} [cotizacionData.cliente_direccion] - Dirección del cliente (opcional)
 * @param {Array} cotizacionData.productos - Array de productos con {id, cantidad, precio_unitario}
 * @param {string} [cotizacionData.estado] - Estado de la cotización (default: 'pendiente')
 * @param {string} [cotizacionData.observaciones] - Observaciones adicionales (opcional)
 * @param {number} [cotizacionData.descuento] - Descuento aplicado (opcional, default: 0)
 * @param {string} [cotizacionData.fecha_vencimiento] - Fecha de vencimiento (opcional)
 * @returns {Promise<Object>} - Resultado de la creación
 */
export async function createCotizacion(cotizacionData) {
  try {
    const url = `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cotizacionData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al crear cotización')
    }

    return { success: true, data: result.data, error: null }
  } catch (error) {
    console.error('Error creando cotización:', error)
    return { success: false, data: null, error: error.message }
  }
}

/**
 * Obtener cotizaciones con paginación
 * @param {Object} options - Opciones de paginación y filtrado
 * @param {number} [options.page=1] - Página actual
 * @param {number} [options.limit=20] - Cantidad de registros por página
 * @param {string} [options.estado] - Filtrar por estado (opcional)
 * @returns {Promise<Object>} - Lista de cotizaciones con paginación
 */
export async function getCotizaciones(options = {}) {
  try {
    const page = options.page || 1
    const limit = options.limit || 20
    const estado = options.estado

    const queryParams = new URLSearchParams()
    queryParams.set('page', page.toString())
    queryParams.set('limit', limit.toString())
    if (estado) {
      queryParams.set('estado', estado)
    }

    const url = `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones?${queryParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al obtener cotizaciones')
    }

    return { success: true, data: result.data, pagination: result.pagination, error: null }
  } catch (error) {
    console.error('Error obteniendo cotizaciones:', error)
    return { success: false, data: null, pagination: null, error: error.message }
  }
}

/**
 * Obtener una cotización por ID
 * @param {string} idCotizacion - ID de la cotización
 * @returns {Promise<Object>} - Datos de la cotización
 */
export async function getCotizacionById(idCotizacion) {
  try {
    const url = `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones/${idCotizacion}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al obtener cotización')
    }

    return { success: true, data: result.data, error: null }
  } catch (error) {
    console.error('Error obteniendo cotización:', error)
    return { success: false, data: null, error: error.message }
  }
}

