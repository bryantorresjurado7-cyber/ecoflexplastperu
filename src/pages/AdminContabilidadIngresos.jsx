import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    TrendingUp,
    Calendar,
    Plus,
    ChevronDown,
    Trash2,
    Edit2,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    X,
    FileText,
    CreditCard,
    Building,
    Check,
    DollarSign,
    Users,
    ArrowLeft,
    Clock,
    Wallet,
    Smartphone
} from 'lucide-react'
import { contabilidadService } from '../services/contabilidadService'

const AdminContabilidadIngresos = () => {
    const navigate = useNavigate()
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

    // Estados para datos
    const [ingresos, setIngresos] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterEstado, setFilterEstado] = useState('todos')
    const [filterMetodo, setFilterMetodo] = useState('todos')

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingIngreso, setEditingIngreso] = useState(null)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, concepto: '' })
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const categorias = [
        { value: 'ventas', label: 'Ventas', icon: '🛒', color: 'bg-green-100 text-green-800' },
        { value: 'servicios', label: 'Servicios', icon: '💼', color: 'bg-blue-100 text-blue-800' },
        { value: 'alquiler', label: 'Alquiler', icon: '🏠', color: 'bg-purple-100 text-purple-800' },
        { value: 'comisiones', label: 'Comisiones', icon: '💰', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'reembolsos', label: 'Reembolsos', icon: '↩️', color: 'bg-orange-100 text-orange-800' },
        { value: 'otros', label: 'Otros', icon: '📋', color: 'bg-gray-100 text-gray-800' }
    ]

    const metodosPago = [
        { value: 'efectivo', label: 'Efectivo', icon: '💵', color: 'text-green-600' },
        { value: 'transferencia', label: 'Transferencia', icon: '🏦', color: 'text-blue-600' },
        { value: 'tarjeta', label: 'Tarjeta', icon: '💳', color: 'text-purple-600' },
        { value: 'yape', label: 'Yape', icon: '📱', color: 'text-purple-500' },
        { value: 'plin', label: 'Plin', icon: '📱', color: 'text-cyan-500' },
        { value: 'cheque', label: 'Cheque', icon: '📝', color: 'text-gray-600' },
        { value: 'otro', label: 'Otro', icon: '💰', color: 'text-gray-500' }
    ]

    const tiposDocumento = [
        { value: 'BOLETA', label: 'Boleta' },
        { value: 'FACTURA', label: 'Factura' },
        { value: 'RECIBO', label: 'Recibo' },
        { value: 'TICKET', label: 'Ticket' },
        { value: 'OTRO', label: 'Otro' }
    ]

    const [formData, setFormData] = useState({
        concepto: '',
        descripcion: '',
        categoria: 'ventas',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        cliente: '',
        metodo_pago: 'efectivo',
        referencia_pago: '',
        tipo_documento: 'BOLETA',
        numero_documento: '',
        estado: 'pendiente'
    })

    // Cargar datos
    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await contabilidadService.getIngresos({
                mes: selectedMonth,
                anio: selectedYear
            })

            if (fetchError) throw fetchError
            setIngresos(data || [])
        } catch (err) {
            console.error('Error loading ingresos:', err)
            setError('Error al cargar los ingresos')
        } finally {
            setLoading(false)
        }
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        loadData()
    }, [loadData])

    const showSuccess = (message) => {
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(null), 3000)
    }

    const resetForm = () => {
        setFormData({
            concepto: '',
            descripcion: '',
            categoria: 'ventas',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            cliente: '',
            metodo_pago: 'efectivo',
            referencia_pago: '',
            tipo_documento: 'BOLETA',
            numero_documento: '',
            estado: 'pendiente'
        })
        setEditingIngreso(null)
    }

    const openModal = (ingreso = null) => {
        if (ingreso) {
            setEditingIngreso(ingreso)
            setFormData({
                concepto: ingreso.concepto || '',
                descripcion: ingreso.descripcion || '',
                categoria: ingreso.categoria || 'ventas',
                monto: ingreso.monto?.toString() || '',
                fecha: ingreso.fecha || new Date().toISOString().split('T')[0],
                cliente: ingreso.cliente || '',
                metodo_pago: ingreso.metodo_pago || 'efectivo',
                referencia_pago: ingreso.referencia_pago || '',
                tipo_documento: ingreso.tipo_documento || 'BOLETA',
                numero_documento: ingreso.numero_documento || '',
                estado: ingreso.estado || 'pendiente'
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
            if (editingIngreso) {
                const { error: updateError } = await contabilidadService.updateIngreso(
                    editingIngreso.id_ingreso,
                    formData
                )
                if (updateError) throw updateError
                showSuccess('Ingreso actualizado correctamente')
            } else {
                const { error: createError } = await contabilidadService.createIngreso(formData)
                if (createError) throw createError
                showSuccess('Ingreso creado correctamente')
            }

            await loadData()
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            console.error('Error saving ingreso:', err)
            setError('Error al guardar el ingreso')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        setSaving(true)
        try {
            const { error: deleteError } = await contabilidadService.deleteIngreso(deleteModal.id)
            if (deleteError) throw deleteError
            await loadData()
            showSuccess('Ingreso eliminado correctamente')
            setDeleteModal({ isOpen: false, id: null, concepto: '' })
        } catch {
            setError('Error al eliminar el ingreso')
        } finally {
            setSaving(false)
        }
    }

    const handleMarcarCobrado = async (ingreso) => {
        setSaving(true)
        try {
            await contabilidadService.updateIngreso(ingreso.id_ingreso, {
                estado: 'cobrado',
                fecha_cobro: new Date().toISOString().split('T')[0]
            })
            await loadData()
            showSuccess('Ingreso marcado como cobrado')
        } catch {
            setError('Error al actualizar el ingreso')
        } finally {
            setSaving(false)
        }
    }

    // Filtrar datos
    const filteredIngresos = ingresos.filter(i => {
        const matchSearch = i.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchEstado = filterEstado === 'todos' || i.estado === filterEstado
        const matchMetodo = filterMetodo === 'todos' || i.metodo_pago === filterMetodo
        return matchSearch && matchEstado && matchMetodo
    })

    // Calcular totales
    const totalIngresos = filteredIngresos.reduce((acc, i) => acc + parseFloat(i.monto || 0), 0)
    const totalCobrados = filteredIngresos.filter(i => i.estado === 'cobrado').reduce((acc, i) => acc + parseFloat(i.monto || 0), 0)
    const totalPendientes = filteredIngresos.filter(i => i.estado === 'pendiente').reduce((acc, i) => acc + parseFloat(i.monto || 0), 0)

    // Ingresos por método de pago
    const ingresosPorMetodo = metodosPago.map(m => ({
        ...m,
        total: filteredIngresos.filter(i => i.metodo_pago === m.value && i.estado === 'cobrado')
            .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0)
    })).filter(m => m.total > 0)

    const getCategoriaInfo = (cat) => categorias.find(c => c.value === cat) || categorias[categorias.length - 1]
    const getMetodoInfo = (metodo) => metodosPago.find(m => m.value === metodo) || metodosPago[metodosPago.length - 1]

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

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/contabilidad')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver a Contabilidad</span>
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="text-green-600" size={28} />
                                </div>
                                Ingresos
                            </h1>
                            <p className="text-gray-600 mt-1">Administra los ingresos y cobros de la empresa</p>
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
                                            <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 hover:bg-gray-100 rounded">◀</button>
                                            <span className="font-bold text-lg">{selectedYear}</span>
                                            <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 hover:bg-gray-100 rounded">▶</button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {shortMonths.map((month, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => { setSelectedMonth(idx); setIsDateMenuOpen(false) }}
                                                    className={`px-2 py-2 text-sm rounded-lg transition-colors ${
                                                        selectedMonth === idx ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
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
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-600/30"
                            >
                                <Plus size={18} />
                                Nuevo Ingreso
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total del Mes</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalIngresos)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <DollarSign size={28} />
                            </div>
                        </div>
                        <p className="text-green-100 text-sm mt-3">{filteredIngresos.length} ingresos</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Cobrados</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalCobrados)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Check size={28} />
                            </div>
                        </div>
                        <p className="text-blue-100 text-sm mt-3">{filteredIngresos.filter(i => i.estado === 'cobrado').length} cobrados</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg shadow-yellow-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Por Cobrar</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalPendientes)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Clock size={28} />
                            </div>
                        </div>
                        <p className="text-yellow-100 text-sm mt-3">{filteredIngresos.filter(i => i.estado === 'pendiente').length} pendientes</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm mb-3">Métodos de Pago</p>
                        <div className="space-y-2">
                            {ingresosPorMetodo.slice(0, 3).map(m => (
                                <div key={m.value} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>{m.icon}</span>
                                        <span className="text-sm text-gray-600">{m.label}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{formatCurrency(m.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por concepto o cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 min-w-[150px]"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="cobrado">Cobrado</option>
                            <option value="anulado">Anulado</option>
                        </select>
                        <select
                            value={filterMetodo}
                            onChange={(e) => setFilterMetodo(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 min-w-[180px]"
                        >
                            <option value="todos">Todos los métodos</option>
                            {metodosPago.map(m => (
                                <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista de Ingresos como Cards */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-green-600" size={40} />
                    </div>
                ) : filteredIngresos.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-500">
                        <TrendingUp size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay ingresos registrados</p>
                        <p className="text-sm">Agrega tu primer ingreso para este mes</p>
                        <button 
                            onClick={() => openModal()}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Agregar ingreso
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredIngresos.map((ingreso) => {
                            const catInfo = getCategoriaInfo(ingreso.categoria)
                            const metodoInfo = getMetodoInfo(ingreso.metodo_pago)
                            return (
                                <div 
                                    key={ingreso.id_ingreso} 
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-xl text-2xl">
                                                    {catInfo.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{ingreso.concepto}</h3>
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${catInfo.color}`}>
                                                        {catInfo.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                ingreso.estado === 'cobrado' ? 'bg-green-100 text-green-700' :
                                                ingreso.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {ingreso.estado}
                                            </span>
                                        </div>
                                        
                                        {ingreso.descripcion && (
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ingreso.descripcion}</p>
                                        )}
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} />
                                                <span>{formatDate(ingreso.fecha)}</span>
                                            </div>
                                            {ingreso.cliente && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Users size={14} />
                                                    <span>{ingreso.cliente}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>{metodoInfo.icon}</span>
                                                <span>{metodoInfo.label}</span>
                                                {ingreso.referencia_pago && (
                                                    <span className="text-gray-400">• {ingreso.referencia_pago}</span>
                                                )}
                                            </div>
                                            {ingreso.numero_documento && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FileText size={14} />
                                                    <span>{ingreso.tipo_documento}: {ingreso.numero_documento}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="text-2xl font-bold text-green-600">
                                                {formatCurrency(ingreso.monto)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {ingreso.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => handleMarcarCobrado(ingreso)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Marcar como cobrado"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openModal(ingreso)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, id: ingreso.id_ingreso, concepto: ingreso.concepto })}
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
                                        {editingIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Concepto *</label>
                                    <input
                                        type="text"
                                        value={formData.concepto}
                                        onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        placeholder="Ej: Venta de productos..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        rows={2}
                                        placeholder="Descripción opcional..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                                        <select
                                            value={formData.categoria}
                                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        >
                                            {categorias.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.monto}
                                                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                                        <input
                                            type="date"
                                            value={formData.fecha}
                                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                                        <input
                                            type="text"
                                            value={formData.cliente}
                                            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                            placeholder="Nombre del cliente"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                        <select
                                            value={formData.metodo_pago}
                                            onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        >
                                            {metodosPago.map(m => (
                                                <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Referencia Pago</label>
                                        <input
                                            type="text"
                                            value={formData.referencia_pago}
                                            onChange={(e) => setFormData({ ...formData, referencia_pago: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                            placeholder="Nro. operación"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Documento</label>
                                        <select
                                            value={formData.tipo_documento}
                                            onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        >
                                            {tiposDocumento.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nro. Documento</label>
                                        <input
                                            type="text"
                                            value={formData.numero_documento}
                                            onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                            placeholder="B001-00001"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="cobrado">Cobrado</option>
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
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        {editingIngreso ? 'Guardar Cambios' : 'Crear Ingreso'}
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Ingreso</h3>
                                <p className="text-gray-600 mb-6">
                                    ¿Estás seguro de eliminar <strong>"{deleteModal.concepto}"</strong>? Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, id: null, concepto: '' })}
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

export default AdminContabilidadIngresos
