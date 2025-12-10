import { useState, useEffect } from 'react'
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
  Cog,
  ArrowLeftRight,
  Wallet
} from 'lucide-react'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // State for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Handle resize to detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false) // Close sidebar by default on mobile
      } else {
        setSidebarOpen(true) // Open sidebar by default on desktop
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Check on mount

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      title: 'Movimientos',
      icon: ArrowLeftRight,
      path: '/admin/movimientos'
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
      title: 'Caja Chica',
      icon: Wallet,
      path: '/admin/caja-chica'
    },
    {
      title: 'Configuración',
      icon: Settings,
      path: '/admin/configuracion'
    }
  ]

  // Sidebar classes calculation
  const getSidebarClasses = () => {
    const baseClasses = "bg-negro-principal text-white transition-all duration-300 flex flex-col fixed h-full z-50 print:hidden"

    if (isMobile) {
      // Mobile: Fixed width, slide in/out
      return `${baseClasses} w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
    } else {
      // Desktop: Collapsible width
      return `${baseClasses} ${sidebarOpen ? 'w-64' : 'w-20'}`
    }
  }

  // Main content margin calculation
  const getMainClasses = () => {
    const baseClasses = "flex-1 transition-all duration-300 min-h-screen print:ml-0"

    if (isMobile) {
      return `${baseClasses} ml-0`
    } else {
      return `${baseClasses} ${sidebarOpen ? 'ml-64' : 'ml-20'}`
    }
  }

  return (
    <div className="min-h-screen bg-fondo-claro flex relative">
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={getSidebarClasses()}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gris-oscuro">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-verde-principal">EcoFlexPlast</h1>
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${isActive
                  ? 'bg-verde-principal text-white'
                  : 'text-gris-claro hover:bg-gris-oscuro hover:text-white'
                  }`}
                title={!sidebarOpen && !isMobile ? item.title : ''}
              >
                <Icon size={20} className="min-w-[20px]" />
                {(sidebarOpen || isMobile) && <span className="font-medium">{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gris-oscuro">
          {(sidebarOpen || isMobile) && (
            <div className="mb-3">
              <p className="text-sm text-gris-claro">Conectado como:</p>
              <p className="text-sm font-semibold text-white truncate">
                {user?.email || 'Admin'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gris-oscuro hover:text-red-300 rounded-lg transition-colors ${(!sidebarOpen && !isMobile) ? 'justify-center' : ''
              }`}
            title={!sidebarOpen && !isMobile ? 'Cerrar Sesión' : ''}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {(sidebarOpen || isMobile) && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={getMainClasses()}>
        {/* Mobile Header Toggle */}
        {isMobile && !sidebarOpen && (
          <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-30 print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-negro-principal"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-bold text-negro-principal">EcoFlexPack</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Header Actions (optional) */}
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}

export default AdminLayout

