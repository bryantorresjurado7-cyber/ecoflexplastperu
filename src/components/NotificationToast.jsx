import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'

const NotificationToast = ({ open, type = 'success', title, message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [open, duration, onClose])

  if (!open) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-green-500" size={48} />
      case 'error':
        return <XCircle className="text-red-500" size={48} />
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={48} />
      default:
        return <CheckCircle2 className="text-green-500" size={48} />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-green-50 border-green-200'
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      default:
        return 'text-green-800'
    }
  }

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700'
      case 'error':
        return 'text-red-700'
      case 'warning':
        return 'text-yellow-700'
      default:
        return 'text-green-700'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
      {/* Overlay oscuro */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Pop-up de notificación */}
      <div 
        className={`
          relative bg-white rounded-2xl shadow-2xl 
          border-2 ${getBgColor()}
          max-w-md w-full mx-auto
          transform transition-all duration-300 ease-out
          pointer-events-auto
        `}
        style={{
          animation: 'slideUpFadeIn 0.3s ease-out forwards'
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gris-medio hover:text-gris-oscuro transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icono */}
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            
            {/* Texto */}
            <div className="flex-1 pt-1">
              <h3 className={`text-lg font-bold ${getTitleColor()} mb-1`}>
                {title}
              </h3>
              {message && (
                <p className={`text-sm ${getMessageColor()}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Barra de progreso (si tiene duración) */}
          {duration > 0 && (
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  type === 'success' ? 'bg-green-500' :
                  type === 'error' ? 'bg-red-500' :
                  'bg-yellow-500'
                } transition-all ease-linear`}
                style={{
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>

        {/* Botón de acción (solo para success) */}
        {type === 'success' && (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full bg-verde-principal hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Aceptar
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUpFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

export default NotificationToast

