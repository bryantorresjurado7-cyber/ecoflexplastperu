import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
    ArrowLeft,
    Save,
    Loader2,
    Shield,
    Check
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { menuItems } from '../data/menuItems'

const AdminMantenimientoModulos = () => {
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedRole, setSelectedRole] = useState(null)
    const [saving, setSaving] = useState(false)
    const [notification, setNotification] = useState(null)

    // Local state for the selected role's permissions
    const [currentPermissions, setCurrentPermissions] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)

            // Cargar roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('parametrica')
                .select('*')
                .eq('tipo_parametro', 'rol_usuario')
                .eq('estado', true)

            if (rolesError) throw rolesError

            // Cargar permisos existentes
            const { data: permsData, error: permsError } = await supabase
                .from('parametrica')
                .select('*')
                .eq('tipo_parametro', 'permisos_rol')

            if (permsError) throw permsError

            setRoles(rolesData || [])
            setPermissions(permsData || [])

            if (rolesData && rolesData.length > 0) {
                // Seleccionar el primer rol por defecto
                handleRoleSelect(rolesData[0], permsData || [])
            }

        } catch (error) {
            console.error('Error cargando datos:', error)
            showNotification('Error al cargar datos', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleSelect = (role, currentPermsList = permissions) => {
        setSelectedRole(role)

        // Buscar permisos para este rol
        // El codigo_parametro del permiso debe coincidir con el codigo_parametro del rol
        const permEntry = currentPermsList.find(p => p.codigo_parametro === role.codigo_parametro)

        if (permEntry && permEntry.valor) {
            try {
                setCurrentPermissions(JSON.parse(permEntry.valor))
            } catch (e) {
                console.error('Error parseando permisos JSON:', e)
                setCurrentPermissions([])
            }
        } else {
            setCurrentPermissions([])
        }
    }

    const toggleModule = (moduleId) => {
        setCurrentPermissions(prev => {
            if (prev.includes(moduleId)) {
                return prev.filter(id => id !== moduleId)
            } else {
                return [...prev, moduleId]
            }
        })
    }

    // Helper to check if a module or its subitems are checked
    const isModuleChecked = (moduleId) => currentPermissions.includes(moduleId)

    const handleSave = async () => {
        if (!selectedRole) return
        setSaving(true)

        try {
            // Verificar si ya existe una entrada para este rol
            const existingPerm = permissions.find(p => p.codigo_parametro === selectedRole.codigo_parametro)

            const permValue = JSON.stringify(currentPermissions)

            if (existingPerm) {
                // Actualizar
                const { error } = await supabase
                    .from('parametrica')
                    .update({
                        valor: permValue,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id_parametrica', existingPerm.id_parametrica)

                if (error) throw error
            } else {
                // Crear nuevo
                const { error } = await supabase
                    .from('parametrica')
                    .insert([{
                        tipo_parametro: 'permisos_rol',
                        codigo_parametro: selectedRole.codigo_parametro,
                        descripcion: `Permisos para rol ${selectedRole.descripcion}`,
                        valor: permValue,
                        orden: 0,
                        estado: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])

                if (error) throw error
            }

            // Recargar permisos
            const { data: permsData, error: permsError } = await supabase
                .from('parametrica')
                .select('*')
                .eq('tipo_parametro', 'permisos_rol')

            if (permsError) throw permsError
            setPermissions(permsData || [])

            showNotification('Permisos guardados correctamente')

        } catch (error) {
            console.error('Error guardando permisos:', error)
            showNotification('Error al guardar permisos', 'error')
        } finally {
            setSaving(false)
        }
    }

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Notification */}
                {notification && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in">
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${notification.type === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}>
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
                        <Shield className="text-blue-500" size={32} />
                        <h1 className="text-3xl font-bold text-negro-principal">
                            Gestión de Módulos (Roles)
                        </h1>
                    </div>
                    <p className="text-gris-medio ml-11">
                        Configura qué módulos son visibles para cada rol
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Lista de Roles */}
                    <div className="md:col-span-1 bg-white rounded-xl shadow-card p-4 h-fit">
                        <h2 className="font-bold text-lg text-negro-principal mb-4 px-2">Roles</h2>
                        {loading && roles.length === 0 ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="animate-spin text-verde-principal" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {roles.map(role => (
                                    <button
                                        key={role.id_parametrica}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${selectedRole?.id_parametrica === role.id_parametrica
                                                ? 'bg-verde-principal text-white shadow-md'
                                                : 'hover:bg-fondo-claro text-gris-oscuro'
                                            }`}
                                    >
                                        <span className="font-medium">{role.descripcion}</span>
                                        {selectedRole?.id_parametrica === role.id_parametrica && (
                                            <Check size={16} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selector de Módulos */}
                    <div className="md:col-span-3 bg-white rounded-xl shadow-card p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                <Loader2 className="animate-spin text-verde-principal mb-2" size={32} />
                                <p className="text-gris-medio">Cargando...</p>
                            </div>
                        ) : !selectedRole ? (
                            <div className="text-center p-12 text-gris-medio">
                                Selecciona un rol para configurar sus permisos
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6 border-b pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-negro-principal">
                                            Permisos para: <span className="text-verde-principal">{selectedRole.descripcion}</span>
                                        </h2>
                                        <p className="text-sm text-gris-medio mt-1">
                                            Selecciona los módulos a los que este rol tendrá acceso
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Guardar Cambios
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {menuItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`border rounded-xl p-4 transition-all cursor-pointer ${isModuleChecked(item.id)
                                                    ? 'border-verde-principal bg-green-50'
                                                    : 'border-gray-200 hover:border-verde-principal/50'
                                                }`}
                                            onClick={() => toggleModule(item.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${isModuleChecked(item.id) ? 'bg-verde-principal text-white' : 'bg-gray-100 text-gris-medio'
                                                    }`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className={`font-semibold ${isModuleChecked(item.id) ? 'text-negro-principal' : 'text-gris-medio'
                                                            }`}>
                                                            {item.title}
                                                        </h3>
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isModuleChecked(item.id) ? 'bg-verde-principal border-verde-principal' : 'border-gray-300 bg-white'
                                                            }`}>
                                                            {isModuleChecked(item.id) && <Check size={12} className="text-white" />}
                                                        </div>
                                                    </div>
                                                    {item.subItems && (
                                                        <p className="text-xs text-gris-medio mt-2">
                                                            Incluye: {item.subItems.map(s => s.title).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminMantenimientoModulos
