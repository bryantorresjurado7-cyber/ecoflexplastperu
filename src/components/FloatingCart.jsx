import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useQuote } from '../contexts/QuoteContext';

const FloatingCart = () => {
  const { getTotalProducts } = useQuote();
  const total = getTotalProducts();

  if (total === 0) return null;

  return (
    <Link
      to="/cotizacion"
      className="fixed right-4 bottom-6 z-40"
      aria-label="Abrir cotización"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-verde-principal hover:bg-verde-hover text-white shadow-xl flex items-center justify-center transition-colors">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <span className="absolute -top-2 -right-2 min-w-[28px] h-7 px-2 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
          {total}
        </span>
      </div>
    </Link>
  );
};

export default FloatingCart;


