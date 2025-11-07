import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  ArrowLeft,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const AdminDashboardVentas = () => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPedidos: 0,
    confirmados: 0,
    pendientes: 0,
    totalVentas: 0,
    ventasMes: 0,
    metaVentasPorcentaje: 0
  })
  const [recentPedidos, setRecentPedidos] = useState([])
  const [allPedidos, setAllPedidos] = useState([])
  const [salesByMonth, setSalesByMonth] = useState([])
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadPedidosStats()
  }, [dateRange])

  const loadPedidosStats = async () => {
    setLoading(true)
    try {
      // Total de pedidos
      const { count: total } = await supabase
        .from('pedido')
        .select('*', { count: 'exact', head: true })
      
      // Pedidos confirmados
      const { count: confirmados } = await supabase
        .from('pedido')
        .select('*', { count: 'exact', head: true })
        .eq('estado_pedido', 'confirmado')
      
      // Pedidos pendientes
      const { count: pendientes } = await supabase
        .from('pedido')
        .select('*', { count: 'exact', head: true })
        .eq('estado_pedido', 'pendiente')
      
      // Total de ventas (todos los confirmados)
      const { data: ventasData } = await supabase
        .from('pedido')
        .select('total')
        .eq('estado_pedido', 'confirmado')
      
      const totalVentas = ventasData?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
      
      // Ventas en el rango de fechas
      const { data: ventasRango } = await supabase
        .from('pedido')
        .select('total')
        .eq('estado_pedido', 'confirmado')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')
      
      const ventasMes = ventasRango?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
      
      // Calcular meta mensual realista basada en proyección histórica
      const metaMensualCalculada = await calcularMetaMensualRealista()
      
      // Pedidos recientes
      const { data: pedidosData } = await supabase
        .from('pedido')
        .select(`
          id_pedido,
          id_cliente,
          total,
          estado_pedido,
          created_at,
          cliente:cliente(nombre)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Calcular porcentaje de meta de ventas basado en el rango seleccionado
      const porcentajeMeta = calculateMetaVentasPorcentaje(ventasMes, dateRange.start, dateRange.end, metaMensualCalculada)
      
      setStats({
        totalPedidos: total || 0,
        confirmados: confirmados || 0,
        pendientes: pendientes || 0,
        totalVentas,
        ventasMes,
        metaVentasPorcentaje: porcentajeMeta
      })
      
      setRecentPedidos(pedidosData || [])
      
      // Obtener todos los pedidos para la tabla
      const { data: allPedidosData } = await supabase
        .from('pedido')
        .select(`
          id_pedido,
          id_cliente,
          total,
          estado_pedido,
          created_at,
          cliente:cliente(nombre)
        `)
        .order('created_at', { ascending: false })
      
      setAllPedidos(allPedidosData || [])
      
      // Calcular ventas por mes
      const salesByMonthData = calculateSalesByMonth(allPedidosData || [])
      setSalesByMonth(salesByMonthData)
      
    } catch (error) {
      console.error('Error cargando stats de pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularMetaMensualRealista = async () => {
    try {
      const fechaHoy = new Date()
      const inicioMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1)
      const finMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + 1, 0)
      
      // Obtener ventas del mes actual hasta hoy
      const { data: ventasMesActual } = await supabase
        .from('pedido')
        .select('total')
        .eq('estado_pedido', 'confirmado')
        .gte('created_at', inicioMesActual.toISOString())
        .lte('created_at', fechaHoy.toISOString())
      
      const ventasHastaHoy = ventasMesActual?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
      const diasTranscurridos = fechaHoy.getDate()
      const diasDelMes = finMesActual.getDate()
      
      // Proyección: Si llevamos X% del mes, proyectar ventas mensuales
      if (diasTranscurridos > 0 && ventasHastaHoy > 0) {
        const proyeccionMensual = (ventasHastaHoy / diasTranscurridos) * diasDelMes
        // Aplicar un factor de crecimiento conservador (1.2 = 20% más)
        return Math.max(proyeccionMensual * 1.2, ventasHastaHoy * 2)
      }
      
      // Si no hay ventas aún, obtener promedio histórico de últimos 3 meses
      const tresMesesAtras = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() - 3, 1)
      
      const { data: ventasHistoricas } = await supabase
        .from('pedido')
        .select('total, created_at')
        .eq('estado_pedido', 'confirmado')
        .gte('created_at', tresMesesAtras.toISOString())
        .lt('created_at', inicioMesActual.toISOString())
      
      if (ventasHistoricas && ventasHistoricas.length > 0) {
        // Agrupar ventas por mes
        const ventasPorMes = {}
        ventasHistoricas.forEach(pedido => {
          const fecha = new Date(pedido.created_at)
          const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`
          if (!ventasPorMes[mesKey]) {
            ventasPorMes[mesKey] = 0
          }
          ventasPorMes[mesKey] += pedido.total || 0
        })
        
        // Calcular promedio mensual
        const meses = Object.keys(ventasPorMes)
        if (meses.length > 0) {
          const sumaTotal = Object.values(ventasPorMes).reduce((sum, venta) => sum + venta, 0)
          const promedioMensual = sumaTotal / meses.length
          // Meta = promedio histórico + 10% de crecimiento
          return Math.max(promedioMensual * 1.1, 500)
        }
      }
      
      // Valor mínimo por defecto si no hay datos históricos
      return Math.max(ventasHastaHoy * 10, 500)
    } catch (error) {
      console.error('Error calculando meta realista:', error)
      // Valor por defecto conservador
      return 1000
    }
  }

  const calculateMetaVentasPorcentaje = (ventasReales, dateStart, dateEnd, metaMensual) => {
    // Calcular número de días en el rango seleccionado
    const startDate = new Date(dateStart)
    const endDate = new Date(dateEnd)
    const diasEnRango = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    
    // Calcular días del mes actual
    const diasDelMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    
    // Meta proporcional al rango de fechas seleccionado
    const metaProporcional = (metaMensual / diasDelMes) * diasEnRango
    
    // Calcular porcentaje de cumplimiento
    if (metaProporcional === 0) return 0
    const porcentaje = Math.min(100, Math.round((ventasReales / metaProporcional) * 100))
    
    return porcentaje
  }

  const calculateSalesByMonth = (pedidos) => {
    const monthlySales = {}
    
    pedidos.forEach(pedido => {
      const date = new Date(pedido.created_at)
      const monthYear = `${date.toLocaleString('es-PE', { month: 'short' })} ${date.getFullYear()}`
      
      if (!monthlySales[monthYear]) {
        monthlySales[monthYear] = { month: monthYear, total: 0, count: 0 }
      }
      
      monthlySales[monthYear].total += pedido.total || 0
      monthlySales[monthYear].count += 1
    })
    
    // Convertir a array y ordenar
    const result = Object.values(monthlySales).sort((a, b) => {
      return new Date(a.month) - new Date(b.month)
    })
    
    return result.slice(-12) // Últimos 12 meses
  }

  const getStatusColor = (estado) => {
    const colors = {
      confirmado: 'bg-green-500',
      pendiente: 'bg-yellow-500',
      enviado: 'bg-blue-500',
      entregado: 'bg-emerald-500',
      cancelado: 'bg-red-500'
    }
    return colors[estado] || 'bg-gray-500'
  }

  const getStatusLabel = (estado) => {
    const labels = {
      confirmado: 'Confirmado',
      pendiente: 'Pendiente',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    }
    return labels[estado] || estado
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-fondo-claro">
        {/* Header */}
        <div className="bg-white border-b border-gris-claro">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                  <DollarSign className="text-verde-principal" size={32} />
                  Dashboard de Ventas
                </h1>
                <p className="text-gris-medio mt-1">Análisis y control de ventas</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 border border-gris-claro rounded-lg hover:bg-fondo-claro transition-colors"
                >
                  <ArrowLeft size={20} />
                  Volver
                </button>
                <button
                  onClick={() => navigate('/admin/venta')}
                  className="bg-verde-principal hover:bg-verde-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nueva Venta
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - KPIs and Filters */}
              <div className="lg:col-span-2 space-y-6">
                {/* KPIs Superiores - Similar a la imagen */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="text-blue-500" size={28} />
                      <h3 className="text-sm font-medium text-gris-medio uppercase">SATISFACCIÓN CLIENTE</h3>
                    </div>
                    <p className="text-6xl font-bold text-verde-principal mb-2">
                      {stats.totalPedidos > 0 ? Math.round((stats.confirmados / stats.totalPedidos) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gris-medio">Basado en pedidos confirmados</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="text-emerald-500" size={28} />
                      <h3 className="text-sm font-medium text-gris-medio uppercase">META VENTAS</h3>
                    </div>
                    <p className="text-6xl font-bold text-verde-principal mb-2">{stats.metaVentasPorcentaje}%</p>
                    <p className="text-xs text-gris-medio">Objetivo del rango seleccionado</p>
                  </div>
                </div>

                {/* Filtros de Fecha */}
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Calendar className="text-verde-principal" size={24} />
                    <label className="text-lg font-semibold text-negro-principal">Filtrar por rango de fechas</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gris-medio block mb-2">Desde</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => {
                          const selectedDate = e.target.value
                          const today = new Date().toISOString().split('T')[0]
                          // Solo permitir fechas hasta hoy
                          const finalDate = selectedDate > today ? today : selectedDate
                          setDateRange({ ...dateRange, start: finalDate })
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gris-medio block mb-2">Hasta</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-4 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
                      />
                    </div>
                  </div>
                </div>

                {/* Gráfico Donut - Estados de Pedidos */}
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-negro-principal mb-4">Pedidos por Estado</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <svg width="256" height="256" className="transform -rotate-90">
                        {/* Total circumference */}
                        <circle
                          cx="128"
                          cy="128"
                          r="90"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="40"
                        />
                        {/* Confirmados */}
                        {stats.confirmados > 0 && (
                          <circle
                            cx="128"
                            cy="128"
                            r="90"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="40"
                            strokeDasharray={565.48}
                            strokeDashoffset={565.48 - (stats.confirmados / stats.totalPedidos) * 565.48}
                            className="transition-all duration-300"
                          />
                        )}
                        {/* Pendientes */}
                        {stats.pendientes > 0 && (
                          <circle
                            cx="128"
                            cy="128"
                            r="90"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="40"
                            strokeDasharray={565.48}
                            strokeDashoffset={565.48 - ((stats.confirmados + stats.pendientes) / stats.totalPedidos) * 565.48}
                            className="transition-all duration-300"
                            style={{ strokeDashoffset: 565.48 - ((stats.confirmados + stats.pendientes) / (stats.totalPedidos || 1)) * 565.48 }}
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-negro-principal">{stats.totalPedidos}</p>
                          <p className="text-sm text-gris-medio">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium">Confirmados</p>
                        <p className="text-xs text-gris-medio">{stats.confirmados}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <div>
                        <p className="text-sm font-medium">Pendientes</p>
                        <p className="text-xs text-gris-medio">{stats.pendientes}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <FileText size={28} />
                    </div>
                    <p className="text-indigo-100 text-sm mb-1">Total de Pedidos</p>
                    <p className="text-3xl font-bold">{stats.totalPedidos}</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircle size={28} />
                    </div>
                    <p className="text-emerald-100 text-sm mb-1">Confirmados</p>
                    <p className="text-3xl font-bold">{stats.confirmados}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Clock size={28} />
                    </div>
                    <p className="text-orange-100 text-sm mb-1">Pendientes</p>
                    <p className="text-3xl font-bold">{stats.pendientes}</p>
                  </div>

                  <div className="bg-gradient-to-br from-verde-principal to-verde-hover rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign size={28} />
                    </div>
                    <p className="text-green-100 text-sm mb-1">Total Ventas</p>
                    <p className="text-3xl font-bold">S/ {stats.totalVentas.toFixed(2)}</p>
                  </div>
                </div>

                {/* Gráfico de Barras - Comparación */}
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-negro-principal mb-4">Resumen de Ventas</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-fondo-claro rounded-lg">
                      <p className="text-2xl font-bold text-verde-principal">{formatCurrency(stats.totalVentas)}</p>
                      <p className="text-sm text-gris-medio mt-1">Total General</p>
                    </div>
                    <div className="text-center p-4 bg-fondo-claro rounded-lg">
                      <p className="text-2xl font-bold text-blue-500">{formatCurrency(stats.ventasMes)}</p>
                      <p className="text-sm text-gris-medio mt-1">Este Mes</p>
                    </div>
                    <div className="text-center p-4 bg-fondo-claro rounded-lg">
                      <p className="text-2xl font-bold text-purple-500">{stats.totalPedidos}</p>
                      <p className="text-sm text-gris-medio mt-1">Pedidos</p>
                    </div>
                  </div>
                </div>

                {/* Resumen de Ventas por Fecha */}
                <div className="bg-white border border-gris-claro rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-verde-principal" size={24} />
                    <h4 className="text-lg font-semibold text-negro-principal">Ventas en el rango seleccionado</h4>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-verde-principal">
                      {formatCurrency(stats.ventasMes)}
                    </span>
                    <span className="text-gris-medio text-sm">
                      ({dateRange.start} hasta {dateRange.end})
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Recent Orders */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-negro-principal mb-4 flex items-center gap-2">
                    <Package size={20} />
                    Pedidos Recientes
                  </h3>
                  <div className="space-y-3">
                    {recentPedidos.map((pedido) => (
                      <div 
                        key={pedido.id_pedido} 
                        className="p-3 bg-fondo-claro rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/admin/ventas`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm text-negro-principal">{pedido.cliente?.nombre || 'Cliente'}</p>
                            <p className="text-xs text-gris-medio">
                              {new Date(pedido.created_at).toLocaleDateString('es-PE')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(pedido.estado_pedido)}`}>
                            {getStatusLabel(pedido.estado_pedido)}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-verde-principal">{formatCurrency(pedido.total)}</p>
                      </div>
                    ))}
                    {recentPedidos.length === 0 && (
                      <p className="text-sm text-gris-medio text-center py-4">No hay pedidos recientes</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Pedidos - Debajo de los gráficos */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-negro-principal">Pedidos de Clientes</h3>
                <button
                  onClick={() => navigate('/admin/ventas')}
                  className="text-verde-principal hover:text-verde-hover text-sm font-medium"
                >
                  Ver todos →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gris-claro">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gris-medio">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gris-medio">Cliente</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gris-medio">Total ↑</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gris-medio">Estado</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gris-medio">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPedidos.slice(0, 10).map((pedido, index) => (
                      <tr key={pedido.id_pedido} className="border-b border-gris-claro hover:bg-fondo-claro transition-colors">
                        <td className="py-3 px-4 text-sm text-negro-principal">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-negro-principal">{pedido.cliente?.nombre || 'Cliente'}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-verde-principal">{formatCurrency(pedido.total)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(pedido.estado_pedido)}`}>
                            {getStatusLabel(pedido.estado_pedido)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-gris-medio">
                          {new Date(pedido.created_at).toLocaleDateString('es-PE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allPedidos.length === 0 && (
                  <p className="text-center py-8 text-gris-medio">No hay pedidos registrados</p>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico de Barras por Meses */}
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-negro-principal mb-4">Ventas por Mes</h3>
              {salesByMonth.length > 0 ? (
                <div className="space-y-4">
                  {salesByMonth.map((sales, index) => {
                    const maxSales = Math.max(...salesByMonth.map(s => s.total))
                    const percentage = (sales.total / maxSales) * 100
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-negro-principal">{sales.month}</span>
                          <span className="text-sm font-bold text-verde-principal">{formatCurrency(sales.total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-gradient-to-r from-verde-principal to-verde-hover h-6 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="flex h-full items-center justify-end pr-2 text-xs text-white font-medium">
                              {sales.count} pedidos
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gris-medio">No hay datos para mostrar</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboardVentas

