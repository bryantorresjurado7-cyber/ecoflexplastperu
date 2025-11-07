import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  MessageSquare,
  Building,
  User
} from 'lucide-react';
import { getTiposConsulta, getParametrica } from '../services/parametricaService';
import { buscarClientePorDocumento, buscarProveedorPorDocumento } from '../services/clienteProveedorService';
import { crearConsulta } from '../services/consultaService';

// Sanitizadores simples para prevenir scripts y caracteres peligrosos
const sanitizeName = (value = '') => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]/g, '');
};

const sanitizeCompany = (value = '') => {
  return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,-]/g, '');
};

const sanitizePhone = (value = '') => {
  return value.replace(/[^0-9+\s()-]/g, '');
};

const sanitizeDocumentNumber = (value = '') => {
  // Permitir solo números (sin letras ni guiones)
  return value.replace(/[^0-9]/g, '');
};

const sanitizeEmail = (value = '') => {
  return (value || '').toLowerCase().replace(/[^a-z0-9@._+-]/g, '');
};

const sanitizeMessage = (value = '') => {
  let sanitized = (value || '').replace(/(javascript:|data:)/gi, '');
  sanitized = sanitized.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-_!¡¿?\n]/g, '');
  return sanitized;
};

const Contacto = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('addr1');
  const [tiposConsulta, setTiposConsulta] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [loadingTiposDoc, setLoadingTiposDoc] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue
  } = useForm({ mode: 'onChange' });

  const termsAccepted = watch('terminos', false);
  const isSubmitDisabled = isSubmitting || !isValid || !termsAccepted;
  
  // Observar cambios en campos relevantes para autocompletado
  const tipoRelacion = watch('tipoRelacion');
  const tipoDocumento = watch('tipoDocumento');
  const numeroDocumento = watch('numeroDocumento');

  // Cargar tipos de consulta desde la base de datos
  useEffect(() => {
    const cargarTiposConsulta = async () => {
      try {
        setLoadingTipos(true);
        const result = await getTiposConsulta();
        if (result.data && result.data.length > 0) {
          setTiposConsulta(result.data);
        } else {
          // Si no hay datos, usar valores por defecto
          setTiposConsulta([
            { codigo: 'cotizacion', nombre: '💬 Solicitar cotización', valor: 'cotizacion', estado: true },
            { codigo: 'informacion', nombre: '📦 Información de productos', valor: 'informacion', estado: true },
            { codigo: 'soporte', nombre: '🛠️ Soporte técnico', valor: 'soporte', estado: true },
            { codigo: 'distribuidor', nombre: '🤝 Ser distribuidor', valor: 'distribuidor', estado: true },
            { codigo: 'otros', nombre: '✉️ Otros', valor: 'otros', estado: true }
          ]);
        }
      } catch (error) {
        // En caso de error, usar valores por defecto
        setTiposConsulta([
          { codigo: 'cotizacion', nombre: '💬 Solicitar cotización', valor: 'cotizacion', estado: true },
          { codigo: 'informacion', nombre: '📦 Información de productos', valor: 'informacion', estado: true },
          { codigo: 'soporte', nombre: '🛠️ Soporte técnico', valor: 'soporte', estado: true },
          { codigo: 'distribuidor', nombre: '🤝 Ser distribuidor', valor: 'distribuidor', estado: true },
          { codigo: 'otros', nombre: '✉️ Otros', valor: 'otros', estado: true }
        ]);
      } finally {
        setLoadingTipos(false);
      }
    };

    cargarTiposConsulta();
    
    // Cargar tipos de documento desde la base de datos
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
            { codigo_parametro: 'PAS', descripcion: 'Pasaporte', valor: 'PAS' }
          ]);
        }
      } catch (error) {
        // Valores por defecto en caso de error
        setTiposDocumento([
          { codigo_parametro: 'DNI', descripcion: 'Documento Nacional de Identidad', valor: 'DNI' },
          { codigo_parametro: 'RUC', descripcion: 'Registro Único de Contribuyentes', valor: 'RUC' },
          { codigo_parametro: 'CE', descripcion: 'Carnet de Extranjería', valor: 'CE' },
          { codigo_parametro: 'PAS', descripcion: 'Pasaporte', valor: 'PAS' }
        ]);
      } finally {
        setLoadingTiposDoc(false);
      }
    };

    cargarTiposDocumento();
  }, []);

  // Autocompletado cuando se ingresa número de documento
  useEffect(() => {
    const autocompletarDatos = async () => {
      // Validar que tenemos todos los datos necesarios
      if (!tipoRelacion || !tipoDocumento || !numeroDocumento || numeroDocumento.length < 4) {
        return;
      }

      try {
        console.log('[Contacto] Autocompletando datos:', { tipoRelacion, tipoDocumento, numeroDocumento });
        
        let resultado = null;
        
        // Buscar según el tipo de relación
        if (tipoRelacion === 'cliente') {
          resultado = await buscarClientePorDocumento(tipoDocumento, numeroDocumento);
        } else if (tipoRelacion === 'proveedor') {
          resultado = await buscarProveedorPorDocumento(tipoDocumento, numeroDocumento);
        }

        console.log('[Contacto] Resultado de búsqueda:', resultado);

        // Si encontramos datos, autocompletar campos
        if (resultado && resultado.data && !resultado.error) {
          const datos = resultado.data;
          console.log('[Contacto] Datos encontrados para autocompletar:', datos);
          
          // Mapear campos según la estructura real de las tablas
          // cliente: nombre, email, telefono
          // proveedor: nombre, email, telefono
          if (datos.nombre) {
            setValue('nombre', datos.nombre);
          }
          
          if (datos.email) {
            setValue('email', datos.email);
          }
          
          if (datos.telefono) {
            setValue('telefono', datos.telefono);
          }
        } else {
          console.log('[Contacto] No se encontraron datos o hay error:', resultado?.error);
        }
      } catch (error) {
        console.error('[Contacto] Error en autocompletado:', error);
        // Silenciar errores de búsqueda (puede que no exista el registro)
        // No mostrar error al usuario si no se encuentra
      }
    };

    // Debounce: esperar 800ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      autocompletarDatos();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [tipoRelacion, tipoDocumento, numeroDocumento, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Limpiar y sanitizar datos
      const nombreLimpio = sanitizeName(data?.nombre || '').trim();
      const emailLimpio = sanitizeEmail(data?.email || '');
      const telefonoLimpio = sanitizePhone(data?.telefono || '');
      const mensajeLimpio = sanitizeMessage(data?.mensaje || '').trim();
      const tipoDocumentoLimpio = data?.tipoDocumento || '';
      const numeroDocumentoLimpio = sanitizeDocumentNumber(data?.numeroDocumento || '').trim();

      // Buscar la descripción del tipo de consulta desde los tipos cargados
      const tipoConsultaSeleccionado = tiposConsulta.find(
        tipo => tipo.valor === data?.tipoConsulta || tipo.codigo === data?.tipoConsulta || tipo.id === data?.tipoConsulta
      );
      const descripcionTipoConsulta = tipoConsultaSeleccionado?.descripcion || 
                                      tipoConsultaSeleccionado?.nombre || 
                                      tipoConsultaSeleccionado?.valor || 
                                      data?.tipoConsulta || '';

      // Preparar datos para la edge function
      const datosConsulta = {
        tipoRelacion: data?.tipoRelacion || '',
        tipoDocumento: tipoDocumentoLimpio,
        numeroDocumento: numeroDocumentoLimpio,
        nombre: nombreLimpio,
        email: emailLimpio,
        telefono: telefonoLimpio || null,
        mensaje: mensajeLimpio,
        tipoConsulta: data?.tipoConsulta || '',
        descripcionTipoConsulta: descripcionTipoConsulta,
        asunto: null // Por ahora no hay campo asunto en el formulario
      };

      // Llamar a la edge function para crear la consulta
      const resultado = await crearConsulta(datosConsulta);

      if (resultado.success) {
        // Éxito: mostrar mensaje y resetear formulario
        setIsSubmitted(true);
        reset();
      } else {
        // Error: mostrar mensaje de error
        alert(`Error al enviar el formulario: ${resultado.error}`);
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert(`Error al enviar el formulario: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (isSubmitted) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-industrial p-8 text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-negro-principal mb-4">
            ¡Mensaje Enviado!
          </h2>
          <p className="text-gris-medio mb-6">
            Gracias por contactarnos. Nuestro equipo se pondrá en contacto contigo 
            en las próximas 24 horas.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn-primary w-full"
          >
            Enviar otro mensaje
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro">
      {/* Header */}
      <div className="bg-white border-b border-gris-muy-claro">
        <div className="container-max section-padding py-12">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-negro-principal mb-4">
              Contacta con Nosotros
            </h1>
            <p className="text-xl text-gris-oscuro max-w-2xl mx-auto">
              ¿Tienes preguntas sobre nuestros productos? Nuestro equipo de especialistas 
              está listo para ayudarte.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-max section-padding py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Información de contacto */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-negro-principal mb-6">
                Información de Contacto
              </h2>
              <p className="text-gris-oscuro mb-8">
                Estamos aquí para ayudarte con todas tus necesidades de enzunchado industrial. 
                Contáctanos por cualquiera de estos medios.
              </p>
            </div>

            <div className="space-y-6">
              {/* Dirección */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-verde-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-verde-principal" />
                </div>
                <div>
                  <h3 className="font-semibold text-negro-principal mb-1">
                    Dirección
                  </h3>
                  <p className="text-gris-oscuro">
                    calle 2 sector 3 grupo 29 Mz.N Lt.45, villa el salvador<br />
                    Jr. Isabel Flores de Oliva 270, Lima 15079
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-verde-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-verde-principal" />
                </div>
                <div>
                  <h3 className="font-semibold text-negro-principal mb-1">
                    Teléfono
                  </h3>
                  <p className="text-gris-oscuro">
                    <button 
                      onClick={() => window.open('https://wa.me/message/FP3PXXHAVSTLM1', '_blank')}
                      className="hover:text-verde-principal transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      +51 946 881 539
                    </button>
                  </p>
                  <p className="text-sm text-gris-medio">
                    Línea directa de ventas
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-verde-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-verde-principal" />
                </div>
                <div>
                  <h3 className="font-semibold text-negro-principal mb-1">
                    Email
                  </h3>
                  <p className="text-gris-oscuro">
                    <a href="mailto:ventas@ecoflexplastperu.com" className="hover:text-verde-principal transition-colors">
                      ventas@ecoflexplastperu.com
                    </a>
                  </p>
                  <p className="text-sm text-gris-medio">
                    Cotizaciones y consultas
                  </p>
                </div>
              </div>

              {/* Horarios */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-verde-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-verde-principal" />
                </div>
                <div>
                  <h3 className="font-semibold text-negro-principal mb-1">
                    Horarios de Atención
                  </h3>
                  <div className="text-gris-oscuro space-y-1">
                    <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
                    <p>Sábados: 8:00 AM - 1:00 PM</p>
                    <p className="text-sm text-gris-medio">Domingos: Cerrado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa con selector de dirección */}
            <div className="bg-gris-muy-claro rounded-xl overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAddress('addr1')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${selectedAddress === 'addr1' ? 'bg-verde-principal text-white border-verde-principal' : 'bg-white text-negro-principal border-gris-muy-claro'}`}
                  >
                    Dirección 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAddress('addr2')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${selectedAddress === 'addr2' ? 'bg-verde-principal text-white border-verde-principal' : 'bg-white text-negro-principal border-gris-muy-claro'}`}
                  >
                    Dirección 2
                  </button>
                </div>
              </div>
              <div className="h-64 md:h-80 w-full bg-white">
                <iframe
                  title="Mapa de Eco Flex Plast"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(selectedAddress === 'addr1' ? '-12.2261667,-76.9375278' : 'Jr. Isabel Flores de Oliva 270, Lima 15079, Perú')}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-3 text-right">
                <a
                  className="text-sm text-verde-principal hover:underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress === 'addr1' ? '-12.2261667,-76.9375278' : 'Jr. Isabel Flores de Oliva 270, Lima 15079, Perú')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>
          </motion.div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-negro-principal mb-2">
                  Envíanos un Mensaje
                </h2>
                <p className="text-gris-oscuro">
                  Completa el formulario y nos pondremos en contacto contigo pronto.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Tipo de relación comercial */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-3">
                    Soy *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="group relative flex flex-col items-start p-5 border-2 border-gris-muy-claro rounded-xl cursor-pointer hover:border-verde-principal hover:bg-verde-light/30 transition-all duration-200 has-[:checked]:border-verde-principal has-[:checked]:bg-verde-light/20 has-[:checked]:shadow-md">
                      <div className="flex items-start space-x-3 w-full">
                        <input
                          type="radio"
                          {...register('tipoRelacion', { required: 'Selecciona una opción' })}
                          value="cliente"
                          className="mt-1 w-5 h-5 text-verde-principal focus:ring-2 focus:ring-verde-principal focus:ring-offset-2 border-2 border-gris-medio cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="block text-base font-semibold text-negro-principal mb-1 group-hover:text-verde-principal transition-colors">
                            Cliente
                          </span>
                          <span className="block text-sm text-gris-oscuro leading-relaxed">
                            Busco comprar productos
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-has-[:checked]:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-verde-principal" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </label>
                    <label className="group relative flex flex-col items-start p-5 border-2 border-gris-muy-claro rounded-xl cursor-pointer hover:border-verde-principal hover:bg-verde-light/30 transition-all duration-200 has-[:checked]:border-verde-principal has-[:checked]:bg-verde-light/20 has-[:checked]:shadow-md">
                      <div className="flex items-start space-x-3 w-full">
                        <input
                          type="radio"
                          {...register('tipoRelacion', { required: 'Selecciona una opción' })}
                          value="proveedor"
                          className="mt-1 w-5 h-5 text-verde-principal focus:ring-2 focus:ring-verde-principal focus:ring-offset-2 border-2 border-gris-medio cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="block text-base font-semibold text-negro-principal mb-1 group-hover:text-verde-principal transition-colors">
                            Proveedor
                          </span>
                          <span className="block text-sm text-gris-oscuro leading-relaxed">
                            Ofrezco productos/servicios
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-has-[:checked]:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-verde-principal" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </label>
                  </div>
                  {errors.tipoRelacion && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.tipoRelacion.message}
                    </p>
                  )}
                </div>

                {/* Tipo de consulta */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Tipo de consulta *
                  </label>
                  <select
                    {...register('tipoConsulta', { required: 'Selecciona un tipo de consulta' })}
                    disabled={loadingTipos}
                    className="input-field appearance-none bg-no-repeat pr-12 pl-4 py-3 rounded-lg border focus:ring-2 focus:ring-verde-principal focus:border-transparent transition-all bg-right-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\"><path fill=\"%2399A3AE\" d=\"M5.516 7.548a.625.625 0 0 1 .884-.032L10 10.834l3.6-3.318a.625.625 0 1 1 .852.916l-4.027 3.712a.625.625 0 0 1-.852 0L5.548 8.4a.625.625 0 0 1-.032-.852Z\"/></svg>')",
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <option value="">
                      {loadingTipos ? 'Cargando opciones...' : 'Selecciona una opción'}
                    </option>
                    {tiposConsulta.map((tipo) => (
                      <option key={tipo.codigo || tipo.valor || tipo.id} value={tipo.valor || tipo.codigo || tipo.id}>
                        {tipo.nombre || tipo.descripcion || tipo.valor}
                      </option>
                    ))}
                  </select>
                  {errors.tipoConsulta && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipoConsulta.message}</p>
                  )}
                </div>

                {/* Tipo y número de documento */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Tipo de documento *
                    </label>
                    <select
                      {...register('tipoDocumento', { required: 'Selecciona un tipo de documento' })}
                      disabled={loadingTiposDoc}
                      className="input-field appearance-none bg-no-repeat pr-12 pl-4 py-3 rounded-lg border focus:ring-2 focus:ring-verde-principal focus:border-transparent transition-all bg-right-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\"><path fill=\"%2399A3AE\" d=\"M5.516 7.548a.625.625 0 0 1 .884-.032L10 10.834l3.6-3.318a.625.625 0 1 1 .852.916l-4.027 3.712a.625.625 0 0 1-.852 0L5.548 8.4a.625.625 0 0 1-.032-.852Z\"/></svg>')",
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      <option value="">
                        {loadingTiposDoc ? 'Cargando opciones...' : 'Selecciona un tipo'}
                      </option>
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
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Número de documento *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      {...register('numeroDocumento', { 
                        required: 'El número de documento es requerido',
                        pattern: {
                          value: /^[0-9]+$/,
                          message: 'El número de documento solo debe contener números'
                        },
                        setValueAs: (v) => sanitizeDocumentNumber(v).trim()
                      })}
                      onInput={(e) => {
                        const sanitized = sanitizeDocumentNumber(e.currentTarget.value);
                        if (sanitized !== e.currentTarget.value) e.currentTarget.value = sanitized;
                      }}
                      onKeyPress={(e) => {
                        // Solo permitir números
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                          e.preventDefault();
                        }
                      }}
                      className="input-field"
                      placeholder="Ej: 12345678"
                      maxLength={20}
                    />
                    {errors.numeroDocumento && (
                      <p className="mt-1 text-sm text-red-600">{errors.numeroDocumento.message}</p>
                    )}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    {...register('nombre', { required: 'El nombre es requerido', setValueAs: (v) => sanitizeName(v).trim() })}
                    onInput={(e) => {
                      const sanitized = sanitizeName(e.currentTarget.value);
                      if (sanitized !== e.currentTarget.value) e.currentTarget.value = sanitized;
                    }}
                    className="input-field"
                    placeholder="Tu nombre"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        setValueAs: (v) => sanitizeEmail(v),
                        required: 'El email es requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      onInput={(e) => {
                        const sanitized = sanitizeEmail(e.currentTarget.value);
                        if (sanitized !== e.currentTarget.value) e.currentTarget.value = sanitized;
                      }}
                      className="input-field"
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      {...register('telefono', { required: 'El teléfono es requerido', setValueAs: (v) => sanitizePhone(v).trim() })}
                      onInput={(e) => {
                        const sanitized = sanitizePhone(e.currentTarget.value);
                        if (sanitized !== e.currentTarget.value) e.currentTarget.value = sanitized;
                      }}
                      className="input-field"
                      placeholder="+51 987 654 321"
                    />
                    {errors.telefono && (
                      <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
                    )}
                  </div>
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Mensaje *
                  </label>
                  <textarea
                    {...register('mensaje', { required: 'El mensaje es requerido', setValueAs: (v) => sanitizeMessage(v).trim() })}
                    onInput={(e) => {
                      const sanitized = sanitizeMessage(e.currentTarget.value);
                      if (sanitized !== e.currentTarget.value) e.currentTarget.value = sanitized;
                    }}
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Cuéntanos qué necesitas... incluye detalles como cantidades, colores, medidas específicas, etc."
                  />
                  {errors.mensaje && (
                    <p className="mt-1 text-sm text-red-600">{errors.mensaje.message}</p>
                  )}
                </div>

                {/* Checkbox de términos */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    {...register('terminos', { required: 'Debes aceptar los términos' })}
                    className="mt-1 w-4 h-4 text-verde-principal border-gris-muy-claro rounded focus:ring-verde-principal"
                  />
                  <label className="text-sm text-gris-oscuro">
                    Acepto los{' '}
                    <a href="/terminos" className="text-verde-principal hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="/privacidad" className="text-verde-principal hover:underline">
                      política de privacidad
                    </a>
                  </label>
                </div>
                {errors.terminos && (
                  <p className="text-sm text-red-600">{errors.terminos.message}</p>
                )}

                {/* Botón de envío */}
                <motion.button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`btn-primary w-full inline-flex items-center justify-center gap-2 ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      Enviar Mensaje
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gradiente-principal py-16">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas una cotización rápida?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Llámanos directamente y recibe atención inmediata de nuestros especialistas
            </p>
            <button 
              onClick={() => window.open('https://wa.me/message/FP3PXXHAVSTLM1', '_blank')}
              className="bg-white text-verde-principal px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center cursor-pointer"
            >
              <Phone className="w-5 h-5 mr-2" />
              +51 946 881 539
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contacto;
