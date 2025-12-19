import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    DollarSign,
    History,
    User,
    Factory,
    FlaskConical,
    Truck,
    Cog,
    ArrowLeftRight,
    Database
} from 'lucide-react'

export const menuItems = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin/dashboard'
    },
    {
        id: 'contabilidad',
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
        id: 'productos',
        title: 'Productos',
        icon: Package,
        path: '/admin/productos'
    },
    {
        id: 'movimientos',
        title: 'Movimientos',
        icon: ArrowLeftRight,
        path: '/admin/movimientos'
    },
    {
        id: 'insumos',
        title: 'Insumos',
        icon: FlaskConical,
        path: '/admin/insumos'
    },
    {
        id: 'ventas',
        title: 'Ventas',
        icon: History,
        path: '/admin/ventas',
        subItems: [
            { title: 'Gestión de Ventas', path: '/admin/ventas' },
            { title: 'Proyección de ventas', path: '/admin/ventas/proyeccion' }
        ]
    },
    {
        id: 'cotizaciones',
        title: 'Cotizaciones',
        icon: ShoppingCart,
        path: '/admin/cotizaciones'
    },
    {
        id: 'clientes',
        title: 'Clientes',
        icon: User,
        path: '/admin/clientes'
    },
    {
        id: 'proveedores',
        title: 'Proveedores',
        icon: Truck,
        path: '/admin/proveedores'
    },
    {
        id: 'maquinarias',
        title: 'Maquinarias',
        icon: Cog,
        path: '/admin/maquinarias',
        subItems: [
            { title: 'Gestión de Maquinaria', path: '/admin/maquinarias' },
            { title: 'Generar orden de mantenimiento', path: '/admin/maquinarias/orden-mantenimiento' }
        ]
    },
    {
        id: 'produccion',
        title: 'Producción',
        icon: Factory,
        path: '/admin/produccion'
    },
    {
        id: 'usuarios',
        title: 'Usuarios',
        icon: User,
        path: '/admin/usuarios'
    },

    {
        id: 'mantenimiento',
        title: 'Mantenimiento',
        icon: Database,
        path: '/admin/mantenimiento-tablas',
        subItems: [
            { title: 'Tabla Paramétrica', path: '/admin/mantenimiento-tablas/parametrica' },
            { title: 'Categorías Productos', path: '/admin/mantenimiento-tablas/categorias_productos' },
            { title: 'Gestión de Módulos', path: '/admin/mantenimiento-tablas/modulos' }
        ]
    },
    {
        id: 'configuracion',
        title: 'Configuración',
        icon: Settings,
        path: '/admin/configuracion'
    }
]
