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
    Layers,
    AlertCircle,
    CheckCircle,
    Loader2,
    
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const AdminMantenimientoCategorias = () => {
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [saving, setSaving] = useState(false)
    const [notification, setNotification] = useState(null)

    const [formData, setFormData] = useState({
        nombre: '',
        slug: '',
        descripcion: '',
        orden: 0,
        activo: true
    })

    useEffect(() => {
        loadCategorias()
    }, [])

    const loadCategorias = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('categorias_productos')
                .select('*')
                .order('orden', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error
            setCategorias(data || [])
        } catch (error) {
            console.error('Error cargando categorías:', error)
            showNotification('Error al cargar las categorías', 'error')
        } finally {
            setLoading(false)
        }
    }

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }

    const generateSlug = (nombre) => {
        return nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                nombre: item.nombre || '',
                slug: item.slug || '',
                descripcion: item.descripcion || '',
                orden: item.orden || 0,
                activo: item.activo ?? true
            })
        } else {
            setEditingItem(null)
            setFormData({
                nombre: '',
                slug: '',
                descripcion: '',
                orden: 0,
                activo: true
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
        setFormData({
            nombre: '',
            slug: '',
            descripcion: '',
            orden: 0,
            activo: true
        })
    }

    const handleNombreChange = (nombre) => {
        setFormData({
            ...formData,
            nombre,
            slug: generateSlug(nombre)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (editingItem) {
                // Actualizar
                const { error } = await supabase
                    .from('categorias_productos')
                    .update({
                        nombre: formData.nombre,
                        slug: formData.slug,
                        descripcion: formData.descripcion,
                        orden: formData.orden,
                        activo: formData.activo
                    })
                    .eq('id', editingItem.id)

                if (error) throw error
                showNotification('Categoría actualizada correctamente')
            } else {
                // Crear
                const { error } = await supabase
                    .from('categorias_productos')
                    .insert([{
                        nombre: formData.nombre,
                        slug: formData.slug,
                        descripcion: formData.descripcion,
                        orden: formData.orden,
                        activo: formData.activo,
                        created_at: new Date().toISOString()
                    }])

                if (error) throw error
                showNotification('Categoría creada correctamente')
            }

            handleCloseModal()
            loadCategorias()
        } catch (error) {
            console.error('Error guardando categoría:', error)
            showNotification('Error al guardar la categoría', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return

        try {
            const { error } = await supabase
                .from('categorias_productos')
                .delete()
                .eq('id', id)

            if (error) throw error
            showNotification('Categoría eliminada correctamente')
            loadCategorias()
        } catch (error) {
            console.error('Error eliminando categoría:', error)
            showNotification('Error al eliminar la categoría', 'error')
        }
    }

    const filteredCategorias = categorias.filter(c => {
        return c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               c.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <Layers className="text-green-500" size={32} />
                        <h1 className="text-3xl font-bold text-negro-principal">
                            Categorías de Productos
                        </h1>
                    </div>
                    <p className="text-gris-medio ml-11">
                        Administra las categorías del catálogo de productos
                    </p>
                </div>

                {/* Barra de búsqueda */}
                <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar categorías..."
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                {/* Botón Agregar */}
                <div className="mb-6">
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Agregar Categoría
                    </button>
                </div>

                {/* Tabla */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-card p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-verde-principal mb-4" size={40} />
                        <p className="text-gris-medio">Cargando categorías...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-fondo-gris">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Slug
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gris-oscuro uppercase tracking-wider">
                                            Descripción
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
                                        {filteredCategorias.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <p className="text-gris-medio">No se encontraron categorías</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCategorias.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-fondo-claro transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-negro-principal font-semibold">
                                                        {cat.nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-sm text-gris-oscuro bg-gray-100 px-2 py-1 rounded">
                                                        {cat.slug}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gris-oscuro text-sm">
                                                        {cat.descripcion || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-gris-oscuro font-medium">
                                                        {cat.orden}
                                                    </span>
                                                </td>
                                                
                                                <td className="px-6 py-4 text-center">
                                                    {cat.activo ? (
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
                                                            onClick={() => handleOpenModal(cat)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(cat.id, cat.nombre)}
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
                                    {editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Nombre de la Categoría *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => handleNombreChange(e.target.value)}
                                        className="input-field"
                                        placeholder="ej: Zunchos de Plástico"
                                        required
                                    />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Slug (URL amigable) *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="input-field font-mono"
                                        placeholder="ej: zunchos-de-plastico"
                                        required
                                    />
                                    <p className="text-xs text-gris-medio mt-1">Se genera automáticamente, pero puedes editarlo</p>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="input-field resize-none"
                                        rows="3"
                                        placeholder="Descripción de la categoría (opcional)"
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
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
                                            value={formData.activo ? 'true' : 'false'}
                                            onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
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

export default AdminMantenimientoCategorias
