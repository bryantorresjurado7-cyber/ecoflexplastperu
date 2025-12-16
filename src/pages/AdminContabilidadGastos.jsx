import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    TrendingDown,
    Calendar,
    Plus,
    Loader2,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    X,
    DollarSign,
    ArrowRight,
    Repeat,
    Receipt,
    ChevronDown
} from 'lucide-react'
import { contabilidadService } from '../services/contabilidadService'

const AdminContabilidadGastos = () => {
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)

    // Estados para datos
    const [gastosFijos, setGastosFijos] = useState([])
    const [gastosVariables, setGastosVariables] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    // Cargar datos
    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [fijosRes, variablesRes] = await Promise.all([
                contabilidadService.getGastosFijos(true),
                contabilidadService.getGastosVariables({ mes: selectedMonth, anio: selectedYear })
            ])

            if (fijosRes.error) throw fijosRes.error
            if (variablesRes.error) throw variablesRes.error

            setGastosFijos(fijosRes.data || [])
            setGastosVariables(variablesRes.data || [])
        } catch (err) {
            console.error('Error loading gastos:', err)
            setError('Error al cargar los gastos')
        } finally {
            setLoading(false)
        }
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Calcular totales
    const totalGastosFijos = gastosFijos.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)
    const totalGastosVariables = gastosVariables.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)
    const totalGeneral = totalGastosFijos + totalGastosVariables
    const gastosPendientes = gastosVariables.filter(g => g.estado === 'pendiente').reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <TrendingDown className="text-red-600" size={28} />
                                </div>
                                Gestión de Gastos
                            </h1>
                            <p className="text-gray-600 mt-1">Administra los gastos fijos y variables de la empresa</p>
                        </div>
                        
                        <div className="flex gap-3">
                            {/* Selector de Mes/Año */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <Calendar size={18} className="text-gray-500" />
                                    <span className="font-medium">{months[selectedMonth]} {selectedYear}</span>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isDateMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 w-72">
                                        <div className="flex justify-between items-center mb-4">
                                            <button
                                                onClick={() => setSelectedYear(y => y - 1)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                ◀
                                            </button>
                                            <span className="font-bold text-lg">{selectedYear}</span>
                                            <button
                                                onClick={() => setSelectedYear(y => y + 1)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {shortMonths.map((month, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedMonth(idx)
                                                        setIsDateMenuOpen(false)
                                                    }}
                                                    className={`px-2 py-2 text-sm rounded-lg transition-colors ${
                                                        selectedMonth === idx
                                                            ? 'bg-red-600 text-white'
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {month}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <span className="text-red-700">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto">
                            <X size={18} className="text-red-400 hover:text-red-600" />
                        </button>
                    </div>
                )}

                {/* Resumen General */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">Total Gastos del Mes</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalGeneral)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <DollarSign size={28} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Gastos Fijos</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalGastosFijos)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Repeat size={28} />
                            </div>
                        </div>
                        <p className="text-blue-100 text-sm mt-2">{gastosFijos.length} gastos activos</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Gastos Variables</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalGastosVariables)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Receipt size={28} />
                            </div>
                        </div>
                        <p className="text-orange-100 text-sm mt-2">{gastosVariables.length} este mes</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg shadow-yellow-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Por Pagar</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(gastosPendientes)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Calendar size={28} />
                            </div>
                        </div>
                        <p className="text-yellow-100 text-sm mt-2">Pendientes de pago</p>
                    </div>
                </div>

                {/* Cards de acceso a submódulos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Card Gastos Fijos */}
                    <Link 
                        to="/admin/contabilidad/gastos/fijo"
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Repeat className="text-blue-600" size={32} />
                                </div>
                                <ArrowRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gastos Fijos</h3>
                            <p className="text-gray-600 mb-4">
                                Administra los gastos recurrentes mensuales como alquiler, servicios, sueldos, etc.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500">Total mensual</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalGastosFijos)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Activos</p>
                                    <p className="text-2xl font-bold text-gray-900">{gastosFijos.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-blue-50 text-blue-600 text-sm font-medium flex items-center gap-2">
                            <Plus size={16} />
                            Gestionar gastos fijos
                        </div>
                    </Link>

                    {/* Card Gastos Variables */}
                    <Link 
                        to="/admin/contabilidad/gastos/variable"
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <Receipt className="text-orange-600" size={32} />
                                </div>
                                <ArrowRight className="text-gray-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gastos Variables</h3>
                            <p className="text-gray-600 mb-4">
                                Registra gastos puntuales como compras, reparaciones, insumos, etc.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500">Total del mes</p>
                                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalGastosVariables)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Registros</p>
                                    <p className="text-2xl font-bold text-gray-900">{gastosVariables.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-orange-50 text-orange-600 text-sm font-medium flex items-center gap-2">
                            <Plus size={16} />
                            Gestionar gastos variables
                        </div>
                    </Link>
                </div>

                {/* Vista rápida de últimos gastos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Últimos Gastos Variables del Mes</h3>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : gastosVariables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Receipt size={48} className="mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No hay gastos variables este mes</p>
                            <Link 
                                to="/admin/contabilidad/gastos/variable" 
                                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Agregar gasto variable
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {gastosVariables.slice(0, 5).map((gasto) => (
                                <div key={gasto.id_gasto} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                                {gasto.categoria === 'insumos' ? '📦' :
                                                 gasto.categoria === 'transporte' ? '🚚' :
                                                 gasto.categoria === 'reparaciones' ? '🔧' :
                                                 gasto.categoria === 'compras' ? '🛒' : '📋'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{gasto.nombre}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(gasto.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                                    {gasto.proveedor && ` • ${gasto.proveedor}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatCurrency(gasto.monto)}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                gasto.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {gasto.estado}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {gastosVariables.length > 5 && (
                                <Link 
                                    to="/admin/contabilidad/gastos/variable"
                                    className="block p-4 text-center text-orange-600 hover:bg-orange-50 transition-colors font-medium"
                                >
                                    Ver todos los gastos ({gastosVariables.length})
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminContabilidadGastos
