import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  Package, 
  Ruler, 
  Shield, 
  Truck,
  Star,
  ChevronRight
} from 'lucide-react';
import { colores } from '../data/productos';
import { getPrecioPorProducto } from '../data/precios';
import { useQuote } from '../contexts/QuoteContext';
import ColorChip from '../components/ColorChip';
import ProductCard from '../components/ProductCard';
import { loadProducto } from '../services/productosService';
import { loadProductos } from '../services/productosService';

// Funciones helper para formatear producto (igual que en productosService)
const categoriasMap = {
  'zunchos': 'Zunchos',
  'esquineros': 'Esquineros',
  'burbupack': 'Burbupack',
  'mangas': 'Mangas',
  'accesorios': 'Accesorios'
}

function extractColor(producto) {
  if (producto.colores_disponibles && producto.colores_disponibles.length > 0) {
    return producto.colores_disponibles[0].toLowerCase()
  }
  const coloresList = ['negro', 'blanco', 'azul', 'amarillo', 'rojo', 'verde', 'transparente']
  const nombreLower = producto.nombre.toLowerCase()
  for (const color of coloresList) {
    if (nombreLower.includes(color)) {
      return color
    }
  }
  return 'negro'
}

function extractAncho(producto) {
  if (producto.categoria !== 'zunchos') return null
  if (producto.especificaciones?.ancho) {
    return producto.especificaciones.ancho
  }
  const match = producto.nombre.match(/(\d+\/\d+)/)
  return match ? match[1] : '5/8'
}

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
      for (const medida of producto.medidas_disponibles) {
        // Buscar medidas que terminen en "m" pero no "mm" (evitar milímetros)
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
    if (producto.medidas_disponibles && producto.medidas_disponibles.length > 0) {
      const medida = producto.medidas_disponibles[0]
      const match = medida.match(/(\d+)m/i)
      return match ? parseInt(match[1]) : 1000
    }
    return 1000
  }
  
  // Para burbupack: usar especificaciones.largo_m
  if (producto.categoria === 'burbupack' && producto.especificaciones?.largo_m) {
    return producto.especificaciones.largo_m
  }
  
  // Para otras categorías, intentar extraer de medidas_disponibles
  if (producto.medidas_disponibles && producto.medidas_disponibles.length > 0) {
    const medida = producto.medidas_disponibles[0]
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
  
  return 1000
}

function generateImagenPath(producto) {
  const categoriaLower = (producto.categoria || '').toLowerCase();
  if (categoriaLower === 'zunchos' || categoriaLower === 'zuncho') {
    const colorNombre = extractColor(producto);
    const colorInfo = colores.find(c => c.id === colorNombre);
    const carpetaColor = colorInfo?.nombre || colorNombre.charAt(0).toUpperCase() + colorNombre.slice(1);
    return `/images/productos/Zunchos/${carpetaColor}/zuncho_${colorNombre}.png`;
  }
  if (producto.imagen_principal) {
    return producto.imagen_principal;
  }
  return '/images/placeholder.png';
}

