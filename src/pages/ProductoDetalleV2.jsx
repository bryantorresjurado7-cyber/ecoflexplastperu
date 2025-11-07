import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { calcularPrecioEsquinero } from '../utils/preciosEsquineros';
import { catalogoV2 } from '../data/catalogo.v2';
import { getPrecioPorProducto } from '../data/precios';
import { colores as coloresV1 } from '../data/productos';
import { useQuote } from '../contexts/QuoteContext';
import { useMemo, useState } from 'react';
import { ArrowLeft, ShoppingCart, Check, Package, Ruler, Shield, Truck, ChevronRight, Star } from 'lucide-react';
import ColorChip from '../components/ColorChip';
import ProductCardV2 from '../components/ProductCardV2';

const ProductoDetalleV2 = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToQuote, isInQuote } = useQuote();
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);

  const producto = catalogoV2.find(p => p.id === id);
  const qs = new URLSearchParams(location.search || '');
  const Lqs = Number(qs.get('L'));
  const gqs = Number(qs.get('g'));
  const colorInfo = producto?.color ? coloresV1.find(c => c.id === producto.color) : null;
  
  const defaultImage = useMemo(() => {
    if (!producto) return undefined;
    if (producto.imagen) return producto.imagen;
    if (producto.categoria === 'burbupack') {
      const ancho = Number(producto.medidas.anchoM).toFixed(2);
      const largo = producto.medidas.largoM;
      return `/images/productos/Burbupack/${ancho}/burbupack_${ancho}Mx${largo}.png`;
    }
    if (producto.categoria === 'esquinero') {
      const nombreColor = (coloresV1.find(c => c.id === producto.color)?.nombre) || 'Negro';
      // Usar siempre paquete.png
      return `/images/productos/Esquineros/${nombreColor}/paquete.png`;
    }
    if (producto.categoria === 'accesorio') {
      // Usar principal.png para accesorios
      return `/images/productos/Accesorios/${producto.nombre}/principal.png`;
    }
    return undefined;
  }, [producto]);

  const imagenes = useMemo(() => {
    const base = [];
    if (!producto) return base;

    const colorInfo = coloresV1.find(c => c.id === producto.color);
    const nombreColor = colorInfo?.nombre || (producto.color ? (String(producto.color).charAt(0).toUpperCase() + String(producto.color).slice(1)) : 'Negro');

    if (producto.categoria === 'zuncho') {
      // Para zunchos: imagen principal + 3 imágenes adicionales
      if (defaultImage) {
        base.push(defaultImage);
      }
      // Agregar las imágenes adicionales para zunchos
      base.push(`/images/productos/Zunchos/${nombreColor}/fondo.png`);
      base.push(`/images/productos/Zunchos/${nombreColor}/rollos.png`);
      base.push(`/images/productos/Zunchos/${nombreColor}/tira.png`);
    } else if (producto.categoria === 'esquinero') {
      // Para esquineros: imagen principal + 3 imágenes adicionales (sin duplicar paquete.png)
      if (defaultImage) {
        base.push(defaultImage);
      }
      // Agregar las imágenes adicionales para esquineros (excluyendo paquete.png que ya está en defaultImage)
      base.push(`/images/productos/Esquineros/${nombreColor}/empaquetado.png`);
      base.push(`/images/productos/Esquineros/${nombreColor}/esquinero.png`);
      base.push(`/images/productos/Esquineros/${nombreColor}/real.png`);
    } else if (producto.categoria === 'manga') {
      // Para mangas: principal + primero/segundo/tercero desde la misma carpeta
      if (defaultImage) {
        base.push(defaultImage);
      }
      const altoFmt = Number(producto.medidas?.altoM).toFixed(2);
      base.push(`/images/productos/Mangas/${nombreColor}/${altoFmt}/primero.png`);
      base.push(`/images/productos/Mangas/${nombreColor}/${altoFmt}/segundo.png`);
      base.push(`/images/productos/Mangas/${nombreColor}/${altoFmt}/tercero.png`);
    } else if (producto.categoria === 'accesorio') {
      // Para accesorios: imagen principal + 3 imágenes adicionales
      if (defaultImage) {
        base.push(defaultImage);
      }
      // Agregar las imágenes adicionales para accesorios
      base.push(`/images/productos/Accesorios/${producto.nombre}/segunda.png`);
      base.push(`/images/productos/Accesorios/${producto.nombre}/tercera.png`);
      base.push(`/images/productos/Accesorios/${producto.nombre}/cuarta.png`);
    } else {
      // Para otras categorías: solo imagen principal
      if (defaultImage) {
        base.push(defaultImage);
      }
    }

    // Solo duplicar si tenemos menos de 4 imágenes Y no es zuncho, esquinero ni accesorio
    if (producto.categoria !== 'zuncho' && producto.categoria !== 'esquinero' && producto.categoria !== 'accesorio' && base.length > 0 && base.length < 4) {
      while (base.length < 4) {
        base.push(base[0]);
      }
    }

    return base;
  }, [producto, defaultImage]);
  
  const hasImage = imagenes.length > 0;

  const especificaciones = useMemo(() => {
    if (!producto) return [];
    if (producto.categoria === 'esquinero') {
      return [
        { label: 'Color', valor: colorInfo?.nombre || producto.color },
        { label: 'Ala (mm)', valor: `39.5` },
        { label: 'Espesor (mm)', valor: `3.3` },
        { label: 'Gramaje (g/m)', valor: gramajeDetalle(producto) },
        { label: 'Longitud', valor: producto.medidas.longitudM ? `${producto.medidas.longitudM} m` : 'A medida' },
        { label: 'Código', valor: producto.codigoCorto || producto.codigo },
        { label: 'Disponibilidad', valor: producto.disponible ? 'En Stock' : 'Bajo Pedido' }
      ];
    }
    if (producto.categoria === 'burbupack') {
      return [
        { label: 'Formato', valor: 'Rollo de burbuja' },
        { label: 'Ancho', valor: `${producto.medidas.anchoM.toFixed(2)} m` },
        { label: 'Largo', valor: `${producto.medidas.largoM} metros` },
        { label: 'Código', valor: producto.codigoCorto || producto.codigo },
        { label: 'Disponibilidad', valor: producto.disponible ? 'En Stock' : 'Bajo Pedido' }
      ];
    }
    if (producto.categoria === 'manga') {
      const nombreColor = colorInfo?.nombre || (producto.color ? (String(producto.color).charAt(0).toUpperCase() + String(producto.color).slice(1)) : '');
      return [
        { label: 'Color', valor: nombreColor },
        { label: 'Altura (m)', valor: producto.medidas.altoM.toFixed(2) },
        { label: 'Espesor (mm)', valor: `${producto.medidas.espesorMM}` },
        { label: 'Material', valor: 'Plástico 100% virgen' },
        { label: 'Presentación', valor: 'Rollo continuo' },
        { label: 'Código', valor: producto.codigoCorto || producto.codigo },
        { label: 'Disponibilidad', valor: producto.disponible ? 'En Stock' : 'Bajo Pedido' }
      ];
    }
    // Accesorio o fallback
    const tags = Array.isArray(producto.tags) ? producto.tags.join(', ') : undefined;
    const base = [
      { label: 'Código', valor: producto.codigoCorto || producto.codigo },
      { label: 'Disponibilidad', valor: producto.disponible ? 'En Stock' : 'Bajo Pedido' }
    ];
    return tags ? [{ label: 'Características', valor: tags }, ...base] : base;
  }, [producto, colorInfo]);

  const aplicaciones = useMemo(() => {
    if (!producto) return [];
    if (Array.isArray(producto.aplicaciones) && producto.aplicaciones.length > 0) return producto.aplicaciones;
    if (producto.categoria === 'burbupack') return ['Protección de productos', 'Amortiguación', 'Relleno de embalaje'];
    if (producto.categoria === 'esquinero') return ['Protección de esquinas', 'Estabilización de pallets', 'Embalaje industrial'];
    if (producto.categoria === 'accesorio') return ['Uso complementario para zunchos', 'Operación y cierre'];
    return [];
  }, [producto]);

  const productosRelacionados = useMemo(() => {
    if (!producto) return [];
    return catalogoV2
      .filter(p => p.id !== producto.id && p.categoria === producto.categoria)
      .slice(0, 3);
  }, [producto]);

  const formatPrice = (precio) => {
    const placeholder = 129.9; // Precio demostrativo
    if (typeof precio !== 'number') precio = placeholder;
    try {
      return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(precio);
    } catch (err) {
      return `S/ ${Number(precio).toFixed(2)}`;
    }
  };

  const handleAddToQuote = () => {
    // Si hay L y es esquinero, persistimos el metraje, un título y el href con params
    let prodToAdd = producto;
    if (producto?.categoria === 'esquinero' && Number.isFinite(Lqs) && Lqs > 0) {
      const nombreColor = colorInfo?.nombre || (producto.color ? (String(producto.color).charAt(0).toUpperCase() + String(producto.color).slice(1)) : '');
      const tituloCotizacion = `Esquinero plástico ${String(nombreColor).toLowerCase()} de ${Number(Lqs).toFixed(2)} m`;
      const hrefConParams = `${location.pathname}${location.search || ''}`;
      prodToAdd = {
        ...producto,
        medidas: { ...(producto.medidas || {}), longitudM: Number(Lqs) },
        tituloCotizacion,
        detalleHref: hrefConParams,
      };
    }
    addToQuote(prodToAdd, cantidad);
  };

  if (!producto) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-negro-principal mb-4">Producto no encontrado</h2>
          <Link to="/productos" className="btn-primary">Ver Catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gris-muy-claro">
        <div className="container-max section-padding py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gris-medio hover:text-verde-principal">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-gris-muy-claro" />
            <Link to="/productos" className="text-gris-medio hover:text-verde-principal">Productos</Link>
            <ChevronRight className="w-4 h-4 text-gris-muy-claro" />
            <span className="text-negro-principal">{producto.nombre}</span>
          </nav>
        </div>
      </div>

      <div className="container-max section-padding py-8">
        {/* Botón volver */}
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gris-oscuro hover:text-verde-principal mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Galería */}
          <div>
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="bg-fondo-claro rounded-xl p-8 mb-6 flex items-center justify-center min-h-[520px]">
                <div className="relative">
                  {/* Imagen principal */}
                  {hasImage ? (
                    <img src={imagenes[imagenActiva]} alt={producto.nombre} className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] object-contain" onError={(e) => {
                      if (producto.categoria === 'burbupack' && e.currentTarget.dataset.altTried !== '1') {
                        e.currentTarget.dataset.altTried = '1';
                        e.currentTarget.src = (imagenes[imagenActiva] || '').replace('.png', ' .png');
                        return;
                      }
                      e.currentTarget.style.display = 'none';
                    }} />
                  ) : (
                    <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] rounded-full border-8 border-opacity-30 flex items-center justify-center shadow-lg" style={{ borderColor: colorInfo?.hex }}>
                      <div className="w-40 h-40 sm:w-52 sm:h-52 lg:w-[300px] lg:h-[300px] rounded-full" style={{ backgroundColor: colorInfo?.hex }} />
                    </div>
                  )}

                  {/* Badge color */}
                  {colorInfo && (
                    <div className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg">
                      <ColorChip color={colorInfo} size="lg" />
                    </div>
                  )}
                  {producto.destacado && (
                    <div className="absolute -top-2 -left-2 bg-verde-principal text-white text-xs font-semibold px-3 py-1 rounded-full">Destacado</div>
                  )}
                </div>
              </div>

              {/* Thumbnails controlables */}
              <div className="grid grid-cols-4 gap-4 sm:gap-5">
                {imagenes.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImagenActiva(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-selected={imagenActiva === i}
                    className={`bg-fondo-claro rounded-lg p-3 sm:p-4 flex items-center justify-center h-24 sm:h-28 border ${imagenActiva === i ? 'ring-2 ring-verde-principal' : 'border-transparent'}`}
                  >
                    {hasImage ? (
                      <img src={src} alt={`Vista ${i + 1}`} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" onError={(e) => {
                        if (producto.categoria === 'burbupack' && e.currentTarget.dataset.altTried !== '1') {
                          e.currentTarget.dataset.altTried = '1';
                          e.currentTarget.src = (src || '').replace('.png', ' .png');
                          return;
                        }
                        // Para zunchos, mostrar círculo de color como fallback
                        if (producto.categoria === 'zuncho') {
                          e.currentTarget.style.display = 'none';
                          const fallbackDiv = e.currentTarget.nextSibling;
                          if (fallbackDiv) fallbackDiv.style.display = 'block';
                          return;
                        }
                        e.currentTarget.style.display = 'none';
                      }} />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" style={{ backgroundColor: colorInfo?.hex }} />
                    )}
                    {/* Fallback para zunchos cuando la imagen no carga */}
                    {producto.categoria === 'zuncho' && (
                      <div className="hidden w-16 h-16 sm:w-20 sm:h-20 rounded-full" style={{ backgroundColor: colorInfo?.hex }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {colorInfo && <ColorChip color={colorInfo} size="md" />}
                {colorInfo && (
                  <span className="text-sm font-medium text-gris-oscuro bg-gris-muy-claro/50 px-3 py-1 rounded-full">{colorInfo?.nombre}</span>
                )}
                {producto.destacado && (
                  <span className="bg-verde-light text-verde-principal text-xs font-semibold px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 inline mr-1" /> Destacado
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">{(() => {
                if (producto.categoria === 'esquinero' && Number.isFinite(Lqs) && Lqs > 0) {
                  const nombreColor = colorInfo?.nombre || (producto.color ? (String(producto.color).charAt(0).toUpperCase() + String(producto.color).slice(1)) : '');
                  return `Esquinero plástico ${nombreColor.toLowerCase()} de ${Number(Lqs).toFixed(2)} m`;
                }
                return producto.nombre;
              })()}</h1>
              <p className="text-gris-oscuro text-lg mb-6">
                {producto.categoria === 'esquinero'
                  ? descripcionEsquineroSinGramaje(Lqs)
                  : (producto.descripcion || '')}
              </p>

              <div className="flex items-end justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${producto.disponible ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className={`font-medium ${producto.disponible ? 'text-green-600' : 'text-orange-600'}`}>{producto.disponible ? 'En Stock' : 'Bajo Pedido'}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-verde-principal">{(() => {
                    if (producto.categoria === 'esquinero' && Number.isFinite(Lqs) && Lqs > 0) {
                      const colorKey = (producto.color || '').toLowerCase() === 'verde' ? 'verde' : 'colores';
                      const gRaw = Number.isFinite(gqs) && [18,19,20].includes(gqs) ? gqs : Math.round(Number(producto.gramajeGxm || 0.20) * 100);
                      const g = [18,19,20].includes(gRaw) ? gRaw : 20;
                      try {
                        const px = calcularPrecioEsquinero(colorKey, Lqs, g, { modoRedondeo: 'normal' });
                        return formatPrice(px);
                      } catch (e) {
                        return formatPrice(getPrecioPorProducto(producto));
                      }
                    }
                    const base = getPrecioPorProducto(producto);
                    if (producto.categoria === 'manga' && Number(base) === 0) {
                      return 'Solicitar Cotización';
                    }
                    return formatPrice(base);
                  })()}</div>
                  <div className="text-xs text-gris-medio mt-1">Precio de lista (minorista)</div>
                  <Link to="/contacto" className="text-sm text-verde-principal hover:underline inline-block mt-1">Solicitar precio por mayor</Link>
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-xl font-semibold text-negro-principal mb-4">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {especificaciones.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gris-muy-claro last:border-b-0">
                    <span className="text-sm font-medium text-gris-oscuro">{spec.label}:</span>
                    <span className="text-sm text-negro-principal font-semibold">{spec.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aplicaciones */}
            {aplicaciones.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-xl font-semibold text-negro-principal mb-4">Aplicaciones Recomendadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aplicaciones.map((ap, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-verde-principal flex-shrink-0" />
                      <span className="text-sm text-gris-oscuro">{ap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">Cantidad</label>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-10 h-10 border border-gris-muy-claro rounded-lg flex items-center justify-center hover:bg-gris-muy-claro/50 transition-colors">-</button>
                    <span className="w-16 text-center font-semibold">{cantidad}</span>
                    <button onClick={() => setCantidad(cantidad + 1)} className="w-10 h-10 border border-gris-muy-claro rounded-lg flex items-center justify-center hover:bg-gris-muy-claro/50 transition-colors">+</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <button type="button" onClick={handleAddToQuote} className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isInQuote(producto.id)
                      ? 'bg-white border-2 border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white'
                      : 'bg-gradient-to-r from-verde-principal to-verde-hover text-white'
                  }`}>
                    {isInQuote(producto.id) ? (
                      <>
                        <Check className="w-5 h-5 mr-2" /> En Cotización
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" /> Añadir cotización
                      </>
                    )}
                  </button>
                  <Link to="/contacto" className="btn-secondary inline-flex w-full items-center justify-center">Consultar Especialista</Link>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro"><Package className="w-5 h-5 text-verde-principal" /><span>Entrega rápida</span></div>
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro"><Shield className="w-5 h-5 text-verde-principal" /><span>Calidad garantizada</span></div>
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro"><Truck className="w-5 h-5 text-verde-principal" /><span>Envío nacional</span></div>
              <div className="flex items-center space-x-3 text-sm text-gris-oscuro"><Ruler className="w-5 h-5 text-verde-principal" /><span>Medidas exactas</span></div>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {productosRelacionados.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-negro-principal mb-4">Productos Relacionados</h2>
              <p className="text-gris-oscuro">Otros productos que podrían interesarte</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productosRelacionados.map((p) => (
                <div key={p.id} className="h-full">
                  {/* Lazy import para evitar ciclo */}
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <ProductCardV2 producto={p} onAddToQuote={addToQuote} isInQuote={isInQuote(p.id)} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const Spec = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 items-center">
    <span className="text-gris-medio col-span-1">{label}:</span>
    <span className="text-negro-principal font-medium col-span-2">{value}</span>
  </div>
);

export default ProductoDetalleV2;

// Helpers locales
function productodescPersonalizada(desc, L) {
  try {
    return String(desc).replace(/\(0\.14 m a 2\.4 m\)/, `${Number(L).toFixed(2)} m`);
  } catch {
    return desc;
  }
}

function descripcionEsquineroSinGramaje(L) {
  const base = 'Esquinero plástico con alas de 39.5 mm y espesor 3.3 mm.';
  if (Number.isFinite(L) && L > 0) {
    return `${base} Longitud a medida ${Number(L).toFixed(2)} m.`;
  }
  return `${base} Longitud a medida.`;
}

function gramajeDetalle(producto) {
  // 1) Si la URL trae g=18|19|20 -> usarlo
  try {
    const params = new URLSearchParams(window.location.search || '');
    const gQuery = Number(params.get('g'));
    if ([18, 19, 20].includes(gQuery)) return `${(gQuery / 100).toFixed(2)} g/m`;
  } catch {}

  // 2) Inferir desde el código corto/largo: ...-G18 | ...-G19 | ...-G20
  const code = String(producto?.codigo || producto?.codigoCorto || '');
  const m = code.match(/-G(18|19|20)\b/);
  if (m) {
    const gCode = Number(m[1]);
    if ([18, 19, 20].includes(gCode)) return `${(gCode / 100).toFixed(2)} g/m`;
  }

  // 3) Fallback: mostrar rango
  return '0.20 (ajustable 0.18–0.20)';
}


