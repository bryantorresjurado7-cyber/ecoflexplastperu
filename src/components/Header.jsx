import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone } from 'lucide-react';
import { useQuote } from '../contexts/QuoteContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getTotalProducts } = useQuote();
  const total = getTotalProducts();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const menuItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/sobre-nosotros' },
    { name: 'Productos', path: '/productos' },
    { name: 'Colores', path: '/colores' },
    { name: 'Accesorios', path: '/accesorios' },
    { name: 'Contacto', path: '/contacto' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-header shadow-lg' 
          : 'bg-white/95'
      }`}
    >
      <div className="container-max section-padding relative">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-6 lg:mr-10">
            <img
              src="/images/logo/logoEmpresa.png"
              alt="EcoFlexPlast"
              className="h-8 w-auto lg:h-10 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-verde-principal'
                    : 'text-gris-oscuro hover:text-verde-principal'
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-verde-principal" />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden lg:flex items-center space-x-3 ml-auto">
            <Link 
              to="/cotizacion" 
              className="btn-secondary relative text-sm py-2 px-4 h-10 leading-none inline-flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cotización
              {total > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {total}
                </span>
              )}
            </Link>
            <Link 
              to="/contacto" 
              className="btn-primary text-sm py-2 px-4 h-10 leading-none inline-flex items-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              Consultar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gris-muy-claro/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gris-oscuro" />
            ) : (
              <Menu className="w-6 h-6 text-gris-oscuro" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute left-0 right-0 top-full z-[120] border-t border-gris-muy-claro bg-white/95 backdrop-blur-sm shadow-lg rounded-b-xl max-h-[80vh] overflow-auto"
            >
              <nav className="py-4 space-y-2 px-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block py-2 px-4 rounded-lg font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-verde-principal bg-verde-light'
                        : 'text-gris-oscuro hover:text-verde-principal hover:bg-verde-light/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
