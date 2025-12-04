import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Package,
  Wrench,
  Palette,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Users,
  Award
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { industrias, colores } from '../data/productos';
import { loadProductosDestacados, loadProductos } from '../services/productosService';
import { useQuote } from '../contexts/QuoteContext';

// Keep motion recognized by linter
const __MOTION = motion;

const Home = () => {
  const { addToQuote } = useQuote();
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const industriasDestacadas = industrias.slice(0, 6);

  // Cargar un producto destacado de cada categoría desde la base de datos
  useEffect(() => {
    const cargarProductosDestacados = async () => {
      try {
        setLoadingProductos(true);

        // Cargar todos los productos activos
        const result = await loadProductos();

        if (result.data && result.data.length > 0) {
          // Excluir accesorios - solo mostrar: zunchos, esquineros, burbupack, mangas
          const categorias = ['zunchos', 'esquineros', 'burbupack', 'mangas'];
          const productosPorCategoria = [];

          // Para cada categoría, buscar un producto destacado o el primero disponible
          categorias.forEach(categoria => {
            // Buscar en la categoría original (_categoriaOriginal) o en categoria mapeada
            const productosCategoria = result.data.filter(p => {
              const catOriginal = p._categoriaOriginal?.toLowerCase() || p.categoria?.toLowerCase();
              return catOriginal === categoria;
            });

            if (productosCategoria.length > 0) {
              // Priorizar productos destacados, si no hay, tomar el primero
              const destacado = productosCategoria.find(p => p.destacado) || productosCategoria[0];
              productosPorCategoria.push(destacado);
            }
          });

          setProductosDestacados(productosPorCategoria);
        }
      } catch (error) {
        console.error('Error cargando productos destacados:', error);
      } finally {
        setLoadingProductos(false);
      }
    };

    cargarProductosDestacados();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Tabs de categoría en Hero
  // const [catHero] = useState('zuncho');

  // SEO JSON-LD Organization básico
  const orgJson = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EcoFlexPlast',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    logo: '/images/logo/logoEmpresa.png',
  };

  return (
    <div className="pt-16 lg:pt-20">
      <SEO
        title="EcoFlexPlast | Zunchos, Esquineros y Burbupack para embalaje industrial"
        description="Soluciones B2B en embalaje: Zunchos PP, Esquineros plásticos y Burbupack. Stock permanente, entrega 24-48h y asesoría técnica."
        url={typeof window !== 'undefined' ? window.location.href : ''}
        image="/images/og-home.jpg"
        jsonLd={[orgJson]}
      />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-fondo-claro to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container-max section-padding relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Contenido */}
            <motion.div
              className="space-y-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <div className="inline-flex items-center space-x-2 bg-verde-light border border-verde-border rounded-full px-4 py-2 mb-6">
                  <CheckCircle className="w-4 h-4 text-verde-principal" />
                  <span className="text-verde-principal text-sm font-medium">
                    Envío a todo el país
                  </span>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-negro-principal leading-tight">
                  Soluciones Profesionales de{' '}
                  <span className="text-gradient">
                    Embalaje Industrial
                  </span>
                </h1>

                <p className="text-xl text-gris-oscuro leading-relaxed">
                  Zunchos PP, Esquineros plásticos y Burbupack. Stock permanente, entrega rápida y asesoría técnica para todas las industrias.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link to="/productos" className="inline-flex items-center px-5 py-2.5 bg-gradiente-principal text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
                  Ver Catálogo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/contacto" className="inline-flex items-center px-5 py-2.5 border border-verde-principal text-verde-principal rounded-lg font-semibold text-sm hover:bg-verde-principal hover:text-white transition-all">
                  Cotización rápida
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-3 gap-6 pt-8 border-t border-gris-muy-claro"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-verde-principal">500+</div>
                  <div className="text-sm text-gris-medio">Clientes Satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-verde-principal">24h</div>
                  <div className="text-sm text-gris-medio">Entrega Rápida</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-verde-principal">5</div>
                  <div className="text-sm text-gris-medio">Colores Disponibles</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Imagen Hero - Grid fijo de categorías */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative bg-gradient-to-br from-white to-fondo-claro rounded-3xl shadow-industrial p-8 lg:p-12">
                {/* Mini-grid fija de categorías */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                  {[
                    { key: 'zuncho', title: 'Zuncho PP', image: '/images/productos/Zunchos/Negro/zuncho_negro.png', measure: '5/8" × 1000m', link: '/productos?cat=zuncho' },
                    { key: 'esquinero', title: 'Esquineros', image: '/images/productos/Esquineros/Negro/paquete.png', measure: '30×1.5 mm', link: '/productos?cat=esquinero' },
                    { key: 'burbupack', title: 'Burbupack', image: '/images/productos/Burbupack/1.00/burbupack_1.00Mx100.png', measure: '1.00 m × 100 m', link: '/productos?cat=burbupack' },
                    { key: 'manga', title: 'Mangas', image: '/images/productos/Mangas/Azul/1.00/principal.png', measure: '1.00 m × 2 mm', link: '/productos?cat=manga' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.key}
                      className="space-y-3 text-center group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.03 }}
                    >
                      <Link to={item.link} className="block">
                        <div className="relative w-full h-32 lg:h-40 rounded-2xl border-2 border-gris-muy-claro flex items-center justify-center bg-white shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-24 h-24 lg:w-32 lg:h-32 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="space-y-1 mt-2">
                          <div className="text-sm font-semibold text-negro-principal group-hover:text-verde-principal transition-colors">{item.title}</div>
                          <div className="text-xs text-gris-medio">{item.measure}</div>
                          <div className="text-xs text-verde-principal font-medium">En Stock</div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Badge flotante mejorado */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-gradient-to-r from-verde-principal to-verde-hover text-white px-6 py-3 rounded-full text-base font-bold shadow-xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⭐ ¡Stock Permanente!
                </motion.div>

                {/* Indicador de calidad */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg">
                  <div className="w-8 h-8 bg-verde-principal rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              Productos Destacados
            </h2>
            <p className="text-gris-oscuro text-lg max-w-2xl mx-auto">
              Descubre nuestras soluciones de embalaje: Zunchos PP, Esquineros plásticos,
              Burbupack (film de burbuja) y Mangas plásticas para máxima protección y eficiencia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              className="card p-8 text-center group hover:shadow-industrial transition-all duration-300 flex flex-col h-full"
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 bg-gradiente-principal rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-negro-principal mb-4">
                Zunchos PP
              </h3>
              <p className="text-gris-medio mb-6">
                Rollos de polipropileno en múltiples colores y medidas, resistentes y duraderos.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {colores.slice(0, 5).map(color => (
                  <div
                    key={color.id}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                ))}
              </div>
              <Link to="/productos" className="text-verde-principal font-semibold hover:underline mt-auto inline-block">
                Ver más →
              </Link>
            </motion.div>

            <motion.div
              className="card p-8 text-center group hover:shadow-industrial transition-all duration-300 flex flex-col h-full"
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 bg-gradiente-principal rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-negro-principal mb-2">
                Esquineros plásticos
              </h3>
              <p className="text-gris-medio mb-6">
                Protección de bordes para pallets y embalajes. Medidas personalizables.
              </p>
              <div className="space-y-2 mb-6">
                <div className="text-sm text-gris-oscuro">• Lado: 39.5 mm</div>
                <div className="text-sm text-gris-oscuro">• Espesor: 3.3 mm</div>
                <div className="text-sm text-gris-oscuro">• Longitud: 0.14–2.40 m (a medida)</div>
              </div>
              <Link to="/productos?cat=esquinero" className="text-verde-principal font-semibold hover:underline mt-auto inline-block">
                Ver más →
              </Link>
            </motion.div>

            <motion.div
              className="card p-8 text-center group hover:shadow-industrial transition-all duration-300 flex flex-col h-full"
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 bg-gradiente-principal rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-negro-principal mb-2">
                Burbupack (Film de burbuja)
              </h3>
              <p className="text-gris-medio mb-6">
                Amortiguación y protección transparente para envíos y almacenamiento.
              </p>
              <div className="space-y-2 mb-6">
                <div className="text-sm text-gris-oscuro">• Anchos: 0.40, 0.50, 0.58, 1.00, 1.50 m</div>
                <div className="text-sm text-gris-oscuro">• Largos: 80 m y 100 m</div>
                <div className="text-sm text-gris-oscuro">• Stock permanente</div>
              </div>
              <Link to="/productos?cat=burbupack" className="text-verde-principal font-semibold hover:underline mt-auto inline-block">
                Ver más →
              </Link>
            </motion.div>

            <motion.div
              className="card p-8 text-center group hover:shadow-industrial transition-all duration-300 flex flex-col h-full"
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 bg-gradiente-principal rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-negro-principal mb-2">
                Mangas plásticas
              </h3>
              <p className="text-gris-medio mb-6">
                Enfundado y protección para múltiples usos. Material 100% virgen.
              </p>
              <div className="space-y-2 mb-6">
                <div className="text-sm text-gris-oscuro">• Alturas: 1.00 m y 1.50 m</div>
                <div className="text-sm text-gris-oscuro">• Espesor: 2.0 mm</div>
                <div className="text-sm text-gris-oscuro">• Colores: Transparente, Blanco, Amarillo, Rojo, Verde, Azul, Negro</div>
              </div>
              <Link to="/productos?cat=manga" className="text-verde-principal font-semibold hover:underline mt-auto inline-block">
                Ver más →
              </Link>
            </motion.div>
          </div>

          {/* Grid de productos destacados desde la base de datos */}
          {loadingProductos ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-verde-principal"></div>
              <p className="mt-4 text-gris-medio">Cargando productos destacados...</p>
            </div>
          ) : productosDestacados.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {productosDestacados.map((producto, index) => (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard
                    producto={producto}
                    onAddToQuote={() => addToQuote(producto, 1)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gris-medio">No hay productos destacados disponibles en este momento.</p>
            </div>
          )}

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              to="/productos"
              className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-verde-principal to-verde-hover text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
              Ver Catálogo Completo
              <ArrowRight className="w-6 h-6 ml-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ventajas Competitivas */}
      <section className="py-20 bg-fondo-claro">
        <div className="container-max section-padding">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              ¿Por qué elegir EcoFlexPlast?
            </h2>
            <p className="text-gris-oscuro text-lg max-w-2xl mx-auto">
              Somos líderes en soluciones de enzunchado industrial, comprometidos con
              la calidad y el servicio excepcional.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Truck,
                title: 'Entrega rápida',
                description: 'Envío en 24-48 horas a todo el país',
                gradient: 'from-sky-500 to-blue-600'
              },
              {
                icon: Shield,
                title: 'Calidad garantizada',
                description: 'Materiales premium',
                gradient: 'from-emerald-500 to-green-600'
              },
              {
                icon: Users,
                title: 'Asesoría técnica',
                description: 'Soporte especializado gratuito',
                gradient: 'from-violet-500 to-purple-600'
              },
              {
                icon: Award,
                title: 'Stock permanente',
                description: 'Disponibilidad inmediata de productos',
                gradient: 'from-amber-500 to-orange-600'
              }
            ].map((ventaja, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-2xl border border-gris-muy-claro/60 p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`mx-auto mb-4 w-14 h-14 rounded-xl bg-gradient-to-br ${ventaja.gradient} flex items-center justify-center shadow-lg ring-1 ring-black/5`}>
                  <ventaja.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-negro-principal mb-2">
                  {ventaja.title}
                </h3>
                <p className="text-sm text-gris-medio leading-relaxed">
                  {ventaja.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industrias que Atendemos */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              Industrias que Atendemos
            </h2>
            <p className="text-gris-oscuro text-lg max-w-2xl mx-auto">
              Nuestros zunchos de polipropileno son la solución ideal para múltiples sectores industriales.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industriasDestacadas.map((industria, index) => (
              <motion.div
                key={industria.id}
                className="group bg-white dark:bg-white rounded-2xl border border-gris-muy-claro/60 overflow-hidden shadow-card hover:shadow-card-hover focus-within:ring-2 focus-within:ring-verde-principal transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div aria-label={`Industria ${industria.nombre}`} className="block h-full bg-white dark:bg-white">
                  {/* Imagen protagonista */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={`/images/iconoIndustrias/${encodeURIComponent(industria.nombre)}.png`}
                      alt={industria.nombre}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="p-5 sm:p-6 bg-white">
                    <p className="text-base sm:text-lg font-semibold text-[#111827] mb-1">
                      {industria.nombre}
                    </p>
                    <p className="text-sm leading-relaxed text-[#374151] line-clamp-2">
                      {industria.descripcion}
                    </p>

                    {Array.isArray(industria.colores) && industria.colores.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        {industria.colores.map(colorId => {
                          const color = colores.find(c => c.id === colorId);
                          return color ? (
                            <span
                              key={colorId}
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-gray-300"
                              style={{ backgroundColor: color.hex }}
                              aria-label={`Color sugerido: ${color.nombre}`}
                              title={color.nombre}
                            />
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradiente-principal">
        <div className="container-max section-padding">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              ¿Listo para optimizar tu proceso de enzunchado?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Contacta con nuestros especialistas y recibe una cotización personalizada
              para tu empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/contacto"
                className="group bg-white text-verde-principal px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center"
              >
                Solicitar Cotización
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/productos"
                className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-verde-principal transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center"
              >
                Ver Catálogo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
