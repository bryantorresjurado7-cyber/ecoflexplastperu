import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  History,
  User,
  Factory,
  FlaskConical,
  Truck,
  Cog
} from 'lucide-react'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/admin/login')
    }
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard'
    },
    {
      title: 'Productos',
      icon: Package,
      path: '/admin/productos'
    },
    {
      title: 'Insumos',
      icon: FlaskConical,
      path: '/admin/insumos'
    },
    {
      title: 'Ventas',
      icon: History,
      path: '/admin/ventas'
    },
    {
      title: 'Cotizaciones',
      icon: ShoppingCart,
      path: '/admin/cotizaciones'
    },
    {
      title: 'Clientes',
      icon: User,
      path: '/admin/clientes'
    },
    {
      title: 'Proveedores',
      icon: Truck,
      path: '/admin/proveedores'
    },
    {
      title: 'Maquinarias',
      icon: Cog,
      path: '/admin/maquinarias'
    },
    {
      title: 'Producción',
      icon: Factory,
      path: '/admin/produccion'
    },
    {
      title: 'Usuarios',
      icon: User,
      path: '/admin/usuarios'
    },
    {
      title: 'Configuración',
      icon: Settings,
      path: '/admin/configuracion'
    }
  ]

  return (
    <div className="min-h-screen bg-fondo-claro flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-negro-principal text-white transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gris-oscuro">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-verde-principal">EcoFlexPack</h1>
          ) : (
            <div className="w-full flex justify-center">
              <Package className="text-verde-principal" size={24} />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gris-oscuro rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
                           (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-verde-principal text-white'
                    : 'text-gris-claro hover:bg-gris-oscuro hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gris-oscuro">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm text-gris-claro">Conectado como:</p>
              <p className="text-sm font-semibold text-white truncate">
                {user?.email || 'Admin'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gris-oscuro hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {children}
      </main>
    </div>
  )
}

export default AdminLayout

