import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { industrias, colores } from '../data/productos';
import ColorChip from '../components/ColorChip';

const Industrias = () => {
  return (
    <div className="pt-16 lg:pt-20 min-h-screen">
      {/* Hero */}
      <section className="bg-gradiente-principal text-white py-20">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Industrias que Atendemos
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Soluciones de enzunchado especializadas para cada sector industrial, 
              adaptadas a sus necesidades específicas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industrias */}
      <section className="py-20 bg-fondo-claro">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {industrias.map((industria, index) => (
              <motion.div
                key={industria.id}
                className="card p-8 hover:shadow-industrial transition-all duration-300 h-full flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradiente-principal rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-negro-principal mb-3">
                      {industria.nombre}
                    </h3>
                    
                    <p className="text-gris-oscuro mb-6">
                      {industria.descripcion}
                    </p>

                    <div className="space-y-4 mb-6">
                      <h4 className="font-semibold text-negro-principal">
                        Aplicaciones Principales:
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        {industria.aplicaciones.map((app, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm text-gris-oscuro">
                            <div className="w-2 h-2 bg-verde-principal rounded-full flex-shrink-0" />
                            <span>{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 mb-6">
                      <h4 className="font-semibold text-negro-principal">
                        Colores Recomendados:
                      </h4>
                      <div className="flex space-x-3">
                        {industria.colores.map(colorId => {
                          const color = colores.find(c => c.id === colorId);
                          return color ? (
                            <div key={colorId} className="flex items-center space-x-2">
                              <ColorChip color={color} size="md" />
                              <span className="text-sm text-gris-oscuro">{color.nombre}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-negro-principal">
                        Medidas Disponibles:
                      </h4>
                      <div className="flex space-x-2">
                        {industria.medidas.map(medida => (
                          <span 
                            key={medida}
                            className="bg-verde-light text-verde-principal px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {medida}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                      <Link 
                        to={`/productos?color=${industria.colores[0]}`}
                        className="btn-primary flex-1 inline-flex items-center justify-center"
                      >
                        Ver productos
                      </Link>
                      <Link 
                        to="/contacto"
                        className="btn-secondary flex-1 inline-flex items-center justify-center"
                      >
                        Consultar
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-6">
              ¿Tu industria no está en la lista?
            </h2>
            <p className="text-xl text-gris-oscuro mb-8 max-w-2xl mx-auto">
              Trabajamos con múltiples sectores. Contáctanos para conocer cómo podemos 
              ayudar a tu industria específica.
            </p>
            <Link 
              to="/contacto" 
              className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-verde-principal to-verde-hover text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
              Consultar tu caso
              <ArrowRight className="w-6 h-6 ml-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Industrias;
