import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import AdminLayout from '../components/AdminLayout'
import NotificationToast from '../components/NotificationToast'
import {
  ArrowLeft,
  Package,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  Printer
} from 'lucide-react'
import PrintPreviewModal from '../components/PrintPreviewModal'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminCotizacionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingCotizacion, setLoadingCotizacion] = useState(false)
  const [loadingCotizacionExistente, setLoadingCotizacionExistente] = useState(false)
  const [cotizacionCargada, setCotizacionCargada] = useState(false)

  // Estado para el modal de impresión
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printData, setPrintData] = useState(null)

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Datos del cliente
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteEmail, setClienteEmail] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [clienteEmpresa, setClienteEmpresa] = useState('')
  const [clienteDireccion, setClienteDireccion] = useState('')
  const [clienteTipoDocumento, setClienteTipoDocumento] = useState('DNI')
  const [clienteNumeroDocumento, setClienteNumeroDocumento] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [clienteEncontrado, setClienteEncontrado] = useState(false)
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState(18.00)
  const [cotizacionNumero, setCotizacionNumero] = useState('')

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    loadProductos()
  }, [])

  // Cargar cotización cuando los productos estén listos y haya un ID
  useEffect(() => {
    if (id && productos.length > 0 && !loading && !cotizacionCargada) {
      setCotizacionCargada(true)
      loadCotizacionExistente(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos.length, loading, id, cotizacionCargada])

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos_db')
        .select('id, codigo, nombre, categoria, precio_unitario, stock_disponible, imagen_principal')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar productos',
        message: 'No se pudieron cargar los productos. Por favor, recargue la página.'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCotizacionExistente = async (cotizacionId) => {
    setLoadingCotizacionExistente(true)
    try {
      // Obtener token de autenticación
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const url = `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones/${cotizacionId}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar la cotización')
      }

      const result = await response.json()

      if (result.success && result.data) {
        const cotizacion = result.data
        setCotizacionNumero(cotizacion.numero_cotizacion || '')

        // Cargar datos del cliente
        const cliente = Array.isArray(cotizacion.cliente)
          ? cotizacion.cliente[0]
          : cotizacion.cliente

        if (cliente) {
          setClienteNombre(cliente.nombre || '')
          setClienteEmail(cliente.email || '')
          setClienteTelefono(cliente.telefono || '')
          setClienteDireccion(cliente.direccion || '')
          setClienteEmpresa(cliente.descripcion || '')
          setClienteTipoDocumento(cliente.tipo_documento || 'DNI')
          setClienteNumeroDocumento(cliente.numero_documento || '')
          setClienteEncontrado(true)
        }

        // Cargar IGV
        if (cotizacion.igv !== undefined && cotizacion.igv !== null) {
          // Determinar si incluye IGV basado en el valor
          // Si el IGV es mayor a 0, significa que incluye IGV (18%)
          // Si el IGV es 0, no incluye IGV
          const subtotal = cotizacion.subtotal || 0
          const igvCalculado = subtotal * 0.18
          const tieneIGV = Math.abs(cotizacion.igv - igvCalculado) < 0.01 // Comparación con tolerancia
          setImpuestoPorcentaje(tieneIGV ? 18.00 : 0.00)
        } else {
          setImpuestoPorcentaje(18.00) // Por defecto
        }

        // Cargar observaciones
        if (cotizacion.observaciones) {
          setObservaciones(cotizacion.observaciones)
        }

        // Cargar productos en el carrito
        if (cotizacion.detalles && cotizacion.detalles.length > 0) {
          const itemsCarrito = await Promise.all(
            cotizacion.detalles.map(async (detalle) => {
              // Buscar producto en la lista cargada
              let producto = productos.find(p => p.id === detalle.id_producto)

              // Si no está en la lista, buscar individualmente
              if (!producto) {
                try {
                  const { data } = await supabase
                    .from('productos_db')
                    .select('id, codigo, nombre, categoria, precio_unitario, stock_disponible, imagen_principal')
                    .eq('id', detalle.id_producto)
                    .single()

                  if (data) {
                    producto = data
                  }
                } catch (error) {
                  console.error('Error cargando producto:', error)
                }
              }

              if (producto) {
                return {
                  ...producto,
                  cantidad: detalle.cantidad || 1,
                  precio_unitario: parseFloat(detalle.precio_unitario || producto.precio_unitario || 0)
                }
              }

              return null
            })
          )

          setCarrito(itemsCarrito.filter(item => item !== null))
        }
      } else {
        throw new Error(result.error || 'Cotización no encontrada')
      }
    } catch (error) {
      console.error('Error cargando cotización:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar cotización',
        message: error.message || 'No se pudieron cargar los datos de la cotización.'
      })
    } finally {
      setLoadingCotizacionExistente(false)
    }
  }

  // Buscar cliente por número de documento (sin restricción de tipo para mayor flexibilidad)
  const buscarClientePorDocumento = async () => {
    const numeroDoc = clienteNumeroDocumento?.trim()

    if (!numeroDoc || numeroDoc.length < 8) {
      setClienteEncontrado(false)
      return
    }

    try {
      setBuscandoCliente(true)

      // Buscar cliente solo por numero_documento (más flexible)
      // Esto permite encontrar al cliente independientemente del tipo seleccionado
      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .eq('numero_documento', numeroDoc)
        .eq('estado', true)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        // Cliente encontrado - autocompletar campos incluyendo tipo de documento
        // Actualizar tipo de documento al que tiene en la BD
        setClienteTipoDocumento(data.tipo_documento || 'DNI')

        // Autocompletar el resto de campos
        setClienteNombre(data.nombre || '')
        setClienteEmail(data.email || '')
        setClienteTelefono(data.telefono || '')
        setClienteDireccion(data.direccion || '')
        setClienteEmpresa(data.descripcion || '') // Usando descripcion como empresa temporalmente
        setClienteEncontrado(true)
      } else {
        // Cliente no encontrado
        setClienteEncontrado(false)
      }
    } catch (error) {
      console.error('Error buscando cliente:', error)
      setClienteEncontrado(false)
    } finally {
      setBuscandoCliente(false)
    }
  }

  // Buscar automáticamente cuando se complete el número de documento
  useEffect(() => {
    const numeroDoc = clienteNumeroDocumento?.trim()

    if (!numeroDoc) {
      setClienteEncontrado(false)
      return
    }

    if (numeroDoc.length < 8) {
      // Si es muy corto, resetear estado pero no buscar aún
      setClienteEncontrado(false)
      return
    }

    // Buscar solo si tiene al menos 8 caracteres y no está buscando actualmente
    if (!buscandoCliente) {
      const timeoutId = setTimeout(() => {
        buscarClientePorDocumento()
      }, 800) // Debounce de 800ms para dar tiempo a terminar de escribir

      return () => clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteNumeroDocumento])

  const addToCart = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id)
      if (existe) {
        return prev.map(p =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const removeFromCart = (productoId) => {
    setCarrito(prev => prev.filter(p => p.id !== productoId))
  }

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }
    setCarrito(prev =>
      prev.map(p =>
        p.id === productoId
          ? { ...p, cantidad }
          : p
      )
    )
  }

  const getSubtotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0)
  }

  const getIGV = () => {
    if (impuestoPorcentaje === 0) return 0
    return getSubtotal() * (impuestoPorcentaje / 100)
  }

  const getTotal = () => {
    if (impuestoPorcentaje === 0) {
      // Si no incluye IGV, el total es igual al subtotal
      return getSubtotal()
    }
    // Si incluye IGV, el total es subtotal + IGV
    return getSubtotal() + getIGV()
  }

  const filteredProductos = productos.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCrearCotizacion = () => {
    // Validaciones
    if (!clienteTipoDocumento || !clienteNumeroDocumento.trim()) {
      setNotification({
        open: true,
        type: 'warning',
        title: 'Campos incompletos',
        message: 'Por favor ingrese el tipo y número de documento del cliente'
      })
      return
    }

    if (!clienteNombre || !clienteEmail) {
      setNotification({
        open: true,
        type: 'warning',
        title: 'Campos incompletos',
        message: 'Por favor ingrese nombre y email del cliente'
      })
      return
    }

    if (carrito.length === 0) {
      setNotification({
        open: true,
        type: 'warning',
        title: 'Carrito vacío',
        message: 'Debe agregar al menos un producto a la cotización'
      })
      return
    }

    setShowConfirmModal(true)
  }

  const confirmarCotizacion = async () => {
    try {
      console.log(isEditing ? '🚀 Iniciando actualización de cotización...' : '🚀 Iniciando creación de cotización...')
      setLoadingCotizacion(true)
      setShowConfirmModal(false)

      // Preparar datos
      const productosData = carrito.map(item => ({
        id: item.id,
        nombre: item.nombre,
        codigo: item.codigo,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad
      }))

      console.log('📦 Productos en carrito:', productosData)
      console.log('👤 Datos del cliente:', {
        nombre: clienteNombre,
        email: clienteEmail,
        telefono: clienteTelefono,
        empresa: clienteEmpresa
      })

      const cotizacionData = {
        cliente_nombre: clienteNombre,
        cliente_email: clienteEmail,
        cliente_telefono: clienteTelefono || null,
        cliente_empresa: clienteEmpresa || null,
        cliente_direccion: clienteDireccion || null,
        cliente_tipo_documento: clienteTipoDocumento,
        cliente_numero_documento: clienteNumeroDocumento.trim(),
        productos: productosData,
        observaciones: observaciones || null,
        estado: 'pendiente',
        subtotal: getSubtotal(),
        igv: getIGV(),
        total: getTotal(),
        incluye_igv: impuestoPorcentaje > 0
      }

      // Si es edición, no enviar estado (mantener el actual)
      if (isEditing) {
        delete cotizacionData.estado
      }

      console.log('📋 Datos de cotización a enviar:', JSON.stringify(cotizacionData, null, 2))

      // Obtener token de autenticación
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Error obteniendo sesión:', sessionError)
      }

      const token = session?.access_token
      console.log('🔑 Token obtenido:', token ? 'Sí' : 'No')

      // Determinar URL y método según si es creación o edición
      const url = isEditing
        ? `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones/${id}`
        : `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones`

      const method = isEditing ? 'PUT' : 'POST'

      console.log('🌐 URL de la Edge Function:', url)
      console.log('📡 Método:', method)

      // Llamar a la Edge Function
      console.log(`📡 Enviando petición ${method}...`)
      const response = await fetch(url, {
        method: method,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cotizacionData)
      })

      console.log('📥 Respuesta recibida, status:', response.status, response.statusText)

      const responseText = await response.text()
      console.log('📄 Respuesta completa (texto):', responseText)

      let result
      try {
        result = JSON.parse(responseText)
        console.log('✅ Respuesta parseada:', JSON.stringify(result, null, 2))
      } catch (parseError) {
        console.error('❌ Error parseando respuesta:', parseError)
        console.error('Texto de respuesta:', responseText)
        throw new Error(`Error en respuesta del servidor: ${responseText}`)
      }

      if (!response.ok || !result.success) {
        console.error('❌ Error en respuesta:', result)
        throw new Error(result.error || `Error HTTP ${response.status}: ${response.statusText}`)
      }

      console.log(isEditing ? '✅ Cotización actualizada exitosamente:' : '✅ Cotización creada exitosamente:', result.data)

      // Mostrar notificación de éxito
      setNotification({
        open: true,
        type: 'success',
        title: isEditing ? '¡Cotización actualizada exitosamente!' : '¡Cotización creada exitosamente!',
        message: isEditing
          ? `La cotización ha sido actualizada correctamente.`
          : `La cotización ha sido guardada correctamente.`
      })

      // Navegar después de 2 segundos
      setTimeout(() => {
        navigate('/admin/cotizaciones')
      }, 2000)
    } catch (error) {
      console.error('❌ Error completo creando cotización:', error)
      console.error('Stack:', error.stack)

      // Mostrar notificación de error
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al crear cotización',
        message: error.message || 'Ocurrió un error al intentar crear la cotización. Por favor, intente nuevamente.'
      })
    } finally {
      setLoadingCotizacion(false)
    }
  }

  const handlePrint = () => {
    const modalData = {
      type: 'COTIZACION',
      titulo: 'COTIZACIÓN',
      numero: cotizacionNumero || 'BORRADOR',
      fecha: new Date().toLocaleDateString(),
      valido_hasta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      cliente: {
        nombre: clienteNombre,
        documento: `${clienteTipoDocumento}: ${clienteNumeroDocumento}`,
        email: clienteEmail,
        telefono: clienteTelefono,
        direccion: clienteDireccion,
        empresa: clienteEmpresa
      },
      detalles: carrito.map(item => ({
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad
      })),
      resumen: {
        subtotal: getSubtotal(),
        impuestos: getIGV(),
        impuesto_porcentaje: impuestoPorcentaje,
        total: getTotal()
      },
      observaciones: observaciones
    }

    setPrintData(modalData)
    setShowPrintModal(true)
  }

  return (
    <AdminLayout>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-negro-principal flex items-center gap-3">
              <FileText className="text-verde-principal" size={28} />
              {isEditing ? 'Editar Cotización' : 'Nueva Cotización'}
            </h2>
            <p className="text-gris-medio mt-1">
              {isEditing ? 'Modifica los datos de la cotización' : 'Complete el formulario para crear una cotización'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/cotizaciones')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>
      </header>

      <div className="p-8">
        {loadingCotizacionExistente && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 font-medium">Cargando datos de la cotización...</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Datos del cliente y productos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-negro-principal mb-4 flex items-center gap-2">
                <User className="text-verde-principal" size={20} />
                Información del Cliente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Campos de búsqueda de cliente */}
                <div>
                  <label className="text-sm font-medium text-gris-medio block mb-2">
                    Tipo de Documento *
                  </label>
                  <select
                    value={clienteTipoDocumento}
                    onChange={(e) => {
                      setClienteTipoDocumento(e.target.value)
                      setClienteEncontrado(false)
                      // Limpiar número si cambia el tipo de documento
                      if (clienteNumeroDocumento) {
                        setClienteNumeroDocumento('')
                      }
                    }}
                    className="w-full px-4 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">CE</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gris-medio block mb-2 flex items-center gap-2">
                    Número de Documento *
                    {buscandoCliente && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-verde-principal"></div>
                    )}
                    {clienteEncontrado && (
                      <span className="text-green-600 text-xs">✓ Cliente encontrado</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clienteNumeroDocumento}
                      onChange={(e) => {
                        const nuevoNumero = e.target.value.replace(/\D/g, '') // Solo números
                        setClienteNumeroDocumento(nuevoNumero)
                        if (clienteEncontrado) {
                          setClienteEncontrado(false)
                        }
                      }}
                      onBlur={() => {
                        // Buscar al salir del campo si tiene al menos 8 caracteres
                        if (clienteNumeroDocumento.trim().length >= 8) {
                          buscarClientePorDocumento()
                        }
                      }}
                      onKeyPress={(e) => {
                        // Solo permitir números
                        if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
                          e.preventDefault()
                        }
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          buscarClientePorDocumento()
                        }
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal ${clienteEncontrado
                        ? 'border-green-500 bg-green-50'
                        : buscandoCliente
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gris-claro'
                        }`}
                      placeholder={clienteTipoDocumento === 'RUC' ? 'Ej: 12345678901' : 'Ej: 12345678'}
                    />
                    <button
                      type="button"
                      onClick={buscarClientePorDocumento}
                      disabled={!clienteTipoDocumento || !clienteNumeroDocumento.trim() || buscandoCliente}
                      className="px-4 py-2 bg-verde-principal text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      title="Buscar cliente"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-gris-medio block mb-2">
                    Nombre * <User className="inline ml-1" size={14} />
                  </label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal ${clienteEncontrado ? 'bg-green-50 border-green-200' : 'border-gris-claro'
                      }`}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gris-medio block mb-2">
                    Email * <Mail className="inline ml-1" size={14} />
                  </label>
                  <input
                    type="email"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal ${clienteEncontrado ? 'bg-green-50 border-green-200' : 'border-gris-claro'
                      }`}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gris-medio block mb-2">
                    Teléfono <Phone className="inline ml-1" size={14} />
                  </label>
                  <input
                    type="text"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal ${clienteEncontrado ? 'bg-green-50 border-green-200' : 'border-gris-claro'
                      }`}
                    placeholder="+51 999 999 999"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gris-medio block mb-2">
                    Empresa <Building className="inline ml-1" size={14} />
                  </label>
                  <input
                    type="text"
                    value={clienteEmpresa}
                    onChange={(e) => setClienteEmpresa(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal ${clienteEncontrado ? 'bg-green-50 border-green-200' : 'border-gris-claro'
                      }`}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gris-medio block mb-2">
                    Dirección <MapPin className="inline ml-1" size={14} />
                  </label>
                  <input
                    type="text"
                    value={clienteDireccion}
                    onChange={(e) => setClienteDireccion(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal ${clienteEncontrado ? 'bg-green-50 border-green-200' : 'border-gris-claro'
                      }`}
                    placeholder="Dirección de entrega"
                  />
                </div>
              </div>
            </div>

            {/* Búsqueda y Lista de Productos */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-negro-principal mb-4 flex items-center gap-2">
                <Package className="text-verde-principal" size={20} />
                Agregar Productos
              </h3>

              {/* Búsqueda */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gris-medio" size={20} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
                />
              </div>

              {/* Lista de productos */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-verde-principal mx-auto"></div>
                  </div>
                ) : filteredProductos.length > 0 ? (
                  filteredProductos.map(producto => (
                    <div
                      key={producto.id}
                      className="flex items-center justify-between p-3 border border-gris-claro rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-negro-principal">{producto.nombre}</p>
                          <p className="text-xs text-gris-medio">{producto.codigo} | S/ {producto.precio_unitario}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(producto)}
                        className="px-3 py-1 bg-verde-principal text-white rounded-lg hover:bg-verde-hover transition-colors flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Agregar
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gris-medio py-4">No se encontraron productos</p>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-negro-principal mb-4">Observaciones</h3>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          {/* Columna derecha - Carrito */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-negro-principal mb-4">
                Resumen de Cotización
              </h3>

              {carrito.length === 0 ? (
                <p className="text-gris-medio text-center py-8">El carrito está vacío</p>
              ) : (
                <>
                  {/* Productos en carrito */}
                  <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                    {carrito.map(item => (
                      <div key={item.id} className="p-3 border border-gris-claro rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-negro-principal">{item.nombre}</p>
                            <p className="text-xs text-gris-medio">S/ {item.precio_unitario}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gris-claro rounded hover:bg-fondo-claro"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-12 text-center font-medium">{item.cantidad}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gris-claro rounded hover:bg-fondo-claro"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-semibold">S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen de Total con IGV */}
                  <div className="border-t border-gris-claro pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gris-medio">Subtotal</span>
                        <span className="text-sm font-medium text-negro-principal">
                          S/ {getSubtotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gris-medio">IGV ({impuestoPorcentaje}%):</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={impuestoPorcentaje === 18.00}
                              onChange={(e) => setImpuestoPorcentaje(e.target.checked ? 18.00 : 0.00)}
                              className="w-4 h-4 text-verde-principal border-gris-claro rounded focus:ring-verde-principal focus:ring-2"
                            />
                            <span className="text-xs text-gris-medio">Incluye IGV</span>
                          </label>
                        </div>
                        <span className={`text-sm font-medium text-negro-principal ${impuestoPorcentaje > 0 ? '' : 'line-through text-gris-medio'}`}>
                          S/ {getIGV().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gris-claro">
                        <span className="text-lg font-semibold text-negro-principal">Total</span>
                        <span className="text-2xl font-bold text-verde-principal">
                          S/ {getTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handlePrint}
                        type="button"
                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                      >
                        <Printer size={20} />
                        Imprimir
                      </button>
                      <button
                        onClick={handleCrearCotizacion}
                        disabled={loadingCotizacion}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        {loadingCotizacion ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Check size={20} />
                            {isEditing ? 'Actualizar Cotización' : 'Crear Cotización'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-negro-principal mb-4">
              Confirmar Cotización
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-gris-medio"><strong>Cliente:</strong> {clienteNombre}</p>
              <p className="text-gris-medio"><strong>Email:</strong> {clienteEmail}</p>
              <p className="text-gris-medio"><strong>Productos:</strong> {carrito.length}</p>
              <div className="border-t border-gris-claro pt-2 mt-3">
                <p className="text-gris-medio flex justify-between"><strong>Subtotal:</strong> S/ {getSubtotal().toFixed(2)}</p>
                <p className="text-gris-medio flex justify-between"><strong>IGV ({impuestoPorcentaje}%):</strong> S/ {getIGV().toFixed(2)}</p>
                <p className="text-verde-principal flex justify-between font-bold mt-2"><strong>Total:</strong> S/ {getTotal().toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCotizacion}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AdminCotizacionForm

