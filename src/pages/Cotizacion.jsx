import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  Send,
  ShoppingCart,
  Package,
  CheckCircle,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { useQuote } from '../contexts/QuoteContext';
import { colores } from '../data/productos';
import { getParametrica } from '../services/parametricaService';
import { createCotizacion } from '../services/cotizacionService';
// import ColorChip from '../components/ColorChip';

const Cotizacion = () => {
  const { items, removeFromQuote, updateQuantity, clearQuote, getTotalItems, getTotalProducts } = useQuote();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [loadingTiposDoc, setLoadingTiposDoc] = useState(true);
  const bannedRegex = /[<>"'()&;:]/g;
  const sanitizeInput = (v) => (typeof v === 'string' ? v.replace(bannedRegex, '') : v);
  const sanitizeDocumentNumber = (value = '') => {
    // Permitir solo números (sin letras ni guiones)
    return value.replace(/[^0-9]/g, '');
  };
  const handleKeyDownXSS = (e) => {
    const banned = ['<', '>', '"', "'", '(', ')', '&', ';', ':'];
    if (banned.includes(e.key)) {
      e.preventDefault();
    }
  };
  const handlePasteXSS = (e) => {
    const text = e.clipboardData.getData('text') || '';
    if (bannedRegex.test(text)) {
      e.preventDefault();
      const sanitized = text.replace(bannedRegex, '');
      const target = e.target;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      target.value = target.value.slice(0, start) + sanitized + target.value.slice(end);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm({ mode: 'onChange' });
  const [acceptLegal, setAcceptLegal] = useState(false);

  // Cargar tipos de documento desde la base de datos
  useEffect(() => {
    const cargarTiposDocumento = async () => {
      try {
        setLoadingTiposDoc(true);
        const result = await getParametrica('tipo_documento', 'true');
        if (result.data && result.data.length > 0) {
          setTiposDocumento(result.data);
        } else {
          // Valores por defecto si no hay datos
          setTiposDocumento([
            { codigo_parametro: 'DNI', descripcion: 'Documento Nacional de Identidad', valor: 'DNI' },
            { codigo_parametro: 'RUC', descripcion: 'Registro Único de Contribuyentes', valor: 'RUC' },
            { codigo_parametro: 'CE', descripcion: 'Carnet de Extranjería', valor: 'CE' },
          ]);
        }
      } catch (error) {
        console.error('Error cargando tipos de documento:', error);
        // En caso de error, usar valores por defecto
        setTiposDocumento([
          { codigo_parametro: 'DNI', descripcion: 'Documento Nacional de Identidad', valor: 'DNI' },
          { codigo_parametro: 'RUC', descripcion: 'Registro Único de Contribuyentes', valor: 'RUC' },
          { codigo_parametro: 'CE', descripcion: 'Carnet de Extranjería', valor: 'CE' },
        ]);
      } finally {
        setLoadingTiposDoc(false);
      }
    };
    cargarTiposDocumento();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Formatear productos según lo que espera el edge function
      const productos = items.map(item => ({
        id: item.id,
        cantidad: item.cantidad || 1,
        precio_unitario: item.precio_unitario || item.precio || 0
      }));

      // Preparar datos según el formato esperado por crud-cotizaciones
      const cotizacionData = {
        cliente_tipo_documento: data.tipoDocumento,
        cliente_numero_documento: data.numeroDocumento,
        cliente_nombre: data.nombre,
        cliente_email: data.email,
        cliente_telefono: data.telefono,
        cliente_empresa: null, // No tenemos campo empresa en el formulario
        cliente_direccion: null, // No tenemos campo dirección en el formulario
        productos: productos,
        estado: 'pendiente',
        observaciones: data.mensaje || null,
        descuento: 0
      };

      console.log('Enviando cotización:', cotizacionData);

      // Llamar al edge function para crear la cotización
      const result = await createCotizacion(cotizacionData);

      if (!result.success) {
        throw new Error(result.error || 'Error al crear la cotización');
      }

      console.log('Cotización creada exitosamente:', result.data);

      setIsSubmitted(true);
      reset();
      clearQuote();
    } catch (error) {
      console.error('Error al enviar cotización:', error);
      alert(`Error al enviar la cotización: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-industrial p-6 sm:p-8 text-center max-w-md mx-auto w-full"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-negro-principal mb-3 sm:mb-4">
            ¡Cotización Enviada!
          </h2>
          <p className="text-sm sm:text-base text-gris-medio mb-5 sm:mb-6">
            Hemos recibido tu solicitud de cotización. Nuestro equipo comercial
            se pondrá en contacto contigo en las próximas 2 horas.
          </p>
          <a href="/" className="btn-primary w-full">
            Volver al Inicio
          </a>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro">
        <div className="container-max section-padding py-12 sm:py-16">
          <div className="text-center px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gris-muy-claro rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gris-claro" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-negro-principal mb-3 sm:mb-4">
              Tu cotización está vacía
            </h1>
            <p className="text-sm sm:text-base text-gris-oscuro mb-6 sm:mb-8 max-w-md mx-auto">
              Agrega productos a tu cotización desde nuestro catálogo para continuar.
            </p>
            <Link
              to="/productos"
              className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Package className="w-5 h-5" />
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro overflow-x-hidden">
      <div className="container-max section-padding py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-negro-principal mb-3 sm:mb-4">
            Solicitar Cotización
          </h1>
          <p className="text-sm sm:text-base text-gris-oscuro">
            Revisa tu selección y completa tus datos para recibir una cotización personalizada.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-card p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-negro-principal">
                  Productos Seleccionados ({items.length})
                </h2>
                <button
                  onClick={clearQuote}
                  className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Limpiar todo
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => {
                    const colorInfo = colores.find(c => c.id === item.color);
                    let detalleHref = item?.detalleHref
                      || (item?.categoria
                        ? (item.categoria === 'zuncho' && typeof item.idV1 === 'number' ? `/producto/${item.idV1}` : `/producto-v2/${item.id}`)
                        : `/producto/${item.id}`);
                    if (item?.categoria === 'esquinero') {
                      const Lval = Number(item?.medidas?.longitudM);
                      if (Number.isFinite(Lval) && Lval > 0) {
                        const gRaw = Math.round(Number(item.gramajeGxm || 0.20) * 100);
                        const g = [18, 19, 20].includes(gRaw) ? gRaw : 20;
                        const params = new URLSearchParams({ L: String(Lval), g: String(g) });
                        detalleHref = `${detalleHref}?${params.toString()}`;
                      }
                    }
                    const displayName = (() => {
                      if (typeof item.tituloCotizacion === 'string' && item.tituloCotizacion.trim().length > 0) {
                        return item.tituloCotizacion;
                      }
                      if (item?.categoria === 'esquinero') {
                        const colorName = (colorInfo?.nombre || item.color || '').toString().toLowerCase();
                        const Lval = Number(item?.medidas?.longitudM);
                        if (Number.isFinite(Lval) && Lval > 0) {
                          return `Esquinero plástico ${colorName} de ${Lval.toFixed(2)} m`;
                        }
                        return `Esquinero plástico ${colorName}`;
                      }
                      return item.nombre;
                    })();

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gris-muy-claro rounded-lg hover:border-verde-principal/30 transition-colors"
                      >
                        {/* Bloque clickeable hacia detalle */}
                        <Link to={detalleHref} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 group">
                          {/* Imagen del producto */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gris-muy-claro bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {(() => {
                              // Render según categoría - Normalizada
                              const cat = (item?.categoria || '').toLowerCase();

                              if (cat === 'esquinero' || cat === 'esquineros') {
                                const nombreColor = colorInfo?.nombre || (item.color ? item.color.charAt(0).toUpperCase() + item.color.slice(1) : 'Negro');
                                const src = `/images/productos/Esquineros/${nombreColor}/esquinero.png`;
                                return (
                                  <>
                                    <img
                                      src={src}
                                      alt={`Esquinero ${nombreColor}`}
                                      className="w-12 h-12 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextSibling;
                                        if (fallback) fallback.style.display = 'block';
                                      }}
                                    />
                                    <div className="hidden w-10 h-10 rounded-full" style={{ backgroundColor: colorInfo?.hex || '#e5e7eb' }} />
                                  </>
                                );
                              }

                              if (cat === 'burbupack') {
                                // Intentar obtener ancho y largo de diferentes fuentes
                                let ancho = item?.medidas?.anchoM;
                                let largo = item?.medidas?.largoM;

                                // Si no existen en medidas, buscar en especificaciones
                                if (!ancho && item?.especificaciones?.ancho_m) {
                                  ancho = item.especificaciones.ancho_m;
                                } else if (!ancho && item?.especificaciones?.ancho) {
                                  ancho = item.especificaciones.ancho;
                                }

                                if (!largo && item?.especificaciones?.largo_m) {
                                  largo = item.especificaciones.largo_m;
                                } else if (!largo && item?.especificaciones?.largo) {
                                  largo = item.especificaciones.largo;
                                }

                                // Si aún no hay valores, intentar extraer de medidas_disponibles
                                if (!ancho || !largo) {
                                  if (item?.medidas_disponibles && item.medidas_disponibles.length > 0) {
                                    const medida = item.medidas_disponibles[0];
                                    // Buscar patrón "0.40m x 100m" o "0.50 x 100"
                                    const match = medida.match(/(\d+\.?\d*)\s*(?:m|mts|metros)?\s*x\s*(\d+)\s*(?:m|mts|metros)?/i);
                                    if (match) {
                                      if (!ancho) ancho = parseFloat(match[1]);
                                      if (!largo) largo = parseInt(match[2]);
                                    }
                                  }
                                }

                                // Formatear ancho y largo
                                const anchoStr = ancho ? Number(ancho).toFixed(2) : '0.00';
                                const largoStr = largo ? String(largo) : '';

                                const src = item.imagen || `/images/productos/Burbupack/${anchoStr}/burbupack_${anchoStr}Mx${largoStr}.png`;
                                const srcAlt = src.replace('.png', ' .png');

                                return (
                                  <>
                                    <img
                                      src={src}
                                      alt={`Burbupack ${anchoStr} m x ${largoStr} m`}
                                      className="w-12 h-12 object-contain"
                                      onError={(e) => {
                                        if (!e.currentTarget.dataset.altTried) {
                                          e.currentTarget.dataset.altTried = '1';
                                          e.currentTarget.src = srcAlt;
                                          return;
                                        }
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextSibling;
                                        if (fallback) fallback.style.display = 'block';
                                      }}
                                    />
                                    <div className="hidden w-10 h-10 rounded-full" style={{ backgroundColor: '#e5e7eb' }} />
                                  </>
                                );
                              }

                              if (cat === 'accesorio' || cat === 'accesorios') {
                                const lowerName = (item.nombre || '').toLowerCase();
                                let folderName = item.nombre;
                                if (lowerName.includes('tenaza')) folderName = 'Tenaza';
                                else if (lowerName.includes('tensador')) folderName = 'Tensador Manual';
                                else if (lowerName.includes('grapa')) folderName = 'Grapas Metálicas';

                                const src = `/images/productos/Accesorios/${folderName}/principal.png`;
                                return (
                                  <>
                                    <img
                                      src={src}
                                      alt={item.nombre}
                                      className="w-12 h-12 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextSibling;
                                        if (fallback) fallback.style.display = 'block';
                                      }}
                                    />
                                    <div className="hidden w-10 h-10 rounded-full" style={{ backgroundColor: '#e5e7eb' }} />
                                  </>
                                );
                              }

                              if (cat === 'manga' || cat === 'mangas') {
                                const baseColor = (colorInfo?.nombre || item.color || 'Negro');
                                const folderColor = String(baseColor).charAt(0).toUpperCase() + String(baseColor).slice(1);
                                const altoFmt = Number(item?.medidas?.altoM || 0).toFixed(2);
                                const src = item.imagen || `/images/productos/Mangas/${folderColor}/${altoFmt}/principal.png`;
                                return (
                                  <>
                                    <img
                                      src={src}
                                      alt={`Manga ${folderColor} ${altoFmt} m`}
                                      className="w-12 h-12 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextSibling;
                                        if (fallback) fallback.style.display = 'block';
                                      }}
                                    />
                                    <div className="hidden w-10 h-10 rounded-full" style={{ backgroundColor: colorInfo?.hex || '#e5e7eb' }} />
                                  </>
                                );
                              }

                              // Zuncho (V1 o V2) - Fallback default
                              const carpetaColor = colorInfo?.nombre || (item.color ? (item.color.charAt(0).toUpperCase() + item.color.slice(1).toLowerCase()) : 'Negro');
                              // Asegurar que nombreColor sea valido para carpeta (Capitalizado)
                              const rutaNueva = `/images/productos/Zunchos/${carpetaColor}/zuncho_${(item.color || 'negro').toLowerCase()}.png`;
                              const rutaAntigua = `/images/productos/zuncho_${(item.color || 'negro').toLowerCase()}.png`;
                              return (
                                <>
                                  <img
                                    src={rutaNueva}
                                    alt={`Zuncho ${colorInfo?.nombre || item.color || 'Negro'}`}
                                    className="w-12 h-12 object-contain"
                                    onError={(e) => {
                                      if (!e.currentTarget.dataset.fallbackApplied) {
                                        e.currentTarget.dataset.fallbackApplied = 'true';
                                        e.currentTarget.src = rutaAntigua;
                                        return;
                                      }
                                      // Si tampoco existe, ocultar imagen y mostrar círculo de color
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextSibling;
                                      if (fallback) fallback.style.display = 'block';
                                    }}
                                  />
                                  <div
                                    className="hidden w-10 h-10 rounded-full"
                                    style={{ backgroundColor: colorInfo?.hex || '#e5e7eb' }}
                                  />
                                </>
                              );
                            })()}
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-negro-principal line-clamp-2 sm:truncate group-hover:text-verde-principal">
                              {displayName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                              <span className="text-xs sm:text-sm text-gris-medio">
                                {(() => {
                                  if (item?.categoria === 'burbupack' || item?.categoria?.toLowerCase() === 'burbupack') {
                                    // Intentar obtener ancho y largo de diferentes fuentes
                                    let ancho = item?.medidas?.anchoM;
                                    let largo = item?.medidas?.largoM;

                                    // Si no existen en medidas, buscar en especificaciones
                                    if (!ancho && item?.especificaciones?.ancho_m) {
                                      ancho = item.especificaciones.ancho_m;
                                    } else if (!ancho && item?.especificaciones?.ancho) {
                                      ancho = item.especificaciones.ancho;
                                    }

                                    if (!largo && item?.especificaciones?.largo_m) {
                                      largo = item.especificaciones.largo_m;
                                    } else if (!largo && item?.especificaciones?.largo) {
                                      largo = item.especificaciones.largo;
                                    }

                                    // Si aún no hay valores, intentar extraer de medidas_disponibles
                                    if (!ancho || !largo) {
                                      if (item?.medidas_disponibles && item.medidas_disponibles.length > 0) {
                                        const medida = item.medidas_disponibles[0];
                                        const match = medida.match(/(\d+\.?\d*)\s*(?:m|mts|metros)?\s*x\s*(\d+)\s*(?:m|mts|metros)?/i);
                                        if (match) {
                                          if (!ancho) ancho = parseFloat(match[1]);
                                          if (!largo) largo = parseInt(match[2]);
                                        }
                                      }
                                    }

                                    if (ancho && largo) {
                                      return `${Number(ancho).toFixed(2)} m × ${largo} m`;
                                    }
                                    return null;
                                  }
                                  if (item?.categoria === 'esquinero' && item?.medidas) {
                                    const base = `${item.medidas.ladoMM}×${item.medidas.espesorMM} mm`;
                                    const largo = Number(item.medidas.longitudM);
                                    return Number.isFinite(largo) && largo > 0
                                      ? `${base} · ${largo.toFixed(2)} m`
                                      : base;
                                  }
                                  if (item?.categoria === 'manga' && item?.medidas) {
                                    return `Altura ${Number(item.medidas.altoM).toFixed(2)} m · Espesor ${item.medidas.espesorMM} mm`;
                                  }
                                  if (item?.categoria === 'zuncho') {
                                    return `${item.ancho}" × ${item.largo}m`;
                                  }
                                  return null;
                                })()}
                              </span>
                              <span className="text-xs sm:text-sm text-gris-medio">
                                {item.codigoCorto || item.codigo}
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Controles de cantidad y eliminar */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                              className="w-8 h-8 border border-gris-muy-claro rounded flex items-center justify-center hover:bg-gris-muy-claro/50 transition-colors flex-shrink-0"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-sm sm:text-base">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              className="w-8 h-8 border border-gris-muy-claro rounded flex items-center justify-center hover:bg-gris-muy-claro/50 transition-colors flex-shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => removeFromQuote(item.id)}
                            className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex items-center justify-center transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div>
            <div className="bg-white rounded-xl shadow-card p-4 sm:p-6 lg:sticky lg:top-28">
              <h2 className="text-lg sm:text-xl font-semibold text-negro-principal mb-4 sm:mb-6">
                Datos de Contacto
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                {/* Tipo de documento */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-negro-principal mb-1">
                    Tipo de documento *
                  </label>
                  <select
                    {...register('tipoDocumento', { required: 'Selecciona un tipo de documento' })}
                    disabled={loadingTiposDoc}
                    className="input-field appearance-none bg-no-repeat pr-12 pl-4 py-3 rounded-lg border focus:ring-2 focus:ring-verde-principal focus:border-transparent transition-all bg-right-3 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    style={{
                      backgroundImage: loadingTiposDoc ? 'none' : "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo.codigo_parametro || tipo.valor || tipo.id} value={tipo.codigo_parametro || tipo.valor || tipo.id}>
                        {tipo.codigo_parametro || tipo.valor || tipo.id}
                      </option>
                    ))}
                  </select>
                  {errors.tipoDocumento && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipoDocumento.message}</p>
                  )}
                </div>

                {/* Número de documento */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-negro-principal mb-1">
                    Número de documento *
                  </label>
                  <input
                    type="text"
                    {...register('numeroDocumento', {
                      required: 'El número de documento es requerido',
                      pattern: {
                        value: /^[0-9]+$/,
                        message: 'Solo se permiten números'
                      },
                      setValueAs: sanitizeDocumentNumber
                    })}
                    onKeyPress={(e) => {
                      // Solo permitir números
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="input-field w-full"
                    placeholder="12345678"
                  />
                  {errors.numeroDocumento && (
                    <p className="mt-1 text-sm text-red-600">{errors.numeroDocumento.message}</p>
                  )}
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-negro-principal mb-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    {...register('nombre', {
                      required: 'El nombre es requerido',
                      setValueAs: sanitizeInput
                    })}
                    onKeyDown={handleKeyDownXSS}
                    onPaste={handlePasteXSS}
                    className="input-field"
                    placeholder="Tu nombre completo"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-negro-principal mb-1">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className="input-field"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-negro-principal mb-1">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    {...register('telefono', {
                      required: 'El teléfono es requerido',
                      setValueAs: sanitizeInput
                    })}
                    onKeyDown={handleKeyDownXSS}
                    onPaste={handlePasteXSS}
                    className="input-field"
                    placeholder="+51 987 654 321"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
                  )}
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-negro-principal mb-1">
                    Mensaje adicional
                  </label>
                  <textarea
                    {...register('mensaje', {
                      setValueAs: sanitizeInput
                    })}
                    onKeyDown={handleKeyDownXSS}
                    onPaste={handlePasteXSS}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Comentarios adicionales, fechas de entrega, etc."
                  />
                </div>

                {/* Resumen */}
                <div className="bg-fondo-claro rounded-lg p-3 sm:p-4 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gris-oscuro">Total de productos:</span>
                    <span className="font-semibold">{getTotalProducts()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gris-oscuro">Total de rollos:</span>
                    <span className="font-semibold">{getTotalItems()}</span>
                  </div>
                  <div className="border-t border-gris-muy-claro pt-2">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="font-semibold text-negro-principal">Precio:</span>
                      <span className="font-bold text-verde-principal">A consultar</span>
                    </div>
                  </div>
                </div>

                {/* Aceptación legal */}
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gris-medio">
                  <input
                    id="acepto"
                    type="checkbox"
                    checked={acceptLegal}
                    onChange={(e) => setAcceptLegal(e.target.checked)}
                    className="mt-0.5 sm:mt-1 w-4 h-4 rounded border-gris-muy-claro focus:ring-verde-principal flex-shrink-0"
                  />
                  <label htmlFor="acepto" className="leading-snug">
                    Acepto los <a href="/terminos" className="text-verde-principal hover:underline">términos y condiciones</a> y la <a href="/privacidad" className="text-verde-principal hover:underline">política de privacidad</a>
                  </label>
                </div>

                {/* Botón enviar */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !isValid || !acceptLegal}
                  aria-disabled={isSubmitting || !isValid || !acceptLegal}
                  className={`btn-primary w-full inline-flex items-center justify-center gap-2 text-sm sm:text-base py-3 ${(!isValid || !acceptLegal || isSubmitting) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Solicitar Cotización
                    </>
                  )}
                </motion.button>

                {/* Texto redundante de aceptación eliminado: ya existe la casilla superior */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cotizacion;
