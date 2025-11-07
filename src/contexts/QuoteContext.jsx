import { createContext, useContext, useState } from 'react';

const QuoteContext = createContext();

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote debe usarse dentro de QuoteProvider');
  }
  return context;
};

export const QuoteProvider = ({ children }) => {
  const [quoteItems, setQuoteItems] = useState([]);

  const addToQuote = (producto, cantidad = 1) => {
    const toAdd = Number.isFinite(cantidad) && cantidad > 0 ? Math.floor(cantidad) : 1;
    setQuoteItems(prev => {
      const exists = prev.find(item => item.id === producto.id);
      if (exists) {
        return prev.map(item => 
          item.id === producto.id 
            ? { ...item, cantidad: item.cantidad + toAdd }
            : item
        );
      } else {
        return [...prev, { ...producto, cantidad: toAdd }];
      }
    });
  };

  const removeFromQuote = (productoId) => {
    setQuoteItems(prev => prev.filter(item => item.id !== productoId));
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removeFromQuote(productoId);
      return;
    }
    setQuoteItems(prev => 
      prev.map(item => 
        item.id === productoId 
          ? { ...item, cantidad }
          : item
      )
    );
  };

  const clearQuote = () => {
    setQuoteItems([]);
  };

  const getTotalItems = () => {
    return quoteItems.reduce((total, item) => total + item.cantidad, 0);
  };

  const getTotalProducts = () => {
    return quoteItems.length;
  };

  const value = {
    items: quoteItems,
    addToQuote,
    removeFromQuote,
    updateQuantity,
    clearQuote,
    getTotalItems,
    getTotalProducts,
    isInQuote: (productoId) => quoteItems.some(item => item.id === productoId)
  };

  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
};

export default QuoteContext;


