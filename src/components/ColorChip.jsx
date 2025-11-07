// Simple button without framer-motion for stability
import { Check } from 'lucide-react';

const ColorChip = ({ color, isSelected = false, onClick, size = 'md' }) => {
  // Si no hay color, no renderizar nada
  if (!color || !color.hex) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const borderSize = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4'
  };

  // Determinar si el color es claro (blanco, amarillo, etc.) para usar un borde más visible
  const isLightColor = color.hex === '#ffffff' || color.hex === '#ffff00' || color.hex === '#ffeb3b' || 
                      color.hex === '#fff' || color.hex === '#ff0' || color.hex === '#yellow';

  return (
    <button
      onClick={() => onClick?.(color)}
      className={`
        ${sizeClasses[size]} 
        ${borderSize[size]} 
        rounded-full 
        flex items-center justify-center 
        transition-transform duration-200 hover:scale-110 active:scale-95
        ${isSelected 
          ? 'border-verde-principal shadow-lg shadow-verde-principal/30' 
          : isLightColor 
            ? 'border-gray-400 hover:border-verde-principal/50' 
            : 'border-gris-muy-claro hover:border-verde-principal/50'
        }
      `}
      style={{ backgroundColor: color.hex }}
      title={color.nombre}
    >
      {isSelected && (
        <div
          className={`
            rounded-full bg-white flex items-center justify-center
            ${size === 'sm' ? 'w-3 h-3' : ''}
            ${size === 'md' ? 'w-4 h-4' : ''}
            ${size === 'lg' ? 'w-6 h-6' : ''}
            ${size === 'xl' ? 'w-8 h-8' : ''}
          `}
        >
          <Check className={`
            text-verde-principal
            ${size === 'sm' ? 'w-2 h-2' : ''}
            ${size === 'md' ? 'w-2.5 h-2.5' : ''}
            ${size === 'lg' ? 'w-3 h-3' : ''}
            ${size === 'xl' ? 'w-4 h-4' : ''}
          `} />
        </div>
      )}
    </button>
  );
};

export default ColorChip;
