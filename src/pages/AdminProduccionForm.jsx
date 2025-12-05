import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import produccionService from '../services/produccionService'
import NotificationToast from '../components/NotificationToast'
import { ArrowLeft, Save, Factory, Package, Calendar, DollarSign, Users, Settings, AlertTriangle, CheckCircle2, Printer } from 'lucide-react'

const AdminProduccionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [productos, setProductos] = useState([])
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [categoriaFiltro, setCategoriaFiltro] = useState('all')
  const [categorias, setCategorias] = useState([])
  const [validatingStock, setValidatingStock] = useState(false)
  const [stockValidation, setStockValidation] = useState(null)
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  const [formData, setFormData] = useState({
    fecha_produccion: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    id_producto: '',
    cantidad_planificada: 0,
    cantidad_producida: null,
    cantidad_buen_estado: null,
    cantidad_defectuosa: null,
    costo_unitario: 0,
    costo_total: 0,
    estado: 'planificada',
    observaciones: '',
    id_maquinaria: '',
    turno: 'mañana'
  })

  const [maquinarias, setMaquinarias] = useState([])
  const [operarios, setOperarios] = useState([])
  const [operariosSeleccionados, setOperariosSeleccionados] = useState([])

  // Función para validar stock - debe estar definida antes del useEffect que la usa
  const validateStock = useCallback(async (idProducto, cantidadPlanificada) => {
    if (!idProducto || !cantidadPlanificada || cantidadPlanificada <= 0) {
      setStockValidation(null)
      return
    }

    try {
      setValidatingStock(true)
      const { data, error } = await supabase.rpc('validar_stock_insumos', {
        p_id_producto: idProducto,
        p_cantidad_planificada: parseInt(cantidadPlanificada) || 0
      })

      if (error) throw error

      setStockValidation(data || [])
    } catch (error) {
      console.error('Error validando stock:', error)
      setStockValidation(null)
    } finally {
      setValidatingStock(false)
    }
  }, [])

  useEffect(() => {
    loadProductos()
    loadMaquinarias()
    loadOperarios()
    if (isEditing) {
      loadProduccion()
    }
  }, [id])

  // Validar stock cuando cambien el producto o la cantidad planificada
  useEffect(() => {
    if (!isEditing && formData.id_producto && formData.cantidad_planificada > 0) {
      const timeoutId = setTimeout(() => {
        validateStock(formData.id_producto, formData.cantidad_planificada)
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setStockValidation(null)
    }
  }, [formData.id_producto, formData.cantidad_planificada, isEditing, validateStock])

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos_db')
        .select('id, nombre, codigo, categoria')
        .eq('activo', true)
        .order('categoria')
        .order('nombre')

      if (error) throw error

      setProductos(data || [])

      // Extraer categorías únicas de los productos
      const categoriasUnicas = [...new Set((data || []).map(p => p.categoria).filter(Boolean))]
      setCategorias(categoriasUnicas.sort())

      // Inicializar productos filtrados
      setProductosFiltrados(data || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }

  // Filtrar productos por categoría
  useEffect(() => {
    if (categoriaFiltro === 'all') {
      setProductosFiltrados(productos)
    } else {
      setProductosFiltrados(productos.filter(p => p.categoria === categoriaFiltro))
    }
  }, [categoriaFiltro, productos])

  // Limpiar producto seleccionado si no pertenece a la categoría filtrada
  useEffect(() => {
    if (categoriaFiltro !== 'all' && formData.id_producto && productos.length > 0) {
      const productoSeleccionado = productos.find(p => p.id === formData.id_producto)
      if (productoSeleccionado && productoSeleccionado.categoria !== categoriaFiltro) {
        setFormData(prev => ({ ...prev, id_producto: '' }))
        setStockValidation(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaFiltro])

  // Cuando se carga una producción en modo edición, ajustar el filtro de categoría al producto seleccionado
  useEffect(() => {
    if (isEditing && formData.id_producto && productos.length > 0 && categoriaFiltro === 'all') {
      const productoSeleccionado = productos.find(p => p.id === formData.id_producto)
      if (productoSeleccionado && productoSeleccionado.categoria) {
        setCategoriaFiltro(productoSeleccionado.categoria)
      }
    }
  }, [isEditing, formData.id_producto, productos])

  const loadMaquinarias = async () => {
    try {
      const { data, error } = await supabase
        .from('maquinarias')
        .select('id_maquinaria, nombre, codigo_maquinaria, estado')
        .eq('estado', 'activa')
        .order('nombre')

      if (error) throw error
      setMaquinarias(data || [])
    } catch (error) {
      console.error('Error cargando maquinarias:', error)
    }
  }

  const loadOperarios = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('id, nombre, email, rol')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setOperarios(data || [])
    } catch (error) {
      console.error('Error cargando operarios:', error)
    }
  }

  const loadProduccion = async () => {
    try {
      setLoading(true)
      const result = await produccionService.loadProduccion(id)

      if (result.error) throw new Error(result.error)

      const data = result.data
      setFormData({
        fecha_produccion: data.fecha_produccion || new Date().toISOString().split('T')[0],
        fecha_vencimiento: data.fecha_vencimiento || '',
        id_producto: data.id_producto || '',
        cantidad_planificada: data.cantidad_planificada || 0,
        cantidad_producida: data.cantidad_producida ?? null,
        cantidad_buen_estado: data.cantidad_buen_estado ?? null,
        cantidad_defectuosa: data.cantidad_defectuosa ?? null,
        costo_unitario: data.costo_unitario || 0,
        costo_total: data.costo_total || 0,
        estado: data.estado || 'planificada',
        observaciones: data.observaciones || '',
        id_maquinaria: data.id_maquinaria || '',
        turno: data.turno || 'mañana'
      })

      // Cargar operarios asignados a esta producción
      if (data.id_produccion) {
        const { data: operariosAsign, error: operariosError } = await supabase
          .from('produccion_operarios')
          .select('id_operario')
          .eq('id_produccion', data.id_produccion)

        if (!operariosError && operariosAsign) {
          setOperariosSeleccionados(operariosAsign.map(o => o.id_operario))
        }
      }
    } catch (error) {
      console.error('Error cargando producción:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Error al cargar orden de producción: ' + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }

      // Calcular costo total automáticamente
      if (name === 'cantidad_planificada' || name === 'costo_unitario') {
        const cantidad = name === 'cantidad_planificada'
          ? parseFloat(value) || 0
          : prev.cantidad_planificada
        const costoUnit = name === 'costo_unitario'
          ? parseFloat(value) || 0
          : prev.costo_unitario
        newData.costo_total = cantidad * costoUnit
      }

      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar stock antes de crear la orden (solo si hay producto seleccionado)
      if (!isEditing && formData.id_producto && formData.cantidad_planificada) {
        const { data: stockValidation, error: stockError } = await supabase.rpc('validar_stock_insumos', {
          p_id_producto: formData.id_producto,
          p_cantidad_planificada: parseInt(formData.cantidad_planificada) || 0
        })

        if (!stockError && stockValidation) {
          const insumosFaltantes = stockValidation.filter(item => !item.stock_suficiente)

          if (insumosFaltantes.length > 0) {
            const mensajeFaltantes = insumosFaltantes.map(item =>
              `${item.insumo_nombre}: Faltan ${item.faltante} ${item.unidad_medida} (disponible: ${item.stock_disponible} ${item.unidad_medida})`
            ).join(', ')

            setNotification({
              open: true,
              type: 'error',
              title: 'Stock insuficiente',
              message: `No hay suficiente stock. ${mensajeFaltantes}. Por favor, revise el stock antes de crear la orden.`
            })
            setLoading(false)
            return
          }
        }
      }

      const produccionData = {
        fecha_produccion: formData.fecha_produccion || new Date().toISOString().split('T')[0],
        fecha_vencimiento: formData.fecha_vencimiento || null,
        id_producto: formData.id_producto || null,
        cantidad_planificada: parseInt(formData.cantidad_planificada) || 0,
        // Al crear, las cantidades producidas deben ser NULL
        cantidad_producida: isEditing ? (parseInt(formData.cantidad_producida) || null) : null,
        cantidad_buen_estado: isEditing ? (parseInt(formData.cantidad_buen_estado) || null) : null,
        cantidad_defectuosa: isEditing ? (parseInt(formData.cantidad_defectuosa) || null) : null,
        costo_unitario: parseFloat(formData.costo_unitario) || 0,
        costo_total: parseFloat(formData.costo_total) || 0,
        estado: isEditing ? formData.estado : 'planificada', // Al crear siempre es 'planificada'
        observaciones: formData.observaciones || null,
        id_maquinaria: formData.id_maquinaria || null,
        turno: formData.turno || 'mañana'
      }

      let result
      if (isEditing) {
        // Actualizar
        result = await produccionService.updateProduccion(id, produccionData)
      } else {
        // Crear nuevo
        result = await produccionService.createProduccion(produccionData)
      }

      if (result.error) throw new Error(result.error)

      const produccionId = result.data?.id_produccion || id

      // Guardar operarios asignados
      if (operariosSeleccionados.length > 0 && produccionId) {
        // Eliminar operarios anteriores (si estamos editando)
        await supabase
          .from('produccion_operarios')
          .delete()
          .eq('id_produccion', produccionId)

        // Insertar nuevos operarios
        const operariosParaInsertar = operariosSeleccionados.map(idOperario => ({
          id_produccion: produccionId,
          id_operario: idOperario,
          rol: 'operario'
        }))

        const { error: operariosError } = await supabase
          .from('produccion_operarios')
          .insert(operariosParaInsertar)

        if (operariosError) {
          console.error('Error guardando operarios:', operariosError)
          // No lanzamos error, solo lo registramos
        }
      } else if (isEditing && operariosSeleccionados.length === 0) {
        // Si estamos editando y no hay operarios seleccionados, eliminar todos
        await supabase
          .from('produccion_operarios')
          .delete()
          .eq('id_produccion', produccionId)
      }

      setNotification({
        open: true,
        type: 'success',
        title: isEditing ? 'Orden actualizada' : 'Orden creada',
        message: `La orden de producción ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`
      })

      setTimeout(() => {
        navigate('/admin/produccion')
      }, 2000)
    } catch (error) {
      console.error('Error guardando producción:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Error al guardar orden de producción: ' + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    // Find related data names
    const producto = productos.find(p => p.id === formData.id_producto)
    const maquinaria = maquinarias.find(m => m.id_maquinaria === formData.id_maquinaria)
    const operariosNombres = operarios
      .filter(o => operariosSeleccionados.includes(o.id))
      .map(o => o.nombre)
      .join(', ')

    const printData = {
      type: 'ORDEN_PRODUCCION',
      titulo: 'ORDEN DE PRODUCCIÓN',
      numero: isEditing ? `OP-${id.slice(0, 8)}` : 'BORRADOR',
      fecha: formData.fecha_produccion,
      valido_hasta: formData.fecha_vencimiento,
      cliente: {
        nombre: 'Interno',
        empresa: 'ECO FLEX PLAST',
        documento: 'RUC: 20610012345'
      },
      extra: {
        turno: formData.turno,
        maquinaria: maquinaria ? `${maquinaria.codigo_maquinaria} - ${maquinaria.nombre}` : 'No asignada',
        operarios: operariosNombres || 'No asignados',
        estado: formData.estado
      },
      detalles: [{
        codigo: producto?.codigo || 'N/A',
        nombre: producto?.nombre || 'Producto no seleccionado',
        cantidad: formData.cantidad_planificada,
        precio_unitario: formData.costo_unitario,
        subtotal: formData.costo_total
      }],
      resumen: {
        subtotal: formData.costo_total,
        impuestos: 0,
        total: formData.costo_total
      },
      observaciones: formData.observaciones
    }

    localStorage.setItem('printData', JSON.stringify(printData))
    window.open('/print', '_blank')
  }

  if (loading && isEditing) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando orden de producción...</p>
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
            onClick={() => navigate('/admin/produccion')}
            className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4"
          >
            <ArrowLeft size={20} />
            Volver a Producción
          </button>
          <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
            <Factory className="text-verde-principal" size={32} />
            {isEditing ? 'Editar Orden de Producción' : 'Nueva Orden de Producción'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-card p-8 space-y-8">
            {/* Información básica */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
                <Factory size={24} />
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Filtrar por Categoría
                  </label>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => {
                      setCategoriaFiltro(e.target.value)
                    }}
                    className="input-field"
                  >
                    <option value="all">Todas las categorías</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gris-medio mt-1">
                    {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto disponible' : 'productos disponibles'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Producto Relacionado
                  </label>
                  <select
                    name="id_producto"
                    value={formData.id_producto}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Seleccionar producto (opcional)</option>
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.codigo} - {prod.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay productos en esta categoría</option>
                    )}
                  </select>
                  {categoriaFiltro !== 'all' && (
                    <p className="text-xs text-gris-medio mt-1">
                      Mostrando solo productos de la categoría seleccionada
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Fecha de Producción *
                  </label>
                  <input
                    type="date"
                    name="fecha_produccion"
                    value={formData.fecha_produccion}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Estado *
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="planificada">Planificada</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="pendiente_validacion">Pendiente Validación</option>
                      <option value="validada">Validada</option>
                      <option value="completada">Completada</option>
                      <option value="pausada">Pausada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                )}
                {!isEditing && (
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Estado inicial:</strong> La orden se creará con estado "Planificada".
                        Una vez completada la producción, un supervisor deberá validar la cantidad producida real.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Turno
                  </label>
                  <select
                    name="turno"
                    value={formData.turno}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cantidades */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
                <Package size={24} />
                Cantidades
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Cantidad Planificada *
                  </label>
                  <input
                    type="number"
                    name="cantidad_planificada"
                    value={formData.cantidad_planificada}
                    onChange={handleChange}
                    required
                    min="1"
                    className="input-field"
                    placeholder="0"
                  />
                  <p className="text-xs text-gris-medio mt-1">
                    Cantidad que se planea producir en esta orden
                  </p>

                  {/* Validación de Stock en tiempo real */}
                  {formData.id_producto && formData.cantidad_planificada > 0 && (
                    <div className="mt-3">
                      {validatingStock ? (
                        <div className="flex items-center gap-2 text-sm text-gris-medio">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-verde-principal"></div>
                          <span>Validando stock de insumos...</span>
                        </div>
                      ) : stockValidation && stockValidation.length > 0 ? (
                        <div className="mt-2">
                          {stockValidation.every(item => item.stock_suficiente) ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                                <Package className="text-green-600" size={16} />
                                Stock disponible para todos los insumos
                              </p>
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-800 font-medium mb-2">
                                ⚠️ Stock insuficiente de algunos insumos:
                              </p>
                              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                                {stockValidation
                                  .filter(item => !item.stock_suficiente)
                                  .map((item, idx) => (
                                    <li key={idx}>
                                      <strong>{item.insumo_nombre}</strong> ({item.insumo_codigo}):
                                      Requiere {item.cantidad_requerida} {item.unidad_medida},
                                      disponible {item.stock_disponible} {item.unidad_medida}.
                                      <span className="font-bold"> Faltan {item.faltante} {item.unidad_medida}</span>
                                    </li>
                                  ))
                                }
                              </ul>
                            </div>
                          )}
                          {/* Mostrar también los insumos que sí tienen stock */}
                          {stockValidation.some(item => item.stock_suficiente) && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-blue-800 font-medium mb-1">
                                Insumos con stock suficiente:
                              </p>
                              <ul className="text-xs text-blue-700 space-y-0.5">
                                {stockValidation
                                  .filter(item => item.stock_suficiente)
                                  .map((item, idx) => (
                                    <li key={idx}>
                                      {item.insumo_nombre}: {item.stock_disponible} {item.unidad_medida} disponible
                                      (requiere {item.cantidad_requerida} {item.unidad_medida})
                                    </li>
                                  ))
                                }
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {isEditing && formData.estado !== 'planificada' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-negro-principal mb-2">
                        Cantidad Producida
                      </label>
                      <input
                        type="number"
                        name="cantidad_producida"
                        value={formData.cantidad_producida || ''}
                        onChange={handleChange}
                        min="0"
                        className="input-field"
                        placeholder="0"
                      />
                      <p className="text-xs text-gris-medio mt-1">
                        Cantidad real producida (será validada por supervisor)
                      </p>
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
                  </>
                )}

                {!isEditing && (
                  <div className="md:col-span-2">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Nota:</strong> La cantidad producida real se registrará después de completar la producción.
                        Un supervisor validará las cantidades finales y los lotes generados.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Costos */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
                <DollarSign size={24} />
                Costos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Costo Unitario (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="costo_unitario"
                    value={formData.costo_unitario}
                    onChange={handleChange}
                    min="0"
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Costo Total (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="costo_total"
                    value={formData.costo_total}
                    readOnly
                    className="input-field bg-gray-50"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gris-medio mt-1">
                    Se calcula automáticamente (Cantidad × Costo Unitario)
                  </p>
                </div>
              </div>
            </div>

            {/* Recursos */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4 flex items-center gap-2">
                <Settings size={24} />
                Recursos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2">
                    Maquinaria Utilizada
                  </label>
                  <select
                    name="id_maquinaria"
                    value={formData.id_maquinaria}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Seleccionar maquinaria (opcional)</option>
                    {maquinarias.map(maq => (
                      <option key={maq.id_maquinaria} value={maq.id_maquinaria}>
                        {maq.codigo_maquinaria} - {maq.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gris-medio mt-1">
                    Maquinaria que se utilizará para esta producción
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro-principal mb-2 flex items-center gap-2">
                    <Users size={18} />
                    Operarios Asignados
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gris-muy-claro rounded-lg p-4 bg-white">
                    {operarios.length === 0 ? (
                      <p className="text-sm text-gris-medio">No hay operarios disponibles.</p>
                    ) : (
                      operarios.map(operario => (
                        <label
                          key={operario.id}
                          className="flex items-center gap-3 p-2 hover:bg-gris-muy-claro rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={operariosSeleccionados.includes(operario.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setOperariosSeleccionados([...operariosSeleccionados, operario.id])
                              } else {
                                setOperariosSeleccionados(operariosSeleccionados.filter(id => id !== operario.id))
                              }
                            }}
                            className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-negro-principal">
                              {operario.nombre}
                            </p>
                            {operario.email && (
                              <p className="text-xs text-gris-medio">{operario.email}</p>
                            )}
                            {operario.rol && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-azul/10 text-azul rounded">
                                {operario.rol}
                              </span>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gris-medio mt-2">
                    Seleccione los operarios que participarán en esta producción
                  </p>
                  {operariosSeleccionados.length > 0 && (
                    <p className="text-xs text-verde-principal mt-1 font-medium">
                      {operariosSeleccionados.length} {operariosSeleccionados.length === 1 ? 'operario seleccionado' : 'operarios seleccionados'}
                    </p>
                  )}
                </div>
              </div>
            </div>


            {/* Observaciones */}
            <div>
              <h2 className="text-xl font-semibold text-negro-principal mb-4">
                Observaciones
              </h2>
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Notas y Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                  placeholder="Agregar notas, observaciones o instrucciones especiales..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gris-muy-claro">
              <button
                type="button"
                onClick={() => navigate('/admin/produccion')}
                className="px-6 py-3 border border-gris-muy-claro rounded-xl font-medium text-gris-oscuro hover:bg-fondo-claro transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-3 border border-gris-muy-claro rounded-xl font-medium text-gris-oscuro hover:bg-fondo-claro transition-colors flex items-center gap-2"
              >
                <Printer size={20} />
                Imprimir
              </button>
              <button
                type="submit"
                disabled={loading || (stockValidation && stockValidation.some(item => !item.stock_suficiente) && !isEditing)}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEditing ? 'Actualizar' : 'Crear'} Orden</span>
                  </>
                )}
              </button>
              {stockValidation && stockValidation.some(item => !item.stock_suficiente) && !isEditing && (
                <p className="text-xs text-red-600 mt-2">
                  No se puede crear la orden: hay insumos con stock insuficiente
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Notificación Toast */}
        <NotificationToast
          open={notification.open}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification({ ...notification, open: false })}
          duration={notification.type === 'success' ? 3000 : 5000}
        />
      </div>
    </AdminLayout>
  )
}

export default AdminProduccionForm

