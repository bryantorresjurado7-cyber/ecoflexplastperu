import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, ArrowRight } from 'lucide-react';
import { accesorios } from '../data/productos';
import { skuAccesorio } from '../data/catalogo.v2';
import { useQuote } from '../contexts/QuoteContext';

const Accesorios = () => {
  const { addToQuote, isInQuote } = useQuote();

  const buildProductoAccesorio = (a) => {
    const codigo = skuAccesorio(a.id || a.nombre || 'ACC');
    const imagen = `/images/productos/Accesorios/${a.nombre}/principal.png`;
    return {
      id: `accesorio-${codigo}`,
      categoria: 'accesorio',
      nombre: a.nombre,
      codigo,
      precio: 'Consultar',
      disponible: true,
      imagen,
      descripcion: a.descripcion,
      tags: Array.isArray(a.tipos) ? a.tipos : (Array.isArray(a.caracteristicas) ? a.caracteristicas : undefined)
    };
  };
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
              Accesorios y Herramientas
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Complementa tu sistema de enzunchado con nuestras herramientas profesionales 
              y accesorios de alta calidad.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Productos */}
      <section className="py-20 bg-fondo-claro">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {accesorios.map((accesorio, index) => (
              <motion.div
                key={accesorio.id}
                className="card p-8 hover:shadow-industrial transition-all duration-300 h-full flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-fondo-claro overflow-hidden border border-gris-muy-claro">
                  <img
                    src={`/images/productos/Accesorios/${accesorio.nombre}/principal.png`}
                    alt={accesorio.nombre}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-negro-principal mb-4">
                  {accesorio.nombre}
                </h3>
                
                <p className="text-gris-oscuro mb-6">
                  {accesorio.descripcion}
                </p>

                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-negro-principal">
                    Características:
                  </h4>
                  <ul className="space-y-2">
                    {(accesorio.caracteristicas || accesorio.tipos).map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gris-oscuro">
                        <div className="w-2 h-2 bg-verde-principal rounded-full" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-negro-principal">
                    Aplicaciones:
                  </h4>
                  <ul className="space-y-2">
                    {accesorio.aplicaciones.map((app, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gris-oscuro">
                        <Package className="w-3 h-3 text-verde-principal" />
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() => addToQuote(buildProductoAccesorio(accesorio))}
                    className="group w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-verde-principal to-verde-hover text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    aria-label={`Añadir ${accesorio.nombre} a cotización`}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                    Añadir a cotización
                  </button>
                  <Link 
                    to="/contacto" 
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-verde-principal text-verde-principal rounded-xl font-semibold hover:bg-verde-principal hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Consultar precio
                  </Link>
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
              ¿Necesitas asesoría técnica?
            </h2>
            <p className="text-xl text-gris-oscuro mb-8 max-w-2xl mx-auto">
              Nuestros especialistas te ayudarán a elegir las herramientas adecuadas 
              para tu operación.
            </p>
            <Link 
              to="/contacto" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-verde-principal to-verde-hover text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
            >
              Contactar con un especialista
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Accesorios;
