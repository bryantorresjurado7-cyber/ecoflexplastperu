import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    Search,
    Calendar,
    Plus,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    ChevronDown
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const AdminMovimientos = () => {
    const [movements, setMovements] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all') // 'all', 'ingreso', 'salida'
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    })

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        producto_id: '',
        tipo_producto: '',
        perecible: 'NO PERECIBLE',
        medida: 'UND',
        cantidad: 1,
        tipo_movimiento: 'ingreso',
        solicitante: '',
        observaciones: ''
    })

    // Product Autocomplete State
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [showProductSuggestions, setShowProductSuggestions] = useState(false)
    const suggestionsRef = useRef(null)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)

    useEffect(() => {
        loadMovements()
        loadProducts()

        // Click outside to close suggestions
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowProductSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [dateRange])

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('productos_db')
                .select('id, nombre, tipo_producto, medida')
                .order('nombre')

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error cargando productos:', error)
        }
    }

    const loadMovements = async () => {
        setLoading(true)
        try {
            // 1. Fetch Salidas (Pedidos Confirmados)
            const { data: salidasData } = await supabase
                .from('pedido')
                .select('created_at, total, id_pedido, cliente(nombre)')
                .eq('estado_pedido', 'confirmado')
                .gte('created_at', dateRange.start)
                .lte('created_at', dateRange.end + 'T23:59:59')
                .order('created_at', { ascending: false })

            // 2. Fetch Ingresos (Producción Completada o Validada)
            const { data: ingresosData } = await supabase
                .from('produccion')
                .select('fecha_produccion, cantidad_producida, id_produccion, codigo_produccion, nombre')
                .in('estado', ['completada', 'validada'])
                .gte('fecha_produccion', dateRange.start)
                .lte('fecha_produccion', dateRange.end + 'T23:59:59')
                .order('fecha_produccion', { ascending: false })

            // 3. Combine and Normalize Data
            const movimientosSalida = (salidasData || []).map(s => ({
                id: `S-${s.id_pedido}`,
                originalId: s.id_pedido,
                tipo: 'SALIDA',
                producto: 'Varios (Pedido)', // Idealmente detallaríamos los items del pedido si tuviéramos la tabla de items a mano
                cantidad: 1, // Simplificación
                fecha: s.created_at,
                referencia: `Pedido #${s.id_pedido.substring(0, 8)}`,
                responsable: s.cliente?.nombre || 'Cliente',
                detalle: 'Venta confirmada',
                medida: 'UND'
            }))

            const movimientosIngreso = (ingresosData || []).map(p => ({
                id: `I-${p.id_produccion}`,
                originalId: p.id_produccion,
                tipo: 'INGRESO',
                producto: p.nombre || 'Producción',
                cantidad: p.cantidad_producida || 0,
                fecha: p.fecha_produccion,
                referencia: p.codigo_produccion || `Prod #${p.id_produccion}`,
                responsable: 'Planta',
                detalle: 'Producción finalizada',
                medida: 'UND'
            }))

            const todosMovimientos = [...movimientosSalida, ...movimientosIngreso]

            // Sort by date descending
            todosMovimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

            setMovements(todosMovimientos)
        } catch (error) {
            console.error('Error cargando movimientos:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const filteredMovements = movements.filter(m => {
        const matchSearch = m.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.responsable.toLowerCase().includes(searchTerm.toLowerCase())

        const matchType = filterType === 'all' || m.tipo.toLowerCase() === filterType.toLowerCase()

        return matchSearch && matchType
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedMovements = filteredMovements.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filterType, dateRange])

    const handleProductSelect = (product) => {
        setFormData({
            ...formData,
            producto_id: product.id,
            tipo_producto: product.tipo_producto,
            medida: product.medida
        })
        setProductSearchTerm(product.nombre)
        setShowProductSuggestions(false)
    }

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(productSearchTerm.toLowerCase())
    )

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-8 relative">
                {/* Top Action Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => {
                            setIsModalOpen(true)
                            setProductSearchTerm('')
                            setFormData({
                                producto_id: '',
                                tipo_producto: '',
                                perecible: 'NO PERECIBLE',
                                medida: 'UND',
                                cantidad: 1,
                                tipo_movimiento: 'ingreso',
                                solicitante: '',
                                observaciones: ''
                            })
                        }}
                        className="bg-negro-principal text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        Nuevo Movimiento
                    </button>
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

                        {/* Tipo Producto */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                Tipo Producto
                            </label>
                            <select
                                className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none appearance-none"
                            >
                                <option value="all">Todas</option>
                                {/* Placeholder for future product types */}
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
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gris-medio uppercase tracking-wider">Tipo</th>
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
                                                {new Date(mov.fecha).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${mov.tipo === 'INGRESO' ? 'bg-verde-principal' : 'bg-red-500'
                                                    }`}>
                                                    {mov.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gris-oscuro">
                                                {mov.responsable}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gris-medio">
                                                {mov.detalle}
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

                {/* Modal Nuevo Movimiento */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-negro-principal">Nuevo Movimiento</h2>
                                    <p className="text-sm text-gris-medio">Completa la información del movimiento a continuación</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-fondo-claro rounded-full transition-colors text-gris-medio hover:text-negro-principal"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Productos Autocomplete */}
                                <div className="relative" ref={suggestionsRef}>
                                    <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                        Productos
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Seleccionar Producto"
                                            value={productSearchTerm}
                                            onChange={(e) => {
                                                setProductSearchTerm(e.target.value)
                                                setShowProductSuggestions(true)
                                            }}
                                            onFocus={() => setShowProductSuggestions(true)}
                                            className="w-full px-4 py-3 bg-negro-principal text-white border-none rounded-lg focus:ring-2 focus:ring-verde-principal focus:outline-none placeholder-gray-400"
                                        />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showProductSuggestions && (
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map(product => (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => handleProductSelect(product)}
                                                        className="w-full text-left px-4 py-3 hover:bg-fondo-claro transition-colors border-b border-gray-50 last:border-none flex items-center justify-between group"
                                                    >
                                                        <span className="font-medium text-negro-principal group-hover:text-verde-principal transition-colors">
                                                            {product.nombre}
                                                        </span>
                                                        <span className="text-xs text-gris-medio bg-gray-100 px-2 py-1 rounded-full">
                                                            {product.tipo_producto || 'Sin tipo'}
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gris-medio text-center">
                                                    No se encontraron productos
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                            Tipo Producto
                                        </label>
                                        <select
                                            value={formData.tipo_producto}
                                            disabled
                                            className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-gris-oscuro focus:outline-none"
                                        >
                                            <option value="">{formData.tipo_producto || 'Seleccionar tipo'}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                            Perecible
                                        </label>
                                        <select
                                            value={formData.perecible}
                                            onChange={(e) => setFormData({ ...formData, perecible: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none"
                                        >
                                            <option value="NO PERECIBLE">NO PERECIBLE</option>
                                            <option value="PERECIBLE">PERECIBLE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                            Medida
                                        </label>
                                        <select
                                            value={formData.medida}
                                            disabled
                                            className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-gris-oscuro focus:outline-none"
                                        >
                                            <option value="UND">{formData.medida}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Cantidad */}
                                <div>
                                    <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.cantidad}
                                        onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none"
                                    />
                                </div>

                                {/* Ingreso/Salida */}
                                <div>
                                    <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                        Ingreso/Salida
                                    </label>
                                    <select
                                        value={formData.tipo_movimiento}
                                        onChange={(e) => setFormData({ ...formData, tipo_movimiento: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none"
                                    >
                                        <option value="ingreso">Ingreso</option>
                                        <option value="salida">Salida</option>
                                    </select>
                                </div>

                                {/* Solicitante */}
                                <div>
                                    <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                        Solicitante
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente o escribir manualmente"
                                        value={formData.solicitante}
                                        onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none"
                                    />
                                </div>

                                {/* Observaciones */}
                                <div>
                                    <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                        Observaciones
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Escriba observaciones adicionales sobre el movimiento..."
                                        value={formData.observaciones}
                                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                <span className="text-xs text-gris-medio">
                                    Última Actualización: {new Date().toLocaleDateString()} Por Admin
                                </span>
                                <button className="bg-verde-principal text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg">
                                    Guardar Movimiento
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminMovimientos
