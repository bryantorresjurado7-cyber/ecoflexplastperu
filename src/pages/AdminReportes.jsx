import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import {
    Package,
    ShoppingCart,
    Users,
    AlertCircle,
    FileText,
    TrendingUp,
    Factory,
    Truck,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Download,
    ClipboardCheck
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { exportToExcel } from '../utils/exportToExcel'

const AdminReportes = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('month') // 'month', 'year', 'all'

    // Estado para todos los datos del reporte
    const [reportData, setReportData] = useState({
        kpis: {
            ventasTotal: 0,
            ventasCount: 0,
            produccionTotal: 0,
            produccionActiva: 0,
            inventarioValor: 0,
            inventarioItems: 0,
            clientesNuevos: 0
        },
        ventasRecientes: [],
        topProductos: [],
        produccionEstado: {
            planificada: 0,
            en_proceso: 0,
            completada: 0
        },
        movimientosRecientes: [],
        inventarioAlerta: []
    })

    useEffect(() => {
        loadDashboardData()
    }, [dateRange])

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            // Calcular fechas según rango
            const now = new Date()
            let startDate = new Date()

            if (dateRange === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            } else if (dateRange === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1)
            } else {
                startDate = new Date(2000, 0, 1) // Todo
            }

            const startDateStr = startDate.toISOString()

            // 1. KPIs y Ventas
            const { data: pedidos } = await supabase
                .from('pedido')
                .select('*, cliente(nombre)')
                .gte('created_at', startDateStr)
                .order('created_at', { ascending: false })

            const ventasTotal = pedidos?.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0) || 0
            const ventasCount = pedidos?.length || 0

            // 2. Producción
            const { data: produccion } = await supabase
                .from('orden_produccion')
                .select('*')
                .gte('created_at', startDateStr)

            const produccionTotal = produccion?.length || 0
            const produccionActiva = produccion?.filter(p => ['en_proceso', 'pendiente_validacion'].includes(p.estado)).length || 0
            const produccionEstado = {
                planificada: produccion?.filter(p => p.estado === 'planificada').length || 0,
                en_proceso: produccion?.filter(p => ['en_proceso', 'pendiente_validacion'].includes(p.estado)).length || 0,
                completada: produccion?.filter(p => ['completada', 'validada'].includes(p.estado)).length || 0
            }

            // 3. Inventario y Productos
            const { data: productos } = await supabase
                .from('productos_db')
                .select('*')
                .eq('activo', true)

            const inventarioItems = productos?.length || 0
            // Estimación simple de valor (precio_unitario * stock)
            const inventarioValor = productos?.reduce((sum, p) => sum + ((p.precio_unitario || 0) * (p.stock_disponible || 0)), 0) || 0
            const inventarioAlerta = productos?.filter(p => p.stock_alerta || (p.stock_disponible <= p.stock_minimo)) || []

            // Top Productos (simulado con datos locales de pedidos si no hay detalle accesible fácil, 
            // pero idealmente sería una query agrupada. Aquí usaremos productos con menos stock como proxy de "se vende mucho" o simplemente los alertas)
            // Mejor: Productos con más stock para "Valorizado"
            const topProductosValor = [...(productos || [])]
                .sort((a, b) => ((b.precio_unitario * b.stock_disponible) - (a.precio_unitario * a.stock_disponible)))
                .slice(0, 5)

            // 4. Clientes Nuevos
            const { count: clientesCount } = await supabase
                .from('cliente')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startDateStr)

            // 5. Movimientos Recientes
            const { data: movimientos } = await supabase
                .from('movimiento')
                .select('*, productos_db(nombre)')
                .order('created_at', { ascending: false })
                .limit(5)

            setReportData({
                kpis: {
                    ventasTotal,
                    ventasCount,
                    produccionTotal,
                    produccionActiva,
                    inventarioValor,
                    inventarioItems,
                    clientesNuevos: clientesCount || 0
                },
                ventasRecientes: pedidos?.slice(0, 5) || [],
                topProductos: topProductosValor,
                produccionEstado,
                movimientosRecientes: movimientos || [],
                inventarioAlerta: inventarioAlerta.slice(0, 5)
            })

        } catch (error) {
            console.error('Error cargando dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount || 0)
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header Dashboard */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-negro-principal">Panel de Reportes</h1>
                        <p className="text-gris-medio mt-1">
                            Visión general del estado de la empresa
                        </p>
                    </div>

                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                        <button
                            onClick={() => setDateRange('month')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateRange === 'month'
                                    ? 'bg-negro-principal text-white shadow-md'
                                    : 'text-gris-medio hover:text-negro-principal hover:bg-gray-50'
                                }`}
                        >
                            Este Mes
                        </button>
                        <button
                            onClick={() => setDateRange('year')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateRange === 'year'
                                    ? 'bg-negro-principal text-white shadow-md'
                                    : 'text-gris-medio hover:text-negro-principal hover:bg-gray-50'
                                }`}
                        >
                            Este Año
                        </button>
                        <button
                            onClick={() => setDateRange('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateRange === 'all'
                                    ? 'bg-negro-principal text-white shadow-md'
                                    : 'text-gris-medio hover:text-negro-principal hover:bg-gray-50'
                                }`}
                        >
                            Histórico
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-blue-500 hover:shadow-card-hover transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gris-medio">Ventas Totales</p>
                                        <h3 className="text-2xl font-bold text-negro-principal mt-1">
                                            {formatCurrency(reportData.kpis.ventasTotal)}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <DollarSign size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                                    <TrendingUp size={16} />
                                    <span>{reportData.kpis.ventasCount} pedidos registrados</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-green-500 hover:shadow-card-hover transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gris-medio">Producción Activa</p>
                                        <h3 className="text-2xl font-bold text-negro-principal mt-1">
                                            {reportData.kpis.produccionActiva} Órdenes
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <Factory size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gris-medio">
                                    <span>De {reportData.kpis.produccionTotal} totales en el periodo</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-purple-500 hover:shadow-card-hover transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gris-medio">Valor Inventario</p>
                                        <h3 className="text-2xl font-bold text-negro-principal mt-1">
                                            {formatCurrency(reportData.kpis.inventarioValor)}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Package size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gris-medio">
                                    <span>{reportData.kpis.inventarioItems} productos en catálogo</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-orange-500 hover:shadow-card-hover transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gris-medio">Nuevos Clientes</p>
                                        <h3 className="text-2xl font-bold text-negro-principal mt-1">
                                            +{reportData.kpis.clientesNuevos}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                                    <Activity size={16} />
                                    <span>Crecimiento de cartera</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid Principal */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Columna Izquierda (2/3) */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* Reporte de Ventas Recientes */}
                                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-negro-principal flex items-center gap-2">
                                            <ShoppingCart size={20} className="text-blue-600" />
                                            Últimas Ventas
                                        </h3>
                                        <Link to="/admin/ventas" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gris-medio uppercase">Cliente</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gris-medio uppercase">Fecha</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gris-medio uppercase">Estado</th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gris-medio uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {reportData.ventasRecientes.length > 0 ? (
                                                    reportData.ventasRecientes.map((venta) => (
                                                        <tr key={venta.id_pedido} className="hover:bg-fondo-claro transition-colors">
                                                            <td className="px-6 py-3 text-sm font-medium text-negro-principal">
                                                                {venta.cliente?.nombre || 'Cliente Final'}
                                                            </td>
                                                            <td className="px-6 py-3 text-sm text-center text-gris-medio">
                                                                {formatDate(venta.fecha_pedido || venta.created_at)}
                                                            </td>
                                                            <td className="px-6 py-3 text-center">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${venta.estado_pedido === 'completado' || venta.estado_pedido === 'entregado'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {venta.estado_pedido}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 text-sm text-right font-bold text-negro-principal">
                                                                {formatCurrency(venta.total)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="4" className="text-center py-8 text-gris-medio">No hay ventas recientes</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Reporte de Producción */}
                                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-negro-principal flex items-center gap-2">
                                            <Factory size={20} className="text-green-600" />
                                            Resumen de Producción
                                        </h3>
                                        <Link to="/admin/produccion" className="text-sm text-green-600 hover:underline">Gestionar</Link>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="p-4 bg-gray-50 rounded-lg text-center">
                                                <p className="text-sm text-gris-medio mb-1">Planificadas</p>
                                                <p className="text-2xl font-bold text-negro-principal">{reportData.produccionEstado.planificada}</p>
                                            </div>
                                            <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                                                <p className="text-sm text-blue-700 mb-1">En Proceso</p>
                                                <p className="text-2xl font-bold text-blue-800">{reportData.produccionEstado.en_proceso}</p>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
                                                <p className="text-sm text-green-700 mb-1">Completadas</p>
                                                <p className="text-2xl font-bold text-green-800">{reportData.produccionEstado.completada}</p>
                                            </div>
                                        </div>
                                        {/* Barra de progreso visual */}
                                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${(reportData.produccionEstado.en_proceso / Math.max(reportData.kpis.produccionTotal, 1)) * 100}%` }}
                                                title="En Proceso"
                                            ></div>
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${(reportData.produccionEstado.completada / Math.max(reportData.kpis.produccionTotal, 1)) * 100}%` }}
                                                title="Completadas"
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gris-medio mt-2">
                                            <span>Progreso del periodo</span>
                                            <span>{reportData.produccionEstado.completada} de {reportData.kpis.produccionTotal} totales</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Columna Derecha (1/3) */}
                            <div className="space-y-8">

                                {/* Alertas de Inventario */}
                                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-red-50 flex items-center justify-between">
                                        <h3 className="font-bold text-red-800 flex items-center gap-2">
                                            <AlertCircle size={20} />
                                            Alertas de Stock
                                        </h3>
                                        <Link to="/admin/productos" className="text-xs font-semibold text-red-800 hover:underline">Ver inventario</Link>
                                    </div>
                                    <div className="p-0">
                                        {reportData.inventarioAlerta.length > 0 ? (
                                            <div className="divide-y divide-gray-100">
                                                {reportData.inventarioAlerta.map(prod => (
                                                    <div key={prod.id} className="p-4 hover:bg-red-50/30 transition-colors">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-medium text-sm text-negro-principal">{prod.nombre}</p>
                                                                <p className="text-xs text-gris-medio">SKU: {prod.codigo}</p>
                                                            </div>
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                                                {prod.stock_disponible} unid.
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-red-500 h-1.5 rounded-full"
                                                                style={{ width: `${Math.min((prod.stock_disponible / (prod.stock_minimo || 1)) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-red-600 mt-1">Mínimo requerido: {prod.stock_minimo}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center">
                                                <ClipboardCheck size={32} className="mx-auto text-green-500 mb-2" />
                                                <p className="text-sm text-gris-medio">Todo el inventario está en niveles óptimos.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Movimientos Recientes */}
                                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                        <Truck size={20} className="text-gray-600" />
                                        <h3 className="font-bold text-negro-principal">Movimientos</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {reportData.movimientosRecientes.map(mov => (
                                            <div key={mov.id_movimiento} className="p-4 flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${mov.id_tipo_movimiento === 1 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {mov.id_tipo_movimiento === 1 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-negro-principal truncate">{mov.productos_db?.nombre || mov.producto}</p>
                                                    <p className="text-xs text-gris-medio">{formatDate(mov.fecha_movimiento)}</p>
                                                </div>
                                                <span className="font-bold text-sm">
                                                    {mov.id_tipo_movimiento === 1 ? '+' : '-'}{mov.cantidad}
                                                </span>
                                            </div>
                                        ))}
                                        <Link to="/admin/movimientos" className="block p-3 text-center text-sm text-gris-oscuro hover:bg-gray-50 transition-colors">
                                            Ver historial completo
                                        </Link>
                                    </div>
                                </div>

                                {/* Top Productos Valorizados */}
                                <div className="bg-white rounded-xl shadow-card p-6">
                                    <h3 className="font-bold text-negro-principal mb-4 flex items-center gap-2">
                                        <DollarSign size={20} className="text-purple-600" />
                                        Productos Más Valiosos
                                    </h3>
                                    <div className="space-y-4">
                                        {reportData.topProductos.map((prod, idx) => (
                                            <div key={prod.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-negro-principal truncate max-w-[120px]">{prod.nombre}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-purple-700">{formatCurrency(prod.precio_unitario * prod.stock_disponible)}</p>
                                                    <p className="text-xs text-gris-medio">{prod.stock_disponible} unid.</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminReportes
