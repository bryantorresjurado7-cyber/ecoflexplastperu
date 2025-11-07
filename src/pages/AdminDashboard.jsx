import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import {
  Package,
  ShoppingCart,
  Users,
  AlertCircle,
  FileText
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosStockBajo: 0,
    cotizacionesPendientes: 0,
    contactosNuevos: 0,
    totalPedidos: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Productos totales
      const { count: productosCount } = await supabase
        .from('productos_db')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
      
      // Productos con stock bajo
      const { count: stockBajoCount } = await supabase
        .from('productos_db')
        .select('*', { count: 'exact', head: true })
        .eq('stock_alerta', true)
        .eq('activo', true)
      
      // Cotizaciones pendientes
      const { count: cotizacionesCount } = await supabase
        .from('cotizacion')
        .select('*', { count: 'exact', head: true })
      
      // Pedidos totales
      const { count: totalPedidosCount } = await supabase
        .from('pedido')
        .select('*', { count: 'exact', head: true })
      
      setStats({
        totalProductos: productosCount || 0,
        productosStockBajo: stockBajoCount || 0,
        cotizacionesPendientes: cotizacionesCount || 0,
        contactosNuevos: 0,
        totalPedidos: totalPedidosCount || 0
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total Productos',
      value: stats.totalProductos,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/productos'
    },
    {
      title: 'Stock Bajo',
      value: stats.productosStockBajo,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      alert: stats.productosStockBajo > 0
    },
    {
      title: 'Total Pedidos',
      value: stats.totalPedidos,
      icon: FileText,
      color: 'bg-indigo-500',
      link: '/admin/dashboard/ventas'
    },
    {
      title: 'Cotizaciones',
      value: stats.cotizacionesPendientes,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/cotizaciones'
    },
    {
      title: 'Contactos Nuevos',
      value: stats.contactosNuevos,
      icon: Users,
      color: 'bg-purple-500'
    }
  ]

  return (
    <AdminLayout>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <h2 className="text-2xl font-bold text-negro-principal">
            Dashboard de Administración
          </h2>
          <p className="text-gris-medio mt-1">
            Bienvenido de nuevo, {user?.nombre}
          </p>
        </header>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-xl shadow-card p-6 ${
                        stat.link ? 'cursor-pointer hover:shadow-card-hover' : ''
                      } transition-shadow`}
                      onClick={() => stat.link && navigate(stat.link)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.color} p-3 rounded-lg`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        {stat.alert && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                            ¡Alerta!
                          </span>
                        )}
                      </div>
                      <h3 className="text-gris-medio text-sm font-medium mb-1">
                        {stat.title}
                      </h3>
                      <p className="text-3xl font-bold text-negro-principal">
{stat.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productos con stock bajo */}
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-negro-principal">
                      Productos con Stock Bajo
                    </h3>
                    <AlertCircle className="text-yellow-500" size={24} />
                  </div>
                  {stats.productosStockBajo === 0 ? (
                    <p className="text-gris-medio text-sm">
                      ✅ Todos los productos tienen stock suficiente
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gris-medio">
                        {stats.productosStockBajo} producto(s) requieren atención
                      </p>
                      <Link
                        to="/admin/productos?filter=stock-bajo"
                        className="inline-block text-verde-principal hover:text-verde-hover font-medium text-sm"
                      >
                        Ver productos →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Acciones rápidas */}
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-negro-principal mb-4">
                    Acciones Rápidas
                  </h3>
                  <div className="space-y-3">
                    <Link
                      to="/admin/productos/nuevo"
                      className="block w-full btn-primary text-center"
                    >
                      + Agregar Producto
                    </Link>
                    <Link
                      to="/admin/productos"
                      className="block w-full btn-secondary text-center"
                    >
                      Ver Todos los Productos
                    </Link>
                    <Link
                      to="/admin/venta"
                      className="block w-full btn-primary text-center bg-verde-principal hover:bg-verde-hover"
                    >
                      + Nueva Venta
                    </Link>
                    <Link
                      to="/admin/ventas"
                      className="block w-full btn-secondary text-center"
                    >
                      Ver Historial de Ventas
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
    </AdminLayout>
  )
}

export default AdminDashboard

