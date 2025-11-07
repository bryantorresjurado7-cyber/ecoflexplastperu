import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminProductosInsumosModal = ({ producto, isOpen, onClose }) => {
  const [insumos, setInsumos] = useState([])
  const [insumosDisponibles, setInsumosDisponibles] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    id_insumo: '',
    cantidad_requerida: 1,
    unidad_medida: '',
    orden: 0,
    es_obligatorio: true,
    observaciones: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && producto) {
      loadInsumos()
      loadInsumosDisponibles()
    }
  }, [isOpen, producto])

  const loadInsumos = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/crud-producto-insumos/producto/${producto.id}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const result = await response.json()
      
      if (result.success) {
        setInsumos(result.data || [])
      } else {
        setError(result.message || 'Error al cargar insumos')
      }
    } catch (error) {
      console.error('Error cargando insumos:', error)
      setError('Error al cargar insumos')
    } finally {
      setLoading(false)
    }
  }

  const loadInsumosDisponibles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/crud-producto-insumos/insumos`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const result = await response.json()
      
      if (result.success) {
        setInsumosDisponibles(result.data || [])
      }
    } catch (error) {
      console.error('Error cargando insumos disponibles:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY
      
      const url = editingId
        ? `${SUPABASE_URL}/functions/v1/crud-producto-insumos/id/${editingId}`
        : `${SUPABASE_URL}/functions/v1/crud-producto-insumos`

      const method = editingId ? 'PUT' : 'POST'
      const body = editingId
        ? {
            cantidad_requerida: formData.cantidad_requerida,
            unidad_medida: formData.unidad_medida,
            orden: formData.orden,
            es_obligatorio: formData.es_obligatorio,
            observaciones: formData.observaciones
          }
        : {
            id_producto: producto.id,
            id_insumo: formData.id_insumo,
            cantidad_requerida: formData.cantidad_requerida,
            unidad_medida: formData.unidad_medida,
            orden: formData.orden,
            es_obligatorio: formData.es_obligatorio,
            observaciones: formData.observaciones
          }

      const response = await fetch(url, {
        method,
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        await loadInsumos()
        resetForm()
      } else {
        setError(result.message || 'Error al guardar insumo')
      }
    } catch (error) {
      console.error('Error guardando insumo:', error)
      setError('Error al guardar insumo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este insumo de la receta?')) return

    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/crud-producto-insumos/id/${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const result = await response.json()

      if (result.success) {
        await loadInsumos()
      } else {
        setError(result.message || 'Error al eliminar insumo')
      }
    } catch (error) {
      console.error('Error eliminando insumo:', error)
      setError('Error al eliminar insumo')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      id_insumo: item.id_insumo,
      cantidad_requerida: item.cantidad_requerida,
      unidad_medida: item.unidad_medida,
      orden: item.orden,
      es_obligatorio: item.es_obligatorio,
      observaciones: item.observaciones || ''
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      id_insumo: '',
      cantidad_requerida: 1,
      unidad_medida: '',
      orden: 0,
      es_obligatorio: true,
      observaciones: ''
    })
  }

  const handleInsumoChange = (insumoId) => {
    const insumo = insumosDisponibles.find(i => i.id_insumo === insumoId)
    if (insumo) {
      setFormData({
        ...formData,
        id_insumo: insumoId,
        unidad_medida: insumo.unidad_medida
      })
    }
  }

  if (!isOpen) return null

  // Filtrar insumos ya agregados (excepto el que se está editando)
  const insumosDisponiblesFiltrados = insumosDisponibles.filter(insumo => {
    if (editingId) {
      const itemEditando = insumos.find(i => i.id === editingId)
      return itemEditando?.id_insumo === insumo.id_insumo || 
             !insumos.some(i => i.id_insumo === insumo.id_insumo)
    }
    return !insumos.some(i => i.id_insumo === insumo.id_insumo)
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-negro-principal">
              Gestión de Insumos
            </h2>
            <p className="text-sm text-gris-medio mt-1">
              {producto?.nombre} - {producto?.codigo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gris-medio hover:text-negro-principal transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Formulario */}
          <div className="bg-fondo-claro rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-negro-principal mb-4">
              {editingId ? 'Editar Insumo' : 'Agregar Insumo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Insumo */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Insumo {!editingId && '*'}
                  </label>
                  <select
                    value={formData.id_insumo}
                    onChange={(e) => handleInsumoChange(e.target.value)}
                    disabled={editingId !== null}
                    required={!editingId}
                    className="input-field w-full"
                  >
                    <option value="">Seleccionar insumo</option>
                    {insumosDisponiblesFiltrados.map(insumo => (
                      <option key={insumo.id_insumo} value={insumo.id_insumo}>
                        {insumo.nombre} ({insumo.codigo_insumo}) - {insumo.unidad_medida}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad Requerida */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Cantidad Requerida (por unidad de producto) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.cantidad_requerida}
                    onChange={(e) => setFormData({ ...formData, cantidad_requerida: parseFloat(e.target.value) || 0 })}
                    required
                    className="input-field w-full"
                  />
                </div>

                {/* Unidad de Medida */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Unidad de Medida *
                  </label>
                  <input
                    type="text"
                    value={formData.unidad_medida}
                    readOnly
                    className="input-field w-full bg-gray-100"
                    placeholder="Se asigna automáticamente"
                  />
                </div>

                {/* Orden */}
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                    className="input-field w-full"
                  />
                  <p className="text-xs text-gris-medio mt-1">Orden de uso en la receta</p>
                </div>

                {/* Es Obligatorio */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.es_obligatorio}
                      onChange={(e) => setFormData({ ...formData, es_obligatorio: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-negro-principal">
                      Insumo obligatorio
                    </span>
                  </label>
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={2}
                    className="input-field w-full"
                    placeholder="Notas adicionales sobre este insumo en la receta..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                  {editingId ? 'Guardar Cambios' : 'Agregar Insumo'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Insumos */}
          <div>
            <h3 className="text-lg font-semibold text-negro-principal mb-4">
              Insumos de la Receta ({insumos.length})
            </h3>
            {loading && insumos.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-verde-principal"></div>
                <p className="mt-2 text-gris-medio">Cargando insumos...</p>
              </div>
            ) : insumos.length === 0 ? (
              <div className="text-center py-8 bg-fondo-claro rounded-lg">
                <p className="text-gris-medio">No hay insumos agregados a este producto</p>
                <p className="text-sm text-gris-claro mt-1">Agrega insumos usando el formulario de arriba</p>
              </div>
            ) : (
              <div className="space-y-2">
                {insumos.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gris-medio">
                            #{item.orden || index + 1}
                          </span>
                          <h4 className="font-semibold text-negro-principal">
                            {item.insumo?.nombre || 'Insumo desconocido'}
                          </h4>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-verde-light text-verde-principal">
                            {item.es_obligatorio ? 'Obligatorio' : 'Opcional'}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gris-medio">Código:</span>
                            <span className="ml-2 font-medium">{item.insumo?.codigo_insumo}</span>
                          </div>
                          <div>
                            <span className="text-gris-medio">Cantidad:</span>
                            <span className="ml-2 font-medium">
                              {item.cantidad_requerida} {item.unidad_medida}
                            </span>
                          </div>
                          <div>
                            <span className="text-gris-medio">Stock:</span>
                            <span className={`ml-2 font-medium ${
                              (item.insumo?.stock_disponible || 0) < (item.insumo?.stock_minimo || 0)
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {item.insumo?.stock_disponible || 0} {item.unidad_medida}
                            </span>
                          </div>
                          <div>
                            <span className="text-gris-medio">Costo:</span>
                            <span className="ml-2 font-medium">
                              S/ {(item.insumo?.costo_unitario || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {item.observaciones && (
                          <p className="mt-2 text-sm text-gris-medio italic">
                            {item.observaciones}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-azul hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProductosInsumosModal

