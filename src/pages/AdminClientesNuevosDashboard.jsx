import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    Users,
    TrendingUp,
    TrendingDown,
    Clock,
    Globe,
    DollarSign,
    Target,
    Filter,
    ArrowLeft,
    Smartphone,
    Monitor,
    Tablet,
    MapPin,
    Share2,
    Activity
} from 'lucide-react'

const AdminClientesNuevosDashboard = () => {
    const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, month, last_month, custom
    const [loading, setLoading] = useState(true)

    // Mock Data State
    const [metrics, setMetrics] = useState({
        volume: {
            total: 0,
            growth: 0,
            acquisitionSpeed: 0, // days
            history: []
        },
        origin: {
            channels: [],
            campaigns: []
        },
        quality: {
            aov: 0,
            cac: 0,
            industries: []
        },
        conversion: {
            rate: 0,
            funnel: [],
            devices: []
        }
    })

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setMetrics({
                volume: {
                    total: 145,
                    growth: 12.5,
                    acquisitionSpeed: 4.2,
                    history: [12, 15, 10, 18, 22, 25, 20, 23] // Mock daily/weekly data
                },
                origin: {
                    channels: [
                        { name: 'Orgánico (SEO)', value: 45, color: 'bg-blue-500' },
                        { name: 'Redes Sociales', value: 30, color: 'bg-purple-500' },
                        { name: 'Referidos', value: 15, color: 'bg-green-500' },
                        { name: 'Email Marketing', value: 10, color: 'bg-yellow-500' }
                    ],
                    campaigns: [
                        { name: 'Promo Verano', leads: 50 },
                        { name: 'Black Friday', leads: 35 },
                        { name: 'Lanzamiento 2025', leads: 20 }
                    ]
                },
                quality: {
                    aov: 1250.00,
                    cac: 45.00,
                    industries: [
                        { name: 'Retail', value: 40 },
                        { name: 'Manufactura', value: 30 },
                        { name: 'Servicios', value: 20 },
                        { name: 'Otros', value: 10 }
                    ]
                },
                conversion: {
                    rate: 3.2,
                    funnel: [
                        { stage: 'Visitas', count: 5000, color: 'bg-gray-300' },
                        { stage: 'Leads', count: 800, color: 'bg-blue-300' },
                        { stage: 'Prospectos', count: 250, color: 'bg-blue-500' },
                        { stage: 'Clientes', count: 145, color: 'bg-green-500' }
                    ],
                    devices: [
                        { name: 'Escritorio', value: 60, icon: Monitor },
                        { name: 'Móvil', value: 35, icon: Smartphone },
                        { name: 'Tablet', value: 5, icon: Tablet }
                    ]
                }
            })
            setLoading(false)
        }, 1000)
    }, [timeRange])

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
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors">
                        <ArrowLeft size={20} />
                        Volver al Dashboard Principal
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                                <Users className="text-verde-principal" size={32} />
                                Dashboard de Clientes Nuevos
                            </h1>
                            <p className="text-gris-medio mt-1">Análisis detallado de adquisición y crecimiento</p>
                        </div>

                        {/* Time Filter */}
                        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                            {[
                                { label: '7D', value: '7d' },
                                { label: '30D', value: '30d' },
                                { label: 'Mes Actual', value: 'month' },
                                { label: 'Mes Anterior', value: 'last_month' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTimeRange(opt.value)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === opt.value
                                            ? 'bg-verde-principal text-white shadow-sm'
                                            : 'text-gris-medio hover:bg-gray-50'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 1. Volume & Growth Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total New Clients */}
                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Total Clientes Nuevos</p>
                                <h3 className="text-4xl font-bold text-negro-principal mt-2">{metrics.volume.total}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="text-blue-500" size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className={`flex items-center gap-1 font-medium ${metrics.volume.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {metrics.volume.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {Math.abs(metrics.volume.growth)}%
                            </span>
                            <span className="text-gris-medio">vs periodo anterior</span>
                        </div>
                    </div>

                    {/* Acquisition Speed */}
                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Velocidad de Adquisición</p>
                                <h3 className="text-4xl font-bold text-negro-principal mt-2">{metrics.volume.acquisitionSpeed} <span className="text-lg text-gris-medio font-normal">días</span></h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Clock className="text-purple-500" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gris-medio">Tiempo promedio de Lead a Cliente</p>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gris-medio">Tasa de Conversión Global</p>
                                <h3 className="text-4xl font-bold text-negro-principal mt-2">{metrics.conversion.rate}%</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Target className="text-green-500" size={24} />
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.conversion.rate * 10}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* 2. Origin & Source */}
                    <div className="bg-white rounded-xl shadow-card p-6">
                        <h3 className="text-lg font-bold text-negro-principal mb-6 flex items-center gap-2">
                            <Share2 size={20} className="text-verde-principal" />
                            Origen de Clientes
                        </h3>
                        <div className="space-y-6">
                            {metrics.origin.channels.map((channel, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-negro-principal">{channel.name}</span>
                                        <span className="text-gris-medio">{channel.value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${channel.color}`}
                                            style={{ width: `${channel.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gris-medio mb-4 uppercase tracking-wider">Top Campañas</h4>
                            <div className="space-y-3">
                                {metrics.origin.campaigns.map((camp, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-fondo-claro rounded-lg">
                                        <span className="font-medium text-sm text-negro-principal">{camp.name}</span>
                                        <span className="text-sm font-bold text-verde-principal">+{camp.leads} Clientes</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. Conversion Funnel */}
                    <div className="bg-white rounded-xl shadow-card p-6">
                        <h3 className="text-lg font-bold text-negro-principal mb-6 flex items-center gap-2">
                            <Filter size={20} className="text-verde-principal" />
                            Embudo de Conversión
                        </h3>
                        <div className="flex flex-col gap-2">
                            {metrics.conversion.funnel.map((stage, idx) => {
                                // Calculate width relative to the first stage (Visitas)
                                const widthPercentage = (stage.count / metrics.conversion.funnel[0].count) * 100
                                return (
                                    <div key={idx} className="relative group">
                                        <div
                                            className={`${stage.color} h-12 rounded-r-lg flex items-center justify-between px-4 transition-all duration-500`}
                                            style={{ width: `${Math.max(widthPercentage, 15)}%` }}
                                        >
                                            <span className="font-medium text-white whitespace-nowrap">{stage.stage}</span>
                                        </div>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-negro-principal">
                                            {stage.count.toLocaleString()}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4">
                            {metrics.conversion.devices.map((device, idx) => {
                                const Icon = device.icon
                                return (
                                    <div key={idx} className="text-center p-4 bg-fondo-claro rounded-xl">
                                        <Icon className="mx-auto text-gris-medio mb-2" size={24} />
                                        <p className="text-2xl font-bold text-negro-principal">{device.value}%</p>
                                        <p className="text-xs text-gris-medio">{device.name}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. Quality & Value */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="font-semibold text-negro-principal">Valor Promedio (AOV)</h3>
                        </div>
                        <p className="text-3xl font-bold text-negro-principal mt-2">S/ {metrics.quality.aov.toFixed(2)}</p>
                        <p className="text-sm text-gris-medio mt-1">Primer pedido</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <Activity size={20} />
                            </div>
                            <h3 className="font-semibold text-negro-principal">Costo Adquisición (CAC)</h3>
                        </div>
                        <p className="text-3xl font-bold text-negro-principal mt-2">S/ {metrics.quality.cac.toFixed(2)}</p>
                        <p className="text-sm text-gris-medio mt-1">Por cliente nuevo</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Globe size={20} />
                            </div>
                            <h3 className="font-semibold text-negro-principal">Top Industrias</h3>
                        </div>
                        <div className="space-y-2">
                            {metrics.quality.industries.map((ind, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span className="text-gris-oscuro">{ind.name}</span>
                                    <span className="font-medium">{ind.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminClientesNuevosDashboard
