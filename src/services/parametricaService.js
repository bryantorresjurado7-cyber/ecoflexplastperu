// URL base para edge functions
const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

/**
 * Llamar a la edge function get-parametrica
 * @param {string} tipoParametro - Tipo de parámetro a buscar (ej: 'tipo_consulta', 'tipo_documento')
 * @param {string|boolean} estado - Estado de los registros: 'true', 'false', 'all'. Por defecto 'true'
 * @returns {Promise<Object>} - Respuesta de la edge function con los datos
 */
export async function getParametrica(tipoParametro, estado = 'true') {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('tipo_parametro', tipoParametro);
    if (estado) {
      queryParams.set('estado', estado.toString());
    }
    
    const url = `${SUPABASE_URL}/functions/v1/get-parametrica?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Function error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido');
    }
    
    // Filtrar duplicados en el cliente como medida de seguridad
    // Usamos codigo_parametro como clave única
    let datosUnicos = []
    if (result.datos && result.datos.length > 0) {
      const visto = new Set() // Set para verificar códigos únicos
      
      // Ordenar por orden y luego por created_at descendente (más reciente primero)
      const datosOrdenados = [...result.datos].sort((a, b) => {
        // Primero por orden
        if (a.orden !== b.orden) {
          return (a.orden || 0) - (b.orden || 0)
        }
        // Luego por created_at descendente (más reciente primero)
        const fechaA = new Date(a.created_at || 0).getTime()
        const fechaB = new Date(b.created_at || 0).getTime()
        return fechaB - fechaA
      })
      
      for (const registro of datosOrdenados) {
        const codigo = registro.codigo_parametro || registro.codigo || registro.valor
        if (codigo && !visto.has(codigo)) {
          visto.add(codigo)
          datosUnicos.push(registro)
        } else if (!codigo) {
          // Si no tiene codigo, usar id_parametrica como fallback
          const id = registro.id_parametrica || registro.id
          if (id && !visto.has(id)) {
            visto.add(id)
            datosUnicos.push(registro)
          }
        }
      }
    }
    
    return {
      data: datosUnicos.length > 0 ? datosUnicos : (result.datos || []),
      total: datosUnicos.length > 0 ? datosUnicos.length : (result.total_registros || 0),
      error: null
    };
  } catch (error) {
    return {
      data: [],
      total: 0,
      error: error.message
    };
  }
}

/**
 * Obtener tipos de consulta para el formulario de contacto
 * @returns {Promise<Array>} - Array de tipos de consulta
 */
export async function getTiposConsulta() {
  // Intentar diferentes nombres posibles para el tipo de parámetro
  const posiblesNombres = ['tipo_consulta', 'tipo_consultas', 'tipos_consulta', 'consulta_tipo'];
  
  for (const nombre of posiblesNombres) {
    const result = await getParametrica(nombre, 'true');
    if (result.data && result.data.length > 0) {
      return result;
    }
  }
  
  // Si no se encuentra ninguno, retornar array vacío
  return { data: [], total: 0, error: null };
}

