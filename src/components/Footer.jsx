import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Facebook, Linkedin, Music, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-footer-dark text-white">
      {/* Main Footer */}
      <div className="container-max section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Empresa */}
          <div className="space-y-6">
            <div>
              <div className="mb-4">
                <img
                  src="/images/logo/logoEmpresa.png"
                  alt="EcoFlexPlast - Packaging Sostenible Avanzado"
                  className="h-8 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <p className="text-gris-claro text-sm leading-relaxed">
                Especialistas en zunchos de polipropileno de alta calidad. 
                Ofrecemos soluciones completas de enzunchado para todas las industrias.
              </p>
            </div>
            
            {/* Certificaciones (ocultas temporalmente) */}
            {/* <div>
              <h4 className="font-semibold mb-2">Certificaciones</h4>
              <div className="flex space-x-2">
                <div className="px-3 py-1 bg-verde-principal/20 border border-verde-principal/30 rounded text-xs">
                  ISO 9001
                </div>
                <div className="px-3 py-1 bg-verde-principal/20 border border-verde-principal/30 rounded text-xs">
                  Calidad
                </div>
              </div>
            </div> */}
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Productos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/productos?cat=zuncho" className="text-gris-claro hover:text-verde-principal transition-colors">
                  Zunchos
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=esquinero" className="text-gris-claro hover:text-verde-principal transition-colors">
                  Esquineros
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=burbupack" className="text-gris-claro hover:text-verde-principal transition-colors">
                  Burbupack
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=manga" className="text-gris-claro hover:text-verde-principal transition-colors">
                  Mangas
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=accesorio" className="text-gris-claro hover:text-verde-principal transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link to="/productos" className="text-verde-principal font-medium">
                  Ver Catálogo Completo →
                </Link>
              </li>
            </ul>
          </div>

          {/* Servicio */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Servicio</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gris-claro">
                <div className="w-2 h-2 bg-verde-principal rounded-full mr-3"></div>
                Envío a todo el país
              </li>
              <li className="flex items-center text-gris-claro">
                <div className="w-2 h-2 bg-verde-principal rounded-full mr-3"></div>
                Entrega 24-48 horas
              </li>
              <li className="flex items-center text-gris-claro">
                <div className="w-2 h-2 bg-verde-principal rounded-full mr-3"></div>
                Stock permanente
              </li>
              <li className="flex items-center text-gris-claro">
                <div className="w-2 h-2 bg-verde-principal rounded-full mr-3"></div>
                Asesoría técnica gratuita
              </li>
              <li className="flex items-center text-gris-claro">
                <div className="w-2 h-2 bg-verde-principal rounded-full mr-3"></div>
                Garantía de calidad
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-verde-principal mt-0.5 flex-shrink-0" />
                <div className="text-gris-claro text-sm">
                  <p><span className="font-medium text-white">Dirección 1:</span> calle 2 sector 3 grupo 29 Mz.N Lt.45, Villa El Salvador</p>
                  <p><span className="font-medium text-white">Dirección 2:</span> Jr. Isabel Flores de Oliva 270, Lima 15079</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-verde-principal flex-shrink-0" />
                <div>
                  <button 
                    onClick={() => window.open('https://wa.me/message/FP3PXXHAVSTLM1', '_blank')}
                    className="text-gris-claro hover:text-verde-principal transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    +51 946 881 539
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-verde-principal flex-shrink-0" />
                <div>
                  <a href="mailto:ventas@ecoflexplastperu.com" className="text-gris-claro hover:text-verde-principal transition-colors">
                    ventas@ecoflexplastperu.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-verde-principal mt-0.5 flex-shrink-0" />
                <div className="text-gris-claro text-sm">
                  <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
                  <p>Sáb: 8:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Síguenos</h4>
              <div className="flex space-x-3">
                <button 
                  className="w-10 h-10 bg-gris-oscuro hover:bg-verde-principal rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="WhatsApp"
                  onClick={() => window.open('https://wa.me/message/FP3PXXHAVSTLM1', '_blank')}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <a 
                  href="https://www.facebook.com/profile.php?id=61579988324529" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gris-oscuro hover:bg-verde-principal rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@ecoflexplast.peru?_t=ZM-8zU8p2ug1os&_r=1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gris-oscuro hover:bg-verde-principal rounded-lg flex items-center justify-center transition-colors"
                  aria-label="TikTok"
                >
                  <Music className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gris-oscuro hover:bg-verde-principal rounded-lg flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gris-oscuro">
        <div className="container-max section-padding py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="font-semibold mb-2">Mantente Informado</h3>
              <p className="text-gris-claro text-sm">
                Recibe noticias sobre nuevos productos y ofertas especiales
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="px-4 py-2 bg-gris-oscuro border border-gris-medio rounded-l-lg focus:outline-none focus:ring-2 focus:ring-verde-principal text-white placeholder-gris-claro flex-1 md:w-64"
              />
              <button className="bg-verde-principal hover:bg-verde-hover px-6 py-2 rounded-r-lg font-medium transition-colors">
                Suscribir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gris-oscuro">
        <div className="container-max section-padding py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gris-claro text-sm flex items-center gap-4">
              <span>© {currentYear} EcoFlexPack. Todos los derechos reservados.</span>
              <Link 
                to="/admin/login" 
                className="text-gris-medio hover:text-verde-principal transition-colors text-xs opacity-50 hover:opacity-100"
                title="Acceso Administrador"
              >
                Admin
              </Link>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/terminos" className="text-gris-claro hover:text-verde-principal transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="text-gris-claro hover:text-verde-principal transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/faq" className="text-gris-claro hover:text-verde-principal transition-colors">
                FAQ
              </Link>
              <Link to="/libro-reclamaciones" className="text-gris-claro hover:text-verde-principal transition-colors">
                Libro de Reclamaciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