function formatearProducto(p) {
  return {
    id: p.id,
    codigo: p.codigo,
    slug: p.slug || p.codigo.toLowerCase(),
    nombre: p.nombre,
    descripcion: p.descripcion,
    categoria: categoriasMap[p.categoria] || p.categoria,
    color: extractColor(p),
    ancho: extractAncho(p),
    largo: extractLargo(p),
    precio: p.precio_unitario,
    precio_unitario: p.precio_unitario,
    precio_mayorista: p.precio_mayorista,
    disponible: p.stock_disponible > 0,
    stock: p.stock_disponible,
    destacado: p.destacado || false,
    nuevo: p.nuevo || false,
    enOferta: p.en_oferta || false,
    material: p.especificaciones?.material || 'Polipropileno',
    resistencia: p.especificaciones?.resistencia || 'Alta',
    especificaciones: p.especificaciones,
    aplicaciones: p.especificaciones?.aplicaciones || [],
    imagen: generateImagenPath(p),
    imagen_principal: generateImagenPath(p)
  }
}

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToQuote, isInQuote } = useQuote();
  const [producto, setProducto] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setLoading(true);
        const { data, error } = await loadProducto(id);
        
        if (error || !data) {
          setProducto(null);
          return;
        }
        
        const productoFormateado = formatearProducto(data);
        setProducto(productoFormateado);
        
        // Cargar productos relacionados (misma categoría)
        const { data: todosProductos } = await loadProductos();
        if (todosProductos && todosProductos.length > 0) {
          const relacionados = todosProductos
            .filter(p => p.id !== productoFormateado.id && p.categoria === productoFormateado.categoria)
            .slice(0, 3);
          setProductosRelacionados(relacionados);
        }
      } catch (error) {
        setProducto(null);
      } finally {
        setLoading(false);
      }
    };
    
    cargarProducto();
  }, [id]);
  
  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-verde-principal mb-4"></div>
          <p className="text-gris-oscuro text-lg">Cargando producto...</p>
        </div>
      </div>
    );
  }
  
  if (!producto) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-negro-principal mb-4">
            Producto no encontrado
          </h2>
          <Link to="/productos" className="btn-primary">
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const colorInfo = colores.find(c => c.id === producto.color);
  const carpetaColor = colorInfo?.nombre || producto.color;
  
  // Generar rutas de imágenes para zunchos
  const esZuncho = producto.categoria?.toLowerCase() === 'zunchos' || producto.categoria?.toLowerCase() === 'zuncho';
  const rutaNueva = esZuncho 
    ? `/images/productos/Zunchos/${carpetaColor}/zuncho_${producto.color}.png`
    : producto.imagen || producto.imagen_principal || '/images/placeholder.png';
  const rutaAntigua = esZuncho ? `/images/productos/zuncho_${producto.color}.png` : rutaNueva;

  const handleAddToQuote = () => {
    addToQuote(producto, cantidad);
  };

  // Determinar si el producto tiene color (Burbupack no tiene)
  const tieneColor = producto.categoria?.toLowerCase() !== 'burbupack' && colorInfo;
  
  const especificaciones = [
    { label: 'Material', valor: producto.material || 'Polipropileno' },
    ...(tieneColor ? [{ label: 'Color', valor: colorInfo?.nombre || producto.color }] : []),
    ...(producto.ancho ? [{ label: 'Ancho', valor: `${producto.ancho}"` }] : []),
    ...(producto.largo ? [{ label: 'Largo', valor: `${producto.largo} metros` }] : []),
    { label: 'Resistencia', valor: producto.resistencia || 'Alta' },
    { label: 'Código', valor: producto.codigo || 'N/A' },
    { label: 'Disponibilidad', valor: producto.disponible ? 'En Stock' : 'Bajo Pedido' }
  ];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gris-muy-claro">
        <div className="container-max section-padding py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gris-medio hover:text-verde-principal">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 text-gris-muy-claro" />
            <Link to="/productos" className="text-gris-medio hover:text-verde-principal">
              Productos
            </Link>
            <ChevronRight className="w-4 h-4 text-gris-muy-claro" />
            <span className="text-negro-principal">{producto.nombre}</span>
          </nav>
        </div>
      </div>

      <div className="container-max section-padding py-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gris-oscuro hover:text-verde-principal mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Galería de imágenes */}
          <div>
            <div className="bg-white rounded-2xl shadow-card p-8">
              {/* Imagen principal */}
              <div className="bg-fondo-claro rounded-xl p-8 mb-6 flex items-center justify-center min-h-[520px]">
                <div className="relative">
                  {/* Imagen del producto */}
                  <div className="relative">
                    {(() => {
                      // Para zunchos: array de imágenes múltiples
                      // Para otras categorías: solo imagen principal
                      let imagenActual = rutaNueva;
                      
                      if (esZuncho) {
                        const imagenesZuncho = [
                          rutaNueva,
                          `/images/productos/Zunchos/${carpetaColor}/fondo.png`,
                          `/images/productos/Zunchos/${carpetaColor}/rollos.png`,
                          `/images/productos/Zunchos/${carpetaColor}/tira.png`
                        ];
                        imagenActual = imagenesZuncho[imagenActiva] || rutaNueva;
                      }
                      
                      const altText = esZuncho 
                        ? `${producto.nombre} ${producto.ancho ? producto.ancho + '"' : ''} ${producto.largo ? 'x ' + producto.largo + 'm' : ''}`
                        : producto.nombre;
                      
                      return (
                        <img 
                          src={imagenActual}
                          alt={altText}
                          className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] object-contain transition-transform duration-300"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.fallbackApplied) {
                              e.currentTarget.dataset.fallbackApplied = 'true';
                              if (esZuncho && imagenActiva === 0) {
                                e.currentTarget.src = rutaAntigua;
                                return;
                              }
                            }
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'block';
                          }}
                        />
                      );
                    })()}
                    
                    {/* Fallback si no hay imagen */}
                    <div 
                      className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] rounded-full border-8 border-opacity-30 flex items-center justify-center shadow-lg hidden"
                      style={{ borderColor: colorInfo?.hex }}
                    >
                      <div 
                        className="w-40 h-40 sm:w-52 sm:h-52 lg:w-[300px] lg:h-[300px] rounded-full"
                        style={{ backgroundColor: colorInfo?.hex }}
                      />
                    </div>
                    
                    {/* Efecto animado removido por estabilidad */}
                  </div>

                  {/* Badge de color - Solo si tiene color (no para Burbupack) */}
                  {tieneColor && (
                    <div className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg">
                      <ColorChip color={colorInfo} size="lg" />
                    </div>
                  )}

                  {/* Badge de destacado */}
                  {producto.destacado && (
                    <div className="absolute -top-2 -left-2 bg-verde-principal text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Destacado
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails - Solo para zunchos */}
              {esZuncho && (
                <div className="grid grid-cols-4 gap-4 sm:gap-5">
                  {(() => {
                    const imagenesZuncho = [
                      rutaNueva,
                      `/images/productos/Zunchos/${carpetaColor}/fondo.png`,
                      `/images/productos/Zunchos/${carpetaColor}/rollos.png`,
                      `/images/productos/Zunchos/${carpetaColor}/tira.png`
                    ];
                    
                    return imagenesZuncho.map((imagenSrc, index) => (
                      <button
                        key={index}
                        onClick={() => setImagenActiva(index)}
                        className={`bg-fondo-claro rounded-lg p-3 sm:p-4 flex items-center justify-center h-24 sm:h-28 transition-all ${
                          imagenActiva === index 
                            ? 'ring-2 ring-verde-principal bg-verde-light' 
                            : 'hover:bg-gris-muy-claro/50'
                        }`}
                      >
                        <img 
                          src={imagenSrc}
                          alt={`Vista ${index + 1}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.fallbackApplied) {
                              e.currentTarget.dataset.fallbackApplied = 'true';
                              if (index === 0) {
                                e.currentTarget.src = rutaAntigua;
                                return;
                              }
                            }
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full hidden"
                          style={{ backgroundColor: colorInfo?.hex }}
                        />
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {/* Color chip y nombre - Solo si tiene color (no para Burbupack) */}
                {tieneColor && (
                  <>
                    <ColorChip color={colorInfo} size="md" />
                    <span className="text-sm font-medium text-gris-oscuro bg-gris-muy-claro/50 px-3 py-1 rounded-full">
                      {colorInfo?.nombre}
                    </span>
                  </>
                )}
                {producto.destacado && (
                  <span className="bg-verde-light text-verde-principal text-xs font-semibold px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 inline mr-1" />
                    Destacado
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
                {producto.nombre}
              </h1>
              
              <p className="text-gris-oscuro text-lg mb-6">
                {producto.descripcion}
              </p>

              {/* Estado y precio */}
              <div className="flex items-end justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${producto.disponible ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className={`font-medium ${producto.disponible ? 'text-green-600' : 'text-orange-600'}`}>
                    {producto.disponible ? 'En Stock' : 'Bajo Pedido'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-verde-principal">
                    {(() => {
                      const precio = getPrecioPorProducto(producto);
                      try {
                        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(precio);
                      } catch (err) {
                        return `S/ ${Number(precio || 0).toFixed(2)}`;
                      }
                    })()}
                  </div>
                  <div className="text-xs text-gris-medio mt-1">Precio de lista (minorista)</div>
                  <Link to="/contacto" className="text-sm text-verde-principal hover:underline inline-block mt-1">Solicitar precio por mayor</Link>
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-xl font-semibold text-negro-principal mb-4">
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {especificaciones.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gris-muy-claro last:border-b-0">
                    <span className="text-sm font-medium text-gris-oscuro">
                      {spec.label}:
                    </span>
                    <span className="text-sm text-negro-principal font-semibold">
                      {spec.valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aplicaciones */}
            {producto.aplicaciones && producto.aplicaciones.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-xl font-semibold text-negro-principal mb-4">
                  Aplicaciones Recomendadas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {producto.aplicaciones.map((aplicacion, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-verde-principal flex-shrink-0" />
                      <span className="text-sm text-gris-oscuro">{aplicacion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="space-y-4">
                {/* Selector de cantidad */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Cantidad (rollos)
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="w-10 h-10 border border-gris-muy-claro rounded-lg flex items-center justify-center hover:bg-gris-muy-claro/50 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-semibold">
                      {cantidad}
                    </span>
                    <button
                      onClick={() => setCantidad(cantidad + 1)}
                      className="w-10 h-10 border border-gris-muy-claro rounded-lg flex items-center justify-center hover:bg-gris-muy-claro/50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleAddToQuote}
                    className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isInQuote(producto.id)
                        ? 'bg-white border-2 border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white'
                        : 'bg-gradient-to-r from-verde-principal to-verde-hover text-white'
                    }`}
                  >
                    {isInQuote(producto.id) ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        En Cotización
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Añadir cotización
                      </>
                    )}
                  </button>

                  <Link to="/contacto" className="btn-secondary inline-flex w-full items-center justify-center">
                    Consultar Especialista
                  </Link>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro">
                <Package className="w-5 h-5 text-verde-principal" />
                <span>Entrega rápida</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro">
                <Shield className="w-5 h-5 text-verde-principal" />
                <span>Calidad garantizada</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro">
                <Truck className="w-5 h-5 text-verde-principal" />
                <span>Envío nacional</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro">
                <Ruler className="w-5 h-5 text-verde-principal" />
                <span>Medidas exactas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {productosRelacionados.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-negro-principal mb-4">
                Productos Relacionados
              </h2>
              <p className="text-gris-oscuro">
                Otros productos que podrían interesarte
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productosRelacionados.map((prodRelacionado) => (
                <div key={prodRelacionado.id}>
                  <ProductCard
                    producto={prodRelacionado}
                    onAddToQuote={addToQuote}
                    isInQuote={isInQuote(prodRelacionado.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductoDetalle;
