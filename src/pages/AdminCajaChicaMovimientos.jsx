import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    ArrowLeft,
    Plus,
    Minus,
    Search,
    Download,
    FileText,
    Check,
    X,
    Clock,
    Upload,
    Save,
    Trash2
} from 'lucide-react'
import { exportToExcel } from '../utils/exportToExcel'

const AdminCajaChicaMovimientos = () => {
    const [movimientos, setMovimientos] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterTipo, setFilterTipo] = useState('all') // all, ingreso, egreso
    const [filterEstado, setFilterEstado] = useState('all')
    const [filterResponsable, setFilterResponsable] = useState('all')
    const [filterFechaInicio, setFilterFechaInicio] = useState('')
    const [filterFechaFin, setFilterFechaFin] = useState('')
    const [searchTerm, setSearchTerm] = useState('')



    // View Modal State
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedMovimiento, setSelectedMovimiento] = useState(null)

    useEffect(() => {
        // Simular carga de datos
        setTimeout(() => {
            setMovimientos([
                {
                    id: 1,
                    tipo: 'ingreso',
                    monto: 1000.00,
                    fecha: '2025-12-01T10:00:00',
                    motivo: 'Reposición de caja chica',
                    responsable: 'Juan Pérez',
                    categoria: 'Reposición',
                    estado: 'aprobado'
                },
                {
                    id: 2,
                    tipo: 'egreso',
                    monto: 45.50,
                    fecha: '2025-12-01T14:30:00',
                    motivo: 'Taxi para entrega de documentos',
                    responsable: 'Maria Garcia',
                    categoria: 'Transporte',
                    estado: 'pendiente'
                },
                {
                    id: 3,
                    tipo: 'egreso',
                    monto: 120.00,
                    fecha: '2025-11-30T16:00:00',
                    motivo: 'Compra de útiles de oficina',
                    responsable: 'Carlos Ruiz',
                    categoria: 'Materiales',
                    estado: 'aprobado'
                }
            ])
            setLoading(false)
        }, 1000)
    }, [])



    const handleView = (mov) => {
        setSelectedMovimiento(mov)
        setShowViewModal(true)
    }

    // Obtener responsables únicos
    const responsablesUnicos = [...new Set(movimientos.map(m => m.responsable))]

    const filteredMovimientos = movimientos.filter(m => {
        const matchesSearch = m.motivo.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTipo = filterTipo === 'all' || m.tipo === filterTipo
        const matchesEstado = filterEstado === 'all' || m.estado === filterEstado
        const matchesResponsable = filterResponsable === 'all' || m.responsable === filterResponsable

        const fechaMov = new Date(m.fecha).toISOString().split('T')[0]
        const matchesFechaInicio = !filterFechaInicio || fechaMov >= filterFechaInicio
        const matchesFechaFin = !filterFechaFin || fechaMov <= filterFechaFin

        return matchesSearch && matchesTipo && matchesEstado && matchesResponsable && matchesFechaInicio && matchesFechaFin
    })

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/admin/transacciones"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gris-medio"
                            >
                                <ArrowLeft size={24} />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-negro-principal">
                                    Movimientos de Caja Chica
                                </h1>
                                <p className="text-gris-medio mt-1">Gestión de movimientos, ingresos y egresos</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <Link
                                to="/admin/transacciones"
                                className="bg-verde-principal text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-verde-hover transition-colors shadow-lg whitespace-nowrap"
                            >
                                <Plus size={20} />
                                Nuevo Registro
                            </Link>
                            <button
                                onClick={() => {
                                    const columns = [
                                        { key: 'fecha', label: 'Fecha' },
                                        { key: 'tipo', label: 'Tipo' },
                                        { key: 'motivo', label: 'Motivo' },
                                        { key: 'responsable', label: 'Responsable' },
                                        { key: 'monto', label: 'Monto' },
                                        { key: 'estado', label: 'Estado' }
                                    ]
                                    exportToExcel(filteredMovimientos, columns, 'movimientos_caja_chica')
                                }}
                                className="bg-white hover:bg-gray-50 text-verde-principal border border-verde-principal px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg whitespace-nowrap"
                            >
                                <Download size={20} />
                                Exportar Excel
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-card p-4">
                        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                            <div className="flex flex-wrap items-center gap-3 w-full">
                                {/* Buscador */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por motivo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input-field pl-10 w-full"
                                    />
                                </div>

                                {/* Responsable */}
                                <select
                                    value={filterResponsable}
                                    onChange={(e) => setFilterResponsable(e.target.value)}
                                    className="input-field w-auto max-w-[150px]"
                                >
                                    <option value="all" className="hidden">Responsable</option>
                                    <option value="all">Todos</option>
                                    {responsablesUnicos.map(resp => (
                                        <option key={resp} value={resp}>{resp}</option>
                                    ))}
                                </select>

                                {/* Tipo */}
                                <select
                                    value={filterTipo}
                                    onChange={(e) => setFilterTipo(e.target.value)}
                                    className="input-field w-auto"
                                >
                                    <option value="all" className="hidden">Tipo</option>
                                    <option value="all">Todos</option>
                                    <option value="ingreso">Ingresos</option>
                                    <option value="egreso">Egresos</option>
                                </select>

                                {/* Estado */}
                                <select
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    className="input-field w-auto"
                                >
                                    <option value="all" className="hidden">Estado</option>
                                    <option value="all">Todos</option>
                                    <option value="aprobado">Aprobado</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="rechazado">Rechazado</option>
                                </select>

                                {/* Fechas */}
                                <div className="flex flex-col gap-1 h-full justify-center">
                                    <div className="flex items-center gap-2 bg-fondo-claro p-1 rounded-lg border border-gris-claro">
                                        <input
                                            type="date"
                                            value={filterFechaInicio}
                                            onChange={(e) => setFilterFechaInicio(e.target.value)}
                                            className="bg-transparent border-none text-sm focus:ring-0 p-1 text-gris-oscuro"
                                            title="Fecha Inicio"
                                        />
                                        <span className="text-gris-medio">-</span>
                                        <input
                                            type="date"
                                            value={filterFechaFin}
                                            onChange={(e) => setFilterFechaFin(e.target.value)}
                                            className="bg-transparent border-none text-sm focus:ring-0 p-1 text-gris-oscuro"
                                            title="Fecha Fin"
                                        />
                                    </div>
                                    {(filterFechaInicio || filterFechaFin) && (
                                        <button
                                            onClick={() => {
                                                setFilterFechaInicio('')
                                                setFilterFechaFin('')
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center justify-center gap-1 w-full"
                                        >
                                            <X size={12} />
                                            Limpiar fechas
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-fondo-gris">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                                        Motivo / Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                                        Responsable
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                                        Monto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-verde-principal"></div>
                                        </td>
                                    </tr>
                                ) : filteredMovimientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gris-medio">
                                            No se encontraron movimientos
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMovimientos.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-fondo-claro transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gris-medio">
                                                {new Date(mov.fecha).toLocaleDateString()} <br />
                                                <span className="text-xs">{new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${mov.tipo === 'ingreso'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {mov.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-negro-principal">{mov.motivo}</div>
                                                <div className="text-xs text-gris-medio">{mov.categoria}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gris-medio">
                                                {mov.responsable}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {mov.tipo === 'ingreso' ? '+' : '-'} S/ {mov.monto.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {mov.estado === 'aprobado' && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                                        <Check size={14} /> Aprobado
                                                    </span>
                                                )}
                                                {mov.estado === 'pendiente' && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full w-fit">
                                                        <Clock size={14} /> Pendiente
                                                    </span>
                                                )}
                                                {mov.estado === 'rechazado' && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                                                        <X size={14} /> Rechazado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleView(mov)}
                                                    className="text-azul hover:text-blue-900"
                                                    title="Ver detalle"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
                                                            setMovimientos(movimientos.filter(m => m.id !== mov.id))
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-700 ml-3"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>



                {/* View Modal */}
                {showViewModal && selectedMovimiento && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-negro-principal">
                                    Detalle del Movimiento
                                </h3>
                                <button onClick={() => setShowViewModal(false)} className="text-gris-medio hover:text-negro-principal">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-1">
                                            Tipo
                                        </label>
                                        <span className={`px-2 py-1 text-sm font-semibold rounded-full inline-block ${selectedMovimiento.tipo === 'ingreso'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedMovimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-1">
                                            Fecha
                                        </label>
                                        <p className="text-negro-principal font-medium">
                                            {new Date(selectedMovimiento.fecha).toLocaleDateString()}
                                            <span className="text-gris-medio text-sm ml-2">
                                                {new Date(selectedMovimiento.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-1">
                                        Monto
                                    </label>
                                    <p className={`text-2xl font-bold ${selectedMovimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {selectedMovimiento.tipo === 'ingreso' ? '+' : '-'} S/ {selectedMovimiento.monto.toFixed(2)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-1">
                                        Motivo / Descripción
                                    </label>
                                    <p className="text-negro-principal text-lg">
                                        {selectedMovimiento.motivo}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-1">
                                            Categoría
                                        </label>
                                        <p className="text-negro-principal font-medium">
                                            {selectedMovimiento.categoria}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-1">
                                            Responsable
                                        </label>
                                        <p className="text-negro-principal font-medium">
                                            {selectedMovimiento.responsable}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-1">
                                        Estado
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {selectedMovimiento.estado === 'aprobado' && (
                                            <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                <Check size={16} /> Aprobado
                                            </span>
                                        )}
                                        {selectedMovimiento.estado === 'pendiente' && (
                                            <span className="flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                                                <Clock size={16} /> Pendiente
                                            </span>
                                        )}
                                        {selectedMovimiento.estado === 'rechazado' && (
                                            <span className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                                <X size={16} /> Rechazado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {selectedMovimiento.comprobante && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gris-medio uppercase tracking-wider mb-2">
                                            Comprobante
                                        </label>
                                        <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-gray-50">
                                            <FileText className="text-gris-medio" size={24} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-negro-principal">comprobante.pdf</p>
                                                <p className="text-xs text-gris-medio">2.4 MB</p>
                                            </div>
                                            <button className="text-verde-principal hover:text-verde-hover font-medium text-sm">
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChicaMovimientos
