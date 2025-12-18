import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import NotificationButton from '../components/NotificationButton'
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    FileText,
    CheckCircle,
    ArrowLeft,
    Settings,
    History,

    PieChart,
    Plus
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

const AdminCajaChica = () => {
    const [resumen, setResumen] = useState({
        saldoActual: 0,
        ingresosMes: 0,
        egresosMes: 0,
        alertas: []
    })
    const [loading, setLoading] = useState(true)
    const [timeFilter, setTimeFilter] = useState('1M')
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        // Actualizar datos del gráfico cuando cambia el filtro
        // Actualizar datos del gráfico cuando cambia el filtro
        const data = getChartData(timeFilter)
        setChartData(data)
    }, [timeFilter])

    const loadData = async () => {
        try {
            setLoading(true)
            // Simulación de carga de datos
            setTimeout(() => {
                setResumen({
                    saldoActual: 1500.00,
                    ingresosMes: 5000.00,
                    egresosMes: 3500.00,
                    alertas: [
                        { id: 1, tipo: 'warning', mensaje: 'Saldo bajo (menor a S/ 2000)' },
                        { id: 2, tipo: 'error', mensaje: '3 gastos sin justificar' }
                    ]
                })
                setLoading(false)
            }, 500)
        } catch (error) {
            console.error('Error loading caja chica data:', error)
            setLoading(false)
        }
    }

    const getChartData = (filter) => {
        // Datos simulados para el gráfico
        switch (filter) {
            case '1M':
                return [
                    { name: 'Sem 1', gastos: 850 },
                    { name: 'Sem 2', gastos: 920 },
                    { name: 'Sem 3', gastos: 1100 },
                    { name: 'Sem 4', gastos: 630 }
                ]
            case '3M':
                return [
                    { name: 'Oct', gastos: 3200 },
                    { name: 'Nov', gastos: 2800 },
                    { name: 'Dic', gastos: 3500 }
                ]
            case '6M':
                return [
                    { name: 'Jul', gastos: 2900 },
                    { name: 'Ago', gastos: 3100 },
                    { name: 'Sep', gastos: 2800 },
                    { name: 'Oct', gastos: 3200 },
                    { name: 'Nov', gastos: 2800 },
                    { name: 'Dic', gastos: 3500 }
                ]
            case '1A':
                return [
                    { name: 'Ene', gastos: 2100 },
                    { name: 'Feb', gastos: 2300 },
                    { name: 'Mar', gastos: 2800 },
                    { name: 'Abr', gastos: 2500 },
                    { name: 'May', gastos: 3100 },
                    { name: 'Jun', gastos: 2900 },
                    { name: 'Jul', gastos: 2900 },
                    { name: 'Ago', gastos: 3100 },
                    { name: 'Sep', gastos: 2800 },
                    { name: 'Oct', gastos: 3200 },
                    { name: 'Nov', gastos: 2800 },
                    { name: 'Dic', gastos: 3500 }
                ]
            default:
                return []
        }
    }

    const menuItems = [
        
        {
            title: 'Aprobaciones',
            description: 'Validar gastos pendientes',
            icon: <CheckCircle size={24} />,
            link: '/admin/transacciones/aprobaciones',
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Reportes',
            description: 'Estadísticas y exportables',
            icon: <PieChart size={24} />,
            link: '/admin/transacciones/reportes',
            color: 'bg-purple-100 text-purple-600'
        },
        {
            title: 'Arqueo de Caja',
            description: 'Cierre y cuadre de dinero',
            icon: <Wallet size={24} />,
            link: '/admin/transacciones/arqueo',
            color: 'bg-orange-100 text-orange-600'
        },
        {
            title: 'Configuración',
            description: 'Límites y categorías',
            icon: <Settings size={24} />,
            link: '/admin/transacciones/config',
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
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <Link to="/admin/dashboard" className="p-2 rounded-full border-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-sky-50 transition-colors" title="Volver al Dashboard">
                                <ArrowLeft size={24} strokeWidth={2.5} />
                            </Link>
                            <h1 className="text-3xl font-bold text-negro-principal">
                                Caja Chica
                            </h1>
                        </div>
                        <div className="flex gap-3 items-center">
                            <NotificationButton />
                            <Link
                                to="/admin/transacciones"
                                className="bg-verde-principal hover:bg-verde-hover text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Plus size={20} />
                                Nuevo Movimiento
                            </Link>
                        </div>
                    </div>
                    <p className="text-gris-medio mt-1 ml-16">Gestión y control de movimientos financieros</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Analysis Chart Section */}
                    <div className={`bg-white rounded-xl shadow-card p-6 ${resumen.alertas.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-negro-principal flex items-center gap-2">
                                    <TrendingDown className="text-red-500" size={24} />
                                    Análisis de Gastos
                                </h3>
                                <p className="text-sm text-gris-medio mt-1">Visualización histórica de gastos</p>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['1M', '3M', '6M', '1A'].map((filtro) => (
                                    <button
                                        key={filtro}
                                        onClick={() => setTimeFilter(filtro)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFilter === filtro
                                            ? 'bg-white text-negro-principal shadow-sm'
                                            : 'text-gris-medio hover:text-negro-principal hover:bg-gray-200'
                                            }`}
                                    >
                                        {filtro === '1M' ? 'Mes' : filtro === '1A' ? 'Año' : filtro}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(value) => `S/${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F9FAFB' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#EF4444', fontWeight: '600' }}
                                        formatter={(value) => [`S/ ${value}`, 'Gastos']}
                                    />
                                    <Bar
                                        dataKey="gastos"
                                        fill="#EF4444"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Alertas */}
                    {resumen.alertas.length > 0 && (
                        <div className="bg-white rounded-xl shadow-card p-6 h-fit">
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
                </div>

                {/* Menú de Acciones */}
                <div>
                    <h3 className="text-xl font-bold text-negro-principal mb-4">Módulos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.link}
                                className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-all duration-200 group border border-transparent hover:border-gray-100"
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
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChica
