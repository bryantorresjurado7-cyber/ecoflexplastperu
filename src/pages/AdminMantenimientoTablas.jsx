
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import NotificationToast from '../components/NotificationToast'
import {
    Database,
    Table,
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Save,
    Loader,
    AlertCircle,
    CheckCircle,
    PanelLeft,
    Menu
} from 'lucide-react'

// --- CONFIGURACIÓN DE TABLAS ---
// Se deja vacío para permitir el descubrimiento dinámico de columnas y tipos de datos
// para todas las tablas, replicando el comportamiento de 'admin_profiles'.
const TABLE_CONFIG = {}

// --- COMPONENTES AUXILIARES ---

const StatusBadge = ({ active }) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {active ? 'Activo' : 'Inactivo'}
    </span>
)

const Drawer = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in-right">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-negro-principal">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-fondo-gris rounded-full transition-colors">
                        <X size={20} className="text-gris-oscuro" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    )
}

// --- COMPONENTE PRINCIPAL ---

const AdminMantenimientoTablas = () => {
    const { table } = useParams()
    const navigate = useNavigate()

    // Determinar tabla seleccionada (dinámica)
    const selectedTable = table || 'parametrica'

    // Configuración activa (predefinida o dinámica)
    const [activeConfig, setActiveConfig] = useState(TABLE_CONFIG[selectedTable] || {
        label: selectedTable,
        pk: 'id',
        columns: []
    })

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterActive, setFilterActive] = useState('all') // all, active, inactive
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Estado Modal Formulario
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Notificaciones
    const [notification, setNotification] = useState({ open: false, type: 'success', title: '', message: '' })

    const config = activeConfig

    useEffect(() => {
        // Al cambiar de tabla, reseteamos config si no existe predefinida, y cargamos datos
        const predefined = TABLE_CONFIG[selectedTable]
        if (predefined) {
            setActiveConfig(predefined)
            loadData(predefined)
        } else {
            // Config temporal hasta que carguen datos
            const tempConfig = {
                label: selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1).replace(/_/g, ' '),
                pk: 'id',
                columns: []
            }
            setActiveConfig(tempConfig)
            loadData(tempConfig)
        }
    }, [selectedTable])

    const loadData = async (currentConfig) => {
        setLoading(true)
        try {
            // Usamos config pasada o estado
            const cfg = currentConfig || activeConfig

            let query = supabase
                .from(selectedTable)
                .select('*')

            // Solo ordenar si tenemos un campo definido
            if (cfg.defaultSort) {
                query = query.order(cfg.defaultSort, { ascending: true })
            } else if (cfg.pk) {
                // Try ordering by PK if generic
                query = query.order(cfg.pk, { ascending: true })
            }

            const { data, error } = await query

            if (error) throw error
            setData(data || [])

            // Descubrimiento Dinámico de Columnas
            if (!TABLE_CONFIG[selectedTable] && data && data.length > 0) {
                const firstItem = data[0]
                const keys = Object.keys(firstItem)

                // Generar columnas basadas en datos
                const newColumns = keys.map(key => ({
                    key,
                    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                    type: typeof firstItem[key] === 'number' ? 'number' :
                        key.includes('date') || key.includes('at') ? 'date' : 'text',
                    readOnly: key === 'id' || key === 'created_at'
                }))

                setActiveConfig(prev => ({
                    ...prev,
                    columns: newColumns,
                    pk: keys.includes('id') ? 'id' : keys[0],
                    activeField: keys.includes('estado') ? 'estado' : keys.includes('active') ? 'active' : null
                }))
            }
        } catch (error) {
            console.error('Error cargando datos:', error)
            showNotification('error', 'Error al cargar datos', error.message)
        } finally {
            setLoading(false)
        }
    }

    const showNotification = (type, title, message) => {
        setNotification({ open: true, type, title, message })
    }

    // Filtrado y búsqueda
    const filteredData = data.filter(item => {
        // Búsqueda textual
        const matchesSearch = config.columns.some(col => {
            const val = item[col.key]
            return val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        })

        // Filtro estado
        let matchesStatus = true
        if (filterActive !== 'all') {
            const isActive = config.activeValueMap
                ? item[config.activeField] === config.activeValueMap[true]
                : !!item[config.activeField]

            matchesStatus = filterActive === 'active' ? isActive : !isActive
        }

        return matchesSearch && matchesStatus
    })

    // Paginación
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Acciones CRUD
    const handleCreate = () => {
        setEditingItem(null)
        setIsFormOpen(true)
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setIsFormOpen(true)
    }

    const handleSubmit = async (formData) => {
        try {
            // Limpiar campos vacíos si es necesario o transformar tipos
            const payload = { ...formData }

            // Eliminar ID si es nuevo
            if (!editingItem) {
                delete payload[config.pk]
            }

            let error = null

            if (editingItem) {
                const { error: updateError } = await supabase
                    .from(selectedTable)
                    .update(payload)
                    .eq(config.pk, editingItem[config.pk])
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from(selectedTable)
                    .insert(payload)
                error = insertError
            }

            if (error) throw error

            showNotification('success', 'Éxito', `Registro ${editingItem ? 'actualizado' : 'creado'} correctamente`)
            setIsFormOpen(false)
            loadData()
        } catch (error) {
            console.error('Error guardando:', error)
            showNotification('error', 'Error al guardar', error.message)
        }
    }

    const handleToggleStatus = async (item) => {
        try {
            const currentState = config.activeValueMap
                ? item[config.activeField] === config.activeValueMap[true]
                : !!item[config.activeField]

            const newState = !currentState

            // Determinar valor a guardar
            const valueToSave = config.activeValueMap
                ? config.activeValueMap[newState]
                : newState

            const { error } = await supabase
                .from(selectedTable)
                .update({ [config.activeField]: valueToSave })
                .eq(config.pk, item[config.pk])

            if (error) throw error

            showNotification('success', 'Estado actualizado', 'El estado del registro ha sido modificado.')

            // Actualización optimista local
            setData(prev => prev.map(current =>
                current[config.pk] === item[config.pk]
                    ? { ...current, [config.activeField]: valueToSave }
                    : current
            ))

        } catch (error) {
            console.error('Error cambiando estado:', error)
            showNotification('error', 'Error', 'No se pudo cambiar el estado')
        }
    }

    return (
        <AdminLayout>
            <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] bg-fondo-claro w-full">
                {/* CONTENIDO PRINCIPAL */}
                <main className="flex-1 flex flex-col w-full">
                    {/* HEADER DE LA VISTA */}
                    <div className="p-6 bg-white border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-negro-principal">{config.label}</h1>
                                <p className="text-sm text-gris-medio">Gestión de registros de la tabla {selectedTable}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            className="btn-primary flex items-center gap-2 shadow-lg"
                        >
                            <Plus size={20} />
                            Nuevo Registro
                        </button>
                    </div>

                    {/* FILTROS Y TOOLBAR */}
                    <div className="p-4 bg-fondo-claro border-b border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4 bg-white p-3 rounded-xl shadow-sm">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-fondo-claro border border-transparent rounded-lg focus:bg-white focus:border-verde-principal focus:outline-none transition-all text-sm"
                                />
                            </div>
                            <select
                                value={filterActive}
                                onChange={e => setFilterActive(e.target.value)}
                                className="px-4 py-2 bg-fondo-claro border-transparent rounded-lg focus:bg-white focus:border-verde-principal text-sm text-gris-oscuro focus:outline-none cursor-pointer"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="active">Activos</option>
                                <option value="inactive">Inactivos</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLA DE DATOS */}
                    <div className="flex-1 p-2 md:p-4 min-w-0 flex flex-col">
                        <div className="bg-white rounded-xl shadow-card h-full flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-auto relative w-full">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gris-medio">
                                        <Loader className="animate-spin mb-2" size={32} />
                                        <p>Cargando datos...</p>
                                    </div>
                                ) : filteredData.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gris-medio">
                                        <Search size={48} className="mb-4 text-gris-claro" />
                                        <p className="text-lg font-medium">No se encontraron resultados</p>
                                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                    </div>
                                ) : (
                                    <table className="w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                {config.columns.map(col => (
                                                    <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold text-gris-oscuro uppercase tracking-wider whitespace-nowrap">
                                                        {col.label}
                                                    </th>
                                                ))}
                                                <th className="px-3 py-2 text-center text-xs font-semibold text-gris-oscuro uppercase tracking-wider whitespace-nowrap">
                                                    Estado
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gris-oscuro uppercase tracking-wider whitespace-nowrap">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedData.map((item, idx) => {
                                                const isActive = config.activeValueMap
                                                    ? item[config.activeField] === config.activeValueMap[true]
                                                    : !!item[config.activeField]

                                                return (
                                                    <tr key={item[config.pk] || idx} className="hover:bg-fondo-claro transition-colors group">
                                                        {config.columns.map(col => (
                                                            <td key={col.key} className={`px-3 py-2 text-xs text-gris-oscuro whitespace-nowrap ${col.type === 'textarea' ? 'max-w-[300px] truncate' : ''}`}>
                                                                {col.type === 'number' && typeof item[col.key] === 'number'
                                                                    ? item[col.key].toLocaleString()
                                                                    : String(item[col.key] || '-')
                                                                }
                                                            </td>
                                                        ))}
                                                        <td className="px-3 py-2 text-center">
                                                            <button
                                                                onClick={() => handleToggleStatus(item)}
                                                                className="focus:outline-none transform active:scale-95 transition-transform"
                                                                title={isActive ? "Desactivar" : "Activar"}
                                                            >
                                                                <StatusBadge active={isActive} />
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="p-1.5 text-azul hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleStatus(item)}
                                                                    className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                                                                        }`}
                                                                    title={isActive ? "Desactivar" : "Activar"}
                                                                >
                                                                    {isActive ? <Trash2 size={18} /> : <CheckCircle size={18} />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* PAGINACIÓN */}
                        {!loading && filteredData.length > 0 && (
                            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gris-medio pb-8">
                                <p>
                                    Mostrando <span className="font-semibold text-negro-principal">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-semibold text-negro-principal">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> de <span className="font-semibold text-negro-principal">{filteredData.length}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* MODAL / DRAWER FORMULARIO */}
            <Drawer
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={`${editingItem ? 'Editar' : 'Nuevo'} ${config.label}`}
            >
                <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    const values = Object.fromEntries(formData.entries())
                    handleSubmit(values)
                }} className="space-y-4">

                    {config.columns.filter(col => !col.readOnly).map(col => (
                        <div key={col.key}>
                            <label className="block text-sm font-medium text-negro-principal mb-1">
                                {col.label} {col.required && <span className="text-red-500">*</span>}
                            </label>

                            {col.type === 'textarea' ? (
                                <textarea
                                    name={col.key}
                                    defaultValue={editingItem?.[col.key]}
                                    required={col.required}
                                    rows={4}
                                    className="w-full px-4 py-2 bg-fondo-claro border border-gray-200 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none transition-all resize-none"
                                    placeholder={`Ingrese ${col.label.toLowerCase()}`}
                                />
                            ) : (
                                <input
                                    type={col.type}
                                    name={col.key}
                                    defaultValue={editingItem?.[col.key]}
                                    required={col.required}
                                    step={col.step}
                                    className="w-full px-4 py-2 bg-fondo-claro border border-gray-200 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none transition-all"
                                    placeholder={`Ingrese ${col.label.toLowerCase()}`}
                                />
                            )}
                        </div>
                    ))}

                    {/* Estado Toggle en Formulario (Opcional, pero bueno tenerlo) */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <label className="text-sm font-medium text-negro-principal">Estado del registro</label>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gris-medio">
                                El registro se creará como activo por defecto
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gris-oscuro rounded-lg hover:bg-fondo-claro transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-verde-principal text-white rounded-lg hover:bg-verde-hover transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </Drawer>

            <NotificationToast
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            />
        </AdminLayout>
    )
}

export default AdminMantenimientoTablas
