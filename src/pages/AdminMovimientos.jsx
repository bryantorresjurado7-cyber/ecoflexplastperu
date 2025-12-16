import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { exportToXlsx } from '../lib/exportToXlsx'
import {
    Search,
    Calendar,
    Plus,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Download
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const AdminMovimientos = () => {
    const { user } = useAuth()
    const [movements, setMovements] = useState([])
    const [products, setProducts] = useState([])
    const [clientes, setClientes] = useState([])
    const [tiposMovimiento, setTiposMovimiento] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all') // 'all', 'INGRESO', 'SALIDA'
    const [filterCategoria, setFilterCategoria] = useState('all')
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    })

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        loadMovements()
        loadProducts()
        loadClientes()
        loadTiposMovimiento()
        loadCategorias()
    }, [dateRange])

    const loadProducts = async () => {
        try {
            // Cargar TODOS los productos sin filtros (igual que en AdminProductos)
            const { data, error } = await supabase
                .from('productos_db')
                .select('*')
                .order('categoria', { ascending: true })
                .order('nombre', { ascending: true })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error cargando productos:', error)
        }
    }

    const loadClientes = async () => {
        try {
            const { data, error } = await supabase
                .from('cliente')
                .select('id_cliente, nombre')
                .eq('estado', true)
                .order('nombre')

            if (error) throw error
            setClientes(data || [])
        } catch (error) {
            console.error('Error cargando clientes:', error)
        }
    }

    const loadTiposMovimiento = async () => {
        try {
            const { data, error } = await supabase
                .from('tipo_movimiento')
                .select('id_tipo_movimiento, codigo, nombre')
                .eq('activo', true)
                .order('codigo')

            if (error) throw error
            setTiposMovimiento(data || [])
        } catch (error) {
            console.error('Error cargando tipos de movimiento:', error)
        }
    }

    const loadCategorias = async () => {
        try {
            const { data, error } = await supabase
                .from('categorias_productos')
                .select('*')
                .order('orden', { ascending: true })

            if (error) throw error
            setCategorias(data || [])
        } catch (error) {
            console.error('Error cargando categorías:', error)
        }
    }

    const loadMovements = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('movimiento')
                .select(`
                    *,
                    tipo_movimiento(id_tipo_movimiento, codigo, nombre),
                    productos_db(id, nombre, tipo_producto),
                    cliente(id_cliente, nombre)
                `)
                .eq('estado', 1)
                .gte('fecha_movimiento', dateRange.start)
                .lte('fecha_movimiento', dateRange.end)
                .order('fecha_movimiento', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error

            // Normalizar datos para la vista
            const movimientosNormalizados = (data || []).map(m => ({
                id: m.id_movimiento,
                id_movimiento: m.id_movimiento,
                tipo: m.tipo_movimiento?.codigo || 'SIN_TIPO',
                tipoNombre: m.tipo_movimiento?.nombre || '',
                producto: m.producto || m.productos_db?.nombre || 'Sin producto',
                productoId: m.id_producto,
                cantidad: m.cantidad || 0,
                fecha: m.fecha_movimiento,
                fechaVencimiento: m.fecha_vencimiento,
                medida: m.medida || 'UND',
                solicitante: m.solicitante || m.cliente?.nombre || 'N/A',
                clienteId: m.id_cliente,
                observacion: m.observacion || '',
                estado: m.estado,
                referencia: `MOV-${m.id_movimiento}`
            }))

            setMovements(movimientosNormalizados)
        } catch (error) {
            console.error('Error cargando movimientos:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const filteredMovements = movements.filter(mov => {
        // 🔍 Búsqueda
        const searchMatch =
            mov.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mov.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mov.solicitante?.toLowerCase().includes(searchTerm.toLowerCase())

        // 🔄 Tipo de movimiento
        const typeMatch =
            filterType === 'all' ||
            mov.tipo?.toLowerCase() === filterType.toLowerCase()

        // 🗂️ Categoría
        let categoriaMatch = true
        if (filterCategoria !== 'all') {
            const producto = products.find(p => p.id === mov.productoId)
            categoriaMatch =
                producto?.categoria === filterCategoria ||
                producto?.slug === filterCategoria
        }

        return searchMatch && typeMatch && categoriaMatch
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedMovements = filteredMovements.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filterType, filterCategoria, dateRange])



    // Exportar a Excel
    const handleExport = () => {
        try {
            setExporting(true)
            const rows = filteredMovements.map(m => {
                const producto = products.find(p => p.id === m.productoId)
                const categoria = producto?.categoria || ''

                return [
                    m.producto || '',
                    categoria,
                    m.medida || '',
                    m.cantidad || 0,
                    m.fecha ? new Date(m.fecha).toLocaleDateString('es-PE') : '',
                    m.tipoNombre || m.tipo || '',
                    m.solicitante || '',
                    m.observacion || ''
                ]
            })

            const columns = [
                'Producto',
                'Categoria',
                'Medida',
                'Cantidad',
                'Fecha',
                'Movimiento',
                'Solicitante',
                'Observaciones'
            ]

            const dateStr = new Date().toISOString().split('T')[0]
            const filename = `movimientos_${dateStr}`

            exportToXlsx(filename, rows, columns)
        } catch (error) {
            console.error('Error exportando:', error)
        } finally {
            setExporting(false)
        }
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8 relative">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-negro-principal">
                                Movimientos
                            </h1>
                            <p className="text-gris-medio mt-1">Registro de ingresos y salidas de inventario</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto justify-end">
                            <Link
                                to="/admin/movimientos/nuevo"
                                className="bg-verde-principal text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg"
                            >
                                <Plus size={20} />
                                Nuevo Movimiento
                            </Link>
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="bg-white border border-verde-principal text-verde-principal hover:bg-verde-light px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={18} />
                                {exporting ? 'Exportando...' : 'Exportar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-xl shadow-card p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Búsqueda */}
                        <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                Búsqueda
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-claro" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por producto, código..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal placeholder-gris-claro focus:ring-2 focus:ring-verde-principal focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Rango de Fechas */}
                        <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                Rango de Fechas
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none text-sm"
                                    />
                                </div>
                                <span className="text-gris-medio">-</span>
                                <div className="relative flex-1">
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Movimiento */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                Movimiento
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none appearance-none"
                            >
                                <option value="all">Todos</option>
                                <option value="ingreso">Ingresos</option>
                                <option value="salida">Salidas</option>
                            </select>
                        </div>

                        {/* Categoría */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                Categoría
                            </label>
                            <select
                                value={filterCategoria}
                                onChange={(e) => setFilterCategoria(e.target.value)}
                                className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none appearance-none"
                            >
                                <option value="all">Todas</option>
                                {categorias.map(cat => (
                                    <option key={cat.slug || cat.id} value={cat.slug || cat.nombre}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gris-medio uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gris-medio uppercase tracking-wider">Categoria</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gris-medio uppercase tracking-wider">Medida</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gris-medio uppercase tracking-wider">Cantidad</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gris-medio uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gris-medio uppercase tracking-wider">Movimiento</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gris-medio uppercase tracking-wider">Solicitante</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gris-medio uppercase tracking-wider">Observaciones</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gris-medio uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-verde-principal"></div>
                                            <p className="mt-2 text-gris-medio">Cargando movimientos...</p>
                                        </td>
                                    </tr>
                                ) : filteredMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gris-medio">
                                            No se encontraron movimientos
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedMovements.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-fondo-claro transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-negro-principal">{mov.producto}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block w-2 h-0.5 bg-yellow-400"></span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                                    {mov.medida}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-verde-principal text-white rounded-full text-xs font-bold">
                                                    {mov.cantidad}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gris-oscuro">
                                                {mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-PE') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${mov.tipo === 'INGRESO' ? 'bg-verde-principal' : 'bg-red-500'
                                                    }`}>
                                                    {mov.tipoNombre || mov.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gris-oscuro">
                                                {mov.solicitante}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gris-medio">
                                                {mov.observacion || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 text-verde-principal hover:bg-green-50 rounded-lg transition-colors">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filteredMovements.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gris-medio">
                                    Mostrando <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredMovements.length)}</span> de <span className="font-medium">{filteredMovements.length}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                                        ? 'text-gris-claro cursor-not-allowed'
                                        : 'text-negro-principal hover:bg-fondo-claro'
                                        }`}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="text-sm font-medium px-2">
                                    {currentPage}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                                        ? 'text-gris-claro cursor-not-allowed'
                                        : 'text-negro-principal hover:bg-fondo-claro'
                                        }`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    )
}

export default AdminMovimientos
