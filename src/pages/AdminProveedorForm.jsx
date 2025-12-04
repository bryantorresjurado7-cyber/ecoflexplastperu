import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import NotificationToast from '../components/NotificationToast'
import { ArrowLeft, Save, Truck } from 'lucide-react'

const AdminProveedorForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_documento: 'RUC',
    numero_documento: '',
    direccion: '',
    telefono: '',
    email: '',
    descripcion: '',
    estado: true,
    auditoria: 'Sistema'
  })

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    if (isEditing) {
      loadProveedor()
    }
  }, [id])

  const loadProveedor = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedor')
        .select('*')
        .eq('id_proveedor', id)
        .single()
      
      if (error) throw error
      
      setFormData({
        nombre: data.nombre || '',
        tipo_documento: data.tipo_documento || 'RUC',
        numero_documento: data.numero_documento || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        descripcion: data.descripcion || '',
        estado: data.estado !== undefined ? data.estado : true,
        auditoria: data.auditoria || 'Sistema'
      })
    } catch (error) {
      console.error('Error cargando proveedor:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar proveedor',
        message: 'No se pudo cargar la información del proveedor. Por favor, intenta nuevamente.'
      })
      setTimeout(() => {
        navigate('/admin/proveedores')
      }, 2000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const proveedorData = {
        nombre: formData.nombre,
        tipo_documento: formData.tipo_documento,
        numero_documento: formData.numero_documento,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email?.trim() || null,
        descripcion: formData.descripcion || null,
        estado: formData.estado,
        auditoria: formData.auditoria
      }

      let result
      if (isEditing) {
        const { data, error } = await supabase
          .from('proveedor')
          .update(proveedorData)
          .eq('id_proveedor', id)
          .select()
          .single()
        
        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('proveedor')
          .insert([proveedorData])
          .select()
          .single()
        
      if (error) throw error
      result = data
      }

      // Mostrar notificación de éxito
      setNotification({
        open: true,
        type: 'success',
        title: isEditing ? '¡Proveedor actualizado exitosamente!' : '¡Proveedor creado exitosamente!',
        message: isEditing 
          ? 'El proveedor ha sido actualizado correctamente.'
          : 'El proveedor ha sido guardado correctamente.'
      })
      
      // Navegar después de 2 segundos
      setTimeout(() => {
        navigate('/admin/proveedores')
      }, 2000)
    } catch (error) {
      console.error('Error guardando proveedor:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al guardar proveedor',
        message: error.message || 'Ocurrió un error al intentar guardar el proveedor. Por favor, intente nuevamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const tiposDocumento = [
    { value: 'RUC', label: 'RUC - Registro Único de Contribuyente' },
    { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
    { value: 'CE', label: 'CE - Carné de Extranjería' },
    { value: 'PAS', label: 'PAS - Pasaporte' }
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/proveedores')}
              className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a Proveedores
            </button>
            <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
              <Truck className="text-verde-principal" size={32} />
              {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: Distribuidora ABC S.A.C."
                />
              </div>

              {/* Tipo de Documento */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Tipo de Documento *
                </label>
                <select
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                  required
                  className="input-field w-full"
                >
                  {tiposDocumento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Documento */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: 20123456789"
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: Av. Principal 123, Lima, Perú"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: +51 987654321"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: contacto@proveedor.com (opcional)"
                />
              </div>

              {/* Estado */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-negro-principal">
                    Proveedor activo
                  </span>
                </label>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Descripción adicional del proveedor..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/proveedores')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save size={18} />
                )}
                {isEditing ? 'Actualizar Proveedor' : 'Crear Proveedor'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notificación Toast */}
      <NotificationToast
        open={notification.open}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, open: false })}
        duration={notification.type === 'success' ? 3000 : 5000}
      />
    </AdminLayout>
  )
}

export default AdminProveedorForm

