import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import usuariosService from '../services/usuariosService'
import NotificationToast from '../components/NotificationToast'
import { ArrowLeft, Save, Users, Mail, Lock, Shield, UserCheck } from 'lucide-react'

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

  useEffect(() => {
    if (isEditing) {
      loadUsuario()
    }
  }, [id])

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
        apellido: formData.apellido.trim() || null,
        email: formData.email.trim().toLowerCase(),
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
        title: isEditing ? 'Usuario actualizado' : 'Usuario creado',
        message: `El usuario ha sido ${isEditing ? 'actualizado' : 'creado'} correctamente.`
      })

      setTimeout(() => {
        navigate('/admin/usuarios')
      }, 2000)
    } catch (error) {
      console.error('Error guardando usuario:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        message: error.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el usuario.`
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
          <form onSubmit={handleSubmit}>
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

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isEditing}
                    className={`input-field ${errors.email ? 'border-red-500' : ''} ${isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-gris-medio mt-1">
                      El email no se puede modificar
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
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                    placeholder={isEditing ? 'Deje vacío para no cambiar' : 'Mínimo 6 caracteres'}
                    required={!isEditing}
                  />
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
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirme la contraseña"
                    required={!isEditing}
                  />
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
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className={`input-field ${errors.rol ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="operario">Operario</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="control_calidad">Control de Calidad</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super Administrador</option>
                  </select>
                  {errors.rol && (
                    <p className="text-xs text-red-600 mt-1">{errors.rol}</p>
                  )}
                  <p className="text-xs text-gris-medio mt-1">
                    El rol determina los permisos del usuario en el sistema
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

