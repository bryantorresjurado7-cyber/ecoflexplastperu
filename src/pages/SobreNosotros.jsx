import { motion } from 'framer-motion';
import { Target, Eye, BookOpen, Lightbulb, ArrowRight, CheckCircle, FileCheck, Shield, Recycle, PhoneCall, RefreshCw, Users, ClipboardCheck, GraduationCap } from 'lucide-react';
import SEO from '../components/SEO';

const SobreNosotros = () => {
  // Mantener motion reconocido por el linter
  const __MOTION = motion;
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const principios = [
    {
      title: 'Prueba antes que adjetivo',
      description: 'Cada promesa se respalda con fichas técnicas, tolerancias y resultados de prueba. Preferimos mostrar datos a usar superlativos.',
      icon: FileCheck,
      accent: 'from-verde-principal to-verde-hover'
    },
    {
      title: 'Claridad y transparencia',
      description: 'Información completa sobre precios, condiciones, metrajes y tiempos; sin letra chica. La confianza se construye diciendo las cosas como son.',
      icon: Eye,
      accent: 'from-azul to-blue-600'
    },
    {
      title: 'Desempeño que no falla',
      description: 'Priorizamos resistencia, sellado y metraje real para minimizar roturas, reprocesos y paradas operativas. Si un producto no cumple, lo corregimos.',
      icon: Shield,
      accent: 'from-verde-principal to-verde-hover'
    },
    {
      title: 'Sostenibilidad con evidencia',
      description: 'Impulsamos opciones reciclables y de menor desperdicio y comunicamos con datos verificables (materiales, vida útil, recuperabilidad).',
      icon: Recycle,
      accent: 'from-azul to-blue-600'
    },
    {
      title: 'Agilidad y cercanía',
      description: 'Stock disponible, respuesta rápida y atención por los canales del cliente (WhatsApp, teléfono, email, redes sociales).',
      icon: PhoneCall,
      accent: 'from-verde-principal to-verde-hover'
    },
    {
      title: 'Mejora continua',
      description: 'Iteramos procesos y servicio con métricas como calidad de lote, entregas a tiempo (OTIF) y tasa de reclamos. Siempre se puede hacer mejor.',
      icon: RefreshCw,
      accent: 'from-azul to-blue-600'
    },
    {
      title: 'Relaciones de largo plazo',
      description: 'Buscamos valor total, no solo precio. Crecemos con clientes y proveedores en esquemas ganar-ganar y soporte postventa real.',
      icon: Users,
      accent: 'from-verde-principal to-verde-hover'
    },
    {
      title: 'Seguridad y cumplimiento',
      description: 'Operamos con estándares de seguridad, trazabilidad y normativa en toda la cadena. La confiabilidad empieza en fábrica.',
      icon: ClipboardCheck,
      accent: 'from-azul to-blue-600'
    },
    {
      title: 'Equipo y respeto',
      description: 'Cultura inclusiva, técnica y colaborativa. Formamos talento, compartimos conocimiento y nos enorgullece fabricar en el Perú.',
      icon: GraduationCap,
      accent: 'from-verde-principal to-verde-hover'
    }
  ];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen overflow-x-hidden">
      <SEO
        title="Nosotros | ECOFLEXPLAST"
        description="Fabricamos el zuncho correcto y abastecemos el embalaje que tu operación necesita. Misión, visión, filosofía y nuestra big idea."
        url={typeof window !== 'undefined' ? window.location.href : ''}
        image="/images/logo/logoEmpresa.png"
        jsonLd={[{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'ECOFLEXPLAST',
          url: typeof window !== 'undefined' ? window.location.origin + '/sobre-nosotros' : '',
          logo: '/images/logo/logoEmpresa.png'
        }]}
      />
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 flex items-center justify-center overflow-hidden bg-gradient-to-br from-white to-neutral-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container-max section-padding relative z-10">
          <motion.div
            className="grid lg:grid-cols-12 items-center gap-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="lg:col-span-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 text-balance">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-verde-principal to-blue-600 drop-shadow-sm">ECOFLEXPLAST</span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-verde-principal to-blue-600 rounded-full mx-auto lg:mx-0 mb-4" />
              <p className="text-gris-oscuro text-lg leading-relaxed max-w-3xl lg:max-w-xl mx-auto lg:mx-0 text-balance">
              Fabricamos y distribuimos soluciones integrales de embalaje plástico sostenible, incluyendo zunchos de PP de alta resistencia, esquineros plásticos, burbupack y mangas plásticas. Nos enfocamos en acompañar a las empresas para proteger sus productos, optimizar su logística y reforzar su compromiso con la sostenibilidad.
              </p>
              <div className="flex flex-wrap items-center lg:justify-start justify-center gap-3 mt-5">
                {["Stock disponible", "Control por lote", "Asesoría técnica", "Entregas 24-48h"].map((chip) => (
                  <span key={chip} className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-[#d1fae5] bg-[#ecfdf5] text-[#047857] shadow-sm hover:shadow-md ring-1 ring-black/5 transition">
                    <CheckCircle className="w-4 h-4 text-[#047857] mr-2" aria-hidden="true" /> {chip}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="hidden lg:block lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative h-80 md:h-[420px] rounded-3xl overflow-hidden border border-neutral-200/60 shadow-card bg-white">
                <img
                  src="/images/nosotros/personalidadEmpresa.png"
                  alt="ECOFLEXPLAST"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* KPIs */}
      <section className="py-8 bg-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: 'Calidad', t: 'Producto de alta calidad' },
              { n: 'Local', t: 'Fabricación en Perú' },
              { n: '24–48h', t: 'Entregas rápidas' },
              { n: 'Soporte', t: 'Asesoría técnica' }
            ].map((k)=> (
              <div key={k.t} className="text-center card p-5">
                <div className="text-2xl font-bold text-verde-principal">{k.n}</div>
                <div className="text-sm text-gris-medio">{k.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industrias Strip - removido a pedido del cliente */}

      {/* Big Idea */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 bg-verde-light border border-verde-border rounded-full px-4 py-2 mb-6">
              <Lightbulb className="w-4 h-4 text-verde-principal" />
              <span className="text-verde-principal text-sm font-medium">
                Nuestra Propuesta de Valor
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-verde-principal to-blue-600 text-balance">
              ¡Hacemos que tu operación no se detenga!
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-verde-principal to-blue-600 mb-4" />
            <p className="text-gris-oscuro text-lg leading-relaxed max-w-4xl mx-auto text-balance">
              Fabricamos el zuncho correcto y abastecemos el embalaje que tu negocio necesita, 
              justo a tiempo y costos con sostenibilidad.
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-[3fr_2fr] gap-8">
            <motion.div 
              className="relative rounded-3xl p-[1px] bg-gradient-to-r from-verde-principal to-verde-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-3xl bg-white p-8 lg:p-12 h-full">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-verde-light text-verde-principal font-semibold mb-4">Nuestra promesa</div>
                <h3 className="text-2xl lg:text-3xl font-extrabold leading-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-verde-principal to-blue-600">
                  Que tu operación fluya, sin sorpresas
                </h3>
                <p className="text-gris-oscuro text-lg leading-relaxed">
                Creemos que cada empresa necesita aliados que aseguren la protección de su carga y la continuidad de sus operaciones. Por eso nos dedicamos a la fabricación y a la comercialización de soluciones de embalaje que cumplan con los estándares de calidad y sostenibilidad.
                </p>
                <ul className="mt-5 space-y-2 text-[15px] text-gris-oscuro">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-verde-principal mt-0.5" aria-hidden="true" />
                    <span>Cuidamos la continuidad de tu operación.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-verde-principal mt-0.5" aria-hidden="true" />
                    <span>Logística que se adapta a tu ritmo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-verde-principal mt-0.5" aria-hidden="true" />
                    <span>Acompañamiento técnico que responde y se hace cargo.</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div 
              className="rounded-3xl bg-white p-8 lg:p-12 shadow-card border border-gris-muy-claro"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-verde-light text-verde-principal ring-1 ring-verde-border mb-5">
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>Razón para creer</span>
              </div>
              <h3 className="text-[22px] leading-[30px] font-semibold text-negro-principal mb-2">¿Por qué confiar en nosotros?</h3>
              <div className="h-1 w-16 bg-gradient-to-r from-verde-principal to-blue-600 rounded-full mb-4" />
              <ul className="mt-2 space-y-3">
                {[
                  'Fabricación propia de zunchos PP',
                  'Control de calidad por lote',
                  'Stock y entregas ágiles',
                  'Asesoría técnica y packs por industria'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 p-3 rounded-xl border border-gris-muy-claro hover:border-verde-border transition-colors">
                    <CheckCircle className="w-5 h-5 text-verde-principal mt-0.5" aria-hidden="true" />
                    <span className="text-gris-oscuro text-[16px] leading-[26px]">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gradient-to-r from-verde-principal to-verde-hover text-white py-2 text-center shadow-sm">
                  <div className="text-sm font-semibold">24–48h</div>
                  <div className="text-[11px] opacity-90">Entregas</div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 text-center shadow-sm">
                  <div className="text-sm font-semibold">x Lote</div>
                  <div className="text-[11px] opacity-90">Control calidad</div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-verde-principal to-blue-600 text-white py-2 text-center shadow-sm">
                  <div className="text-sm font-semibold">Perú</div>
                  <div className="text-[11px] opacity-90">Fabricación</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Filosofía */}
      <section className="py-16 md:py-24 bg-fondo-claro">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-4">
              Nuestros Pilares Fundamentales
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-verde-principal to-blue-600 mb-4" />
            <p className="text-gris-oscuro text-lg max-w-2xl mx-auto">
              Los principios que guían cada decisión y nos impulsan hacia la excelencia.
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Misión */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-2">
                <div className="w-20 h-20 bg-grad-primary rounded-2xl flex items-center justify-center mx-auto lg:mx-0 shadow-card ring-1 ring-white/10">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="lg:col-span-10">
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-verde-principal to-verde-hover">
                  <div className="card rounded-2xl p-8 h-full">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-2xl font-semibold text-negro-principal">Misión</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-verde-light text-verde-principal font-medium">01 · Misión</div>
                  </div>
                  <div className="h-1 w-12 bg-gradient-to-r from-verde-principal to-verde-hover rounded-full mb-4" />
                  <p className="text-gris-oscuro text-base md:text-lg leading-relaxed">
                  Diseñar, fabricar y distribuir soluciones de embalaje plástico sostenible de alto desempeño con control por lote, pruebas documentadas, stock disponible y entregas ágiles. Acompañamos a industrias como agroexportación, manufactura, logística, y construcción con asesoría técnica y propuestas por sector que mejoran la seguridad de la carga, la eficiencia operativa y el costo total de nuestros clientes. 
                  </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Visión */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-10 order-2 lg:order-1">
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 to-blue-600">
                  <div className="card rounded-2xl p-8 h-full">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-2xl font-semibold text-negro-principal">Visión</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600 font-medium">02 · Visión</div>
                  </div>
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4" />
                  <p className="text-gris-oscuro text-base md:text-lg leading-relaxed">
                  Ser la marca de referencia en el Perú en soluciones de embalaje plástico sostenible, reconocida por calidad verificada, entrega ágil y métricas ambientales transparentes, impulsando la continuidad operativa de nuestros clientes y una logística más segura y sostenible a nivel nacional.
                  </p>
                </div>
                </div>
                </div>
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 shadow-card ring-1 ring-white/10">
                  <Eye className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filosofía */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-max section-padding">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="typo-h2 text-negro-principal mb-4">
              Nuestra Filosofía
            </h2>
            <p className="typo-body text-gris-oscuro max-w-2xl mx-auto text-balance">
              Principios que definen cómo trabajamos y nos relacionamos con nuestros clientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principios.map((item, index) => (
              <motion.div
                key={item.title}
                className="card p-6 h-full relative overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent}`} />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/60 flex items-center justify-center shadow-sm">
                    <item.icon className="w-5 h-5 text-verde-principal" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="typo-h4 text-negro-principal mb-2 text-balance">{item.title}</h4>
                    <p className="typo-body text-gris-oscuro text-balance">{item.description}</p>
                  </div>
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    e.currentTarget.style.setProperty('--x', x + '%');
                    e.currentTarget.style.setProperty('--y', y + '%');
                  }}
                  style={{ background: 'radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(5,150,105,0.06), transparent 40%)' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería visual */}
      <section className="py-16 md:py-24 bg-fondo-claro">
        <div className="container-max section-padding">
            <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
          >
            <h2 className="text-[32px] leading-[40px] font-semibold text-negro-principal">Nuestro trabajo en acción</h2>
            </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { src: '/images/productos/Zunchos/Negro/fondo.png', caption: 'Líneas de producción y calidad' },
              { src: '/images/productos/Esquineros/Negro/empaquetado.png', caption: 'Embalaje listo para despacho' },
              { src: '/images/productos/Burbupack/1.00/burbupack_1.00Mx80.png', caption: 'Protección confiable en rutas' },
            ].map((it) => (
              <motion.figure key={it.src} className="rounded-2xl overflow-hidden bg-white border border-neutral-200/60 shadow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <img src={it.src} alt={it.caption} className="w-full h-56 object-cover" onError={(e)=>{e.currentTarget.style.display='none';}} />
                <figcaption className="p-4 text-sm text-gris-oscuro">{it.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-verde-principal to-verde-hover">
        <div className="container-max section-padding">
            <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              ¿Listo para que tu operación no se detenga?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Descubre cómo nuestras soluciones de embalaje pueden optimizar 
              tu logística y asegurar la continuidad de tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/productos" 
                className="inline-flex items-center px-8 py-4 bg-white text-verde-principal rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Ver Productos
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a 
                href="/contacto" 
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-verde-principal transition-all duration-300 transform hover:-translate-y-1"
              >
                Solicitar Asesoría
              </a>
            </div>
            </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SobreNosotros;