import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import {
  DollarSign,
  Package,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Check,
  X,
  User,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock, // Add Clock for status icons if needed, though not strictly required for this task, keeping imports clean
} from 'lucide-react'

import PrintPreviewModal from '../components/PrintPreviewModal'
import { unwrapResponse } from '../utils/serviceWrapper'
import { getSessionKey } from '../utils/encryption'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminVenta = () => {
  const [searchParams] = useSearchParams()
  const idPedido = searchParams.get('id')
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCliente, setSearchCliente] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingVenta, setLoadingVenta] = useState(false)
  const [loadingVentaExistente, setLoadingVentaExistente] = useState(false)
  const [ventaCargada, setVentaCargada] = useState(false)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [direccionEntrega, setDireccionEntrega] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState(18.00)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Estado para el modal de impresión
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printData, setPrintData] = useState(null)

  const successTimeoutRef = useRef(null)

  useEffect(() => {
    loadProductos()
    loadClientes()

    // Fecha por defecto: 7 días desde hoy
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 7)
    setFechaEntrega(tomorrow.toISOString().split('T')[0])
  }, [])

  // Cargar venta existente cuando los productos estén listos y haya un ID
  useEffect(() => {
    if (idPedido && productos.length > 0 && !loading && !ventaCargada) {
      setVentaCargada(true)
      loadVentaExistente(idPedido)
    }
  }, [idPedido, productos.length, loading, ventaCargada])

  useEffect(() => {
    if (showSuccess) {
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false)
        setCarrito([])
        setSelectedCliente(null)
      }, 3000)
    }
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
    }
  }, [showSuccess])

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
      alert('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente')
        .select('id_cliente, nombre, email, telefono, direccion')
        .eq('estado', true)
        .order('nombre')

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Error cargando clientes:', error)
    }
  }

  const loadVentaExistente = async (pedidoId) => {
    setLoadingVentaExistente(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Sesión expirada. Por favor inicie sesión nuevamente.')
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos/${pedidoId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'x-session-key': getSessionKey()
        }
      })

      const encryptedResult = await response.json()
      const result = await unwrapResponse(encryptedResult)

      if (result.success && result.data) {
        const venta = result.data

        // Cargar cliente
        if (venta.cliente) {
          setSelectedCliente({
            id_cliente: venta.id_cliente,
            nombre: venta.cliente.nombre,
            email: venta.cliente.email,
            telefono: venta.cliente.telefono,
            direccion: venta.cliente.direccion
          })
        }

        // Cargar detalles del pedido en el carrito
        if (venta.detalles && venta.detalles.length > 0) {
          const itemsCarrito = await Promise.all(
            venta.detalles.map(async (detalle) => {
              // Buscar producto en la lista cargada primero
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
                  cantidad: detalle.cantidad,
                  precio_unitario: parseFloat(detalle.precio_unitario || 0)
                }
              }

              return null
            })
          )

          setCarrito(itemsCarrito.filter(item => item !== null))
        }

        // Cargar otros datos
        if (venta.direccion_entrega) {
          setDireccionEntrega(venta.direccion_entrega)
        }
        if (venta.fecha_entrega) {
          const fecha = new Date(venta.fecha_entrega)
          setFechaEntrega(fecha.toISOString().split('T')[0])
        }
        if (venta.metodo_pago) {
          setMetodoPago(venta.metodo_pago)
        }
        if (venta.impuesto_porcentaje !== undefined && venta.impuesto_porcentaje !== null) {
          setImpuestoPorcentaje(parseFloat(venta.impuesto_porcentaje))
        } else {
          // Por defecto 18% si no existe el campo
          setImpuestoPorcentaje(18.00)
        }
      } else {
        alert('Error al cargar la venta: ' + (result.error || 'Venta no encontrada'))
      }
    } catch (error) {
      console.error('Error cargando venta:', error)
      alert('Error al cargar los datos de la venta')
    } finally {
      setLoadingVentaExistente(false)
    }
  }

  const addToCart = (producto) => {
    if (producto.stock_disponible <= 0) {
      alert('Producto sin stock')
      return
    }

    const existingItem = carrito.find(item => item.id === producto.id)

    if (existingItem) {
      if (existingItem.cantidad + 1 > producto.stock_disponible) {
        alert(`Stock disponible: ${producto.stock_disponible}`)
        return
      }
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        ...producto,
        cantidad: 1
      }])
    }
  }

  const removeFromCart = (productId) => {
    setCarrito(carrito.filter(item => item.id !== productId))
  }

  const updateCantidad = (productId, cantidad) => {
    const producto = carrito.find(item => item.id === productId)
    if (!producto) return

    if (cantidad <= 0) {
      removeFromCart(productId)
    } else if (cantidad > producto.stock_disponible) {
      alert(`Stock disponible: ${producto.stock_disponible}`)
    } else {
      setCarrito(carrito.map(item =>
        item.id === productId ? { ...item, cantidad } : item
      ))
    }
  }

  const getSubtotal = () => {
    return carrito.reduce((total, item) =>
      total + (parseFloat(item.precio_unitario || 0) * item.cantidad), 0
    )
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

  const handlePrint = () => {
    // Preparar datos para la impresión
    setPrintData({
      type: 'VENTA',
      titulo: idPedido ? 'FICHA DE VENTA (EDITAR)' : 'FICHA DE VENTA',
      fecha: new Date().toLocaleDateString(),
      cliente: selectedCliente ? {
        nombre: selectedCliente.nombre,
        email: selectedCliente.email,
        telefono: selectedCliente.telefono,
        direccion: selectedCliente.direccion || direccionEntrega,
        documento: selectedCliente.documento || 'N/A' // Asumiendo que existe el campo documento si aplica
      } : {
        nombre: 'Cliente General',
        email: '-',
        telefono: '-',
        direccion: direccionEntrega || '-'
      },
      detalles: carrito.map(item => ({
        codigo: item.codigo || 'N/A',
        nombre: item.nombre,
        descripcion: item.categoria || '',
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio_unitario || 0),
        subtotal: parseFloat(item.precio_unitario || 0) * item.cantidad
      })),
      resumen: {
        subtotal: getSubtotal(),
        impuesto_porcentaje: impuestoPorcentaje,
        impuestos: getIGV(),
        total: getTotal()
      },
      observaciones: `Fecha de entrega: ${fechaEntrega || 'Por definir'}. Método de pago: ${metodoPago}.`,
      extra: {
        estado: idPedido ? 'Existente' : 'Nueva Venta',
        direccion_entrega: direccionEntrega
      }
    })
    setShowPrintModal(true)
  }

  const handleCheckout = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío')
      return
    }

    if (!selectedCliente) {
      alert('Por favor selecciona un cliente')
      setShowClienteModal(true)
      return
    }

    if (!fechaEntrega) {
      alert('Por favor selecciona una fecha de entrega')
      return
    }

    if (!direccionEntrega.trim()) {
      alert('Por favor ingresa la dirección de entrega')
      return
    }

    // Mostrar modal de confirmación personalizado
    setShowConfirmModal(true)
  }

  const confirmarVenta = async () => {
    setShowConfirmModal(false)
    setLoadingVenta(true)

    try {
      // Preparar datos del pedido
      const detalles = carrito.map(item => ({
        id_producto: item.id,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio_unitario || 0)
      }))

      const pedidoData = {
        id_cliente: selectedCliente.id_cliente,
        fecha_entrega: fechaEntrega,
        direccion_entrega: direccionEntrega,
        metodo_pago: metodoPago,
        subtotal: getSubtotal(),
        impuesto_porcentaje: impuestoPorcentaje,
        total_impuesto: getIGV(),
        total: getTotal(),
        estado_pedido: 'confirmado',
        detalles
      }

      // Determinar si es creación o actualización
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Sesión expirada')
        window.location.href = '/login'
        return
      }

      const url = idPedido
        ? `${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos/${idPedido}`
        : `${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos`

      const method = idPedido ? 'PUT' : 'POST'

      // Llamar a la Edge Function
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'x-session-key': getSessionKey(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidoData)
      })

      const encryptedResult = await response.json()
      const result = await unwrapResponse(encryptedResult)

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar la venta')
      }

      // Mostrar éxito
      setShowSuccess(true)

      // Si es edición, redirigir a la lista de ventas después de un momento
      if (idPedido) {
        setTimeout(() => {
          window.location.href = '/admin/ventas'
        }, 2000)
      } else {
        // Resetear formulario solo si es nueva venta
        setDireccionEntrega('')
      }

    } catch (error) {
      console.error('Error al procesar venta:', error)
      alert('Error al procesar la venta: ' + error.message)
    } finally {
      setLoadingVenta(false)
    }
  }

  const filteredProductos = productos.filter(producto =>
    producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-fondo-claro">
      {/* Header */}
      <div className="bg-white border-b border-gris-claro sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                <DollarSign className="text-verde-principal" size={32} />
                {idPedido ? 'Editar Venta' : 'Punto de Venta'}
              </h1>
              <p className="text-gris-medio mt-1">
                {idPedido ? 'Modifica los datos de la venta' : 'Sistema de ventas profesional'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/admin/ventas'}
                className="flex items-center gap-2 px-4 py-2 border border-verde-principal text-verde-principal rounded-lg hover:bg-verde-light transition-colors"
              >
                <Package size={20} />
                <span className="hidden md:inline">Ver Ventas</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gris-claro rounded-lg hover:bg-fondo-claro transition-colors"
              >
                <Printer size={20} />
                <span className="hidden md:inline">Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {loadingVentaExistente && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-blue-700 font-medium">Cargando datos de la venta...</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-negro-principal">Productos Disponibles</h2>
                <div className="text-sm text-gris-medio">
                  {filteredProductos.length} productos disponibles
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gris-medio" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none"
                />
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-verde-principal"></div>
                  <p className="text-gris-medio mt-4">Cargando productos...</p>
                </div>
              ) : filteredProductos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gris-claro mb-4" size={48} />
                  <p className="text-gris-medio">No se encontraron productos</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                  {filteredProductos.map(producto => (
                    <button
                      key={producto.id}
                      onClick={() => addToCart(producto)}
                      disabled={producto.stock_disponible <= 0}
                      className="flex items-center justify-between p-4 border border-gris-claro rounded-lg hover:border-verde-principal hover:bg-fondo-claro transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-negro-principal">{producto.nombre}</h3>
                        <p className="text-sm text-gris-medio">{producto.categoria}</p>
                        <p className="text-xs text-gris-medio">Cod: {producto.codigo}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-verde-principal">
                          S/ {parseFloat(producto.precio_unitario || 0).toFixed(2)}
                        </p>
                        <p className={`text-xs ${producto.stock_disponible > 0 ? 'text-verde-principal' : 'text-red-500'}`}>
                          Stock: {producto.stock_disponible}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Carrito y Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              {/* Selector de Cliente */}
              <div className="mb-6 pb-6 border-b border-gris-claro">
                {selectedCliente ? (
                  <div className="bg-verde-light p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="text-verde-principal" size={24} />
                        <div>
                          <p className="font-semibold text-negro-principal">{selectedCliente.nombre}</p>
                          <p className="text-sm text-gris-medio">{selectedCliente.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowClienteModal(true)}
                        className="text-gris-medio hover:text-verde-principal"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClienteModal(true)}
                    className="w-full py-3 px-4 border-2 border-dashed border-gris-claro rounded-lg hover:border-verde-principal transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={20} />
                    <span className="font-medium">Seleccionar Cliente</span>
                  </button>
                )}
              </div>

              {/* Carrito */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Carrito
                  {carrito.length > 0 && (
                    <span className="bg-verde-principal text-white px-2 py-1 rounded-full text-sm">
                      {carrito.length}
                    </span>
                  )}
                </h2>

                {carrito.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gris-claro rounded-lg">
                    <ShoppingCart className="mx-auto text-gris-claro mb-4" size={48} />
                    <p className="text-gris-medio">El carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                      {carrito.map(item => (
                        <div key={item.id} className="border border-gris-claro rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-negro-principal line-clamp-1">
                                {item.nombre}
                              </h4>
                              <p className="text-xs text-gris-medio">{item.categoria}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                                className="w-7 h-7 border border-gris-claro rounded flex items-center justify-center hover:bg-fondo-claro"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center font-semibold">{item.cantidad}</span>
                              <button
                                onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                                className="w-7 h-7 border border-gris-claro rounded flex items-center justify-center hover:bg-fondo-claro"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="font-bold text-verde-principal">
                              S/ {(parseFloat(item.precio_unitario || 0) * item.cantidad).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumen */}
                    <div className="border-t border-gris-claro pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gris-medio">Subtotal:</span>
                        <span className="font-semibold">S/ {getSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gris-medio">IGV ({impuestoPorcentaje}%):</span>
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
                        <span className={`font-semibold ${impuestoPorcentaje > 0 ? '' : 'line-through text-gris-medio'}`}>
                          S/ {getIGV().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-verde-principal">S/ {getTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Formulario de entrega */}
              {carrito.length > 0 && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-negro-principal mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Dirección de Entrega
                    </label>
                    <input
                      type="text"
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      placeholder="Ingrese la dirección"
                      className="w-full px-4 py-2 border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-negro-principal mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      Fecha de Entrega
                    </label>
                    <input
                      type="date"
                      value={fechaEntrega}
                      onChange={(e) => setFechaEntrega(e.target.value)}
                      className="w-full px-4 py-2 border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-negro-principal mb-2 flex items-center gap-2">
                      <CreditCard size={16} />
                      Método de Pago
                    </label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-full px-4 py-2 border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="yape">Yape</option>
                      <option value="plin">Plin</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Botón de confirmar */}
              <button
                onClick={handleCheckout}
                disabled={carrito.length === 0 || loadingVenta}
                className="w-full bg-verde-principal hover:bg-verde-oscuro text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingVenta ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    {idPedido ? 'Actualizar Venta' : 'Confirmar Venta'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cliente */}
      {showClienteModal && (
        <div className="fixed inset-0 bg-negro-principal bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-negro-principal">Seleccionar Cliente</h3>
              <button
                onClick={() => {
                  setShowClienteModal(false)
                  setSearchCliente('')
                }}
                className="text-gris-medio hover:text-negro-principal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Campo de búsqueda */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gris-medio" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none"
                autoFocus
              />
            </div>

            {/* Lista de clientes filtrados */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {clientes
                .filter(cliente => {
                  const searchLower = searchCliente.toLowerCase()
                  return (
                    cliente.nombre?.toLowerCase().includes(searchLower) ||
                    cliente.email?.toLowerCase().includes(searchLower) ||
                    cliente.telefono?.includes(searchCliente)
                  )
                })
                .map(cliente => (
                  <button
                    key={cliente.id_cliente}
                    onClick={() => {
                      setSelectedCliente(cliente)
                      setDireccionEntrega(cliente.direccion || '')
                      setShowClienteModal(false)
                      setSearchCliente('')
                    }}
                    className="w-full text-left p-4 border border-gris-claro rounded-lg hover:border-verde-principal hover:bg-fondo-claro transition-all"
                  >
                    <p className="font-semibold text-negro-principal">{cliente.nombre}</p>
                    <p className="text-sm text-gris-medio">{cliente.email}</p>
                    {cliente.telefono && (
                      <p className="text-xs text-gris-medio">{cliente.telefono}</p>
                    )}
                  </button>
                ))}
              {clientes.filter(cliente => {
                const searchLower = searchCliente.toLowerCase()
                return (
                  cliente.nombre?.toLowerCase().includes(searchLower) ||
                  cliente.email?.toLowerCase().includes(searchLower) ||
                  cliente.telefono?.includes(searchCliente)
                )
              }).length === 0 && (
                  <div className="text-center py-8">
                    <User className="mx-auto text-gris-claro mb-2" size={32} />
                    <p className="text-gris-medio">No se encontraron clientes</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-negro-principal bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-gris-claro">
              <h3 className="text-2xl font-bold text-negro-principal flex items-center gap-3">
                <CheckCircle className="text-verde-principal" size={28} />
                Confirmar Venta
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-gris-medio">
                ¿Estás seguro de confirmar esta venta?
              </p>

              {/* Resumen de la venta */}
              <div className="bg-fondo-claro rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gris-medio">Cliente:</span>
                  <span className="font-semibold">{selectedCliente?.nombre}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gris-medio">Productos:</span>
                  <span className="font-semibold">{carrito.length} items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gris-medio">Total:</span>
                  <span className="text-lg font-bold text-verde-principal">S/ {getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gris-claro flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 border border-gris-claro rounded-lg hover:bg-fondo-claro transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarVenta}
                disabled={loadingVenta}
                className="flex-1 px-4 py-3 bg-verde-principal text-white rounded-lg hover:bg-verde-oscuro transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingVenta ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Previsualización de Impresión */}
      <PrintPreviewModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={printData}
      />

      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-verde-principal text-white p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up">
          <Check size={24} />
          <div>
            <p className="font-semibold">Venta Registrada</p>
            <p className="text-sm">La venta se ha registrado exitosamente</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVenta
