import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // No hacer scroll top en rutas de admin para mantener posición
    if (!pathname.startsWith('/admin')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;


