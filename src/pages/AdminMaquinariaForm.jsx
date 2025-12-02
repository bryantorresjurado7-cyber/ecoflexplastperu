import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import NotificationToast from '../components/NotificationToast'
import { ArrowLeft, Save, Settings } from 'lucide-react'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminMaquinariaForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo_maquinaria: '',
    nombre: '',
    descripcion: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    estado: 'activa',
    ubicacion: '',
    fecha_adquisicion: '',
    fecha_ultimo_mantenimiento: '',
    proximo_mantenimiento: '',
    observaciones: '',
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
      loadMaquinaria()
    }
  }, [id])

  const loadMaquinaria = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY

      const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-maquinarias?id=${id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!result.success) throw new Error(result.error)
      
      const data = result.data
      setFormData({
        codigo_maquinaria: data.codigo_maquinaria || '',
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        marca: data.marca || '',
        modelo: data.modelo || '',
        numero_serie: data.numero_serie || '',
        estado: data.estado || 'activa',
        ubicacion: data.ubicacion || '',
        fecha_adquisicion: data.fecha_adquisicion ? data.fecha_adquisicion.split('T')[0] : '',
        fecha_ultimo_mantenimiento: data.fecha_ultimo_mantenimiento ? data.fecha_ultimo_mantenimiento.split('T')[0] : '',
        proximo_mantenimiento: data.proximo_mantenimiento ? data.proximo_mantenimiento.split('T')[0] : '',
        observaciones: data.observaciones || '',
        auditoria: data.auditoria || 'Sistema'
      })
    } catch (error) {
      console.error('Error cargando maquinaria:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar maquinaria',
        message: 'No se pudo cargar la información de la maquinaria. Por favor, intenta nuevamente.'
      })
      setTimeout(() => {
        navigate('/admin/maquinarias')
      }, 2000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY

      const maquinariaData = {
        codigo_maquinaria: formData.codigo_maquinaria,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        numero_serie: formData.numero_serie || null,
        estado: formData.estado,
        ubicacion: formData.ubicacion || null,
        fecha_adquisicion: formData.fecha_adquisicion || null,
        fecha_ultimo_mantenimiento: formData.fecha_ultimo_mantenimiento || null,
        proximo_mantenimiento: formData.proximo_mantenimiento || null,
        observaciones: formData.observaciones || null,
        auditoria: formData.auditoria
      }

      const url = isEditing
        ? `${SUPABASE_URL}/functions/v1/crud-maquinarias?id=${id}`
        : `${SUPABASE_URL}/functions/v1/crud-maquinarias`
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(maquinariaData)
      })

      const result = await response.json()
      
      if (!result.success) throw new Error(result.error)

      // Mostrar notificación de éxito
      setNotification({
        open: true,
        type: 'success',
        title: isEditing ? '¡Maquinaria actualizada exitosamente!' : '¡Maquinaria creada exitosamente!',
        message: isEditing 
          ? 'La maquinaria ha sido actualizada correctamente.'
          : 'La maquinaria ha sido guardada correctamente.'
      })
      
      // Navegar después de 2 segundos
      setTimeout(() => {
        navigate('/admin/maquinarias')
      }, 2000)
    } catch (error) {
      console.error('Error guardando maquinaria:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al guardar maquinaria',
        message: error.message || 'Ocurrió un error al intentar guardar la maquinaria. Por favor, intente nuevamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const estados = [
    { value: 'activa', label: 'Activa' },
    { value: 'inactiva', label: 'Inactiva' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'reparacion', label: 'Reparación' }
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/maquinarias')}
              className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a Maquinarias
            </button>
            <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
              <Settings className="text-verde-principal" size={32} />
              {isEditing ? 'Editar Maquinaria' : 'Nueva Maquinaria'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Código de Maquinaria *
                </label>
                <input
                  type="text"
                  value={formData.codigo_maquinaria}
                  onChange={(e) => setFormData({ ...formData, codigo_maquinaria: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: MAQ-001"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: Extrusora Principal"
                />
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
                  placeholder="Descripción de la maquinaria..."
                />
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: ACME"
                />
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: EXT-2024"
                />
              </div>

              {/* Número de Serie */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={formData.numero_serie}
                  onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: SN123456789"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  required
                  className="input-field w-full"
                >
                  {estados.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ubicación */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: Planta Principal, Línea 1"
                />
              </div>

              {/* Fecha de Adquisición */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Fecha de Adquisición
                </label>
                <input
                  type="date"
                  value={formData.fecha_adquisicion}
                  onChange={(e) => setFormData({ ...formData, fecha_adquisicion: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              {/* Fecha Último Mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Fecha Último Mantenimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_ultimo_mantenimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_ultimo_mantenimiento: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              {/* Próximo Mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Próximo Mantenimiento
                </label>
                <input
                  type="date"
                  value={formData.proximo_mantenimiento}
                  onChange={(e) => setFormData({ ...formData, proximo_mantenimiento: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Observaciones adicionales sobre la maquinaria..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/maquinarias')}
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
                {isEditing ? 'Actualizar Maquinaria' : 'Crear Maquinaria'}
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

export default AdminMaquinariaForm

