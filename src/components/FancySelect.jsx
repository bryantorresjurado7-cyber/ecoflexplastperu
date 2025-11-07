import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FancySelect = ({ value, onChange, options, placeholder = 'Seleccionar', className = '' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => String(o.value) === String(value));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-white border border-gris-muy-claro rounded-lg px-4 py-3 shadow-sm hover:border-verde-principal focus:outline-none focus:ring-2 focus:ring-verde-principal flex items-center justify-between"
      >
        <span className={`truncate ${selected ? 'text-negro-principal' : 'text-gris-medio'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-gris-muy-claro rounded-xl shadow-xl overflow-hidden">
          <ul className="max-h-64 overflow-auto py-1">
            {options.map(opt => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    onClick={() => { onChange(String(opt.value)); setOpen(false); }}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gris-muy-claro ${isSelected ? 'bg-verde-light text-verde-principal' : 'text-negro-principal'}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FancySelect;


