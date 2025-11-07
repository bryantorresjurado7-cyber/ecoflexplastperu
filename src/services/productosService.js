import { supabase } from '../lib/supabase'
import { colores } from '../data/productos'

// URL base para edge functions
const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

/**
 * Servicio para gestionar productos desde Supabase
 */

// Mapear categorías de Supabase a español
const categoriasMap = {
  'zunchos': 'Zunchos',
  'esquineros': 'Esquineros',
  'burbupack': 'Burbupack',
  'mangas': 'Mangas',
  'accesorios': 'Accesorios'
}

// Extraer color de los datos del producto
function extractColor(producto) {
  if (producto.colores_disponibles && producto.colores_disponibles.length > 0) {
    return producto.colores_disponibles[0].toLowerCase()
  }
  
  // Buscar color en el nombre
  const colores = ['negro', 'blanco', 'azul', 'amarillo', 'rojo', 'verde', 'transparente']
  const nombreLower = producto.nombre.toLowerCase()
  
  for (const color of colores) {
    if (nombreLower.includes(color)) {
      return color
    }
  }
  
  return 'negro' // Default
}

// Extraer ancho de un zuncho
function extractAncho(producto) {
  if (producto.categoria !== 'zunchos') return null
  
  if (producto.especificaciones?.ancho) {
    return producto.especificaciones.ancho
  }
  
  // Buscar en el nombre: "5/8", "1/2", etc.
  const match = producto.nombre.match(/(\d+\/\d+)/)
  return match ? match[1] : '5/8'
}

// Generar ruta de imagen para un producto
function generateImagenPath(producto) {
  // Si es zuncho, SIEMPRE generar ruta basada en color (ignorar imagen_principal de BD si existe)
  // Verificar tanto 'zunchos' (minúsculas de BD) como 'Zunchos' (mapeado)
  const categoriaLower = (producto.categoria || '').toLowerCase();
  
  if (categoriaLower === 'zunchos' || categoriaLower === 'zuncho') {
    const colorNombre = extractColor(producto);
    const colorInfo = colores.find(c => c.id === colorNombre);
    const carpetaColor = colorInfo?.nombre || colorNombre.charAt(0).toUpperCase() + colorNombre.slice(1);
    
    // ESTRUCTURA CORRECTA: /images/productos/Zunchos/{Color}/zuncho_{color}.png
    // Ejemplo: /images/productos/Zunchos/Azul/zuncho_azul.png
    return `/images/productos/Zunchos/${carpetaColor}/zuncho_${colorNombre}.png`;
  }
  
  // Para otras categorías, usar imagen_principal si existe, sino placeholder
  if (producto.imagen_principal) {
    return producto.imagen_principal;
  }
  
  return '/images/placeholder.png';
}

