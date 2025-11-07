import { useState } from 'react';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { colores as coloresV1 } from '../data/productos';
import { Link } from 'react-router-dom';
import { categorias as categoriasV2 } from '../data/catalogo.v2';
import { getPrecioPorProducto } from '../data/precios';
import { calcularPrecioEsquinero } from '../utils/preciosEsquineros';

const ProductCardV2 = ({ producto, onAddToQuote, isInQuote = false, vista = 'grid', largoSeleccionado }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [requireMsg, setRequireMsg] = useState(false);
  const isList = vista === 'list';

  const colorInfo = producto.color ? coloresV1.find(c => c.id === producto.color) : null;

  const nombreCategoria = categoriasV2.find(c => c.id === producto.categoria)?.nombre || producto.categoria;

  const handleAddToQuote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const prodToAdd = (producto.categoria === 'esquinero' && typeof largoSeleccionado === 'number' && Number.isFinite(largoSeleccionado) && largoSeleccionado > 0)
      ? {
          ...producto,
          medidas: { ...(producto.medidas || {}), longitudM: Number(largoSeleccionado) }
        }
      : producto;
    onAddToQuote?.(prodToAdd);
  };

  const renderSpecs = () => {
    switch (producto.categoria) {
      case 'zuncho':
        return (
          <div className={`grid gap-3 text-sm ${isList ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-2'}`}>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gris-medio" />
              <span className="text-gris-oscuro">{producto.ancho}" × {producto.largo}m</span>
            </div>
            {producto.resistencia && (
              <div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {producto.resistencia}
                </span>
              </div>
            )}
          </div>
        );
      case 'esquinero':
        return (
          <div className={`grid gap-3 text-sm ${isList ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gris-medio" />
              <span className="text-gris-oscuro">{`Ala 39.5 mm · Espesor 3.3 mm`}</span>
            </div>
            <div className="text-gris-oscuro">
              {producto.medidas.longitudM ? `${producto.medidas.longitudM} m` : 'A medida'}
            </div>
          </div>
        );
      case 'burbupack':
        return (
          <div className={`grid gap-3 text-sm ${isList ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gris-medio" />
              <span className="text-gris-oscuro">{producto.medidas.anchoM.toFixed(2)} m × {producto.medidas.largoM} m</span>
            </div>
          </div>
        );
      case 'manga':
        return (
          <div className={`grid gap-3 text-sm ${isList ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gris-medio" />
              <span className="text-gris-oscuro">{`Altura ${producto.medidas.altoM.toFixed(2)} m · Espesor ${producto.medidas.espesorMM} mm`}</span>
            </div>
          </div>
        );
      case 'accesorio':
        return null;
      default:
        return null;
    }
  };

  const renderBadgeColor = () => {
    if (!producto.color) return null;
    return (
      <div className="absolute top-4 right-4 z-10">
        <div 
          className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: colorInfo?.hex }}
          title={colorInfo?.nombre}
        />
      </div>
    );
  };

  // Resolver ruta de imagen según la estructura en public/images/productos
  const toFolderColorName = (nameOrId) => {
    const s = String(nameOrId || 'Negro');
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const buildEsquineroImage = () => {
    const folderColor = toFolderColorName(colorInfo?.nombre || producto.color);
    // Usar siempre 'paquete.png' para todos los colores
    return `/images/productos/Esquineros/${folderColor}/paquete.png`;
  };

  const buildBurbupackImage = () => {
    const anchoStr = Number(producto.medidas?.anchoM || 0).toFixed(2);
    const largoStr = String(producto.medidas?.largoM || '').trim();
    return `/images/productos/Burbupack/${anchoStr}/burbupack_${anchoStr}Mx${largoStr}.png`;
  };

  const buildBurbupackImageWithSpace = () => buildBurbupackImage().replace('.png', ' .png');

  const buildAccesorioImage = () => {
    return `/images/productos/Accesorios/${producto.nombre}/principal.png`;
  };

  const imageSrc = producto.imagen || (
    producto.categoria === 'zuncho'
      ? `/images/productos/Zunchos/${colorInfo?.nombre || producto.color}/zuncho_${producto.color}.png`
      : producto.categoria === 'esquinero'
      ? buildEsquineroImage()
      : producto.categoria === 'burbupack'
      ? buildBurbupackImage()
      : producto.categoria === 'accesorio'
      ? buildAccesorioImage()
      : '/images/placeholder.jpg'
  );

  let detalleHref = producto.categoria === 'zuncho' && typeof producto.idV1 === 'number'
    ? `/producto/${producto.idV1}`
    : `/producto-v2/${producto.id}`;
  if (producto.categoria === 'esquinero') {
    const largoVal = Number(largoSeleccionado);
    if (Number.isFinite(largoVal) && largoVal > 0) {
      const gRaw = Math.round(Number(producto.gramajeGxm || 0.20) * 100);
      const g = [18,19,20].includes(gRaw) ? gRaw : 20;
      const params = new URLSearchParams({ L: String(largoVal), g: String(g) });
      detalleHref = `${detalleHref}?${params.toString()}`;
    }
  }

  const handleOpenDetalle = (e) => {
    if (producto.categoria === 'esquinero') {
      const largoVal = Number(largoSeleccionado);
      const valido = Number.isFinite(largoVal) && largoVal > 0;
      if (!valido) {
        e.preventDefault();
        setRequireMsg(true);
        // ocultar el aviso luego de 2.5s
        setTimeout(() => setRequireMsg(false), 2500);
      }
    }
  };

  return (
    <Link to={detalleHref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenDetalle}
      className="group h-full transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="card p-6 h-full relative overflow-hidden flex flex-col">
        {producto.destacado && (
          <div className="absolute top-4 right-16 z-10">
            <span className="bg-verde-principal text-white text-xs font-semibold px-2 py-1 rounded-full">
              Destacado
            </span>
          </div>
        )}

        {renderBadgeColor()}

        {!isList && (
          <div className="relative mb-6 bg-fondo-claro rounded-lg p-4 flex items-center justify-center min-h-[200px]">
            <div className="relative">
              <img 
                src={imageSrc}
                alt={producto.nombre}
                className="w-32 h-32 object-contain transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Fallback específico para Burbupack con espacio antes de .png
                  if (producto.categoria === 'burbupack' && e.currentTarget.dataset.altTried !== '1') {
                    e.currentTarget.dataset.altTried = '1';
                    e.currentTarget.src = buildBurbupackImageWithSpace();
                    return;
                  }
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4 flex-1">
          <div>
            <div className="text-xs text-gris-medio uppercase tracking-wide mb-1">{nombreCategoria}</div>
            <h3 className="font-semibold text-lg text-negro-principal mb-2 line-clamp-2">{producto.nombre}</h3>
            <p className="text-sm text-gris-medio">Código: {producto.codigoCorto || producto.codigo}</p>
          </div>

          {renderSpecs()}

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${producto.disponible ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${producto.disponible ? 'text-green-600' : 'text-red-600'}`}>
              {producto.disponible ? 'En Stock' : 'Bajo Pedido'}
            </span>
          </div>
        </div>

        {/* Sección de precio/acción fija al fondo del card */}
        <div className="pt-2 mt-auto border-t border-gris-muy-claro">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-gris-medio">Precio de lista (minorista)</div>
              {(() => {
                const requiereLargo = producto.categoria === 'esquinero';
                const largoValido = typeof largoSeleccionado === 'number' && Number.isFinite(largoSeleccionado) && largoSeleccionado > 0;
                if (requiereLargo && !largoValido) {
                  return (
                    <div className={`mt-1 text-sm ${requireMsg ? 'text-red-600 font-semibold' : 'text-gris-medio'}`}>SE REQUIERE EL LARGO (m)</div>
                  );
                }
                let precio;
                if (requiereLargo && largoValido) {
                  const colorKey = (producto.color || '').toLowerCase() === 'verde' ? 'verde' : 'colores';
                  const gRaw = Math.round(Number(producto.gramajeGxm || 0.20) * 100);
                  const g = [18,19,20].includes(gRaw) ? gRaw : 20;
                  try {
                    precio = calcularPrecioEsquinero(colorKey, Number(largoSeleccionado), g, { modoRedondeo: 'normal' });
                  } catch (e) {
                    precio = undefined;
                  }
                } else {
                  precio = getPrecioPorProducto(producto);
                }
                const esMangaSolicitar = producto.categoria === 'manga' && Number(precio) === 0;
                const texto = esMangaSolicitar
                  ? 'Solicitar Cotización'
                  : (typeof precio === 'number' 
                    ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(precio)
                    : '—');
                const colorClass = esMangaSolicitar
                  ? 'text-verde-principal'
                  : (typeof precio === 'number' ? 'text-verde-principal' : 'text-gris-medio');
                return (
                  <div className={`text-lg font-bold ${colorClass} mt-1`}>
                    {texto}
                  </div>
                );
              })()}
            </div>
            <button
              onClick={handleAddToQuote}
              className={`ml-4 p-2 rounded-lg transition-all ${
                isInQuote 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-verde-principal text-white hover:bg-verde-hover'
              }`}
              title={isInQuote ? 'En cotización' : 'Agregar a cotización'}
            >
              {isInQuote ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className={`absolute inset-0 bg-verde-principal bg-opacity-5 rounded-xl transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </Link>
  );
};

export default ProductCardV2;


