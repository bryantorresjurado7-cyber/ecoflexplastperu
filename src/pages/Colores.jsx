import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowRight, Package, Eye } from 'lucide-react';
import { colores, productos } from '../data/productos';
import { catalogoV2, ESQUINERO_LONGITUD_MIN_M, ESQUINERO_LONGITUD_MAX_M, BURBUPACK_ANCHOS_M, BURBUPACK_LARGOS_M } from '../data/catalogo.v2';
import ColorChip from '../components/ColorChip';

const Colores = () => {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState('zuncho');
  const getProductosPorColor = (colorId) => {
    if (categoria === 'zuncho') {
      return productos.filter(p => p.color === colorId);
    }
    if (categoria === 'esquinero') {
      return catalogoV2.filter(p => p.categoria === 'esquinero' && p.color === colorId);
    }
    if (categoria === 'manga') {
      return catalogoV2.filter(p => p.categoria === 'manga' && p.color === colorId);
    }
    if (categoria === 'burbupack') {
      // Burbupack no depende de color; mostramos catálogo completo para consistencia visual
      return catalogoV2.filter(p => p.categoria === 'burbupack');
    }
    return [];
  };

  const getAplicacionesPorColor = (colorId) => {
    switch (colorId) {
      case 'negro':
        return [
          'Uso industrial pesado',
          'Construcción y obra',
          'Paletizado estándar',
          'Embalaje robusto'
        ];
      case 'blanco':
        return [
          'Industria alimentaria',
          'Sector farmacéutico',
          'Productos de higiene',
          'Aplicaciones estéticas'
        ];
      case 'azul':
        return [
          'Identificación y clasificación',
          'Códigos de colores',
          'Logística organizada',
          'Separación de productos'
        ];
      case 'amarillo':
        return [
          'Señalización de seguridad',
          'Productos de alta visibilidad',
          'Advertencias y precauciones',
          'Identificación especial'
        ];
      case 'rojo':
        return [
          'Emergencias y urgencias',
          'Productos especiales',
          'Identificación crítica',
          'Aplicaciones de seguridad'
        ];
      default:
        return [];
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const getColorById = (colorId) => colores.find(c => c.id === colorId);
  const goToColor = (colorId) => navigate(`/productos?color=${colorId}&cat=${categoria}`);
  const goToBurbupack = (anchoM) => navigate(`/productos?cat=burbupack&anchoM=${anchoM}`);

  const recomendacionesIndustria = [
    { industria: 'Industria alimentaria', primario: 'blanco', secundarios: ['azul', 'negro'], usos: 'Embalaje higiénico, productos frescos, exportación.' },
    { industria: 'Bebidas', primario: 'blanco', secundarios: ['negro', 'azul'], usos: 'Botellas/cajas, ambientes limpios, clasificación por lote.' },
    { industria: 'Farmacéutica', primario: 'blanco', secundarios: ['rojo', 'azul'], usos: 'Trazabilidad estéril; rojo para crítico/URGENCIAS.' },
    { industria: 'Cosmética e higiene', primario: 'blanco', secundarios: ['azul'], usos: 'Presentaciones limpias y por líneas/fragrancias.' },
    { industria: 'Pesca y acuicultura', primario: 'blanco', secundarios: ['azul', 'negro'], usos: 'Congelados/conservas, clasificación por especie/lote.' },
    { industria: 'Agricultura / agroexportación', primario: 'blanco', secundarios: ['negro', 'azul'], usos: 'Fruta/verdura fresca, embalaje general y por calidad.' },
    { industria: 'Logística y CEDIS', primario: 'negro', secundarios: ['azul', 'rojo'], usos: 'Palletizado general; azul para rutas/códigos; rojo para prioridad.' },
    { industria: 'E-commerce / Courier', primario: 'negro', secundarios: ['azul', 'amarillo'], usos: 'Empaque robusto; azul por transportista; amarillo “frágil”.' },
    { industria: 'Construcción', primario: 'negro', secundarios: ['amarillo'], usos: 'Materiales de obra; amarillo para advertencia/alta visibilidad.' },
    { industria: 'Manufactura (general)', primario: 'negro', secundarios: ['azul', 'amarillo'], usos: 'Materias primas/PPTO; azul por línea/turno; amarillo precaución.' },
    { industria: 'Textil y confecciones', primario: 'azul', secundarios: ['negro'], usos: 'Clasificación por talla/colección; embalaje general.' },
    { industria: 'Metal-mecánica / Siderurgia', primario: 'negro', secundarios: ['amarillo'], usos: 'Bobinas, piezas y racks; amarillo para riesgo mecánico.' },
    { industria: 'Minería', primario: 'negro', secundarios: ['amarillo', 'rojo'], usos: 'Equipos/insumos pesados; amarillo señalización; rojo emergencia.' },
    { industria: 'Químico', primario: 'amarillo', secundarios: ['rojo', 'negro'], usos: 'Precaución y peligrosidad; rojo para sustancias críticas.' },
    { industria: 'Petroquímico / Hidrocarburos', primario: 'rojo', secundarios: ['amarillo', 'negro'], usos: 'Zonas críticas y emergencia; amarillo advertencias.' },
    { industria: 'Vidrio y cerámica', primario: 'amarillo', secundarios: ['negro'], usos: 'Alta visibilidad y “frágil”; palletizado general.' },
    { industria: 'Madera y muebles', primario: 'negro', secundarios: ['azul'], usos: 'Fardos/tableros; azul por proyecto/cliente.' },
    { industria: 'Papel, cartón, gráfica', primario: 'negro', secundarios: ['azul', 'amarillo'], usos: 'Bobinas/paquetes; azul por tiraje; amarillo “frágil”.' },
    { industria: 'Electrónica / electrodomésticos', primario: 'azul', secundarios: ['amarillo', 'negro'], usos: 'Clasificación por modelo/línea; amarillo para frágil.' },
    { industria: 'Automotriz y autopartes', primario: 'azul', secundarios: ['negro', 'rojo'], usos: 'Picking por modelo/ensamble; rojo piezas críticas.' },
    { industria: 'Retail / supermercados', primario: 'negro', secundarios: ['azul', 'blanco'], usos: 'Palletizado general; azul por categoría; blanco para perecibles.' },
    { industria: 'Salud (hospitales, laboratorios)', primario: 'blanco', secundarios: ['rojo', 'azul'], usos: 'Ambiente estéril; rojo urgencias; azul por área.' },
    { industria: 'Educación / universidades', primario: 'azul', secundarios: ['negro'], usos: 'Inventarios y traslados por facultad/almacén.' },
    { industria: 'Eventos / ferias', primario: 'azul', secundarios: ['amarillo', 'negro'], usos: 'Montaje por zona/stand; amarillo zonas de riesgo.' },
    { industria: 'Residuos/reciclaje', primario: 'azul', secundarios: ['amarillo', 'rojo'], usos: 'Clasificación por material; amarillo advertencias; rojo residuos peligrosos.' }
  ];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradiente-principal text-white py-20">
        <div className="container-max section-padding">
          <Motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Productos por Color
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Explora Zunchos, Esquineros y Mangas por color. Burbupack es transparente: navega por medidas (ancho y largo).
            </p>
            
            {/* Paleta de colores */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 px-2">
              {colores.map((color, index) => (
                <Motion.div
                  key={color.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <ColorChip color={color} size="xl" />
                </Motion.div>
              ))}
            </div>
          </Motion.div>
        </div>
      </section>

      {/* Sección de colores */}
      <section className="py-20 bg-fondo-claro">
        <div className="container-max section-padding">
          {/* Selector de categoría debajo del hero en desktop también */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex border rounded-full overflow-hidden">
              {[
                { id: 'zuncho', nombre: 'Zunchos' },
                { id: 'esquinero', nombre: 'Esquineros' },
                { id: 'manga', nombre: 'Mangas' },
                { id: 'burbupack', nombre: 'Burbupack' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoria(c.id)}
                  className={`px-4 py-2 text-sm font-medium ${categoria === c.id ? 'bg-verde-principal text-white' : 'bg-white text-negro-principal'}`}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>
          {categoria !== 'burbupack' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {colores.map((color, index) => {
              const productosColor = getProductosPorColor(color.id);
              if (productosColor.length === 0) return null; // Ocultar colores sin productos en la categoría seleccionada
              // Imagen del círculo por categoría
              const thumbSrc = (() => {
                if (categoria === 'zuncho') {
                  return `/images/productos/Zunchos/${color.nombre}/zuncho_${color.id}.png`;
                }
                if (categoria === 'esquinero') {
                  const prod = catalogoV2.find(p => p.categoria === 'esquinero' && p.color === color.id);
                  const nombreColor = color.nombre;
                  // Usar siempre paquete.png
                  return prod?.imagen || `/images/productos/Esquineros/${nombreColor}/paquete.png`;
                }
                if (categoria === 'manga') {
                  const prod = catalogoV2.find(p => p.categoria === 'manga' && p.color === color.id);
                  const nombreColor = color.nombre;
                  // Usar siempre la imagen principal de 1.00 m como miniatura
                  return prod?.imagen || `/images/productos/Mangas/${nombreColor}/1.00/principal.png`;
                }
                if (categoria === 'burbupack') {
                  const prod = catalogoV2.find(p => p.categoria === 'burbupack');
                  return prod?.imagen || '/images/productos/Burbupack/1.00/burbupack_1.00Mx100.png';
                }
                return undefined;
              })();
              const aplicaciones = getAplicacionesPorColor(color.id);
              
              return (
                <Motion.div
                  key={color.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden h-full"
                >
                  <div className="grid grid-cols-1 gap-0">
                    
                    {/* Información del color */}
                    <div className="p-6 md:p-8 lg:p-10">
                      <div className="flex items-center space-x-4 mb-6">
                        <button
                          onClick={() => goToColor(color.id)}
                          aria-label={`Ver productos color ${color.nombre}`}
                          className="relative w-16 h-16 rounded-full bg-white border-2 border-gris-muy-claro shadow-sm overflow-hidden"
                        >
                          {thumbSrc && (
                            <img
                              src={thumbSrc}
                              alt={`Vista ${categoria} ${color.nombre}`}
                              className="pointer-events-none absolute inset-0 m-auto w-12 h-12 md:w-14 md:h-14 object-contain"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                        </button>
                        <div>
                          <h2 className="text-3xl font-bold text-negro-principal">
                            {color.nombre}
                          </h2>
                          <p className="text-gris-medio">
                            {productosColor.length} productos disponibles
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-negro-principal mb-3">
                            Aplicaciones Principales
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {aplicaciones.map((aplicacion, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-verde-principal flex-shrink-0" />
                                <span className="text-sm text-gris-oscuro">{aplicacion}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-negro-principal mb-3">Medidas Disponibles</h3>
                          <div className="flex flex-wrap gap-2">
                            {[...new Set(productosColor.map(p => {
                              if (p.categoria === 'zuncho' || (p.ancho && !p.medidas)) return `${p.ancho}"`;
                              if (p.categoria === 'esquinero' && p.medidas) return `${p.medidas.ladoMM}×${p.medidas.espesorMM}mm`;
                              if (p.categoria === 'burbupack' && p.medidas) return `${p.medidas.anchoM.toFixed(2)}m`;
                              if (p.categoria === 'manga' && p.medidas) return `${p.medidas.altoM.toFixed(2)}m`;
                              return null;
                            }).filter(Boolean))].map(txt => (
                              <span key={txt} className="bg-verde-light text-verde-principal px-3 py-1 rounded-full text-sm font-medium">{txt}</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-negro-principal mb-3">Rangos Clave</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                            {productosColor.some(p => p.categoria === 'zuncho') && (
                              <div className="bg-white border border-gris-muy-claro rounded-xl p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gris-medio"><span>Zuncho – Longitudes</span><span></span></div>
                                <div className="flex items-center justify-between font-semibold text-negro-principal mt-1">
                                  <span className="tabular-nums">{Math.min(...productosColor.filter(p => p.categoria === 'zuncho').map(p => p.largo))}m</span>
                                  <span className="text-gris-medio">—</span>
                                  <span className="tabular-nums">{Math.max(...productosColor.filter(p => p.categoria === 'zuncho').map(p => p.largo))}m</span>
                                </div>
                              </div>
                            )}
                            {productosColor.some(p => p.categoria === 'manga') && (
                              <div className="bg-white border border-gris-muy-claro rounded-xl p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gris-medio"><span>Manga – Alturas</span><span></span></div>
                                <div className="flex items-center justify-between font-semibold text-negro-principal mt-1">
                                  <span className="tabular-nums">{Math.min(...productosColor.filter(p => p.categoria === 'manga').map(p => p.medidas.altoM)).toFixed(2)}m</span>
                                  <span className="text-gris-medio">—</span>
                                  <span className="tabular-nums">{Math.max(...productosColor.filter(p => p.categoria === 'manga').map(p => p.medidas.altoM)).toFixed(2)}m</span>
                                </div>
                              </div>
                            )}
                            {productosColor.some(p => p.categoria === 'burbupack') && (
                              <div className="bg-white border border-gris-muy-claro rounded-xl p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gris-medio"><span>Burbupack – Largos</span><span></span></div>
                                <div className="flex items-center justify-between font-semibold text-negro-principal mt-1">
                                  <span className="tabular-nums">{Math.min(...productosColor.filter(p => p.categoria === 'burbupack').map(p => p.medidas.largoM))}m</span>
                                  <span className="text-gris-medio">—</span>
                                  <span className="tabular-nums">{Math.max(...productosColor.filter(p => p.categoria === 'burbupack').map(p => p.medidas.largoM))}m</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <Link 
                            to={`/productos?color=${color.id}&cat=${categoria}`}
                            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[190px]"
                          >
                            <Package className="w-5 h-5" />
                            Ver Productos
                          </Link>
                          <Link 
                            to="/contacto"
                            className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[190px]"
                          >
                            Consultar Precio
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Visualización del color eliminada (espacio derecho) */}
                  </div>
                </Motion.div>
              );
            })}
          </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {BURBUPACK_ANCHOS_M.map((anchoM, index) => {
              const productosAncho = catalogoV2.filter(p => p.categoria === 'burbupack' && p.medidas?.anchoM === anchoM);
              return (
                <Motion.div
                  key={anchoM}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden h-full"
                >
                  <div className="p-6 md:p-8 lg:p-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <button
                        onClick={() => goToBurbupack(anchoM)}
                        aria-label={`Ver Burbupack ${anchoM.toFixed(2)} m`}
                        className="relative w-16 h-16 rounded-full bg-white border-2 border-gris-muy-claro shadow-sm overflow-hidden"
                      >
                        <img src={`/images/productos/Burbupack/${anchoM.toFixed(2)}/burbupack_${anchoM.toFixed(2)}Mx100.png`} alt={`Burbupack ${anchoM.toFixed(2)} m`} className="pointer-events-none absolute inset-0 m-auto w-12 h-12 md:w-14 md:h-14 object-contain" onError={(e) => {
                          if (!e.currentTarget.dataset.altTried) {
                            e.currentTarget.dataset.altTried = '1';
                            e.currentTarget.src = `/images/productos/Burbupack/${anchoM.toFixed(2)}/burbupack_${anchoM.toFixed(2)}Mx100 .png`;
                            return;
                          }
                          e.currentTarget.style.display = 'none';
                        }} />
                      </button>
                      <div>
                        <h2 className="text-3xl font-bold text-negro-principal">Burbupack {anchoM.toFixed(2)} m</h2>
                        <p className="text-gris-medio">{productosAncho.length} productos disponibles</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-negro-principal mb-3">Largos Disponibles</h3>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(productosAncho.map(p => p.medidas?.largoM))].map(l => (
                            <span key={l} className="bg-verde-light text-verde-principal px-3 py-1 rounded-full text-sm font-medium">{l}m</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-negro-principal mb-3">Rango de Largos</h3>
                        <div className="bg-white border border-gris-muy-claro rounded-xl p-4 max-w-[250px] shadow-sm">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gris-medio"><span>Mínimo</span><span>Máximo</span></div>
                          <div className="flex items-center justify-between font-semibold text-negro-principal mt-1">
                            <span className="tabular-nums">{Math.min(...productosAncho.map(p => p.medidas?.largoM))}m</span>
                            <span className="text-gris-medio">—</span>
                            <span className="tabular-nums">{Math.max(...productosAncho.map(p => p.medidas?.largoM))}m</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Link to={`/productos?cat=burbupack&anchoM=${anchoM}`} className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[190px]"><Package className="w-5 h-5" />Ver Productos</Link>
                        <Link to="/contacto" className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[190px]">Consultar Precio</Link>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* Guía de selección */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <Motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              Guía de Selección de Colores
            </h2>
            <p className="text-gris-oscuro text-lg max-w-2xl mx-auto">
              Elige el color adecuado según tu industria y aplicación específica
            </p>
          </Motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                industria: 'Industria Alimentaria',
                coloresRecomendados: ['blanco'],
                razon: 'Cumple estándares de higiene y es fácil de detectar contaminación',
                icon: '🥘'
              },
              {
                industria: 'Construcción',
                coloresRecomendados: ['negro', 'amarillo'],
                razon: 'Negro para uso general, amarillo para señalización de seguridad',
                icon: '🏗️'
              },
              {
                industria: 'Logística',
                coloresRecomendados: ['negro', 'azul', 'rojo'],
                razon: 'Sistema de códigos de colores para clasificación de productos',
                icon: '📦'
              },
              {
                industria: 'Farmacéutica',
                coloresRecomendados: ['blanco'],
                razon: 'Ambiente estéril y trazabilidad de productos críticos',
                icon: '💊'
              },
              {
                industria: 'Manufactura',
                coloresRecomendados: ['negro', 'azul'],
                razon: 'Negro para uso general, azul para identificación de líneas',
                icon: '⚙️'
              },
              {
                industria: 'Agricultura',
                coloresRecomendados: ['blanco', 'negro'],
                razon: 'Blanco para productos frescos, negro para usos generales',
                icon: '🌱'
              }
            ].map((guia, index) => (
              <Motion.div
                key={index}
                className="card p-6 hover:shadow-industrial transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{guia.icon}</div>
                <h3 className="text-xl font-semibold text-negro-principal mb-3">
                  {guia.industria}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {guia.coloresRecomendados.map(colorId => {
                    const color = colores.find(c => c.id === colorId);
                    return color ? (
                      <div key={colorId} className="flex items-center space-x-2">
                        <ColorChip color={color} size="sm" />
                        <span className="text-sm font-medium text-gris-oscuro">
                          {color.nombre}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
                <p className="text-sm text-gris-medio">
                  {guia.razon}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recomendaciones por industria (tabla responsiva) */}
      <section className="py-20 bg-fondo-claro">
        <div className="container-max section-padding">
          <Motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-3">
              Recomendaciones por Industria
            </h2>
            <p className="text-gris-oscuro max-w-3xl mx-auto">
              Basado en mejores prácticas de embalaje, seguridad y trazabilidad.
            </p>
          </Motion.div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white rounded-xl shadow-card overflow-hidden">
              <thead className="bg-fondo-claro/60">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gris-oscuro">Industria</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gris-oscuro">Color primario</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gris-oscuro">Secundario(s)</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gris-oscuro">Usos típicos</th>
                </tr>
              </thead>
              <tbody>
                {recomendacionesIndustria.map((row, idx) => {
                  const colorPrimario = getColorById(row.primario);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-white'}>
                      <td className="px-4 py-4 align-top">
                        <span className="font-medium text-negro-principal">{row.industria}</span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {colorPrimario && (
                          <div className="flex items-center gap-2">
                            <ColorChip color={colorPrimario} size="sm" onClick={() => goToColor(colorPrimario.id)} />
                            <span className="text-sm text-gris-oscuro">{colorPrimario.nombre}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {row.secundarios.map(secId => {
                            const c = getColorById(secId);
                            return c ? (
                              <div key={secId} className="flex items-center gap-2">
                                <ColorChip color={c} size="sm" onClick={() => goToColor(c.id)} />
                                <span className="text-xs text-gris-oscuro">{c.nombre}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="text-sm text-gris-oscuro">{row.usos}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradiente-principal text-white">
        <div className="container-max section-padding">
          <Motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              ¿No estás seguro qué color elegir?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Nuestros especialistas te ayudarán a seleccionar el color perfecto 
              para tu aplicación específica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contacto" 
                className="bg-white text-verde-principal px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Consultar Especialista
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="/productos" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-verde-principal transition-colors inline-flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                Ver Todos los Productos
              </Link>
            </div>
          </Motion.div>
        </div>
      </section>
    </div>
  );
};

export default Colores;
