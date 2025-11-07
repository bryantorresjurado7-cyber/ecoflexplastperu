import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Package, Check } from 'lucide-react';
import { colores } from '../data/productos';
import { getPrecioPorProducto } from '../data/precios';

const ProductCard = ({ producto, onAddToQuote, isInQuote = false, vista = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colorInfo = colores.find(c => c.id === producto.color);
  const carpetaColor = colorInfo?.nombre || (producto.color ? producto.color.charAt(0).toUpperCase() + producto.color.slice(1) : 'Negro');
  
  // Usar imagen del servicio (producto.imagen) que ya tiene la ruta generada correctamente
  // Si no está, usar fallback
  const imagenProducto = producto.imagen || producto.imagen_principal || 
    `/images/productos/Zunchos/${carpetaColor}/zuncho_${producto.color || 'negro'}.png`;
  const rutaAntigua = `/images/productos/zuncho_${producto.color || 'negro'}.png`;
  const isList = vista === 'list';
  
  const handleAddToQuote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToQuote(producto);
  };

  const getResistenciaColor = (resistencia) => {
    switch (resistencia) {
      case 'Alta': return 'text-green-600 bg-green-100';
      case 'Media': return 'text-blue-600 bg-blue-100';
      case 'Básica': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatPrice = (precio) => {
    if (typeof precio !== 'number') precio = 0;
    try {
      return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(precio);
    } catch (err) {
      return `S/ ${Number(precio).toFixed(2)}`;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group transition-transform duration-200 hover:-translate-y-1"
    >
      <Link to={`/producto/${producto.id}`} className="block h-full">
        <div className="card p-6 h-full min-h-[480px] relative overflow-hidden flex flex-col">
          {/* Badge de producto destacado */}
          {producto.destacado && (
            <div className="absolute top-4 right-16 z-10">
              <span className="bg-verde-principal text-white text-xs font-semibold px-2 py-1 rounded-full">
                Destacado
              </span>
            </div>
          )}

          {/* Badge de color */}
          <div className="absolute top-4 right-4 z-10">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: colorInfo?.hex }}
              title={colorInfo?.nombre}
            />
          </div>

          {/* Imagen del producto (oculta en modo lista) */}
          {!isList && (
            <div className="relative mb-6 bg-fondo-claro rounded-lg p-4 flex items-center justify-center min-h-[200px]">
              <div className="relative">
                {/* Imagen del producto */}
                <img 
                  src={imagenProducto}
                  alt={producto.nombre}
                  className="w-32 h-32 object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallbackApplied) {
                      e.currentTarget.dataset.fallbackApplied = 'true';
                      e.currentTarget.src = rutaAntigua;
                      return;
                    }
                    // Fallback si no hay imagen
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'block';
                  }}
                />
                
                {/* Fallback si no hay imagen */}
                <div 
                  className="w-32 h-32 rounded-full border-8 border-opacity-30 flex items-center justify-center hidden"
                  style={{ borderColor: colorInfo?.hex }}
                >
                  <div 
                    className="w-20 h-20 rounded-full opacity-80"
                    style={{ backgroundColor: colorInfo?.hex }}
                  />
                </div>
                
                {/* Línea dinámica eliminada */}
              </div>
            </div>
          )}

          {/* Información del producto */}
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex-shrink-0">
              <h3 className="font-semibold text-lg text-negro-principal mb-2 line-clamp-2 min-h-[3rem]">
                {producto.nombre}
              </h3>
              <p className="text-sm text-gris-medio">
                Código: {producto.codigoCorto || producto.codigo}
              </p>
            </div>

            {/* Especificaciones */}
            <div className={`grid gap-3 text-sm min-h-[3rem] ${isList ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-2'}`}>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gris-medio flex-shrink-0" />
                <span className="text-gris-oscuro">
                  {producto.ancho ? `${producto.ancho}" × ` : ''}{producto.largo ? `${producto.largo}m` : producto.especificaciones?.largo_m ? `${producto.especificaciones.largo_m}m` : producto.medidas_disponibles?.[0] || 'A medida'}
                </span>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResistenciaColor(producto.resistencia || 'Alta')}`}>
                  {producto.resistencia || 'Alta'}
                </span>
              </div>
            </div>

            {/* Estado de disponibilidad */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${producto.disponible ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${producto.disponible ? 'text-green-600' : 'text-red-600'}`}>
                {producto.disponible ? 'En Stock' : 'Bajo Pedido'}
              </span>
            </div>

            {/* Precio */}
            <div className="pt-2 mt-auto border-t border-gris-muy-claro flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-verde-principal">
                  {formatPrice(producto.precio_unitario || producto.precio || getPrecioPorProducto(producto))}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddToQuote}
                    className={`p-2 rounded-lg transition-all ${
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
                  
                  <div
                    className="p-2 rounded-lg bg-gris-muy-claro text-gris-oscuro hover:bg-gris-claro transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay de hover */}
          <div
            className={`absolute inset-0 bg-verde-principal bg-opacity-5 rounded-xl transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
