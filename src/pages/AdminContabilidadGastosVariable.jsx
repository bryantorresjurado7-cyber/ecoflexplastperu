import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    Calendar,
    Plus,
    Trash2,
    Edit2,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    X,
    DollarSign,
    Building,
    Clock,
    Check,
    Ban,
    ArrowLeft,
    FileText,
    TrendingDown,
    ChevronDown,
    Receipt,
    CreditCard
} from 'lucide-react'
import { contabilidadService } from '../services/contabilidadService'
import { getParametrica } from '../services/parametricaService'

const AdminContabilidadGastosVariable = () => {
    const navigate = useNavigate()
    const currentDate = new Date()
    
    // Estados para fecha
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
    
    // Estados para datos
    const [gastos, setGastos] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategoria, setFilterCategoria] = useState('todos')
    const [filterEstado, setFilterEstado] = useState('todos')

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingGasto, setEditingGasto] = useState(null)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nombre: '' })

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    // Categorias desde parametrica
    const [categorias, setCategorias] = useState([])
    const [loadingCategorias, setLoadingCategorias] = useState(true)

    // Colores para categorias (sin emojis)
    const colorMap = {
        'insumos': 'bg-blue-100 text-blue-800',
        'transporte': 'bg-yellow-100 text-yellow-800',
        'reparaciones': 'bg-orange-100 text-orange-800',
        'compras': 'bg-green-100 text-green-800',
        'publicidad': 'bg-purple-100 text-purple-800',
        'servicios': 'bg-indigo-100 text-indigo-800',
        'otros': 'bg-gray-100 text-gray-800'
    }

    const tiposDocumento = [
        { value: 'BOLETA', label: 'Boleta' },
        { value: 'FACTURA', label: 'Factura' },
        { value: 'RECIBO', label: 'Recibo' },
        { value: 'TICKET', label: 'Ticket' },
        { value: 'OTRO', label: 'Otro' }
    ]

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: 'otros',
        monto: '',
        moneda: 'PEN',
        monto_original: '',
        tipo_cambio: '',
        fecha: new Date().toISOString().split('T')[0],
        proveedor: '',
        tipo_documento: 'BOLETA',
        numero_documento: '',
        estado: 'pendiente'
    })

    // Cargar categorias desde parametrica
    const loadCategorias = useCallback(async () => {
        setLoadingCategorias(true)
        try {
            const result = await getParametrica('categoria_gasto_variable', 'true')
            if (result.error) throw result.error
            const cats = (result.data || []).map(p => ({
                value: p.codigo_parametro,
                label: p.valor,
                color: colorMap[p.codigo_parametro] || 'bg-gray-100 text-gray-800'
            }))
            setCategorias(cats)
        } catch (err) {
            console.error('Error loading categorias:', err)
            // Fallback a categorías por defecto
            setCategorias([
                { value: 'insumos', label: 'Insumos', color: 'bg-blue-100 text-blue-800' },
                { value: 'transporte', label: 'Transporte', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'reparaciones', label: 'Reparaciones', color: 'bg-orange-100 text-orange-800' },
                { value: 'compras', label: 'Compras', color: 'bg-green-100 text-green-800' },
                { value: 'publicidad', label: 'Publicidad', color: 'bg-purple-100 text-purple-800' },
                { value: 'servicios', label: 'Servicios', color: 'bg-indigo-100 text-indigo-800' },
                { value: 'otros', label: 'Otros', color: 'bg-gray-100 text-gray-800' }
            ])
        } finally {
            setLoadingCategorias(false)
        }
    }, [])

    // Cargar datos
    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await contabilidadService.getGastosVariables({ 
                mes: selectedMonth, 
                anio: selectedYear 
            })
            if (result.error) throw result.error
            setGastos(result.data || [])
        } catch (err) {
            console.error('Error loading gastos variables:', err)
            setError('Error al cargar los gastos variables')
        } finally {
            setLoading(false)
        }
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        loadCategorias()
    }, [loadCategorias])

    useEffect(() => {
        loadData()
    }, [loadData])

    const showSuccess = (message) => {
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(null), 3000)
    }

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            categoria: 'otros',
            monto: '',
            moneda: 'PEN',
            monto_original: '',
            tipo_cambio: '',
            fecha: new Date().toISOString().split('T')[0],
            proveedor: '',
            tipo_documento: 'BOLETA',
            numero_documento: '',
            estado: 'pendiente'
        })
        setEditingGasto(null)
    }

    const handleOpenModal = (gasto = null) => {
        if (gasto) {
            setEditingGasto(gasto)
            setFormData({
                nombre: gasto.nombre || '',
                descripcion: gasto.descripcion || '',
                categoria: gasto.categoria || 'otros',
                monto: gasto.monto_original || gasto.monto || '',
                moneda: gasto.moneda || 'PEN',
                monto_original: gasto.monto_original || gasto.monto || '',
                tipo_cambio: gasto.tipo_cambio || '',
                fecha: gasto.fecha || new Date().toISOString().split('T')[0],
                proveedor: gasto.proveedor || '',
                tipo_documento: gasto.tipo_documento || 'BOLETA',
                numero_documento: gasto.numero_documento || '',
                estado: gasto.estado || 'pendiente'
            })
        } else {
            resetForm()
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const rawMonto = parseFloat(formData.monto || 0)
            const moneda = formData.moneda || 'PEN'
            const tipoCambio = formData.tipo_cambio ? parseFloat(formData.tipo_cambio) : null

            if (moneda === 'USD' && (!tipoCambio || tipoCambio <= 0)) {
                throw new Error('Ingrese un tipo de cambio válido para USD')
            }

            const monto_en_soles = moneda === 'USD' ? +(rawMonto * tipoCambio || 0).toFixed(2) : +rawMonto.toFixed(2)

            const gastoData = {
                ...formData,
                tipo_gasto: 'variable',
                moneda,
                monto_original: moneda === 'USD' ? rawMonto : null,
                tipo_cambio: moneda === 'USD' ? tipoCambio : null,
                monto: monto_en_soles
            }

            if (editingGasto) {
                const result = await contabilidadService.updateGasto(editingGasto.id_gasto, gastoData)
                if (result.error) throw result.error
                showSuccess('Gasto variable actualizado correctamente')
            } else {
                const result = await contabilidadService.createGasto(gastoData)
                if (result.error) throw result.error
                showSuccess('Gasto variable creado correctamente')
            }

            await loadData()
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            console.error('Error saving gasto:', err)
            setError('Error al guardar el gasto variable')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        setSaving(true)
        try {
            const result = await contabilidadService.deleteGasto(deleteModal.id)
            if (result.error) throw result.error
            await loadData()
            showSuccess('Gasto variable eliminado')
            setDeleteModal({ isOpen: false, id: null, nombre: '' })
        } catch {
            setError('Error al eliminar el gasto')
        } finally {
            setSaving(false)
        }
    }

    const handleMarcarPagado = async (gasto) => {
        setSaving(true)
        try {
            await contabilidadService.marcarGastoPagado(gasto.id_gasto)
            await loadData()
            showSuccess('Gasto marcado como pagado')
        } catch {
            setError('Error al actualizar el gasto')
        } finally {
            setSaving(false)
        }
    }

    // Filtrar datos
    const filteredGastos = gastos.filter(g => {
        const matchSearch = g.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchCategoria = filterCategoria === 'todos' || g.categoria === filterCategoria
        const matchEstado = filterEstado === 'todos' || g.estado === filterEstado
        return matchSearch && matchCategoria && matchEstado
    })

    // Calcular totales
    const totalGastos = filteredGastos.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)
    const totalPagados = filteredGastos.filter(g => g.estado === 'pagado').reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)
    const totalPendientes = filteredGastos.filter(g => g.estado === 'pendiente').reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)

    const getCategoriaInfo = (cat) => {
        const found = categorias.find(c => c.value === cat)
        if (found) return found
        // Fallback si no encuentra
        return { value: cat, label: cat, color: colorMap[cat] || 'bg-gray-100 text-gray-800' }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const getEstadoStyle = (estado) => {
        switch (estado) {
            case 'pagado': return 'bg-green-100 text-green-700'
            case 'pendiente': return 'bg-yellow-100 text-yellow-700'
            case 'vencido': return 'bg-red-100 text-red-700'
            case 'anulado': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/contabilidad/gastos')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver a Gastos</span>
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Receipt className="text-orange-600" size={28} />
                                </div>
                                Gastos Variables
                            </h1>
                            <p className="text-gray-600 mt-1">Administra los gastos puntuales del mes</p>
                        </div>
                        
                        <div className="flex gap-3">
                            {/* Selector de Mes/Año */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <Calendar size={18} className="text-gray-500" />
                                    <span className="font-medium">{months[selectedMonth]} {selectedYear}</span>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isDateMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 w-72">
                                        <div className="flex justify-between items-center mb-4">
                                            <button
                                                onClick={() => setSelectedYear(y => y - 1)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                ◀
                                            </button>
                                            <span className="font-bold text-lg">{selectedYear}</span>
                                            <button
                                                onClick={() => setSelectedYear(y => y + 1)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {shortMonths.map((month, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedMonth(idx)
                                                        setIsDateMenuOpen(false)
                                                    }}
                                                    className={`px-2 py-2 text-sm rounded-lg transition-colors ${
                                                        selectedMonth === idx
                                                            ? 'bg-orange-600 text-white'
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {month}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/30"
                            >
                                <Plus size={18} />
                                Nuevo Gasto
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mensajes */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-green-700">{successMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <span className="text-red-700">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto">
                            <X size={18} className="text-red-400 hover:text-red-600" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Total del Mes</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalGastos)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <DollarSign size={28} />
                            </div>
                        </div>
                        <p className="text-orange-100 text-sm mt-3">{filteredGastos.length} gastos registrados</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Pagados</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalPagados)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Check size={28} />
                            </div>
                        </div>
                        <p className="text-green-100 text-sm mt-3">{filteredGastos.filter(g => g.estado === 'pagado').length} pagados</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg shadow-yellow-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Pendientes</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalPendientes)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Clock size={28} />
                            </div>
                        </div>
                        <p className="text-yellow-100 text-sm mt-3">{filteredGastos.filter(g => g.estado === 'pendiente').length} por pagar</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o proveedor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 min-w-[180px]"
                            disabled={loadingCategorias}
                        >
                            <option value="todos">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 min-w-[150px]"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="pagado">Pagado</option>
                            <option value="vencido">Vencido</option>
                            <option value="anulado">Anulado</option>
                        </select>
                    </div>
                </div>

                {/* Lista de Gastos como Cards */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-orange-600" size={40} />
                    </div>
                ) : filteredGastos.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-500">
                        <TrendingDown size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay gastos variables</p>
                        <p className="text-sm">Agrega tu primer gasto variable para este mes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredGastos.map((gasto) => {
                            const catInfo = getCategoriaInfo(gasto.categoria)
                            return (
                                <div 
                                    key={gasto.id_gasto} 
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-xl">
                                                    <DollarSign className="w-6 h-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{gasto.nombre}</h3>
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${catInfo.color}`}>
                                                        {catInfo.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoStyle(gasto.estado)}`}>
                                                {gasto.estado}
                                            </span>
                                        </div>
                                        
                                        {gasto.descripcion && (
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{gasto.descripcion}</p>
                                        )}
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} />
                                                <span>{formatDate(gasto.fecha)}</span>
                                            </div>
                                            {gasto.proveedor && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building size={14} />
                                                    <span>{gasto.proveedor}</span>
                                                </div>
                                            )}
                                            {gasto.numero_documento && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FileText size={14} />
                                                    <span>{gasto.tipo_documento}: {gasto.numero_documento}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {gasto.moneda === 'USD' ? (
                                                    <>
                                                        <span className="mr-2">${gasto.monto_original}</span>
                                                        <span className="text-sm text-gray-500">· {formatCurrency(gasto.monto)}</span>
                                                    </>
                                                ) : (
                                                    formatCurrency(gasto.monto)
                                                )}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {gasto.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => handleMarcarPagado(gasto)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Marcar como pagado"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(gasto)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, id: gasto.id_gasto, nombre: gasto.nombre })}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Modal Crear/Editar */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingGasto ? 'Editar Gasto Variable' : 'Nuevo Gasto Variable'}
                                    </h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Gasto *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                        placeholder="Ej: Compra de materiales..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                        rows={2}
                                        placeholder="Descripción opcional..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Categoría
                                        </label>
                                        <select
                                            value={formData.categoria}
                                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            disabled={loadingCategorias}
                                        >
                                            {loadingCategorias ? (
                                                <option>Cargando...</option>
                                            ) : (
                                                categorias.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Monto *
                                        </label>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={formData.moneda}
                                                onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            >
                                                <option value="PEN">PEN (S/)</option>
                                                <option value="USD">USD ($)</option>
                                            </select>

                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">{formData.moneda === 'PEN' ? 'S/' : '$'}</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.monto}
                                                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {formData.moneda === 'USD' && (
                                            <div className="mt-2">
                                                <label className="block text-xs text-gray-600 mb-1">Tipo de cambio (S/ por USD)</label>
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    min="0"
                                                    value={formData.tipo_cambio}
                                                    onChange={(e) => setFormData({ ...formData, tipo_cambio: e.target.value })}
                                                    className="w-40 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                                    placeholder="Ej: 3.50"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.fecha}
                                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Proveedor
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.proveedor}
                                            onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            placeholder="Nombre del proveedor"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo Documento
                                        </label>
                                        <select
                                            value={formData.tipo_documento}
                                            onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                        >
                                            {tiposDocumento.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número Documento
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.numero_documento}
                                            onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            placeholder="Ej: B001-00001"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="pagado">Pagado</option>
                                        <option value="vencido">Vencido</option>
                                        <option value="anulado">Anulado</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        {editingGasto ? 'Guardar Cambios' : 'Crear Gasto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Eliminar */}
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="text-red-600" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Gasto</h3>
                                <p className="text-gray-600 mb-6">
                                    ¿Estás seguro de eliminar <strong>"{deleteModal.nombre}"</strong>? Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, id: null, nombre: '' })}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminContabilidadGastosVariable
