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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        id_producto: null,
        id_cliente: null,
        id_tipo_movimiento: null,
        fecha_movimiento: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        cantidad: 1,
        producto: '',
        categoria: '',
        medida: '',
        observacion: '',
        solicitante: '',
        estado: 1
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
        loadClientes()
        loadTiposMovimiento()
        loadCategorias()

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
    const filteredMovements = movements.filter(m => {
        const matchSearch = m.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.observacion?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchType = filterType === 'all' || 
            (filterType === 'ingreso' && m.tipo === 'INGRESO') ||
            (filterType === 'salida' && m.tipo === 'SALIDA')

        // Filtrar por categoría del producto
        const matchCategoria = filterCategoria === 'all' || (() => {
            const producto = products.find(p => p.id === m.productoId)
            return producto?.categoria === filterCategoria
        })()

        return matchSearch && matchType && matchCategoria
    })

    // Handle Save Movement
    const handleSaveMovement = async () => {
        if (!formData.id_producto || !formData.id_tipo_movimiento || !formData.cantidad) {
            alert('Por favor complete todos los campos requeridos')
            return
        }

        setIsSaving(true)
        try {
            // Obtener usuario actual
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            
            // Obtener datos del producto seleccionado
            const selectedProduct = products.find(p => p.id === formData.id_producto)
            const medidaProducto = selectedProduct?.unidad_medida || selectedProduct?.medida || formData.medida || ''
            
            const movimientoData = {
                id_usuario: currentUser?.id || null,
                id_producto: formData.id_producto,
                id_cliente: formData.id_cliente || null,
                id_tipo_movimiento: formData.id_tipo_movimiento,
                fecha_movimiento: formData.fecha_movimiento,
                fecha_vencimiento: formData.fecha_vencimiento || null,
                cantidad: parseInt(formData.cantidad) || 0,
                producto: selectedProduct?.nombre || formData.producto,
                medida: medidaProducto,
                observacion: formData.observacion || null,
                solicitante: formData.solicitante || null,
                estado: 1,
                usuario_creacion: user?.nombre || currentUser?.email || 'Sistema',
                fecha_creacion: new Date().toISOString().split('T')[0],
                usuario_modificacion: user?.nombre || currentUser?.email || 'Sistema',
                fecha_modificacion: new Date().toISOString().split('T')[0]
            }

            const { error } = await supabase
                .from('movimiento')
                .insert([movimientoData])

            if (error) throw error

            // Recargar movimientos
            await loadMovements()
            setIsModalOpen(false)
            
            // Reset form
            setFormData({
                id_producto: null,
                id_cliente: null,
                id_tipo_movimiento: null,
                fecha_movimiento: new Date().toISOString().split('T')[0],
                fecha_vencimiento: '',
                cantidad: 1,
                producto: '',
                categoria: '',
                medida: '',
                observacion: '',
                solicitante: '',
                estado: 1
            })
            setProductSearchTerm('')
            
            alert('Movimiento guardado exitosamente')
        } catch (error) {
            console.error('Error guardando movimiento:', error)
            alert('Error al guardar el movimiento: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedMovements = filteredMovements.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filterType, filterCategoria, dateRange])

    const handleProductSelect = (product) => {
        const medidaProducto = product.unidad_medida || product.medida || ''
        const categoriaProducto = product.categoria || ''
        setFormData({
            ...formData,
            id_producto: product.id,
            producto: product.nombre,
            medida: medidaProducto,
            categoria: categoriaProducto
        })
        setProductSearchTerm(product.nombre)
        setShowProductSuggestions(false)
    }

    const filteredProducts = products.filter(p => {
        const searchLower = productSearchTerm.toLowerCase()
        return (
            p.nombre?.toLowerCase().includes(searchLower) ||
            p.codigo?.toLowerCase().includes(searchLower) ||
            p.categoria?.toLowerCase().includes(searchLower) ||
            p.tipo_producto?.toLowerCase().includes(searchLower)
        )
    })

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
                        <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setProductSearchTerm('')
                            setShowProductSuggestions(false)
                            setFormData({
                                id_producto: null,
                                id_cliente: null,
                                id_tipo_movimiento: null,
                                fecha_movimiento: new Date().toISOString().split('T')[0],
                                fecha_vencimiento: '',
                                cantidad: 1,
                                producto: '',
                                categoria: '',
                                medida: '',
                                observacion: '',
                                solicitante: '',
                                estado: 1
                            })
                            setIsModalOpen(true)
                        }}
                        className="bg-negro-principal text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        Nuevo Movimiento
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

                {/* Modal Nuevo Movimiento */}
                {isModalOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={(e) => {
                            // Cerrar modal al hacer clic fuera de él
                            if (e.target === e.currentTarget) {
                                setIsModalOpen(false)
                            }
                        }}
                    >
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-negro-principal">Nuevo Movimiento</h2>
                                    <p className="text-sm text-gris-medio">Completa la información del movimiento a continuación</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-fondo-claro rounded-full transition-colors text-gris-medio hover:text-negro-principal"
                                    aria-label="Cerrar modal"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-80 overflow-y-auto">
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map(product => (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => handleProductSelect(product)}
                                                        className="w-full text-left px-4 py-3 hover:bg-fondo-claro transition-colors border-b border-gray-50 last:border-none group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-negro-principal group-hover:text-verde-principal transition-colors">
                                                            {product.nombre}
                                                                </div>
                                                                {product.codigo && (
                                                                    <div className="text-xs text-gris-medio mt-0.5">
                                                                        Código: {product.codigo}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 ml-3">
                                                                {product.categoria && (
                                                                    <span className="text-xs text-gris-medio bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                                                                        {product.categoria}
                                                        </span>
                                                                )}
                                                                {(product.tipo_producto || product.medida || product.unidad_medida) && (
                                                                    <span className="text-xs text-gris-medio bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                                                                        {product.tipo_producto || product.medida || product.unidad_medida}
                                                        </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gris-medio text-center">
                                                    No se encontraron productos. Escribe para buscar...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Row 2 - Categoría y Medida (2 columnas) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                            Categoría
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                (() => {
                                                    const selectedProduct = products.find(p => p.id === formData.id_producto)
                                                    return selectedProduct?.categoria || formData.categoria || ''
                                                })()
                                            }
                                            disabled
                                            className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-gris-oscuro focus:outline-none"
                                            placeholder="Seleccione un producto"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-2">
                                            Medida
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                (() => {
                                                    const selectedProduct = products.find(p => p.id === formData.id_producto)
                                                    return selectedProduct?.unidad_medida || selectedProduct?.medida || formData.medida || ''
                                                })()
                                            }
                                            disabled
                                            className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-gris-oscuro focus:outline-none"
                                            placeholder="Seleccione un producto"
                                        />
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
                                        Movimiento
                                    </label>
                                    <select
                                        value={formData.id_tipo_movimiento || ''}
                                        onChange={(e) => setFormData({ ...formData, id_tipo_movimiento: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none appearance-none"
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        {tiposMovimiento.map(tipo => (
                                            <option key={tipo.id_tipo_movimiento} value={tipo.id_tipo_movimiento}>
                                                {tipo.nombre === 'Ingreso' ? 'Ingreso' : tipo.nombre === 'Salida' ? 'Salida' : tipo.nombre}
                                            </option>
                                        ))}
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
                                        value={formData.observacion}
                                        onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-fondo-claro border-none rounded-lg text-negro-principal focus:ring-2 focus:ring-verde-principal focus:outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                <span className="text-xs text-gris-medio">
                                    Última Actualización: {new Date().toLocaleDateString()} Por Admin
                                </span>
                                <button 
                                    onClick={handleSaveMovement}
                                    disabled={isSaving}
                                    className="bg-verde-principal text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar Movimiento'}
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
