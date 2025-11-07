import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import produccionService from '../services/produccionService'
import NotificationToast from '../components/NotificationToast'
import { useAuth } from '../contexts/AuthContext'
import {
  ArrowLeft,
  Factory,
  Package,
  ClipboardCheck,
  FileText,
  Save
} from 'lucide-react'

const AdminProduccionValidacion = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [produccion, setProduccion] = useState(null)
  const [lotes, setLotes] = useState([])
  const [lotesDisponibles, setLotesDisponibles] = useState([])
  const [lotesAsignados, setLotesAsignados] = useState([])
  
  const [formData, setFormData] = useState({
    cantidad_producida: null,
    cantidad_buen_estado: null,
    cantidad_defectuosa: null,
    calidad_controlada: false,
    fecha_control_calidad: '',
    resultado_control: '',
    observaciones_validacion: '',
    lotes_seleccionados: []
  })
  
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    if (id) {
      loadProduccion()
      loadLotesDisponibles()
    }
  }, [id])

  const loadProduccion = async () => {
    try {
      setLoading(true)
      const result = await produccionService.loadProduccion(id)
      
      if (result.error) throw new Error(result.error)
      
      const prod = result.data
      setProduccion(prod)
      
      // Cargar lotes asignados a esta producción
      if (prod.id_produccion) {
        const { data: lotesAsign, error } = await supabase
          .from('produccion_lotes')
          .select(`
            *,
            lote:lotes(*)
          `)
          .eq('id_produccion', prod.id_produccion)
        
        if (!error && lotesAsign) {
          setLotesAsignados(lotesAsign)
          setFormData(prev => ({
            ...prev,
            lotes_seleccionados: lotesAsign.map(l => l.id_lote)
          }))
        }
      }
      
      // Cargar datos del formulario
      setFormData({
        cantidad_producida: prod.cantidad_producida || null,
        cantidad_buen_estado: prod.cantidad_buen_estado || null,
        cantidad_defectuosa: prod.cantidad_defectuosa || null,
        calidad_controlada: prod.calidad_controlada || false,
        fecha_control_calidad: prod.fecha_control_calidad || new Date().toISOString().split('T')[0],
        resultado_control: prod.resultado_control || '',
        observaciones_validacion: prod.observaciones_validacion || '',
        lotes_seleccionados: []
      })
    } catch (error) {
      console.error('Error cargando producción:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar la orden de producción.'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLotesDisponibles = async () => {
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select('*')
        .order('fecha_creacion', { ascending: false })
      
      if (error) throw error
      setLotesDisponibles(data || [])
    } catch (error) {
      console.error('Error cargando lotes:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLoteToggle = (idLote) => {
    setFormData(prev => {
      const lotes = prev.lotes_seleccionados || []
      const nuevosLotes = lotes.includes(idLote)
        ? lotes.filter(l => l !== idLote)
        : [...lotes, idLote]
      
      return {
        ...prev,
        lotes_seleccionados: nuevosLotes
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.cantidad_producida || formData.cantidad_producida <= 0) {
        setNotification({
          open: true,
          type: 'error',
          title: 'Error de validación',
          message: 'Debe ingresar la cantidad producida.'
        })
        setLoading(false)
        return
      }

      if (!formData.cantidad_buen_estado && !formData.cantidad_defectuosa) {
        setNotification({
          open: true,
          type: 'error',
          title: 'Error de validación',
          message: 'Debe ingresar al menos la cantidad en buen estado o defectuosa.'
        })
        setLoading(false)
        return
      }

      if (formData.calidad_controlada && !formData.resultado_control) {
        setNotification({
          open: true,
          type: 'error',
          title: 'Error de validación',
          message: 'Si la calidad fue controlada, debe seleccionar un resultado.'
        })
        setLoading(false)
        return
      }

      // Obtener el ID del supervisor actual (desde admin_profiles)
      const { data: adminProfile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (profileError || !adminProfile) {
        throw new Error('No se pudo obtener el perfil del supervisor.')
      }

      // Actualizar la producción
      const produccionData = {
        cantidad_producida: parseInt(formData.cantidad_producida),
        cantidad_buen_estado: parseInt(formData.cantidad_buen_estado) || 0,
        cantidad_defectuosa: parseInt(formData.cantidad_defectuosa) || 0,
        calidad_controlada: formData.calidad_controlada,
        fecha_control_calidad: formData.calidad_controlada ? formData.fecha_control_calidad : null,
        resultado_control: formData.calidad_controlada ? formData.resultado_control : null,
        observaciones_validacion: formData.observaciones_validacion || null,
        id_supervisor_validacion: adminProfile.id,
        fecha_validacion: new Date().toISOString().split('T')[0],
        estado: 'validada'
      }

      const result = await produccionService.updateProduccion(id, produccionData)
      
      if (result.error) throw new Error(result.error)

      // Actualizar lotes asignados
      if (formData.lotes_seleccionados && formData.lotes_seleccionados.length > 0) {
        // Eliminar lotes anteriores
        await supabase
          .from('produccion_lotes')
          .delete()
          .eq('id_produccion', id)

        // Agregar nuevos lotes
        const lotesParaInsertar = formData.lotes_seleccionados.map(idLote => ({
          id_produccion: id,
          id_lote: idLote,
          cantidad_asignada: formData.cantidad_producida || 0,
          created_by: user?.id
        }))

        const { error: lotesError } = await supabase
          .from('produccion_lotes')
          .insert(lotesParaInsertar)

        if (lotesError) throw lotesError
      }

      setNotification({
        open: true,
        type: 'success',
        title: 'Validación exitosa',
        message: 'La orden de producción ha sido validada correctamente.'
      })
      
      setTimeout(() => {
        navigate('/admin/produccion')
      }, 2000)
    } catch (error) {
      console.error('Error validando producción:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'No se pudo validar la orden de producción.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !produccion) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gris-medio">Cargando...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!produccion) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">No se pudo cargar la orden de producción.</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/produccion')}
            className="flex items-center gap-2 text-gris-medio hover:text-negro-principal transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Producción
          </button>
          <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
            <ClipboardCheck className="text-verde-principal" size={32} />
            Validación de Producción
          </h1>
        </div>

        {/* Información de la orden */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-negro-principal mb-4">
            Información de la Orden
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gris-medio">Código:</span>
              <p className="font-medium">{produccion.codigo_produccion}</p>
            </div>
            <div>
              <span className="text-gris-medio">Producto:</span>
              <p className="font-medium">{produccion.producto?.nombre || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gris-medio">Cantidad Planificada:</span>
              <p className="font-medium">{produccion.cantidad_planificada || 0}</p>
            </div>
          </div>
        </div>

        {/* Formulario de validación */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-8 space-y-8">
          {/* Cantidades Producidas */}
          <div>
            <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
              <Package size={24} />
              Cantidades Producidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Cantidad Producida *
                </label>
                <input
                  type="number"
                  name="cantidad_producida"
                  value={formData.cantidad_producida || ''}
                  onChange={handleChange}
                  min="0"
                  required
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Cantidad en Buen Estado
                </label>
                <input
                  type="number"
                  name="cantidad_buen_estado"
                  value={formData.cantidad_buen_estado || ''}
                  onChange={handleChange}
                  min="0"
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Cantidad Defectuosa
                </label>
                <input
                  type="number"
                  name="cantidad_defectuosa"
                  value={formData.cantidad_defectuosa || ''}
                  onChange={handleChange}
                  min="0"
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Lotes */}
          <div>
            <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
              <Factory size={24} />
              Lotes Generados
            </h2>
            <div className="space-y-4">
              {lotesDisponibles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4 border border-gris-muy-claro rounded-lg">
                  {lotesDisponibles.map(lote => (
                    <label
                      key={lote.id}
                      className="flex items-center gap-3 p-3 border border-gris-muy-claro rounded-lg hover:bg-gris-muy-claro cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.lotes_seleccionados?.includes(lote.id) || false}
                        onChange={() => handleLoteToggle(lote.id)}
                        className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lote.codigo_lote || lote.numero_lote || 'Sin código'}</p>
                        {lote.producto?.nombre && (
                          <p className="text-xs text-gris-medio">{lote.producto.nombre}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gris-medio text-sm">No hay lotes disponibles.</p>
              )}
            </div>
          </div>

          {/* Control de Calidad */}
          <div>
            <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
              <ClipboardCheck size={24} />
              Control de Calidad
            </h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="calidad_controlada"
                    checked={formData.calidad_controlada}
                    onChange={handleChange}
                    className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                  />
                  <span className="text-sm font-medium text-negro-principal">
                    Calidad Controlada
                  </span>
                </label>
              </div>

              {formData.calidad_controlada && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Fecha de Control de Calidad
                    </label>
                    <input
                      type="date"
                      name="fecha_control_calidad"
                      value={formData.fecha_control_calidad}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Resultado del Control *
                    </label>
                    <select
                      name="resultado_control"
                      value={formData.resultado_control}
                      onChange={handleChange}
                      required={formData.calidad_controlada}
                      className="input-field"
                    >
                      <option value="">Seleccionar</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="rechazado">Rechazado</option>
                      <option value="parcial">Parcial</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
              <FileText size={24} />
              Observaciones del Supervisor
            </h2>
            <textarea
              name="observaciones_validacion"
              value={formData.observaciones_validacion}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Ingrese observaciones sobre la validación de la producción..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gris-muy-claro">
            <button
              type="button"
              onClick={() => navigate('/admin/produccion')}
              className="px-6 py-2 border border-gris-medio text-gris-medio rounded-lg hover:bg-gris-muy-claro transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-verde-principal text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Validando...' : 'Validar Producción'}
            </button>
          </div>
        </form>
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

export default AdminProduccionValidacion