// Extraer largo de un producto
function extractLargo(producto) {
  // Para esquineros: usar especificaciones.largo_m o buscar en el nombre/código
  if (producto.categoria === 'esquineros') {
    // Prioridad 1: especificaciones.largo_m (el más confiable)
    if (producto.especificaciones?.largo_m) {
      return producto.especificaciones.largo_m
    }
    // Prioridad 2: buscar en el nombre: "42×42mm - 2.3m" -> extraer 2.3 (solo "m" no "mm")
    if (producto.nombre) {
      // Buscar patrón "- X.Xm" al final del nombre (después de un guión)
      // Evitar capturar "42mm" buscando específicamente el patrón al final con decimal
      // El patrón debe ser: guión seguido de número decimal seguido de "m" (no "mm")
      const match = producto.nombre.match(/-\s*(\d+\.?\d*)\s*m\s*$/i);
      if (match) {
        return parseFloat(match[1])
      }
      // Si no encuentra al final, buscar cualquier "- X.Xm" pero verificando que no sea "mm"
      const match2 = producto.nombre.match(/(?:-|\s)(\d+\.?\d*)\s*m(?!m)/i);
      if (match2) {
        return parseFloat(match2[1])
      }
    }
    // Prioridad 3: buscar en el código: "ESQ-42×42×3_8-2.30M-AMARILLO-G20" -> extraer 2.30
    if (producto.codigo) {
      const match = producto.codigo.match(/-(\d+\.?\d*)M/i);
      if (match) {
        return parseFloat(match[1])
      }
    }
    // Prioridad 4: buscar en medidas_disponibles que contengan "m" pero no "mm"
    if (producto.medidas_disponibles && producto.medidas_disponibles.length > 0) {
      // Buscar medidas que terminen en "m" pero no "mm"
      for (const medida of producto.medidas_disponibles) {
        // Evitar "42×42mm" y buscar "2.3m" o similar
        if (medida.includes('m') && !medida.includes('mm')) {
          const match = medida.match(/(\d+\.?\d*)\s*m(?!m)/i)
          if (match) {
            return parseFloat(match[1])
          }
        }
      }
    }
    return null // No asumir un default para esquineros
  }
  
  // Para zunchos: usar especificaciones.largo o buscar en medidas
  if (producto.categoria === 'zunchos') {
    if (producto.especificaciones?.largo) {
      return producto.especificaciones.largo
    }
    // Buscar en medidas_disponibles: "5/8 x 1000m"
    if (producto.medidas_disponibles && producto.medidas_disponibles.length > 0) {
      const medida = producto.medidas_disponibles[0]
      const match = medida.match(/(\d+)m/i)
      return match ? parseInt(match[1]) : 1000
    }
    return 1000 // Default para zunchos
  }
  
  // Para burbupack: usar especificaciones.largo_m
  if (producto.categoria === 'burbupack' && producto.especificaciones?.largo_m) {
    return producto.especificaciones.largo_m
  }
  
  // Para otras categorías, intentar extraer de medidas_disponibles
  if (producto.medidas_disponibles && producto.medidas_disponibles.length > 0) {
    const medida = producto.medidas_disponibles[0]
    // Buscar patrones como "0.40m x 100m" o "1.00m x 80m"
    const match = medida.match(/x\s*(\d+)m/i) || medida.match(/(\d+)m/i)
    if (match) {
      return parseInt(match[1])
    }
  }
  
  // Si tiene especificaciones con largo
  if (producto.especificaciones?.largo) {
    return producto.especificaciones.largo
  }
  if (producto.especificaciones?.largo_m) {
    return producto.especificaciones.largo_m
  }
  
  return 1000 // Default
}

/**
 * Llamar a la edge function get-productos
 */
async function callEdgeFunction(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.categoria) queryParams.set('categoria', params.categoria);
  if (params.activo !== undefined) queryParams.set('activo', params.activo.toString());
  if (params.destacado !== undefined) queryParams.set('destacado', params.destacado.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  
  const url = `${SUPABASE_URL}/functions/v1/get-productos?${queryParams.toString()}`;
  
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
  
  return await response.json();
}

/**
 * Cargar todos los productos activos de Supabase usando Edge Function
 */
export async function loadProductos() {
  try {
    const result = await callEdgeFunction({ activo: true });
    
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido');
    }
    
    const data = result.datos || [];
    
    // Mapear datos de Supabase al formato esperado por el componente
    const productosFormateados = data.map(p => ({
      // IDs y códigos
      id: p.id,
      codigo: p.codigo,
      slug: p.slug || p.codigo.toLowerCase(),
      
      // Información básica
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: categoriasMap[p.categoria] || p.categoria, // Categoría mapeada para mostrar
      
      // Atributos específicos de zunchos (para compatibilidad)
      color: extractColor(p),
      ancho: extractAncho(p),
      largo: extractLargo(p),
      
      // Guardar categoría original de BD para usar en generateImagenPath
      _categoriaOriginal: p.categoria,
      
      // Precios
      precio: p.precio_unitario,
      precio_unitario: p.precio_unitario,
      precio_mayorista: p.precio_mayorista,
      
      // Stock
      disponible: p.stock_disponible > 0,
      stock: p.stock_disponible,
      stock_disponible: p.stock_disponible,
      
      // Estado
      destacado: p.destacado || false,
      nuevo: p.nuevo || false,
      enOferta: p.en_oferta || false,
      
      // Material y características
      material: p.especificaciones?.material || 'Polipropileno',
      resistencia: p.especificaciones?.resistencia || 'Alta',
      
      // Especificaciones completas
      especificaciones: p.especificaciones,
      colores_disponibles: p.colores_disponibles,
      medidas_disponibles: p.medidas_disponibles,
      
      // Imágenes - generar ruta correcta según categoría
      // IMPORTANTE: Para zunchos, SIEMPRE generar ruta nueva, ignorar imagen_principal de BD
      // La función generateImagenPath ya maneja esto internamente
      imagen: generateImagenPath(p),
      imagen_principal: generateImagenPath(p), // SIEMPRE usar la función para asegurar ruta correcta
      imagenes_secundarias: p.imagenes_secundarias || [],
      
      // Aplicaciones (si existen)
      aplicaciones: p.especificaciones?.aplicaciones || [],
      
      // Tags para búsqueda
      tags: p.tags || [],
      
      // Datos originales para referencia
      _original: p
    }))
    
    return { data: productosFormateados, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

/**
 * Cargar productos por categoría usando Edge Function
 * Acepta categorías desde URL (zuncho, esquinero, etc.)
 */
export async function loadProductosByCategoria(categoria) {
  try {
    const result = await callEdgeFunction({ 
      categoria: categoria, 
      activo: true 
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido');
    }
    
    const data = result.datos || [];
    
    // Formatear productos igual que loadProductos
    const productosFormateados = data.map(p => ({
      // IDs y códigos
      id: p.id,
      codigo: p.codigo,
      slug: p.slug || p.codigo.toLowerCase(),
      
      // Información básica
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: categoriasMap[p.categoria] || p.categoria, // Categoría mapeada para mostrar
      
      // Atributos específicos de zunchos (para compatibilidad)
      color: extractColor(p),
      ancho: extractAncho(p),
      largo: extractLargo(p),
      
      // Guardar categoría original de BD para usar en generateImagenPath
      _categoriaOriginal: p.categoria,
      
      // Precios
      precio: p.precio_unitario,
      precio_unitario: p.precio_unitario,
      precio_mayorista: p.precio_mayorista,
      
      // Stock
      disponible: p.stock_disponible > 0,
      stock: p.stock_disponible,
      stock_disponible: p.stock_disponible,
      
      // Estado
      destacado: p.destacado || false,
      nuevo: p.nuevo || false,
      enOferta: p.en_oferta || false,
      
      // Material y características
      material: p.especificaciones?.material || 'Polipropileno',
      resistencia: p.especificaciones?.resistencia || 'Alta',
      
      // Especificaciones completas
      especificaciones: p.especificaciones,
      colores_disponibles: p.colores_disponibles,
      medidas_disponibles: p.medidas_disponibles,
      
      // Imágenes - generar ruta correcta según categoría
      // IMPORTANTE: Para zunchos, SIEMPRE generar ruta nueva, ignorar imagen_principal de BD
      // La función generateImagenPath ya maneja esto internamente
      imagen: generateImagenPath(p),
      imagen_principal: generateImagenPath(p), // SIEMPRE usar la función para asegurar ruta correcta
      imagenes_secundarias: p.imagenes_secundarias || [],
      
      // Aplicaciones (si existen)
      aplicaciones: p.especificaciones?.aplicaciones || [],
      
      // Tags para búsqueda
      tags: p.tags || [],
      
      // Datos originales para referencia
      _original: p
    }))
    
    return { data: productosFormateados, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

/**
 * Cargar un producto por ID o slug
 */
export async function loadProducto(idOrSlug) {
  try {
    // Intentar primero por ID (UUID)
    let query = supabase
      .from('productos_db')
      .select('*')
      .eq('activo', true)
    
    // Verificar si es UUID o slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    if (isUUID) {
      query = query.eq('id', idOrSlug)
    } else {
      query = query.or(`slug.eq.${idOrSlug},codigo.eq.${idOrSlug}`)
    }
    
    const { data, error } = await query.single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

/**
 * Cargar productos destacados
 */
export async function loadProductosDestacados(limit = 6) {
  try {
    const { data, error } = await supabase
      .from('productos_db')
      .select('*')
      .eq('activo', true)
      .eq('destacado', true)
      .limit(limit)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

/**
 * Buscar productos por término
 */
export async function searchProductos(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('productos_db')
      .select('*')
      .eq('activo', true)
      .or(`nombre.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`)
      .order('destacado', { ascending: false })
      .limit(20)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

/**
 * Obtener estadísticas de productos
 */
export async function getProductosStats() {
  try {
    const { count: totalProductos } = await supabase
      .from('productos_db')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
    
    const { count: productosDestacados } = await supabase
      .from('productos_db')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .eq('destacado', true)
    
    const { count: productosStockBajo } = await supabase
      .from('productos_db')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .eq('stock_alerta', true)
    
    return {
      data: {
        total: totalProductos || 0,
        destacados: productosDestacados || 0,
        stockBajo: productosStockBajo || 0
      },
      error: null
    }
  } catch (error) {
    return {
      data: { total: 0, destacados: 0, stockBajo: 0 },
      error: error.message
    }
  }
}

