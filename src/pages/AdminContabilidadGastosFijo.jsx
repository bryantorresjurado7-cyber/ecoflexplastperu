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
    Repeat,
    FileText,
    TrendingDown,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'
import { contabilidadService } from '../services/contabilidadService'
import { getParametrica } from '../services/parametricaService'

const AdminContabilidadGastosFijo = () => {
    const navigate = useNavigate()
    
    // Estados para datos
    const [gastos, setGastos] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategoria, setFilterCategoria] = useState('todos')
    const [filterActivo, setFilterActivo] = useState('todos')

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingGasto, setEditingGasto] = useState(null)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nombre: '' })

    // Categorias desde parametrica
    const [categorias, setCategorias] = useState([])
    const [loadingCategorias, setLoadingCategorias] = useState(true)

    // Colores para categorias (sin emojis)
    const colorMap = {
        'servicios': 'bg-yellow-100 text-yellow-800',
        'alquiler': 'bg-blue-100 text-blue-800',
        'sueldos': 'bg-green-100 text-green-800',
        'mantenimiento': 'bg-orange-100 text-orange-800',
        'impuestos': 'bg-red-100 text-red-800',
        'seguros': 'bg-purple-100 text-purple-800',
        'otros': 'bg-gray-100 text-gray-800'
    }

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: 'otros',
        monto: '',
        moneda: 'PEN',
        monto_original: '',
        tipo_cambio: '',
        dia_vencimiento: 1,
        proveedor: '',
        es_recurrente: true,
        activo: true
    })

    // Cargar categorias desde parametrica
    const loadCategorias = useCallback(async () => {
        setLoadingCategorias(true)
        try {
            const result = await getParametrica('categoria_gasto_fijo', 'true')
            if (result.data && result.data.length > 0) {
                const cats = result.data.map(item => ({
                    value: item.codigo_parametro || item.codigo,
                    label: item.valor || item.nombre,
                    color: colorMap[item.codigo_parametro] || 'bg-gray-100 text-gray-800'
                }))
                setCategorias(cats)
            }
        } catch (err) {
            console.error('Error loading categorias:', err)
        } finally {
            setLoadingCategorias(false)
        }
    }, [])

    // Cargar datos
    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await contabilidadService.getGastosFijos(false)
            if (result.error) throw result.error
            setGastos(result.data || [])
        } catch (err) {
            console.error('Error loading gastos fijos:', err)
            setError('Error al cargar los gastos fijos')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCategorias()
        loadData()
    }, [loadCategorias, loadData])

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
            dia_vencimiento: 1,
            proveedor: '',
            es_recurrente: true,
            activo: true
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
                dia_vencimiento: gasto.dia_vencimiento || 1,
                proveedor: gasto.proveedor || '',
                es_recurrente: gasto.es_recurrente !== false,
                activo: gasto.activo !== false
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
            // Preparar monto en soles y campos relacionados con moneda
            const rawMonto = parseFloat(formData.monto || 0)
            const moneda = formData.moneda || 'PEN'
            const tipoCambio = formData.tipo_cambio ? parseFloat(formData.tipo_cambio) : null

            if (moneda === 'USD' && (!tipoCambio || tipoCambio <= 0)) {
                throw new Error('Ingrese un tipo de cambio válido para USD')
            }

            const monto_en_soles = moneda === 'USD' ? +(rawMonto * tipoCambio || 0).toFixed(2) : +rawMonto.toFixed(2)

            const gastoData = {
                ...formData,
                tipo_gasto: 'fijo',
                fecha: new Date().toISOString().split('T')[0],
                moneda,
                monto_original: moneda === 'USD' ? rawMonto : null,
                tipo_cambio: moneda === 'USD' ? tipoCambio : null,
                monto: monto_en_soles
            }

            if (editingGasto) {
                const result = await contabilidadService.updateGasto(editingGasto.id_gasto, gastoData)
                if (result.error) throw result.error
                showSuccess('Gasto fijo actualizado correctamente')
            } else {
                const result = await contabilidadService.createGasto(gastoData)
                if (result.error) throw result.error
                showSuccess('Gasto fijo creado correctamente')
            }

            await loadData()
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            console.error('Error saving gasto:', err)
            setError('Error al guardar el gasto fijo')
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
            showSuccess('Gasto fijo eliminado')
            setDeleteModal({ isOpen: false, id: null, nombre: '' })
        } catch {
            setError('Error al eliminar el gasto')
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActivo = async (gasto) => {
        setSaving(true)
        try {
            await contabilidadService.updateGasto(gasto.id_gasto, {
                activo: !gasto.activo
            })
            await loadData()
            showSuccess(gasto.activo ? 'Gasto desactivado' : 'Gasto activado')
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
        const matchActivo = filterActivo === 'todos' || 
            (filterActivo === 'activo' && g.activo) || 
            (filterActivo === 'inactivo' && !g.activo)
        return matchSearch && matchCategoria && matchActivo
    })

    // Calcular totales
    const totalMensual = filteredGastos.filter(g => g.activo).reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)
    const totalActivos = filteredGastos.filter(g => g.activo).length
    const totalInactivos = filteredGastos.filter(g => !g.activo).length

    const getCategoriaInfo = (cat) => {
        const found = categorias.find(c => c.value === cat)
        if (found) return found
        // Fallback si no se encuentra
        return { value: cat, label: cat || 'Sin categoría', color: 'bg-gray-100 text-gray-800' }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
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
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Repeat className="text-blue-600" size={28} />
                                </div>
                                Gastos Fijos
                            </h1>
                            <p className="text-gray-600 mt-1">Administra los gastos recurrentes mensuales</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                Actualizar
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
                            >
                                <Plus size={18} />
                                Nuevo Gasto Fijo
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
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Mensual</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(totalMensual)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <DollarSign size={28} />
                            </div>
                        </div>
                        <p className="text-blue-100 text-sm mt-3">Gastos fijos activos</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Activos</p>
                                <p className="text-3xl font-bold mt-1">{totalActivos}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Check size={28} />
                            </div>
                        </div>
                        <p className="text-green-100 text-sm mt-3">Gastos en seguimiento</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-lg shadow-gray-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-100 text-sm">Inactivos</p>
                                <p className="text-3xl font-bold mt-1">{totalInactivos}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Ban size={28} />
                            </div>
                        </div>
                        <p className="text-gray-100 text-sm mt-3">Gastos desactivados</p>
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                        >
                            <option value="todos">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterActivo}
                            onChange={(e) => setFilterActivo(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                        >
                            <option value="todos">Todos</option>
                            <option value="activo">Solo activos</option>
                            <option value="inactivo">Solo inactivos</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de Gastos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : filteredGastos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <TrendingDown size={48} className="mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No hay gastos fijos</p>
                            <p className="text-sm">Agrega tu primer gasto fijo para comenzar</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gasto</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Día Venc.</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredGastos.map((gasto) => {
                                        const catInfo = getCategoriaInfo(gasto.categoria)
                                        return (
                                            <tr key={gasto.id_gasto} className={`hover:bg-gray-50 transition-colors ${!gasto.activo ? 'opacity-50' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${catInfo.color}`}>
                                                            <DollarSign size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{gasto.nombre}</p>
                                                            {gasto.descripcion && (
                                                                <p className="text-sm text-gray-500 truncate max-w-xs">{gasto.descripcion}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${catInfo.color}`}>
                                                        {catInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {gasto.proveedor ? (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Building size={16} />
                                                            <span>{gasto.proveedor}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-gray-600">
                                                        <Calendar size={16} />
                                                        <span className="font-medium">{gasto.dia_vencimiento}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {gasto.moneda === 'USD' ? (
                                                            <>
                                                                <span className="mr-2">${gasto.monto_original}</span>
                                                                <span className="text-sm text-gray-500">· {formatCurrency(gasto.monto)}</span>
                                                            </>
                                                        ) : (
                                                            formatCurrency(gasto.monto)
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleActivo(gasto)}
                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                            gasto.activo 
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {gasto.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                        {gasto.activo ? 'Activo' : 'Inactivo'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
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
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal Crear/Editar */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingGasto ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Luz, Alquiler, Internet..."
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                                            Monto Mensual *
                                        </label>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={formData.moneda}
                                                onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                                                    className="w-40 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                                            Día de Vencimiento
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={formData.dia_vencimiento}
                                                onChange={(e) => setFormData({ ...formData, dia_vencimiento: parseInt(e.target.value) || 1 })}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Proveedor
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={formData.proveedor}
                                                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nombre del proveedor"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="activo"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="activo" className="text-sm text-gray-700">
                                        Gasto activo (se considera en el cálculo mensual)
                                    </label>
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
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Gasto Fijo</h3>
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

export default AdminContabilidadGastosFijo
