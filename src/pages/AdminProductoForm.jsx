import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, Package, Printer } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import PrintPreviewModal from '../components/PrintPreviewModal'

const AdminProductoForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'zunchos',
    subcategoria: '',
    descripcion: '',
    descripcion_larga: '',
    precio_unitario: 0,
    precio_mayorista: 0,
    stock_disponible: 0,
    stock_minimo: 10,
    unidad_medida: 'unidad',
    colores_disponibles: [],
    medidas_disponibles: [],
    imagen_principal: '',
    activo: true,
    destacado: false,
    nuevo: false
  })

  const [coloresInput, setColoresInput] = useState('')
  const [medidasInput, setMedidasInput] = useState('')

  // Estado para el modal de impresión
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printData, setPrintData] = useState(null)

  useEffect(() => {
    loadCategorias()
    if (isEditing) {
      loadProducto()
    }
  }, [id])

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_productos')
        .select('*')
        .order('orden', { ascending: true })

      if (error) throw error
      setCategorias(data || [])
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }

  const loadProducto = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('productos_db')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData(data)

      // Convertir arrays a strings para los inputs
      if (data.colores_disponibles) {
        setColoresInput(data.colores_disponibles.join(', '))
      }
      if (data.medidas_disponibles) {
        setMedidasInput(data.medidas_disponibles.join(', '))
      }
    } catch (error) {
      console.error('Error cargando producto:', error)
      alert('Error al cargar producto')
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Procesar colores y medidas
      const colores = coloresInput.split(',').map(c => c.trim()).filter(c => c)
      const medidas = medidasInput.split(',').map(m => m.trim()).filter(m => m)

      // Excluir campos que no deben actualizarse o son generados automáticamente
      const { stock_alerta, created_at, updated_at, created_by, updated_by, id, ...formDataClean } = formData;

      const productData = {
        ...formDataClean,
        colores_disponibles: colores,
        medidas_disponibles: medidas,
        precio_unitario: parseFloat(formData.precio_unitario) || 0,
        precio_mayorista: parseFloat(formData.precio_mayorista) || 0,
        stock_disponible: parseInt(formData.stock_disponible) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 10
      }

      // Excluir explícitamente stock_alerta por si acaso aún está presente
      delete productData.stock_alerta;

      if (isEditing) {
        // Actualizar
        const { error } = await supabase
          .from('productos_db')
          .update(productData)
          .eq('id', id)

        if (error) throw error

        alert('Producto actualizado correctamente')
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('productos_db')
          .insert([productData])

        if (error) throw error

        alert('Producto creado correctamente')
      }

      navigate('/admin/productos')
    } catch (error) {
      console.error('Error guardando producto:', error)
      alert('Error al guardar producto: ' + error.message)
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
            <p className="mt-4 text-gris-medio">Cargando producto...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/productos')}
            className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4"
          >
            <ArrowLeft size={20} />
            Volver a Productos
          </button>
          <h1 className="text-3xl font-bold text-negro-principal">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-card p-8 space-y-8">
            {/* Información básica */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
                <Package size={24} />
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Código del Producto *
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="ej: ZUNCHO-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="ej: Zuncho Plástico Verde"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    {categorias.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Subcategoría
                  </label>
                  <input
                    type="text"
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="ej: Plástico"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Descripción Corta
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                    placeholder="Descripción breve del producto..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Descripción Detallada
                  </label>
                  <textarea
                    name="descripcion_larga"
                    value={formData.descripcion_larga}
                    onChange={handleChange}
                    className="input-field"
                    rows="5"
                    placeholder="Descripción completa del producto..."
                  />
                </div>
              </div>
            </div>

            {/* Precios */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4">
                Precios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Precio Unitario (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_unitario"
                    value={formData.precio_unitario}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Precio Mayorista (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_mayorista"
                    value={formData.precio_mayorista}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Unidad de Medida
                  </label>
                  <select
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="metro">Metro</option>
                    <option value="rollo">Rollo</option>
                    <option value="paquete">Paquete</option>
                    <option value="caja">Caja</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inventario */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4">
                Inventario
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    name="stock_disponible"
                    value={formData.stock_disponible}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={formData.stock_minimo}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Variantes */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4">
                Variantes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Colores Disponibles
                  </label>
                  <input
                    type="text"
                    value={coloresInput}
                    onChange={(e) => setColoresInput(e.target.value)}
                    className="input-field"
                    placeholder="Verde, Amarillo, Azul (separados por coma)"
                  />
                  <p className="text-xs text-gris-medio mt-1">
                    Separar por comas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Medidas Disponibles
                  </label>
                  <input
                    type="text"
                    value={medidasInput}
                    onChange={(e) => setMedidasInput(e.target.value)}
                    className="input-field"
                    placeholder="1.00m, 1.50m, 2.00m (separados por coma)"
                  />
                  <p className="text-xs text-gris-medio mt-1">
                    Separar por comas
                  </p>
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4">
                Imagen
              </h2>
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  URL de Imagen Principal
                </label>
                <input
                  type="text"
                  name="imagen_principal"
                  value={formData.imagen_principal}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="/images/productos/..."
                />
              </div>
            </div>

            {/* Opciones */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4">
                Opciones
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                  />
                  <span className="text-sm font-medium text-negro-principal">
                    Producto Activo (visible en la tienda)
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                    className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                  />
                  <span className="text-sm font-medium text-negro-principal">
                    Producto Destacado
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="nuevo"
                    checked={formData.nuevo}
                    onChange={handleChange}
                    className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                  />
                  <span className="text-sm font-medium text-negro-principal">
                    Producto Nuevo
                  </span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gris-muy-claro">
              <button
                type="button"
                onClick={() => navigate('/admin/productos')}
                className="px-6 py-3 border border-gris-muy-claro rounded-xl font-medium text-gris-oscuro hover:bg-fondo-claro transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintData({
                    type: 'PRODUCTO',
                    titulo: 'FICHA DE PRODUCTO',
                    fecha: new Date().toLocaleDateString(),
                    cliente: {
                      empresa: 'ECO FLEX PLAST'
                    },
                    detalles: [{
                      codigo: formData.codigo || 'N/A',
                      nombre: formData.nombre || 'Sin nombre',
                      descripcion: formData.descripcion || '',
                      cantidad: formData.stock_disponible || 0,
                      precio_unitario: formData.precio_base || 0,
                      subtotal: (formData.stock_disponible || 0) * (formData.precio_base || 0)
                    }],
                    resumen: {
                      subtotal: (formData.stock_disponible || 0) * (formData.precio_base || 0),
                      total: (formData.stock_disponible || 0) * (formData.precio_base || 0)
                    },
                    extra: {
                      categoria: formData.categoria,
                      ubicacion: formData.ubicacion_almacen,
                      estado: formData.activo ? 'Activo' : 'Inactivo'
                    },
                    observaciones: formData.observaciones
                  })
                  setShowPrintModal(true)
                }}
                className="px-6 py-3 border border-gris-muy-claro rounded-xl font-medium text-gris-oscuro hover:bg-fondo-claro transition-colors flex items-center gap-2"
              >
                <Printer size={20} />
                Imprimir
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEditing ? 'Actualizar' : 'Crear'} Producto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminProductoForm
