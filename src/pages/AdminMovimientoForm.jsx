import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
    ArrowLeft,
    Save,
    Package,
    Calendar,
    Search,
    ChevronDown
} from 'lucide-react'

const AdminMovimientoForm = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    // State
    const [loading, setLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [products, setProducts] = useState([])
    const [clientes, setClientes] = useState([])
    const [tiposMovimiento, setTiposMovimiento] = useState([])

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

    useEffect(() => {
        loadData()

        // Click outside to close suggestions
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowProductSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                loadProducts(),
                loadClientes(),
                loadTiposMovimiento()
            ])
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadProducts = async () => {
        const { data, error } = await supabase
            .from('productos_db')
            .select('*')
            .order('categoria', { ascending: true })
            .order('nombre', { ascending: true })

        if (error) throw error
        setProducts(data || [])
    }

    const loadClientes = async () => {
        const { data, error } = await supabase
            .from('cliente')
            .select('id_cliente, nombre')
            .eq('estado', true)
            .order('nombre')

        if (error) throw error
        setClientes(data || [])
    }

    const loadTiposMovimiento = async () => {
        const { data, error } = await supabase
            .from('tipo_movimiento')
            .select('id_tipo_movimiento, codigo, nombre')
            .eq('activo', true)
            .order('codigo')

        if (error) throw error
        setTiposMovimiento(data || [])
    }

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

            navigate('/admin/movimientos')
        } catch (error) {
            console.error('Error guardando movimiento:', error)
            alert('Error al guardar el movimiento: ' + error.message)
        } finally {
            setIsSaving(false)
        }
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

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
                        <p className="mt-4 text-gris-medio">Cargando...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/movimientos')}
                        className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver a Movimientos
                    </button>
                    <h1 className="text-3xl font-bold text-negro-principal">
                        Nuevo Movimiento
                    </h1>
                </div>

                {/* Form */}
                <div className="max-w-4xl">
                    <div className="bg-white rounded-xl shadow-card p-8 space-y-8">
                        {/* Información del Movimiento */}
                        <div>
                            <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
                                <Package size={24} />
                                Detalles del Movimiento
                            </h2>

                            <div className="space-y-6">
                                {/* Productos Autocomplete */}
                                <div className="relative" ref={suggestionsRef}>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Producto *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar y seleccionar producto..."
                                            value={productSearchTerm}
                                            onChange={(e) => {
                                                setProductSearchTerm(e.target.value)
                                                setShowProductSuggestions(true)
                                            }}
                                            onFocus={() => setShowProductSuggestions(true)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:outline-none"
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
                                                                    <span className="text-xs text-gris-medio bg-blue-50 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                                                                        {product.categoria}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gris-medio text-center">
                                                    No se encontraron productos.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
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
                                            className="input-field bg-gray-50"
                                            placeholder="Automático"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
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
                                            className="input-field bg-gray-50"
                                            placeholder="Automático"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Cantidad *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.cantidad}
                                            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Tipo de Movimiento *
                                        </label>
                                        <select
                                            value={formData.id_tipo_movimiento || ''}
                                            onChange={(e) => setFormData({ ...formData, id_tipo_movimiento: e.target.value ? parseInt(e.target.value) : null })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            {tiposMovimiento.map(tipo => (
                                                <option key={tipo.id_tipo_movimiento} value={tipo.id_tipo_movimiento}>
                                                    {tipo.nombre === 'Ingreso' ? 'Ingreso' : tipo.nombre === 'Salida' ? 'Salida' : tipo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Solicitante
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.solicitante}
                                            onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                                            className="input-field"
                                            placeholder="Solicitante..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Fecha del Movimiento
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                                            <input
                                                type="date"
                                                value={formData.fecha_movimiento}
                                                onChange={(e) => setFormData({ ...formData, fecha_movimiento: e.target.value })}
                                                className="input-field pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Observaciones
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData.observacion}
                                        onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                        className="input-field"
                                        placeholder="Observaciones adicionales..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gris-muy-claro">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/movimientos')}
                                className="px-6 py-3 border border-gris-muy-claro rounded-xl font-medium text-gris-oscuro hover:bg-fondo-claro transition-colors"
                                disabled={isSaving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveMovement}
                                disabled={isSaving}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Guardar Movimiento</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminMovimientoForm
