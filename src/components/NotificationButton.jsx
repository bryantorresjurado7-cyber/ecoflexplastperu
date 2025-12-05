import { useState, useEffect } from 'react'
import { Bell, History } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const NotificationButton = () => {
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([])
    const location = useLocation()

    // Mock Notifications Data based on Path
    const getNotificationsForPath = (path) => {
        if (path.includes('/transacciones') || path.includes('/caja-chica')) {
            return [
                { id: 1, text: 'Gasto pendiente de aprobación', time: '5 min', type: 'warning' },
                { id: 2, text: 'Arqueo de caja realizado', time: '2 horas', type: 'info' }
            ]
        }
        if (path.includes('/cotizaciones')) {
            return [
                { id: 1, text: 'Cotización #405 aprobada', time: '10 min', type: 'success' },
                { id: 2, text: 'Nueva solicitud de cotización', time: '30 min', type: 'info' }
            ]
        }
        if (path.includes('/ventas')) {
            return [
                { id: 1, text: 'Venta #1205 registrada', time: '2 min', type: 'success' },
                { id: 2, text: 'Devolución solicitada', time: '1 hora', type: 'alert' }
            ]
        }
        if (path.includes('/productos') || path.includes('/inventario')) {
            return [
                { id: 1, text: 'Stock bajo: Botella 500ml', time: '15 min', type: 'alert' },
                { id: 2, text: 'Nuevo producto agregado', time: '1 día', type: 'info' }
            ]
        }
        if (path.includes('/clientes')) {
            return [
                { id: 1, text: 'Nuevo cliente registrado', time: '20 min', type: 'info' },
                { id: 2, text: 'Datos de cliente actualizados', time: '3 horas', type: 'info' }
            ]
        }
        if (path === '/admin/dashboard') {
            return [
                { id: 1, text: 'Resumen diario generado', time: '1 hora', type: 'info' },
                { id: 2, text: 'Actualización del sistema', time: '1 día', type: 'info' }
            ]
        }
        return []
    }

    useEffect(() => {
        setNotifications(getNotificationsForPath(location.pathname))
    }, [location.pathname])

    return (
        <div className="relative font-sans">
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 bg-white rounded-full transition-all border border-gray-100 text-gris-medio hover:text-verde-principal group shadow-sm hover:shadow-md"
                title="Notificaciones"
            >
                <Bell size={24} />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-negro-principal">Notificaciones</h3>
                        <span className="text-xs text-gris-claro bg-gray-50 px-2 py-1 rounded-full">Hoy</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm text-negro-principal font-medium group-hover:text-verde-principal transition-colors">
                                            {notif.text}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gris-medio flex items-center gap-1">
                                        <History size={12} />
                                        {notif.time}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-gris-medio">
                                No hay notificaciones nuevas
                            </div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="text-xs text-verde-principal hover:text-verde-hover font-medium w-full text-center"
                            >
                                Marcar todas como leídas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NotificationButton
