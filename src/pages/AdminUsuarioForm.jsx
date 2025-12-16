import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import usuariosService from '../services/usuariosService'
import { getParametrica } from '../services/parametricaService'
import NotificationToast from '../components/NotificationToast'
import { ArrowLeft, Save, Users, Mail, Lock, Shield, UserCheck, ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react'

const AdminUsuarioForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Estado para sugerencias de rol
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false)

  // Estado para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado para roles dinámicos desde parametrica
  const [rolesFromDB, setRolesFromDB] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  // Roles por defecto (fallback si falla la carga desde BD)
  const defaultRoles = [
    { value: 'operario', label: 'Operario' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'control_calidad', label: 'Control de Calidad' },
    { value: 'admin', label: 'Administrador' },
    { value: 'super_admin', label: 'Super Administrador' }
  ]

  // Usar roles de BD o fallback
  const predefinedRoles = rolesFromDB.length > 0 ? rolesFromDB : defaultRoles

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'operario',
    activo: true
  })

  const [errors, setErrors] = useState({})

  // Cargar roles desde parametrica al montar el componente
  useEffect(() => {
    loadRoles()
  }, [])

  useEffect(() => {
    if (isEditing) {
      loadUsuario()
    }
  }, [id])

  // Función para cargar roles desde el servicio parametrica
  const loadRoles = async () => {
    try {
      setLoadingRoles(true)
      const result = await getParametrica('rol_usuario', 'true')
      
      if (result.data && result.data.length > 0) {
        // Mapear datos de parametrica al formato esperado
        const roles = result.data
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(item => ({
            value: item.valor || item.codigo_parametro,
            label: item.descripcion || item.codigo_parametro
          }))
        setRolesFromDB(roles)
      }
    } catch (error) {
      console.error('Error cargando roles:', error)
      // Si falla, usará los roles por defecto (fallback)
    } finally {
      setLoadingRoles(false)
    }
  }

  const loadUsuario = async () => {
    try {
      setLoading(true)
      const result = await usuariosService.loadUsuario(id)

      if (result.error) throw new Error(result.error)

      const data = result.data
      // Asegurarse de que apellido sea string vacío si es null o undefined
      const apellido = data.apellido ? String(data.apellido).trim() : ''
      // Asegurarse de que email sea string vacío si es null o undefined
      const email = data.email ? String(data.email).trim() : ''

      setFormData({
        nombre: data.nombre ? String(data.nombre).trim() : '',
        apellido: apellido,
        email: email,
        password: '',
        confirmPassword: '',
        rol: data.rol || 'operario',
        activo: data.activo !== undefined ? data.activo : true
      })
    } catch (error) {
      console.error('Error cargando usuario:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Error al cargar usuario: ' + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      setNotification({
        open: true,
        type: 'error',
        title: 'Error de validación',
        message: 'Por favor, corrige los errores en el formulario.'
      })
      return
    }

    setLoading(true)

    try {
      const usuarioData = {
        nombre: formData.nombre.trim(),
        apellido: (formData.apellido || '').trim() || null,
        email: (formData.email || '').trim().toLowerCase(),
        rol: formData.rol,
        activo: formData.activo
      }

      // Solo incluir password si se está creando o si se está editando y se proporcionó una nueva
      if (!isEditing || (isEditing && formData.password.trim())) {
        usuarioData.password = formData.password.trim()
      }

      let result
      if (isEditing) {
        result = await usuariosService.updateUsuario(id, usuarioData)
      } else {
        result = await usuariosService.createUsuario(usuarioData)
      }

      if (result.error) throw new Error(result.error)

      setNotification({
        open: true,
        type: 'success',
        title: isEditing ? 'Actualización Completada' : 'Creación Exito',
        message: 'El cambio se realizó de manera exitosa.'
      })

      setTimeout(() => {
        navigate('/admin/usuarios')
      }, 2000)
    } catch (error) {
      console.error('Error guardando usuario:', error)

      let errorMessage = error.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el usuario.`

      const newErrors = {}
      const msgLower = errorMessage.toLowerCase()

      // Mapeo de errores de API a campos específicos
      if (msgLower.includes('email') || msgLower.includes('correo')) {
        newErrors.email = errorMessage
      }

      if (msgLower.includes('password') || msgLower.includes('contraseña')) {
        newErrors.password = errorMessage
      }

      if (msgLower.includes('name') || msgLower.includes('nombre')) {
        newErrors.nombre = errorMessage
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...newErrors }))
      }

      if (errorMessage.toLowerCase().includes('constraint') || errorMessage.toLowerCase().includes('violates check constraint')) {
        errorMessage = 'Error de base de datos: El rol ingresado no está permitido actualmente.'
        setErrors(prev => ({ ...prev, rol: errorMessage }))
      }

      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar. Revise los campos marcados en rojo.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditing) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando usuario...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/usuarios')}
              className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a Usuarios
            </button>
            <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
              <Users className="text-verde-principal" size={32} />
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Hack para evitar autocompletado en algunos navegadores */}
            <input type="password" style={{ display: 'none' }} />
            <input type="email" style={{ display: 'none' }} />

            <div className="bg-white rounded-xl shadow-card p-6 space-y-6">
              {/* Información Personal */}
              <div>
                <h2 className="text-lg font-semibold text-negro-principal mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
                      placeholder="Ingrese el nombre"
                      autoComplete="off"
                      required
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ingrese el apellido (opcional)"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-negro-principal mb-2 flex items-center gap-2">
                      <Mail size={16} />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="usuario@ejemplo.com"
                      autoComplete="off"
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                    )}
                    {isEditing && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        Nota: Si cambia el email, deberá usar el nuevo para iniciar sesión.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <h2 className="text-lg font-semibold text-negro-principal mb-4 flex items-center gap-2">
                  <Lock size={20} />
                  {isEditing ? 'Cambiar Contraseña' : 'Contraseña'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder={isEditing ? 'Deje vacío para no cambiar' : 'Mínimo 6 caracteres'}
                        autoComplete="new-password"
                        required={!isEditing}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-medio hover:text-negro-principal transition-colors p-1"
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        onTouchStart={() => setShowPassword(true)}
                        onTouchEnd={() => setShowPassword(false)}
                        title="Mantener presionado para ver"
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                    )}
                    {isEditing && (
                      <p className="text-xs text-gris-medio mt-1">
                        Deje en blanco si no desea cambiar la contraseña
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Confirmar Contraseña {!isEditing && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirme la contraseña"
                        required={!isEditing}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-medio hover:text-negro-principal transition-colors p-1"
                        onMouseDown={() => setShowConfirmPassword(true)}
                        onMouseUp={() => setShowConfirmPassword(false)}
                        onMouseLeave={() => setShowConfirmPassword(false)}
                        onTouchStart={() => setShowConfirmPassword(true)}
                        onTouchEnd={() => setShowConfirmPassword(false)}
                        title="Mantener presionado para ver"
                      >
                        {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rol y Estado */}
              <div>
                <h2 className="text-lg font-semibold text-negro-principal mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Permisos y Estado
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Rol *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        onFocus={() => setShowRoleSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                        className={`input-field pr-10 ${errors.rol ? 'border-red-500' : ''}`}
                        placeholder="Seleccione o escriba un rol"
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-medio hover:text-negro-principal transition-colors"
                        onClick={() => setShowRoleSuggestions(!showRoleSuggestions)}
                      >
                        {loadingRoles ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <ChevronDown size={20} className={`transition-transform ${showRoleSuggestions ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {showRoleSuggestions && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                          {loadingRoles ? (
                            <li className="px-4 py-3 text-sm text-gris-medio flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin" />
                              Cargando roles...
                            </li>
                          ) : predefinedRoles.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-gris-medio">
                              No hay roles disponibles
                            </li>
                          ) : (
                            <>
                              {predefinedRoles
                                .filter(r =>
                                  r.label.toLowerCase().includes(formData.rol.toLowerCase()) ||
                                  r.value.toLowerCase().includes(formData.rol.toLowerCase())
                                )
                                .map(role => (
                                  <li
                                    key={role.value}
                                    className={`px-4 py-3 hover:bg-verde-claro/10 cursor-pointer text-sm flex items-center justify-between group transition-colors ${
                                      formData.rol === role.value ? 'bg-verde-claro/20 border-l-4 border-verde-principal' : ''
                                    }`}
                                    onMouseDown={() => {
                                      setFormData(prev => ({ ...prev, rol: role.value }))
                                      setErrors(prev => ({ ...prev, rol: '' }))
                                      setShowRoleSuggestions(false)
                                    }}
                                  >
                                    <span className="font-medium text-negro-principal">{role.label}</span>
                                    <span className="text-gris-medio text-xs group-hover:text-verde-principal transition-colors bg-gray-100 px-2 py-0.5 rounded">
                                      {role.value}
                                    </span>
                                  </li>
                                ))
                              }
                              {formData.rol && !predefinedRoles.some(r => r.value === formData.rol) && (
                                <li className="px-4 py-3 text-sm text-gris-medio italic bg-amber-50 border-t border-gray-100 flex items-center gap-2">
                                  <span className="text-amber-600">✨</span>
                                  Nuevo rol: <span className="font-medium text-negro-principal">{formData.rol}</span>
                                </li>
                              )}
                            </>
                          )}
                        </ul>
                      )}
                    </div>
                    {errors.rol && (
                      <p className="text-xs text-red-600 mt-1">{errors.rol}</p>
                    )}
                    <p className="text-xs text-gris-medio mt-1 flex items-center gap-1">
                      {loadingRoles ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Cargando roles desde base de datos...
                        </>
                      ) : rolesFromDB.length > 0 ? (
                        <>
                          ✓ {rolesFromDB.length} roles cargados desde base de datos
                        </>
                      ) : (
                        'Seleccione un rol existente o escriba uno nuevo'
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 p-4 border border-gris-muy-claro rounded-lg hover:bg-gris-muy-claro cursor-pointer">
                      <input
                        type="checkbox"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                      />
                      <div className="flex items-center gap-2">
                        <UserCheck className="text-verde-principal" size={20} />
                        <span className="text-sm font-medium text-negro-principal">
                          Usuario Activo
                        </span>
                      </div>
                    </label>
                    <p className="text-xs text-gris-medio mt-1">
                      Los usuarios inactivos no pueden iniciar sesión
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/usuarios')}
                  className="px-6 py-2 border border-gris-medio text-gris-medio rounded-lg hover:bg-gris-muy-claro transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={20} />
                  {loading ? 'Guardando...' : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Notificación */}
      {notification.open && (
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification({ ...notification, open: false })}
        />
      )}
    </AdminLayout>
  )
}

export default AdminUsuarioForm

