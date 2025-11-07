import { motion } from 'framer-motion';
import { Shield, Calendar } from 'lucide-react';

const Privacidad = () => {
  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro">
      {/* Hero */}
      <section className="bg-white border-b border-gris-muy-claro py-16">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-gradiente-principal rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              Política de Privacidad
            </h1>
            <div className="flex items-center justify-center space-x-2 text-gris-medio">
              <Calendar className="w-4 h-4" />
              <span>Última actualización: Enero 2024</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-card p-8 lg:p-12"
          >
            <div className="prose prose-lg max-w-none space-y-8">
              
              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  1. Introducción
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  En EcoFlexPack valoramos y respetamos la privacidad de nuestros clientes 
                  y visitantes. Esta política describe cómo recopilamos, utilizamos y 
                  protegemos su información personal de acuerdo con la Ley de Protección 
                  de Datos Personales del Perú (Ley N° 29733).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  2. Información que Recopilamos
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>
                    <strong>2.1 Información proporcionada directamente:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Datos de contacto (nombre, email, teléfono, dirección)</li>
                    <li>Información empresarial (nombre de empresa, RUC, cargo)</li>
                    <li>Datos de cotizaciones y pedidos</li>
                    <li>Comunicaciones y consultas</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>2.2 Información recopilada automáticamente:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Dirección IP y ubicación geográfica aproximada</li>
                    <li>Información del navegador y dispositivo</li>
                    <li>Páginas visitadas y tiempo de navegación</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  3. Uso de la Información
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>Utilizamos su información personal para:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Procesar cotizaciones y pedidos</li>
                    <li>Brindar soporte al cliente y asesoría técnica</li>
                    <li>Enviar información comercial y promocional (con su consentimiento)</li>
                    <li>Mejorar nuestros productos y servicios</li>
                    <li>Cumplir con obligaciones legales y regulatorias</li>
                    <li>Realizar análisis estadísticos y de mercado</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  4. Base Legal para el Procesamiento
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>Procesamos sus datos personales basándose en:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Consentimiento:</strong> Para comunicaciones comerciales y marketing</li>
                    <li><strong>Ejecución de contrato:</strong> Para procesar pedidos y brindar servicios</li>
                    <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y análisis</li>
                    <li><strong>Obligación legal:</strong> Para cumplir con requerimientos fiscales y legales</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  5. Compartir Información
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>
                    <strong>5.1 No vendemos sus datos:</strong> Nunca vendemos, 
                    alquilamos o comercializamos su información personal.
                  </p>
                  <p>
                    <strong>5.2 Compartir limitado:</strong> Podemos compartir 
                    información con:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Proveedores de servicios (transportistas, procesadores de pago)</li>
                    <li>Autoridades gubernamentales cuando sea requerido por ley</li>
                    <li>Empresas del grupo corporativo (si aplicable)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  6. Seguridad de Datos
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>Implementamos medidas de seguridad técnicas y organizativas:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cifrado de datos en tránsito y en reposo</li>
                    <li>Acceso restringido a datos personales</li>
                    <li>Auditorías regulares de seguridad</li>
                    <li>Capacitación del personal en protección de datos</li>
                    <li>Respaldo y recuperación de datos</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  7. Retención de Datos
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>Conservamos sus datos personales:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Datos de clientes:</strong> Durante la relación comercial y 5 años adicionales</li>
                    <li><strong>Datos de cotizaciones:</strong> 2 años desde la última interacción</li>
                    <li><strong>Datos de marketing:</strong> Hasta que retire su consentimiento</li>
                    <li><strong>Datos fiscales:</strong> Según los plazos legales establecidos</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  8. Sus Derechos
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>Usted tiene derecho a:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Acceso:</strong> Conocer qué datos personales tenemos sobre usted</li>
                    <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                    <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos</li>
                    <li><strong>Oposición:</strong> Oponerse al procesamiento para fines específicos</li>
                    <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                    <li><strong>Información:</strong> Conocer cómo procesamos sus datos</li>
                  </ul>
                  <p className="mt-4">
                    Para ejercer estos derechos, contáctenos en: 
                    <strong> privacidad@ecoflexplastperu.com</strong>
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  9. Cookies y Tecnologías Similares
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>Utilizamos cookies para:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Mantener sus preferencias y sesión</li>
                    <li>Analizar el tráfico del sitio web</li>
                    <li>Personalizar contenido y anuncios</li>
                    <li>Mejorar la funcionalidad del sitio</li>
                  </ul>
                  <p className="mt-4">
                    Puede configurar su navegador para rechazar cookies, aunque 
                    esto puede afectar la funcionalidad del sitio.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  10. Transferencias Internacionales
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  Actualmente no realizamos transferencias internacionales de datos. 
                  Si esto cambiara en el futuro, implementaremos las salvaguardas 
                  apropiadas conforme a la legislación aplicable.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  11. Menores de Edad
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  Nuestros servicios no están dirigidos a menores de 18 años. 
                  No recopilamos intencionalmente información personal de menores 
                  sin el consentimiento parental apropiado.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  12. Cambios a esta Política
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  Podemos actualizar esta política ocasionalmente. Le notificaremos 
                  sobre cambios significativos por email o mediante aviso prominente 
                  en nuestro sitio web.
                </p>
              </div>

              <div className="border-t border-gris-muy-claro pt-8 mt-12">
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  Contacto - Oficial de Protección de Datos
                </h2>
                <div className="text-gris-oscuro space-y-2">
                  <p>Para consultas sobre privacidad y protección de datos:</p>
                  <p><strong>Email:</strong> bryantorresjurado7@ecoflexplastperu.com</p>
                  <p><strong>Teléfono:</strong> +51 946 881 539</p>
                  <p><strong>Dirección 1:</strong> calle 2 sector 3 grupo 29 Mz.N Lt.45, Villa El Salvador (Q3F6+GXQ, -12.2261667, -76.9375278)</p>
                  <p><strong>Dirección 2:</strong> Jr. Isabel Flores de Oliva 270, Lima 15079</p>
                  <p className="mt-4 text-sm">
                    También puede presentar una queja ante la Autoridad Nacional 
                    de Protección de Datos Personales (ANPD) del Ministerio de Justicia 
                    y Derechos Humanos del Perú.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Privacidad;
