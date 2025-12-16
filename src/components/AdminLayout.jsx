import { useState, useEffect, useRef } from 'react'
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
  Wallet,
  Bell,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // State for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // State for expanded menus (accordion)
  const [expandedMenus, setExpandedMenus] = useState({})

  const toggleSubmenu = (title) => {
    if (!sidebarOpen) setSidebarOpen(true);
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  // Sidebar scroll persistence
  const sidebarRef = useRef(null)

  useEffect(() => {
    const sidebar = sidebarRef.current
    if (sidebar) {
      const savedPosition = sessionStorage.getItem('adminSidebarScroll')
      if (savedPosition) {
        requestAnimationFrame(() => {
          sidebar.scrollTop = Number(savedPosition)
        })
      }

      const handleScroll = () => {
        sessionStorage.setItem('adminSidebarScroll', sidebar.scrollTop)
      }

      sidebar.addEventListener('scroll', handleScroll)
      return () => sidebar.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // State for notifications
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  // Mock Notifications Data based on Path
  const getNotificationsForPath = (path) => {
    if (path.includes('/transacciones') || path.includes('/caja-chica')) {
      return [
        { id: 1, text: 'Gasto pendiente de aprobación', time: '5 min', type: 'warning' },
        { id: 2, text: 'Arqueo de caja realizado', time: '2 horas', type: 'info' }
      ]
    }
    if (path.includes('/cotizaciones')) {
      return [
        { id: 1, text: 'Cotización #405 aprobada', time: '10 min', type: 'success' },
        { id: 2, text: 'Nueva solicitud de cotización', time: '30 min', type: 'info' }
      ]
    }
    if (path.includes('/ventas')) {
      return [
        { id: 1, text: 'Venta #1205 registrada', time: '2 min', type: 'success' },
        { id: 2, text: 'Devolución solicitada', time: '1 hora', type: 'alert' }
      ]
    }
    if (path.includes('/productos') || path.includes('/inventario')) {
      return [
        { id: 1, text: 'Stock bajo: Botella 500ml', time: '15 min', type: 'alert' },
        { id: 2, text: 'Nuevo producto agregado', time: '1 día', type: 'info' }
      ]
    }
    if (path.includes('/clientes')) {
      return [
        { id: 1, text: 'Nuevo cliente registrado', time: '20 min', type: 'info' },
        { id: 2, text: 'Datos de cliente actualizados', time: '3 horas', type: 'info' }
      ]
    }
    if (path === '/admin/dashboard') {
      return [
        { id: 1, text: 'Resumen diario generado', time: '1 hora', type: 'info' },
        { id: 2, text: 'Actualización del sistema', time: '1 día', type: 'info' }
      ]
    }
    return []
  }

  useEffect(() => {
    setNotifications(getNotificationsForPath(location.pathname))
  }, [location.pathname])

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
      title: 'Contabilidad',
      icon: DollarSign,
      path: '/admin/contabilidad',
      subItems: [
        { title: 'Caja', path: '/admin/contabilidad' },
        {
          title: 'Gastos',
          path: '/admin/contabilidad/gastos',
          subItems: [
            { title: 'Gasto Fijo', path: '/admin/contabilidad/gastos/fijo' },
            { title: 'Gasto Variable', path: '/admin/contabilidad/gastos/variable' }
          ]
        },
        { title: 'Ingresos', path: '/admin/contabilidad/ingresos' }
      ]
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
      path: '/admin/ventas', // Base path needed for active check, but item works as toggle
      subItems: [
        { title: 'Gestión de Ventas', path: '/admin/ventas' },
        { title: 'Proyección de ventas', path: '/admin/ventas/proyeccion' }
      ]
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
      path: '/admin/maquinarias',
      subItems: [
        { title: 'Gestión de Maquinaria', path: '/admin/maquinarias' },
        { title: 'Generar orden de mantenimiento', path: '/admin/maquinarias/orden-mantenimiento' }
      ]
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
      path: '/admin/transacciones/movimientos'
    },

    {
      title: 'Configuración',
      icon: Settings,
      path: '/admin/configuracion'
    }
  ]

  // Auto-expand menu based on current path
  useEffect(() => {
    // Buscar si la ruta actual pertenece a algún item con submenú
    // Buscar si la ruta actual pertenece a algún item con submenú
    const activeItem = menuItems.find(item =>
      item.subItems && item.subItems.some(sub => {
        if (sub.subItems) {
          // Check deeper level
          if (sub.subItems.some(subSub => location.pathname.startsWith(subSub.path))) {
            // Also expand the parent of the subSub item immediately? 
            // This effect only sets the top level expansion. We might need a separate check for 2nd level.
            return true
          }
        }
        return location.pathname.startsWith(sub.path)
      })
    )

    if (activeItem) {
      setExpandedMenus(prev => ({
        ...prev,
        [activeItem.title]: true
      }))

      // Check 2nd level expansion
      if (activeItem.subItems) {
        activeItem.subItems.forEach(sub => {
          if (sub.subItems && sub.subItems.some(deep => location.pathname.startsWith(deep.path))) {
            setExpandedMenus(prev => ({ ...prev, [sub.title]: true }))
          }
        })
      }
    }
  }, [location.pathname])

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
    const baseClasses = "flex-1 min-w-0 transition-all duration-300 min-h-screen print:ml-0"

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
        <nav ref={sidebarRef} className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon
            // Check if active (modified for parent items)
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))

            const hasSubItems = item.subItems && item.subItems.length > 0
            const isExpanded = expandedMenus[item.title]

            if (hasSubItems) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all whitespace-nowrap ${isActive ? 'text-white' : 'text-gris-claro hover:bg-gris-oscuro hover:text-white'
                      }`}
                    title={!sidebarOpen && !isMobile ? item.title : ''}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="min-w-[20px]" />
                      {(sidebarOpen || isMobile) && <span className="font-medium">{item.title}</span>}
                    </div>
                    {(sidebarOpen || isMobile) && (
                      isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </button>

                  {/* Submenu Items */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                    {(sidebarOpen || isMobile) && item.subItems.map(subItem => {
                      const hasDeepSubItems = subItem.subItems && subItem.subItems.length > 0
                      const isDeepExpanded = expandedMenus[subItem.title]

                      if (hasDeepSubItems) {
                        return (
                          <div key={subItem.title}>
                            <button
                              onClick={() => toggleSubmenu(subItem.title)}
                              className={`w-full flex items-center justify-between px-4 py-2 pl-12 text-sm rounded-lg transition-all whitespace-nowrap text-gris-medio hover:text-white hover:bg-gris-oscuro/50`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full bg-gris-medio`}></div>
                                <span className="font-normal">{subItem.title}</span>
                              </div>
                              {isDeepExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${isDeepExpanded ? 'max-h-40' : 'max-h-0'}`}>
                              {subItem.subItems.map(deepItem => {
                                const isDeepActive = location.pathname === deepItem.path
                                return (
                                  <Link
                                    key={deepItem.path}
                                    to={deepItem.path}
                                    onClick={() => isMobile && setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2 pl-16 text-xs rounded-lg transition-all whitespace-nowrap ${isDeepActive
                                      ? 'text-verde-principal font-medium'
                                      : 'text-gris-medio hover:text-white'
                                      }`}
                                  >
                                    <div className={`w-1 h-1 rounded-full ${isDeepActive ? 'bg-verde-principal' : 'bg-gray-500'}`}></div>
                                    {deepItem.title}
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )
                      }

                      const isSubActive = location.pathname === subItem.path
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 pl-12 text-sm rounded-lg transition-all whitespace-nowrap ${isSubActive
                            ? 'text-verde-principal font-medium'
                            : 'text-gris-medio hover:text-white'
                            }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-verde-principal' : 'bg-gris-medio'}`}></div>
                          {subItem.title}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

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

      {/* Notification Panel Global Overlay */}
      {/* Implementation detail: doing this cleanly requires changing the component state structure. 
        I'll modify the top of the file to add state first.
     */}
    </div>
  )
}

export default AdminLayout

