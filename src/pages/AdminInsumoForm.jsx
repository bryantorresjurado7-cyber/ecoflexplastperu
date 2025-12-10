import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import PrintPreviewModal from '../components/PrintPreviewModal'
import NotificationToast from '../components/NotificationToast'
import { ArrowLeft, Save, FlaskConical, Printer } from 'lucide-react'

const AdminInsumoForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [formData, setFormData] = useState({
    codigo_insumo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    unidad_medida: 'und',
    stock_disponible: 0,
    stock_minimo: 0,
    costo_unitario: 0,
    id_proveedor: '',
    activo: true,
    ubicacion_almacen: '',
    observaciones: ''
  })

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Estado para el modal de impresión
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printData, setPrintData] = useState(null)

  useEffect(() => {
    loadProveedores()
    if (isEditing) {
      loadInsumo()
    }
  }, [id])

  const loadProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedor')
        .select('id_proveedor, nombre')
        .eq('estado', true)
        .order('nombre')

      if (error) throw error
      setProveedores(data || [])
    } catch (error) {
      console.error('Error cargando proveedores:', error)
    }
  }

  const loadInsumo = async () => {
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('id_insumo', id)
        .single()

      if (error) throw error

      setFormData({
        codigo_insumo: data.codigo_insumo || '',
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        categoria: data.categoria || '',
        unidad_medida: data.unidad_medida || 'und',
        stock_disponible: data.stock_disponible || 0,
        stock_minimo: data.stock_minimo || 0,
        costo_unitario: data.costo_unitario || 0,
        id_proveedor: data.id_proveedor || '',
        activo: data.activo !== undefined ? data.activo : true,
        ubicacion_almacen: data.ubicacion_almacen || '',
        observaciones: data.observaciones || ''
      })
    } catch (error) {
      console.error('Error cargando insumo:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar insumo',
        message: 'No se pudo cargar la información del insumo. Por favor, intenta nuevamente.'
      })
      setTimeout(() => {
        navigate('/admin/insumos')
      }, 2000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const insumoData = {
        codigo_insumo: formData.codigo_insumo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        categoria: formData.categoria || null,
        unidad_medida: formData.unidad_medida,
        stock_disponible: parseFloat(formData.stock_disponible) || 0,
        stock_minimo: parseFloat(formData.stock_minimo) || 0,
        costo_unitario: parseFloat(formData.costo_unitario) || 0,
        id_proveedor: formData.id_proveedor || null,
        activo: formData.activo,
        ubicacion_almacen: formData.ubicacion_almacen || null,
        observaciones: formData.observaciones || null
      }

      let result
      if (isEditing) {
        const { data, error } = await supabase
          .from('insumos')
          .update(insumoData)
          .eq('id_insumo', id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('insumos')
          .insert([insumoData])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Mostrar notificación de éxito
      setNotification({
        open: true,
        type: 'success',
        title: isEditing ? '¡Insumo actualizado exitosamente!' : '¡Insumo creado exitosamente!',
        message: isEditing
          ? 'El insumo ha sido actualizado correctamente.'
          : 'El insumo ha sido guardado correctamente.'
      })

      // Navegar después de 2 segundos
      setTimeout(() => {
        navigate('/admin/insumos')
      }, 2000)
    } catch (error) {
      console.error('Error guardando insumo:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al guardar insumo',
        message: error.message || 'Ocurrió un error al intentar guardar el insumo. Por favor, intente nuevamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const unidadesMedida = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'und', label: 'Unidades (und)' },
    { value: 'lt', label: 'Litros (lt)' },
    { value: 'm', label: 'Metros (m)' },
    { value: 'm2', label: 'Metros cuadrados (m²)' },
    { value: 'm3', label: 'Metros cúbicos (m³)' },
    { value: 'gl', label: 'Galones (gl)' },
    { value: 'lb', label: 'Libras (lb)' },
    { value: 'oz', label: 'Onzas (oz)' }
  ]

  const categorias = [
    'materia_prima',
    'empaque',
    'etiqueta',
    'adhesivo',
    'herramienta',
    'quimico',
    'otro'
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/insumos')}
              className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a Insumos
            </button>
            <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
              <FlaskConical className="text-verde-principal" size={32} />
              {isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Código del Insumo *
                </label>
                <input
                  type="text"
                  value={formData.codigo_insumo}
                  onChange={(e) => setFormData({ ...formData, codigo_insumo: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: INS-001"
                />
              </div>

              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="input-field w-full"
                  placeholder="Ej: Polipropileno PP"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unidad de Medida */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Unidad de Medida *
                </label>
                <select
                  value={formData.unidad_medida}
                  onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                  required
                  className="input-field w-full"
                >
                  {unidadesMedida.map(um => (
                    <option key={um.value} value={um.value}>
                      {um.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Disponible */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Stock Disponible *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.stock_disponible}
                  onChange={(e) => setFormData({ ...formData, stock_disponible: e.target.value })}
                  required
                  className="input-field w-full"
                />
              </div>

              {/* Stock Mínimo */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                  required
                  className="input-field w-full"
                />
                <p className="text-xs text-gris-medio mt-1">Se generará alerta cuando el stock esté por debajo de este valor</p>
              </div>

              {/* Costo Unitario */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Costo Unitario (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costo_unitario}
                  onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Proveedor
                </label>
                <select
                  value={formData.id_proveedor}
                  onChange={(e) => setFormData({ ...formData, id_proveedor: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map(prov => (
                    <option key={prov.id_proveedor} value={prov.id_proveedor}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ubicación Almacén */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Ubicación en Almacén
                </label>
                <input
                  type="text"
                  value={formData.ubicacion_almacen}
                  onChange={(e) => setFormData({ ...formData, ubicacion_almacen: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: Almacén A, Estante 3"
                />
              </div>

              {/* Activo */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-negro-principal">
                    Insumo activo
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
                  placeholder="Descripción del insumo..."
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
                  placeholder="Notas adicionales sobre el insumo..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/insumos')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintData({
                    type: 'INSUMO',
                    titulo: 'FICHA DE INSUMO',
                    fecha: new Date().toLocaleDateString(),
                    cliente: {
                      empresa: 'ECO FLEX PLAST',
                      documento: 'INTERNO'
                    },
                    detalles: [{
                      codigo: formData.codigo_insumo || 'N/A',
                      nombre: formData.nombre || 'Sin nombre',
                      descripcion: formData.descripcion || '',
                      cantidad: formData.stock_disponible || 0,
                      precio_unitario: formData.costo_unitario || 0,
                      subtotal: (formData.stock_disponible || 0) * (formData.costo_unitario || 0)
                    }],
                    resumen: {
                      subtotal: (formData.stock_disponible || 0) * (formData.costo_unitario || 0),
                      total: (formData.stock_disponible || 0) * (formData.costo_unitario || 0)
                    },
                    extra: {
                      categoria: formData.categoria,
                      unidad: formData.unidad_medida,
                      proveedor: proveedores.find(p => p.id_proveedor === formData.id_proveedor)?.nombre || 'No asignado',
                      ubicacion: formData.ubicacion_almacen
                    },
                    observaciones: formData.observaciones
                  })
                  setShowPrintModal(true)
                }}
                className="px-6 py-3 border border-verde-principal text-verde-principal rounded-xl font-semibold hover:bg-verde-principal hover:text-white transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                Imprimir
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
                {isEditing ? 'Actualizar Insumo' : 'Crear Insumo'}
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

      <PrintPreviewModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={printData}
      />
    </AdminLayout>
  )
}

export default AdminInsumoForm

