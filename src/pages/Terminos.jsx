import { motion } from 'framer-motion';
import { FileText, Calendar } from 'lucide-react';

const Terminos = () => {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              Términos y Condiciones
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
                  1. Información General
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  Estos términos y condiciones regulan el uso del sitio web de EcoFlexPlast
                  y la adquisición de nuestros productos y servicios. Al acceder a nuestro
                  sitio web o realizar una compra, usted acepta estar sujeto a estos términos.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  2. Productos y Servicios
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>
                    <strong>2.1 Descripción de productos:</strong> Nos esforzamos por
                    proporcionar descripciones precisas de nuestros zunchos de polipropileno
                    y accesorios. Las especificaciones técnicas están sujetas a tolerancias
                    industriales estándar.
                  </p>
                  <p>
                    <strong>2.2 Disponibilidad:</strong> Los productos están sujetos a
                    disponibilidad. Nos reservamos el derecho de discontinuar productos
                    o modificar especificaciones con previo aviso.
                  </p>
                  <p>
                    <strong>2.3 Garantía:</strong> Garantizamos la calidad de nuestros
                    productos conforme a las especificaciones técnicas publicadas.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  3. Precios y Pagos
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>
                    <strong>3.1 Cotizaciones:</strong> Los precios se proporcionan
                    mediante cotización personalizada y son válidos por 30 días desde
                    su emisión, salvo que se especifique lo contrario.
                  </p>
                  <p>
                    <strong>3.2 Formas de pago:</strong> Aceptamos transferencias
                    bancarias, depósitos, cheques y crédito corporativo previa evaluación.
                  </p>
                  <p>
                    <strong>3.3 IGV:</strong> Todos los precios se cotizan sin IGV.
                    El impuesto se aplicará según corresponda.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  4. Entregas
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>
                    <strong>4.1 Tiempos de entrega:</strong> Los tiempos estimados
                    son referenciales y pueden variar según disponibilidad y ubicación.
                  </p>
                  <p>
                    <strong>4.2 Responsabilidad de entrega:</strong> Nuestra
                    responsabilidad termina al entregar los productos al transportista.
                    El cliente debe inspeccionar los productos al recibirlos.
                  </p>
                  <p>
                    <strong>4.3 Entregas fallidas:</strong> En caso de entregas
                    fallidas por causas atribuibles al cliente, este asumirá los
                    costos adicionales de reenvío.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  5. Devoluciones y Reclamos
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>
                    <strong>5.1 Productos defectuosos:</strong> Aceptamos devoluciones
                    de productos defectuosos dentro de los 7 días posteriores a la entrega,
                    previa evaluación técnica.
                  </p>
                  <p>
                    <strong>5.2 Productos en buen estado:</strong> No aceptamos
                    devoluciones de productos en buen estado por cambio de opinión
                    del cliente.
                  </p>
                  <p>
                    <strong>5.3 Proceso de reclamo:</strong> Los reclamos deben
                    presentarse por escrito con evidencia fotográfica dentro del
                    plazo establecido.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  6. Limitación de Responsabilidad
                </h2>
                <div className="space-y-4 text-gris-oscuro">
                  <p>
                    <strong>6.1 Uso adecuado:</strong> Los productos deben utilizarse
                    conforme a las especificaciones técnicas y recomendaciones de uso
                    proporcionadas.
                  </p>
                  <p>
                    <strong>6.2 Daños indirectos:</strong> EcoFlexPlast no será
                    responsable por daños indirectos, lucro cesante o pérdidas
                    consecuenciales derivadas del uso de nuestros productos.
                  </p>
                  <p>
                    <strong>6.3 Límite de responsabilidad:</strong> Nuestra
                    responsabilidad máxima se limitará al valor de los productos vendidos.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  7. Propiedad Intelectual
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  Todos los contenidos de este sitio web, incluyendo textos, imágenes,
                  logos y diseños, son propiedad de EcoFlexPlast y están protegidos por
                  las leyes de propiedad intelectual. Su uso no autorizado está prohibido.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  8. Privacidad y Protección de Datos
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  El tratamiento de datos personales se rige por nuestra Política de
                  Privacidad, la cual forma parte integral de estos términos y condiciones.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  9. Jurisdicción y Ley Aplicable
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  Estos términos se rigen por las leyes de la República del Perú.
                  Cualquier disputa será resuelta en los tribunales de Lima, Perú.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  10. Modificaciones
                </h2>
                <p className="text-gris-oscuro leading-relaxed">
                  EcoFlexPlast se reserva el derecho de modificar estos términos en
                  cualquier momento. Las modificaciones entrarán en vigor desde su
                  publicación en el sitio web.
                </p>
              </div>

              <div className="border-t border-gris-muy-claro pt-8 mt-12">
                <h2 className="text-2xl font-bold text-negro-principal mb-4">
                  Información de Contacto
                </h2>
                <div className="text-gris-oscuro space-y-2">
                  <p><strong>EcoFlexPlast Perú</strong></p>
                  <p>Dirección 1: calle 2 sector 3 grupo 29 Mz.N Lt.45, Villa El Salvador (Q3F6+GXQ, -12.2261667, -76.9375278)</p>
                  <p>Dirección 2: Jr. Isabel Flores de Oliva 270, Lima 15079</p>
                  <p>Teléfono: +51 946 881 539</p>
                  <p>Email: ventas@ecoflexplastperu.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Terminos;
