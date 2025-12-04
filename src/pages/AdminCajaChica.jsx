import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    FileText,
    CheckCircle,
    Settings,
    History,
    PieChart
} from 'lucide-react'
import cajaChicaService from '../services/cajaChicaService'

const AdminCajaChica = () => {
    const [resumen, setResumen] = useState({
        saldoActual: 0,
        ingresosMes: 0,
        egresosMes: 0,
        alertas: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            // En un caso real, esto llamaría al servicio
            // const data = await cajaChicaService.getResumen()
            // setResumen(data)

            // Datos simulados para la demo visual
            setResumen({
                saldoActual: 1500.00,
                ingresosMes: 5000.00,
                egresosMes: 3500.00,
                alertas: [
                    { id: 1, tipo: 'warning', mensaje: 'Saldo bajo (menor a S/ 2000)' },
                    { id: 2, tipo: 'error', mensaje: '3 gastos sin justificar' }
                ]
            })
        } catch (error) {
            console.error('Error loading caja chica data:', error)
        } finally {
            setLoading(false)
        }
    }

    const menuItems = [
        {
            title: 'Movimientos',
            description: 'Registrar ingresos y egresos',
            icon: <History size={24} />,
            link: '/admin/caja-chica/movimientos',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            title: 'Aprobaciones',
            description: 'Validar gastos pendientes',
            icon: <CheckCircle size={24} />,
            link: '/admin/caja-chica/aprobaciones',
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Reportes',
            description: 'Estadísticas y exportables',
            icon: <PieChart size={24} />,
            link: '/admin/caja-chica/reportes',
            color: 'bg-purple-100 text-purple-600'
        },
        {
            title: 'Arqueo de Caja',
            description: 'Cierre y cuadre de dinero',
            icon: <Wallet size={24} />,
            link: '/admin/caja-chica/arqueo',
            color: 'bg-orange-100 text-orange-600'
        },
        {
            title: 'Configuración',
            description: 'Límites y categorías',
            icon: <Settings size={24} />,
            link: '/admin/caja-chica/config',
            color: 'bg-gray-100 text-gray-600'
        }
    ]

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                        <Wallet className="text-verde-principal" size={32} />
                        Caja Chica
                    </h1>
                    <p className="text-gris-medio mt-1">Gestión y control de gastos menores</p>
                </div>

                {/* Resumen Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Saldo Actual</p>
                                <h3 className="text-2xl font-bold text-negro-principal mt-1">
                                    S/ {resumen.saldoActual.toFixed(2)}
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Wallet className="text-blue-500" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Ingresos del Mes</p>
                                <h3 className="text-2xl font-bold text-green-600 mt-1">
                                    + S/ {resumen.ingresosMes.toFixed(2)}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <TrendingUp className="text-green-500" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-red-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Gastos del Mes</p>
                                <h3 className="text-2xl font-bold text-red-600 mt-1">
                                    - S/ {resumen.egresosMes.toFixed(2)}
                                </h3>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <TrendingDown className="text-red-500" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                {resumen.alertas.length > 0 && (
                    <div className="mb-8 bg-white rounded-xl shadow-card p-6">
                        <h3 className="text-lg font-semibold text-negro-principal mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500" size={20} />
                            Alertas y Notificaciones
                        </h3>
                        <div className="space-y-3">
                            {resumen.alertas.map((alerta) => (
                                <div
                                    key={alerta.id}
                                    className={`p-4 rounded-lg flex items-center gap-3 ${alerta.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                                        }`}
                                >
                                    <AlertTriangle size={18} />
                                    <span className="font-medium">{alerta.mensaje}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Menú de Acciones */}
                <h3 className="text-xl font-bold text-negro-principal mb-4">Módulos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.link}
                            className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-negro-principal text-lg">{item.title}</h4>
                                    <p className="text-sm text-gris-medio mt-1">{item.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChica
