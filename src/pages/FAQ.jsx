import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      categoria: 'Productos',
      preguntas: [
        {
          pregunta: '¿Qué es un zuncho de polipropileno (PP)?',
          respuesta: 'Un zuncho de polipropileno es una cinta plástica resistente utilizada para asegurar, agrupar y embalar productos. Es ideal para paletizado, embalaje industrial y múltiples aplicaciones logísticas debido a su alta resistencia y durabilidad.'
        },
        {
          pregunta: '¿Cuáles son las medidas disponibles?',
          respuesta: 'Ofrecemos zunchos en anchos de 1/2" y 5/8", con longitudes que van desde 360 metros hasta 1500 metros por rollo. Las medidas exactas varían según el color y el tipo de producto.'
        },
        {
          pregunta: '¿Qué diferencia hay entre los colores?',
          respuesta: 'Todos nuestros zunchos tienen la misma calidad independientemente del color. Los diferentes colores permiten sistemas de identificación y clasificación: negro para uso industrial general, blanco para industrias alimentarias, y colores para identificación específica.'
        },
        {
          pregunta: '¿Cuál es la resistencia de los zunchos?',
          respuesta: 'Nuestros zunchos están clasificados en tres niveles: Básica (para embalajes ligeros), Media (uso comercial estándar) y Alta (aplicaciones industriales pesadas). La resistencia específica se indica en cada producto.'
        }
      ]
    },
    {
      categoria: 'Pedidos y Entregas',
      preguntas: [
        {
          pregunta: '¿Cómo puedo realizar un pedido?',
          respuesta: 'Puedes realizar pedidos a través de nuestra página web agregando productos a tu cotización, por teléfono llamando al +51 946 881 539, o enviando un email a ventas@ecoflexplastperu.com.'
        },
        {
          pregunta: '¿Cuál es el tiempo de entrega?',
          respuesta: 'Para productos en stock, el tiempo de entrega es de 24-48 horas en Lima y 2-5 días hábiles en provincias. Para productos bajo pedido, el tiempo puede extenderse a 7-10 días hábiles.'
        },
        {
          pregunta: '¿Realizan entregas a todo el Perú?',
          respuesta: 'Sí, realizamos entregas a nivel nacional. Trabajamos con empresas de courier confiables para asegurar que tu pedido llegue en perfectas condiciones y en el tiempo estimado.'
        },
        {
          pregunta: '¿Cuál es el pedido mínimo?',
          respuesta: 'No tenemos pedido mínimo. Puedes comprar desde un solo rollo hasta grandes volúmenes. Sin embargo, pedidos mayores pueden acceder a precios preferenciales.'
        }
      ]
    },
    {
      categoria: 'Precios y Pagos',
      preguntas: [
        {
          pregunta: '¿Cómo consulto precios?',
          respuesta: 'Los precios se proporcionan mediante cotización personalizada. Puedes solicitarla a través de nuestra web, llamándonos directamente, o enviando un email con los productos de tu interés.'
        },
        {
          pregunta: '¿Qué formas de pago aceptan?',
          respuesta: 'Aceptamos transferencias bancarias, depósitos, cheques, y para clientes corporativos ofrecemos crédito con términos de pago flexibles previa evaluación crediticia.'
        },
        {
          pregunta: '¿Ofrecen descuentos por volumen?',
          respuesta: 'Sí, ofrecemos precios preferenciales para compras de alto volumen. Los descuentos varían según la cantidad, frecuencia de compra y el tipo de cliente. Contacta a nuestro equipo comercial para más detalles.'
        },
        {
          pregunta: '¿Los precios incluyen IGV?',
          respuesta: 'Los precios se cotizan sin IGV. El impuesto se añade según la modalidad de facturación requerida por el cliente.'
        }
      ]
    },
    {
      categoria: 'Soporte Técnico',
      preguntas: [
        {
          pregunta: '¿Ofrecen asesoría técnica?',
          respuesta: 'Sí, contamos con un equipo de especialistas que puede asesorarte en la selección del zuncho más adecuado para tu aplicación específica, así como en técnicas de uso y mejores prácticas.'
        },
        {
          pregunta: '¿Qué herramientas necesito para usar los zunchos?',
          respuesta: 'Para un uso profesional recomendamos tensadores manuales y tenazas cortadoras. También ofrecemos grapas metálicas para el cierre. Todos estos accesorios están disponibles en nuestro catálogo.'
        },
        {
          pregunta: '¿Cómo almaceno correctamente los zunchos?',
          respuesta: 'Los zunchos deben almacenarse en lugar seco, alejados de la luz solar directa y a temperatura ambiente. Manténgalos en su embalaje original hasta su uso para preservar sus propiedades.'
        },
        {
          pregunta: '¿Los zunchos son reciclables?',
          respuesta: 'Sí, nuestros zunchos de polipropileno son 100% reciclables. Pueden ser procesados junto con otros plásticos PP para crear nuevos productos, contribuyendo a la economía circular.'
        }
      ]
    }
  ];

  const toggleFAQ = (categoriaIndex, preguntaIndex) => {
    const index = `${categoriaIndex}-${preguntaIndex}`;
    setActiveIndex(activeIndex === index ? null : index);
  };

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
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              Preguntas Frecuentes
            </h1>
            <p className="text-gris-oscuro text-lg max-w-2xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre nuestros productos 
              y servicios. Si no encuentras lo que buscas, contáctanos directamente.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container-max section-padding">
          <div className="max-w-4xl mx-auto space-y-8">
            {faqs.map((categoria, categoriaIndex) => (
              <motion.div
                key={categoriaIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoriaIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                <div className="bg-verde-light border-b border-verde-border p-6">
                  <h2 className="text-xl font-bold text-verde-principal">
                    {categoria.categoria}
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {categoria.preguntas.map((faq, preguntaIndex) => {
                    const index = `${categoriaIndex}-${preguntaIndex}`;
                    const isActive = activeIndex === index;
                    
                    return (
                      <div key={preguntaIndex} className="border-b border-gris-muy-claro last:border-b-0 pb-4 last:pb-0">
                        <button
                          onClick={() => toggleFAQ(categoriaIndex, preguntaIndex)}
                          className="w-full text-left flex items-center justify-between py-3 hover:text-verde-principal transition-colors"
                        >
                          <span className="font-semibold text-negro-principal pr-4">
                            {faq.pregunta}
                          </span>
                          <motion.div
                            animate={{ rotate: isActive ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                          >
                            <ChevronDown className="w-5 h-5 text-gris-medio" />
                          </motion.div>
                        </button>
                        
                        {activeIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="overflow-hidden text-gris-medio"
                          >
                            {faq.respuesta}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradiente-principal text-white">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              ¿No encontraste la respuesta que buscabas?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Nuestro equipo de soporte está listo para ayudarte con cualquier 
              consulta específica que puedas tener.
            </p>
            <a 
              href="/contacto" 
              className="bg-white text-verde-principal px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Contactar Soporte
              <HelpCircle className="w-5 h-5 ml-2" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
