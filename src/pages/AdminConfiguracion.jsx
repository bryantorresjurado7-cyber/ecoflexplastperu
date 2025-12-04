import React, { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import {
    Settings,
    Shield,
    Bell,
    Mail,
    Database,
    Save,
    Globe,
    Palette,
    CreditCard,
    Smartphone,
    History,
    LogOut,
    Lock
} from 'lucide-react'


const AdminConfiguracion = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)

    // Estados simulados para la configuración
    const [config, setConfig] = useState({
        siteName: 'EcoFlexPack',
        siteDescription: 'Soluciones ecológicas en plástico',
        contactEmail: 'contacto@ecoflexpack.com',
        maintenanceMode: false,
        enableRegistration: true,
        emailNotifications: true,
        pushNotifications: false,
        // Pagos
        saveCards: false,
        paymentPreference: 'transferencia', // 'yape', 'plin', 'transferencia'
        autoReceipts: true,

        // Notificaciones detalladas
        notifyOrderTracking: { email: true, whatsapp: false },
        notifyPromotions: { email: true, whatsapp: true },
        notifyNewProducts: { email: true, whatsapp: false },
        notifyReminders: { email: false, whatsapp: true },

        // Seguridad
        twoFactorAuth: false,

        // Otros
        theme: 'light',
        itemsPerPage: 20
    })

    // Datos simulados para historial de sesiones
    const activeSessions = [
        { id: 1, device: 'Chrome en Windows', ip: '192.168.1.1', location: 'Lima, PE', current: true, lastActive: 'Ahora' },
        { id: 2, device: 'Safari en iPhone', ip: '192.168.1.25', location: 'Lima, PE', current: false, lastActive: 'Hace 2 horas' },
    ]

    const handleSave = () => {
        setLoading(true)
        // Simular guardado
        setTimeout(() => {
            setLoading(false)
            alert('Configuración guardada correctamente')
        }, 1000)
    }

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'apariencia', label: 'Apariencia', icon: Palette },
        { id: 'pagos', label: 'Métodos de Pago', icon: CreditCard },
        { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
        { id: 'seguridad', label: 'Seguridad', icon: Shield },
        { id: 'sistema', label: 'Sistema', icon: Database },
    ]

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                        <Settings className="text-verde-principal" size={32} />
                        Configuración del Sistema
                    </h1>
                    <p className="text-gris-medio mt-1 ml-11">
                        Gestiona las preferencias y opciones globales de la aplicación
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar de Tabs */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-card overflow-hidden sticky top-8">
                            <nav className="flex flex-col">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 px-6 py-4 text-left transition-all border-l-4 ${activeTab === tab.id
                                                ? 'border-verde-principal bg-verde-light/10 text-verde-principal font-medium'
                                                : 'border-transparent text-gris-oscuro hover:bg-fondo-claro hover:text-negro-principal'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Contenido Principal */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-card p-8">
                            {/* Tab General */}
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-negro-principal mb-6 pb-2 border-b border-gray-100">
                                        Información General
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                                Nombre del Sitio
                                            </label>
                                            <input
                                                type="text"
                                                value={config.siteName}
                                                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                                Email de Contacto
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={18} />
                                                <input
                                                    type="email"
                                                    value={config.contactEmail}
                                                    onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                                                    className="input-field pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                                Descripción del Sitio
                                            </label>
                                            <textarea
                                                rows="3"
                                                value={config.siteDescription}
                                                onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                                                className="input-field resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Apariencia */}
                            {activeTab === 'apariencia' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-negro-principal mb-6 pb-2 border-b border-gray-100">
                                        Apariencia y Visualización
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                                Tema del Panel
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => setConfig({ ...config, theme: 'light' })}
                                                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${config.theme === 'light'
                                                        ? 'border-verde-principal bg-verde-light/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="w-full h-20 bg-white border border-gray-200 rounded shadow-sm"></div>
                                                    <span className="text-sm font-medium">Claro</span>
                                                </button>
                                                <button
                                                    onClick={() => setConfig({ ...config, theme: 'dark' })}
                                                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${config.theme === 'dark'
                                                        ? 'border-verde-principal bg-verde-light/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="w-full h-20 bg-gray-900 border border-gray-700 rounded shadow-sm"></div>
                                                    <span className="text-sm font-medium">Oscuro</span>
                                                </button>
                                                <button
                                                    onClick={() => setConfig({ ...config, theme: 'system' })}
                                                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${config.theme === 'system'
                                                        ? 'border-verde-principal bg-verde-light/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 border border-gray-200 rounded shadow-sm"></div>
                                                    <span className="text-sm font-medium">Sistema</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                                Items por página (Tablas)
                                            </label>
                                            <select
                                                value={config.itemsPerPage}
                                                onChange={(e) => setConfig({ ...config, itemsPerPage: Number(e.target.value) })}
                                                className="input-field max-w-xs"
                                            >
                                                <option value={10}>10 items</option>
                                                <option value={20}>20 items</option>
                                                <option value={50}>50 items</option>
                                                <option value={100}>100 items</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Tab Pagos */}
                            {activeTab === 'pagos' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-negro-principal mb-6 pb-2 border-b border-gray-100">
                                        Configuración de Pagos
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Preferencia de Pago */}
                                        <div>
                                            <label className="block text-sm font-medium text-negro-principal mb-3">
                                                Preferencia de Pago Principal
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {['yape', 'plin', 'transferencia'].map((method) => (
                                                    <button
                                                        key={method}
                                                        onClick={() => setConfig({ ...config, paymentPreference: method })}
                                                        className={`p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${config.paymentPreference === method
                                                            ? 'border-verde-principal bg-verde-light/10 text-verde-principal font-medium'
                                                            : 'border-gray-200 hover:border-gray-300 text-gris-oscuro'
                                                            }`}
                                                    >
                                                        <span className="capitalize">{method}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Opciones Adicionales */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-fondo-claro rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                        <CreditCard size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-negro-principal">Guardar Tarjetas</p>
                                                        <p className="text-sm text-gris-medio">Permitir a los clientes guardar sus métodos de pago</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={config.saveCards}
                                                        onChange={(e) => setConfig({ ...config, saveCards: e.target.checked })}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-verde-principal"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-fondo-claro rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                                        <Database size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-negro-principal">Comprobantes Automáticos</p>
                                                        <p className="text-sm text-gris-medio">Generar y registrar comprobantes automáticamente</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={config.autoReceipts}
                                                        onChange={(e) => setConfig({ ...config, autoReceipts: e.target.checked })}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-verde-principal"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Notificaciones */}
                            {activeTab === 'notificaciones' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-negro-principal mb-6 pb-2 border-b border-gray-100">
                                        Preferencias de Notificaciones
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                                            <Bell className="text-blue-600 flex-shrink-0" size={20} />
                                            <p className="text-sm text-blue-800">
                                                Configura qué notificaciones deseas recibir y por qué medio (Email o WhatsApp).
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'notifyOrderTracking', label: 'Seguimiento de Pedidos', desc: 'Actualizaciones sobre el estado de tus compras' },
                                                { key: 'notifyPromotions', label: 'Promociones y Ofertas', desc: 'Descuentos especiales y campañas' },
                                                { key: 'notifyNewProducts', label: 'Nuevos Productos', desc: 'Lanzamientos y novedades en el catálogo' },
                                                { key: 'notifyReminders', label: 'Recordatorios de Compra', desc: 'Alertas sobre carritos abandonados o stock' },
                                            ].map((item) => (
                                                <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-fondo-claro rounded-lg gap-4">
                                                    <div>
                                                        <p className="font-medium text-negro-principal">{item.label}</p>
                                                        <p className="text-sm text-gris-medio">{item.desc}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox h-4 w-4 text-verde-principal rounded border-gray-300 focus:ring-verde-principal"
                                                                checked={config[item.key].email}
                                                                onChange={(e) => setConfig({
                                                                    ...config,
                                                                    [item.key]: { ...config[item.key], email: e.target.checked }
                                                                })}
                                                            />
                                                            <span className="text-sm text-gris-oscuro flex items-center gap-1">
                                                                <Mail size={14} /> Email
                                                            </span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox h-4 w-4 text-verde-principal rounded border-gray-300 focus:ring-verde-principal"
                                                                checked={config[item.key].whatsapp}
                                                                onChange={(e) => setConfig({
                                                                    ...config,
                                                                    [item.key]: { ...config[item.key], whatsapp: e.target.checked }
                                                                })}
                                                            />
                                                            <span className="text-sm text-gris-oscuro flex items-center gap-1">
                                                                <Smartphone size={14} /> WhatsApp
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Seguridad */}
                            {activeTab === 'seguridad' && (
                                <div className="space-y-8">
                                    {/* Sección General */}
                                    <div>
                                        <h2 className="text-xl font-bold text-negro-principal mb-6 pb-2 border-b border-gray-100">
                                            Seguridad y Acceso
                                        </h2>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-fondo-claro rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                        <Lock size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-negro-principal">Autenticación en Dos Pasos (2FA)</p>
                                                        <p className="text-sm text-gris-medio">Añade una capa extra de seguridad a tu cuenta</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={config.twoFactorAuth}
                                                        onChange={(e) => setConfig({ ...config, twoFactorAuth: e.target.checked })}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-verde-principal"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-fondo-claro rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-negro-principal">Modo Mantenimiento</p>
                                                        <p className="text-sm text-gris-medio">Desactivar el acceso público al sitio</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={config.maintenanceMode}
                                                        onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-verde-principal"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Historial de Sesiones */}
                                    <div>
                                        <h3 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                            <History size={20} className="text-gris-oscuro" />
                                            Dispositivos e Historial de Sesiones
                                        </h3>
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="divide-y divide-gray-100">
                                                {activeSessions.map((session) => (
                                                    <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-full ${session.current ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                <Smartphone size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-negro-principal flex items-center gap-2">
                                                                    {session.device}
                                                                    {session.current && (
                                                                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                                                                            Actual
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-gris-medio">
                                                                    {session.location} • {session.ip} • <span className="text-gris-oscuro">{session.lastActive}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {!session.current && (
                                                            <button className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline">
                                                                Cerrar sesión
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                <button className="w-full py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                                                    <LogOut size={18} />
                                                    Cerrar todas las demás sesiones
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Sistema */}
                            {activeTab === 'sistema' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-negro-principal mb-6 pb-2 border-b border-gray-100">
                                        Información del Sistema
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-fondo-claro rounded-lg border border-gray-200">
                                            <p className="text-sm text-gris-medio mb-1">Versión del Sistema</p>
                                            <p className="font-mono font-medium text-negro-principal">v1.2.0</p>
                                        </div>
                                        <div className="p-4 bg-fondo-claro rounded-lg border border-gray-200">
                                            <p className="text-sm text-gris-medio mb-1">Última Actualización</p>
                                            <p className="font-mono font-medium text-negro-principal">01/12/2025</p>
                                        </div>
                                        <div className="p-4 bg-fondo-claro rounded-lg border border-gray-200">
                                            <p className="text-sm text-gris-medio mb-1">Base de Datos</p>
                                            <p className="font-mono font-medium text-green-600 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                Conectado
                                            </p>
                                        </div>
                                        <div className="p-4 bg-fondo-claro rounded-lg border border-gray-200">
                                            <p className="text-sm text-gris-medio mb-1">Almacenamiento</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                <div className="bg-verde-principal h-2.5 rounded-full" style={{ width: '45%' }}></div>
                                            </div>
                                            <p className="text-xs text-gris-medio mt-1 text-right">45% usado</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer de Acciones */}
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                                <button
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gris-oscuro hover:bg-gray-50 font-medium transition-colors"
                                    onClick={() => window.location.reload()}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

// Icono auxiliar para el tab de seguridad
const UserIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
)

export default AdminConfiguracion
