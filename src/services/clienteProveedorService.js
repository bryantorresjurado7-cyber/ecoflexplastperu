// URL base para edge functions
const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

import { supabase } from '../lib/supabase.js'

/**
 * Buscar cliente por tipo y número de documento
 * @param {string} tipoDocumento - Tipo de documento (DNI, RUC, CE, PAS)
 * @param {string} numeroDocumento - Número de documento
 * @returns {Promise<Object>} - Datos del cliente o error
 */
export async function buscarClientePorDocumento(tipoDocumento, numeroDocumento) {
  try {
    if (!tipoDocumento || !numeroDocumento) {
      return { data: null, error: 'Tipo y número de documento son requeridos' }
    }

    // Limpiar el número de documento (sin espacios, pero mantener el formato original)
    const numeroLimpio = numeroDocumento.trim()
    
    console.log('[buscarClientePorDocumento] Buscando cliente:', { tipoDocumento, numeroDocumento: numeroLimpio })
    
    // Buscar en la tabla cliente con todos los filtros desde el inicio
    let { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('tipo_documento', tipoDocumento)
      .eq('numero_documento', numeroLimpio)
      .eq('estado', true)
      .maybeSingle()

    console.log('[buscarClientePorDocumento] Resultado primera búsqueda:', { data, error })

    // Si no encontramos nada, intentar solo con número de documento (sin tipo ni estado)
    if (!data && (!error || error.code === 'PGRST116')) {
      console.log('[buscarClientePorDocumento] Intentando búsqueda solo por número...')
      const { data: dataSimple, error: errorSimple } = await supabase
        .from('cliente')
        .select('*')
        .eq('numero_documento', numeroLimpio)
        .maybeSingle()
      
      console.log('[buscarClientePorDocumento] Resultado búsqueda simple:', { data: dataSimple, error: errorSimple })
      
      if (dataSimple && !errorSimple) {
        // Validar tipo y estado manualmente
        if (dataSimple.tipo_documento === tipoDocumento && dataSimple.estado === true) {
          data = dataSimple
          error = null
        }
      }
    }

    // Si encontramos datos, retornarlos
    if (data) {
      console.log('[buscarClientePorDocumento] Cliente encontrado:', data)
      return { data, error: null }
    }

    // Si no encontramos datos pero tampoco hay error, significa que no existe
    if (!error || error.code === 'PGRST116') {
      console.log('[buscarClientePorDocumento] No se encontró cliente (sin error)')
      // Intentar con edge function como respaldo
      return await buscarClientePorDocumentoEdgeFunction(tipoDocumento, numeroLimpio)
    }

    // Si hay error de RLS o permisos, intentar con edge function
    console.log('[buscarClientePorDocumento] Error en búsqueda:', error)
    if (error.code === 'PGRST301' || error.code === '42501' || error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('row-level security')) {
      console.log('[buscarClientePorDocumento] Intentando con edge function debido a error de permisos')
      return await buscarClientePorDocumentoEdgeFunction(tipoDocumento, numeroLimpio)
    }

    return { data: null, error: error.message }
  } catch (error) {
    console.error('[buscarClientePorDocumento] Error en catch:', error)
    // Si falla, intentar con edge function como respaldo
    try {
      return await buscarClientePorDocumentoEdgeFunction(tipoDocumento, numeroDocumento)
    } catch (err) {
      return { data: null, error: error.message || err.message }
    }
  }
}

/**
 * Buscar cliente usando edge function como respaldo
 */
async function buscarClientePorDocumentoEdgeFunction(tipoDocumento, numeroDocumento) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.set('tipo_documento', tipoDocumento)
    queryParams.set('numero_documento', numeroDocumento)

    const url = `${SUPABASE_URL}/functions/v1/get-cliente?${queryParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return { data: null, error: `Error ${response.status}: No se encontró servicio` }
    }

    const result = await response.json()
    
    if (!result.success) {
      return { data: null, error: result.error || 'Cliente no encontrado' }
    }

    return { data: result.datos || result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

/**
 * Buscar proveedor por tipo y número de documento
 * @param {string} tipoDocumento - Tipo de documento (DNI, RUC, CE, PAS)
 * @param {string} numeroDocumento - Número de documento
 * @returns {Promise<Object>} - Datos del proveedor o error
 */
export async function buscarProveedorPorDocumento(tipoDocumento, numeroDocumento) {
  try {
    if (!tipoDocumento || !numeroDocumento) {
      return { data: null, error: 'Tipo y número de documento son requeridos' }
    }

    // Limpiar el número de documento (sin espacios, mantener formato original)
    const numeroLimpio = numeroDocumento.trim()
    
    console.log('[buscarProveedorPorDocumento] Buscando proveedor:', { tipoDocumento, numeroDocumento: numeroLimpio })
    
    // Buscar en la tabla proveedor con todos los filtros desde el inicio
    let { data, error } = await supabase
      .from('proveedor')
      .select('*')
      .eq('tipo_documento', tipoDocumento)
      .eq('numero_documento', numeroLimpio)
      .eq('estado', true)
      .maybeSingle()

    console.log('[buscarProveedorPorDocumento] Resultado primera búsqueda:', { data, error })

    // Si no encontramos nada, intentar solo con número de documento (sin tipo ni estado)
    if (!data && (!error || error.code === 'PGRST116')) {
      console.log('[buscarProveedorPorDocumento] Intentando búsqueda solo por número...')
      const { data: dataSimple, error: errorSimple } = await supabase
        .from('proveedor')
        .select('*')
        .eq('numero_documento', numeroLimpio)
        .maybeSingle()
      
      console.log('[buscarProveedorPorDocumento] Resultado búsqueda simple:', { data: dataSimple, error: errorSimple })
      
      if (dataSimple && !errorSimple) {
        // Validar tipo y estado manualmente
        if (dataSimple.tipo_documento === tipoDocumento && dataSimple.estado === true) {
          data = dataSimple
          error = null
        }
      }
    }

    // Si encontramos datos, retornarlos
    if (data) {
      console.log('[buscarProveedorPorDocumento] Proveedor encontrado:', data)
      return { data, error: null }
    }

    // Si no encontramos datos pero tampoco hay error, significa que no existe
    if (!error || error.code === 'PGRST116') {
      console.log('[buscarProveedorPorDocumento] No se encontró proveedor (sin error)')
      // Intentar con edge function como respaldo
      return await buscarProveedorPorDocumentoEdgeFunction(tipoDocumento, numeroLimpio)
    }

    // Si hay error de RLS o permisos, intentar con edge function
    console.log('[buscarProveedorPorDocumento] Error en búsqueda:', error)
    if (error.code === 'PGRST301' || error.code === '42501' || error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('row-level security')) {
      console.log('[buscarProveedorPorDocumento] Intentando con edge function debido a error de permisos')
      return await buscarProveedorPorDocumentoEdgeFunction(tipoDocumento, numeroLimpio)
    }

    return { data: null, error: error.message }
  } catch (error) {
    console.error('[buscarProveedorPorDocumento] Error en catch:', error)
    // Si falla, intentar con edge function como respaldo
    try {
      return await buscarProveedorPorDocumentoEdgeFunction(tipoDocumento, numeroDocumento)
    } catch (err) {
      return { data: null, error: error.message || err.message }
    }
  }
}

/**
 * Buscar proveedor usando edge function como respaldo
 */
async function buscarProveedorPorDocumentoEdgeFunction(tipoDocumento, numeroDocumento) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.set('tipo_documento', tipoDocumento)
    queryParams.set('numero_documento', numeroDocumento)

    const url = `${SUPABASE_URL}/functions/v1/get-proveedor?${queryParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return { data: null, error: `Error ${response.status}: No se encontró servicio` }
    }

    const result = await response.json()
    
    if (!result.success) {
      return { data: null, error: result.error || 'Proveedor no encontrado' }
    }

    return { data: result.datos || result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

