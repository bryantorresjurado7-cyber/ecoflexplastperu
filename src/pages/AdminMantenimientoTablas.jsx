import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { Database, Settings, Layers, ChevronRight } from 'lucide-react'

const AdminMantenimientoTablas = () => {
    const tables = [
        {
            id: 'parametrica',
            nombre: 'Tabla Paramétrica',
            descripcion: 'Gestiona parámetros del sistema como tipos de consulta, documentos, roles, etc.',
            icono: Settings,
            ruta: '/admin/mantenimiento-tablas/parametrica',
            color: 'bg-blue-500',
            stats: 'Datos maestros'
        },
        {
            id: 'categorias_productos',
            nombre: 'Categorías de Productos',
            descripcion: 'Administra las categorías de productos disponibles en el catálogo',
            icono: Layers,
            ruta: '/admin/mantenimiento-tablas/categorias_productos',
            color: 'bg-green-500',
            stats: 'Catálogo'
        }
    ]

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Database className="text-verde-principal" size={32} />
                        <h1 className="text-3xl font-bold text-negro-principal">
                            Mantenimiento de Tablas
                        </h1>
                    </div>
                    <p className="text-gris-medio ml-11">
                        Gestiona los datos maestros y configuraciones del sistema
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
                    {tables.map((table) => {
                        const Icon = table.icono
                        return (
                            <Link
                                key={table.id}
                                to={table.ruta}
                                className="group bg-white rounded-2xl shadow-card hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-verde-principal/30"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 ${table.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={28} />
                                        </div>
                                        <ChevronRight 
                                            size={24} 
                                            className="text-gris-claro group-hover:text-verde-principal group-hover:translate-x-1 transition-all duration-300" 
                                        />
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-negro-principal mb-2 group-hover:text-verde-principal transition-colors">
                                        {table.nombre}
                                    </h3>
                                    
                                    <p className="text-gris-medio text-sm mb-4 leading-relaxed">
                                        {table.descripcion}
                                    </p>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-fondo-claro text-gris-oscuro text-xs font-medium rounded-full">
                                            {table.stats}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="h-1 bg-gradient-to-r from-transparent via-verde-principal/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        )
                    })}
                </div>

                {/* Info Card */}
                <div className="mt-8 max-w-5xl">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                    <Database size={20} />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-2">
                                    Información Importante
                                </h4>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                    El mantenimiento de estas tablas afecta directamente el funcionamiento del sistema. 
                                    Los cambios realizados se reflejarán inmediatamente en toda la aplicación.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminMantenimientoTablas
