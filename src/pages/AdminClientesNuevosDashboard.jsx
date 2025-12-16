import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import NotificationButton from '../components/NotificationButton'
import { clientesService } from '../services/clientesService'
import {
    Users,
    TrendingUp,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    FileText,
    ArrowLeft,
    UserPlus,
    Calendar,
    Clock,
    Plus
} from 'lucide-react'

const AdminClientesNuevosDashboard = () => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        activos: 0,
        conEmail: 0,
        conTelefono: 0,
        porTipoDocumento: {},
        recientes: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            // Cargar todos los clientes para calcular métricas
            const { data } = await clientesService.list({ limit: 1000 })

            if (data) {
                const total = data.length
                const activos = data.filter(c => c.estado).length
                const conEmail = data.filter(c => c.email).length
                const conTelefono = data.filter(c => c.telefono).length

                // Agrupar por tipo de documento
                const porTipoDocumento = data.reduce((acc, curr) => {
                    const tipo = curr.tipo_documento || 'Sin Doc.'
                    acc[tipo] = (acc[tipo] || 0) + 1
                    return acc
                }, {})

                // Tomar los 5 más recientes (asumiendo que vienen ordenados o recientes al inicio)
                // Si la API soporta created_at, idealmente ordenaríamos. Usaremos el orden de llegada del array.
                const recientes = data.slice(0, 5)

                setStats({
                    total,
                    activos,
                    conEmail,
                    conTelefono,
                    porTipoDocumento,
                    recientes
                })
            }
        } catch (error) {
            console.error('Error cargando métricas de clientes:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <Link to="/admin/dashboard" className="p-2 rounded-full border-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-sky-50 transition-colors" title="Volver al Dashboard">
                                    <ArrowLeft size={24} strokeWidth={2.5} />
                                </Link>
                                <h1 className="text-3xl font-bold text-negro-principal">
                                    Dashboard de Clientes
                                </h1>
                            </div>
                            <p className="text-gris-medio mt-1 ml-16">Visión general de la base de datos de clientes</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <NotificationButton />
                            <Link
                                to="/admin/clientes"
                                className="bg-verde-principal hover:bg-verde-hover text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Plus size={20} />
                                Nuevo Cliente
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Total Clientes</p>
                                <h3 className="text-3xl font-bold text-negro-principal mt-1">{stats.total}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                <Users size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-gris-medio mt-2">Registrados en el sistema</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Clientes Activos</p>
                                <h3 className="text-3xl font-bold text-negro-principal mt-1">{stats.activos}</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg text-green-500">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2 font-medium">
                            {((stats.activos / (stats.total || 1)) * 100).toFixed(1)}% del total
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Con Email</p>
                                <h3 className="text-3xl font-bold text-negro-principal mt-1">{stats.conEmail}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                                <Mail size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-gris-medio mt-2">Contactabilidad digital</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Con Teléfono</p>
                                <h3 className="text-3xl font-bold text-negro-principal mt-1">{stats.conTelefono}</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                                <Phone size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-gris-medio mt-2">Contactabilidad telefónica</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Breakdown Chart Proxy */}
                    <div className="bg-white rounded-xl shadow-card p-6">
                        <h3 className="text-lg font-bold text-negro-principal mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-verde-principal" />
                            Distribución por Documento
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats.porTipoDocumento).map(([tipo, count], idx) => {
                                const percentage = ((count / stats.total) * 100).toFixed(1)
                                return (
                                    <div key={tipo}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-negro-principal">{tipo}</span>
                                            <span className="text-gris-medio">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-verde-principal'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Recent List */}
                    <div className="bg-white rounded-xl shadow-card p-6">
                        <h3 className="text-lg font-bold text-negro-principal mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-verde-principal" />
                            Agregados Recientemente
                        </h3>
                        <div className="divide-y divide-gray-100">
                            {stats.recientes.length > 0 ? (
                                stats.recientes.map((cliente, idx) => (
                                    <div key={cliente.id || idx} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-full text-gris-medio">
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-negro-principal">{cliente.nombre}</p>
                                                <p className="text-xs text-gris-medio">{cliente.email || cliente.telefono || 'Sin contacto'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cliente.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {cliente.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gris-medio py-4">No hay clientes recientes</p>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/admin/clientes" className="text-sm text-verde-principal hover:underline font-medium">Ver todos los clientes</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminClientesNuevosDashboard
