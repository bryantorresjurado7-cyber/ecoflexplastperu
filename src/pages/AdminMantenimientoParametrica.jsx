import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { 
    ArrowLeft, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Save, 
    X, 
    Settings,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const AdminMantenimientoParametrica = () => {
    const [parametros, setParametros] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterTipo, setFilterTipo] = useState('all')
    const [tiposParametro, setTiposParametro] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [saving, setSaving] = useState(false)
    const [notification, setNotification] = useState(null)

    const [formData, setFormData] = useState({
        tipo_parametro: '',
        codigo_parametro: '',
        descripcion: '',
        valor: '',
        orden: 0,
        estado: true
    })

    useEffect(() => {
        loadParametros()
    }, [])

    useEffect(() => {
        if (parametros.length > 0) {
            const tipos = [...new Set(parametros.map(p => p.tipo_parametro))].sort()
            setTiposParametro(tipos)
        }
    }, [parametros])

    const loadParametros = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('parametrica')
                .select('*')
                .order('tipo_parametro', { ascending: true })
                .order('orden', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error
            setParametros(data || [])
        } catch (error) {
            console.error('Error cargando parámetros:', error)
            showNotification('Error al cargar los parámetros', 'error')
        } finally {
            setLoading(false)
        }
    }

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                tipo_parametro: item.tipo_parametro || '',
                codigo_parametro: item.codigo_parametro || '',
                descripcion: item.descripcion || '',
                valor: item.valor || '',
                orden: item.orden || 0,
                estado: item.estado ?? true
            })
            
        } else {
            setEditingItem(null)
            setFormData({
                tipo_parametro: '',
                codigo_parametro: '',
                descripcion: '',
                valor: '',
                orden: 0,
                estado: true
            })
            
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
        setFormData({
            tipo_parametro: '',
            codigo_parametro: '',
            descripcion: '',
            valor: '',
            orden: 0,
            estado: true
        })
        
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (editingItem) {
                // Actualizar
                const { error } = await supabase
                    .from('parametrica')
                    .update({
                        tipo_parametro: formData.tipo_parametro,
                        codigo_parametro: formData.codigo_parametro,
                        descripcion: formData.descripcion,
                        valor: formData.valor,
                        orden: formData.orden,
                        estado: formData.estado,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id_parametrica', editingItem.id_parametrica)

                if (error) throw error
                showNotification('Parámetro actualizado correctamente')
            } else {
                // Crear
                const { error } = await supabase
                    .from('parametrica')
                    .insert([{
                        tipo_parametro: formData.tipo_parametro,
                        codigo_parametro: formData.codigo_parametro,
                        descripcion: formData.descripcion,
                        valor: formData.valor,
                        orden: formData.orden,
                        estado: formData.estado,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])

                if (error) throw error
                showNotification('Parámetro creado correctamente')
            }

            handleCloseModal()
            loadParametros()
        } catch (error) {
            console.error('Error guardando parámetro:', error)
            showNotification('Error al guardar el parámetro', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id, descripcion) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${descripcion}"?`)) return

        try {
            const { error } = await supabase
                .from('parametrica')
                .delete()
                .eq('id_parametrica', id)

            if (error) throw error
            showNotification('Parámetro eliminado correctamente')
            loadParametros()
        } catch (error) {
            console.error('Error eliminando parámetro:', error)
            showNotification('Error al eliminar el parámetro', 'error')
        }
    }

    const filteredParametros = parametros.filter(p => {
        const matchesSearch = 
            p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo_parametro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tipo_parametro?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesFilter = filterTipo === 'all' || p.tipo_parametro === filterTipo

        return matchesSearch && matchesFilter
    })

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Notification */}
                {notification && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in">
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${
                            notification.type === 'success' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                        }`}>
                            {notification.type === 'success' ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertCircle size={20} />
                            )}
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/admin/mantenimiento-tablas"
                        className="inline-flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver al Mantenimiento
                    </Link>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="text-blue-500" size={32} />
                        <h1 className="text-3xl font-bold text-negro-principal">
                            Tabla Paramétrica
                        </h1>
                    </div>
                    <p className="text-gris-medio ml-11">
                        Gestiona los parámetros maestros del sistema
                    </p>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Búsqueda */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por descripción, código o tipo..."
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Filtro por tipo */}
                        <div>
                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                Tipo de Parámetro
                            </label>
                            <select
                                value={filterTipo}
                                onChange={(e) => setFilterTipo(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">Todos</option>
                                {tiposParametro.map(tipo => (
                                    <option key={tipo} value={tipo}>
                                        {tipo.replace(/_/g, ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Botón Agregar */}
                <div className="mb-6">
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Agregar Parámetro
                    </button>
                </div>

                {/* Tabla */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-card p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-verde-principal mb-4" size={40} />
                        <p className="text-gris-medio">Cargando parámetros...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-fondo-gris">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Valor
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Orden
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredParametros.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <p className="text-gris-medio">No se encontraron parámetros</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredParametros.map((param) => (
                                            <tr key={param.id_parametrica} className="hover:bg-fondo-claro transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                        {param.tipo_parametro?.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-sm text-negro-principal">
                                                        {param.codigo_parametro}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-negro-principal font-medium">
                                                        {param.descripcion}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gris-oscuro text-sm">
                                                        {param.valor}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-gris-oscuro font-medium">
                                                        {param.orden}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {param.estado ? (
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(param)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(param.id_parametrica, param.descripcion)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
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
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-negro-principal">
                                    {editingItem ? 'Editar Parámetro' : 'Nuevo Parámetro'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Tipo de Parámetro */}
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Tipo de Parámetro *
                                        </label>
                                        <select
                                            value={formData.tipo_parametro}
                                            onChange={(e) => setFormData({ ...formData, tipo_parametro: e.target.value })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {tiposParametro.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gris-medio mt-1">Usa guiones bajos para separar palabras</p>
                                    </div>

                                    {/* Código */}
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Código *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.codigo_parametro}
                                            onChange={(e) => setFormData({ ...formData, codigo_parametro: e.target.value })}
                                            className="input-field"
                                            placeholder="ej: DNI, RUC"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Descripción *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="input-field"
                                        placeholder="Descripción completa del parámetro"
                                        required
                                    />
                                </div>

                                {/* Valor */}
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Valor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.valor}
                                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                        className="input-field"
                                        placeholder="Valor del parámetro (opcional)"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Orden */}
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Orden
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.orden}
                                            onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                                            className="input-field"
                                            min="0"
                                        />
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <label className="block text-sm font-medium text-negro-principal mb-2">
                                            Estado
                                        </label>
                                        <select
                                            value={formData.estado ? 'true' : 'false'}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
                                            className="input-field"
                                        >
                                            <option value="true">Activo</option>
                                            <option value="false">Inactivo</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gris-oscuro rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary inline-flex items-center justify-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                {editingItem ? 'Actualizar' : 'Crear'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminMantenimientoParametrica
