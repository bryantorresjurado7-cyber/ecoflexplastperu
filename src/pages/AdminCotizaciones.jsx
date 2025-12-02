import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import { FileText, Search, Eye, Trash2, Filter, Download, Mail, Phone, Package, User, X, Calendar, DollarSign, Edit } from 'lucide-react'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminCotizaciones = () => {
  const navigate = useNavigate()
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('all')
  const [selectedCotizacion, setSelectedCotizacion] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadCotizaciones()
  }, [])

  const loadCotizaciones = async () => {
    try {
      setLoading(true)

      // Obtener sesión del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones?limit=1000`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const result = await response.json()

      if (!result.success) throw new Error(result.error || 'Error cargando cotizaciones')

      console.log('📦 Datos recibidos de la Edge Function:', result.data)

      // Mapear datos - el cliente viene desde el JOIN
      const mappedData = (result.data || []).map(cotizacion => {
        // El cliente puede venir como objeto o como array (depende de cómo Supabase devuelva el JOIN)
        const clienteData = Array.isArray(cotizacion.cliente)
          ? cotizacion.cliente[0]
          : cotizacion.cliente

        return {
          id: cotizacion.id_cotizacion,
          ...cotizacion,
          cliente: clienteData ? {
            nombre: clienteData.nombre || 'Sin nombre',
            email: clienteData.email || '',
            telefono: clienteData.telefono || '',
            empresa: clienteData.descripcion || ''
          } : {
            nombre: 'Sin nombre',
            email: '',
            telefono: '',
            empresa: ''
          }
        }
      })

      console.log('📊 Datos mapeados:', mappedData)
      setCotizaciones(mappedData)
    } catch (error) {
      console.error('Error cargando cotizaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      'en_proceso': 'bg-blue-100 text-blue-800',
      'en proceso': 'bg-blue-100 text-blue-800', // Por si viene sin guión
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const matchSearch =
      cotizacion.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchEstado = filterEstado === 'all' || cotizacion.estado === filterEstado
    return matchSearch && matchEstado
  })

  const totalPages = Math.ceil(filteredCotizaciones.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCotizaciones = filteredCotizaciones.slice(startIndex, endIndex)

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      console.log('🔄 Cambiando estado de cotización:', { id, nuevoEstado })

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      console.log('🔑 Token obtenido:', token ? 'Sí' : 'No')

      const url = `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones/${id}`
      console.log('🌐 URL:', url)
      console.log('📤 Payload:', JSON.stringify({ estado: nuevoEstado }))

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      console.log('📥 Respuesta status:', response.status, response.statusText)

      const responseText = await response.text()
      console.log('📄 Respuesta completa:', responseText)

      let result
      try {
        result = JSON.parse(responseText)
        console.log('✅ Respuesta parseada:', result)
      } catch (parseError) {
        console.error('❌ Error parseando respuesta:', parseError)
        throw new Error(`Error en respuesta: ${responseText}`)
      }

      if (!response.ok || !result.success) {
        console.error('❌ Error en respuesta:', result)
        throw new Error(result.error || `Error HTTP ${response.status}`)
      }

      console.log('✅ Estado actualizado exitosamente')
      loadCotizaciones()
    } catch (error) {
      console.error('❌ Error completo actualizando estado:', error)
      console.error('Stack:', error.stack)
      alert('Error al actualizar estado: ' + error.message)
    }
  }

  const handleEditar = (cotizacion) => {
    const idCotizacion = cotizacion.id_cotizacion || cotizacion.id
    navigate(`/admin/cotizaciones/editar/${idCotizacion}`)
  }

  const handleDeleteClick = (cotizacion) => {
    const cotizacionId = cotizacion.id_cotizacion || cotizacion.id
    const clienteNombre = cotizacion.cliente?.nombre || 'este cliente'
    setDeleteConfirm({ id: cotizacionId, nombre: clienteNombre })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones/${deleteConfirm.id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      setDeleteConfirm(null)
      loadCotizaciones()
    } catch (error) {
      console.error('Error eliminando cotización:', error)
      alert('Error al eliminar cotización')
      setDeleteConfirm(null)
    }
  }

  const handleVerDetalle = async (cotizacion) => {
    try {
      console.log('🔍 Iniciando obtener detalle de cotización')
      console.log('📋 Datos de cotización recibidos:', {
        id: cotizacion.id,
        id_cotizacion: cotizacion.id_cotizacion,
        numero_cotizacion: cotizacion.numero_cotizacion
      })

      setLoadingDetalle(true)
      setShowDetailModal(true)

      // Obtener detalles completos de la cotización
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const idCotizacion = cotizacion.id_cotizacion || cotizacion.id
      console.log('🔍 ID de cotización a buscar:', idCotizacion)
      console.log('🔑 Token disponible:', token ? 'Sí' : 'No')

      const url = `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones/${idCotizacion}`
      console.log('🌐 URL de petición:', url)

      // Obtener cotización completa con cliente, vendedor y detalles
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📥 Respuesta status:', response.status)
      console.log('📥 Respuesta ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error HTTP:', response.status, errorText)
        throw new Error(`Error HTTP ${response.status}: ${errorText}`)
      }

      const responseText = await response.text()
      console.log('📄 Respuesta completa (texto):', responseText)

      let result
      try {
        result = JSON.parse(responseText)
        console.log('✅ Respuesta parseada:', result)
      } catch (parseError) {
        console.error('❌ Error parseando respuesta:', parseError)
        throw new Error(`Error en respuesta: ${responseText}`)
      }

      if (!result.success) {
        console.error('❌ Error en respuesta del servidor:', result.error)
        throw new Error(result.error || 'Error desconocido al obtener detalle')
      }

      console.log('✅ Cotización obtenida exitosamente')
      console.log('📊 Datos de cotización:', {
        id: result.data?.id_cotizacion,
        numero: result.data?.numero_cotizacion,
        cliente: result.data?.cliente?.nombre || 'N/A',
        vendedor: result.data?.vendedor?.nombre || 'N/A',
        total_productos: result.data?.detalles?.length || 0
      })

      // El endpoint ya incluye cliente, vendedor y detalles
      setSelectedCotizacion(result.data)

    } catch (error) {
      console.error('❌ Error completo obteniendo detalle:')
      console.error('📋 Mensaje:', error.message)
      console.error('📋 Stack:', error.stack)
      console.error('📋 Error completo:', error)

      const errorMessage = error.message || 'Error desconocido al obtener el detalle de la cotización'
      alert('Error al obtener detalle: ' + errorMessage)
      setShowDetailModal(false)
    } finally {
      console.log('🏁 Finalizando carga de detalle')
      setLoadingDetalle(false)
    }
  }

  return (
    <AdminLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-negro-principal flex items-center gap-3">
              <FileText className="text-verde-principal" size={28} />
              Gestión de Cotizaciones
            </h2>
            <p className="text-gris-medio mt-1">{cotizaciones.length} cotizaciones en total</p>
          </div>
          <button
            onClick={() => navigate('/admin/cotizaciones/nueva')}
            className="btn-primary flex items-center gap-2"
          >
            <FileText size={20} />
            Nueva Cotización
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gris-medio" size={20} />
              <input
                type="text"
                placeholder="Buscar por cliente o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gris-medio" size={20} />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-verde-principal hover:bg-verde-hover text-white rounded-lg transition-colors">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-fondo-claro border-b border-gris-claro">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio">CLIENTE</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio">CONTACTO</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gris-medio">TOTAL</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gris-medio">ESTADO</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gris-medio">FECHA</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gris-medio">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCotizaciones.map((cotizacion) => (
                      <tr key={cotizacion.id_cotizacion || cotizacion.id} className="border-b border-gris-claro hover:bg-fondo-claro transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-sm text-negro-principal">
                              {cotizacion.cliente?.nombre || 'Sin nombre'}
                            </p>
                            {cotizacion.cliente?.empresa && (
                              <p className="text-xs text-gris-medio">{cotizacion.cliente.empresa}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {cotizacion.cliente?.email && (
                              <p className="text-xs text-gris-medio flex items-center gap-1">
                                <Mail size={12} />
                                {cotizacion.cliente.email}
                              </p>
                            )}
                            {cotizacion.cliente?.telefono && (
                              <p className="text-xs text-gris-medio flex items-center gap-1">
                                <Phone size={12} />
                                {cotizacion.cliente.telefono}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-right font-semibold text-verde-principal">
                            {formatCurrency(cotizacion.total || 0)}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={cotizacion.estado}
                            onChange={(e) => handleChangeEstado(cotizacion.id_cotizacion || cotizacion.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-none ${getEstadoColor(cotizacion.estado)}`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-center text-sm text-gris-medio">
                          {formatDate(cotizacion.fecha_emision || cotizacion.created_at)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleVerDetalle(cotizacion)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="text-blue-500" size={18} />
                            </button>
                            <button
                              onClick={() => handleEditar(cotizacion)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="text-green-600" size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(cotizacion)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="text-red-500" size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="border-t border-gris-claro px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gris-medio">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCotizaciones.length)} de {filteredCotizaciones.length} cotizaciones
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gris-claro rounded-lg hover:bg-fondo-claro transition-colors disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gris-claro rounded-lg hover:bg-fondo-claro transition-colors disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {showDetailModal && selectedCotizacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-verde-principal text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <FileText size={28} />
                  Detalle de Cotización
                </h3>
                <p className="text-sm mt-1 opacity-90">
                  {selectedCotizacion.numero_cotizacion || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedCotizacion(null)
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetalle ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
                </div>
              ) : (
                <>
                  {/* Información del Cliente */}
                  <div className="bg-fondo-claro rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <User className="text-verde-principal" size={20} />
                      Información del Cliente
                    </h4>
                    {(() => {
                      const cliente = Array.isArray(selectedCotizacion.cliente)
                        ? selectedCotizacion.cliente[0]
                        : selectedCotizacion.cliente

                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gris-medio">Nombre</p>
                            <p className="font-medium">{cliente?.nombre || 'Sin nombre'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gris-medio">Email</p>
                            <p className="font-medium flex items-center gap-1">
                              <Mail size={14} />
                              {cliente?.email || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gris-medio">Teléfono</p>
                            <p className="font-medium flex items-center gap-1">
                              <Phone size={14} />
                              {cliente?.telefono || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gris-medio">Empresa</p>
                            <p className="font-medium">{cliente?.descripcion || 'N/A'}</p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Vendedor */}
                  {selectedCotizacion.vendedor && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <User className="text-blue-600" size={20} />
                        Vendedor
                      </h4>
                      {(() => {
                        const vendedor = Array.isArray(selectedCotizacion.vendedor)
                          ? selectedCotizacion.vendedor[0]
                          : selectedCotizacion.vendedor
                        return (
                          <>
                            <p className="font-medium">{vendedor?.nombre || 'N/A'}</p>
                            {vendedor?.email && (
                              <p className="text-sm text-gris-medio mt-1">{vendedor.email}</p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}

                  {/* Productos */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Package className="text-verde-principal" size={20} />
                      Productos ({selectedCotizacion.detalles?.length || 0})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-fondo-claro">
                          <tr>
                            <th className="text-left py-2 px-4 text-sm font-semibold">Producto</th>
                            <th className="text-center py-2 px-4 text-sm font-semibold">Cantidad</th>
                            <th className="text-right py-2 px-4 text-sm font-semibold">Precio Unit.</th>
                            <th className="text-right py-2 px-4 text-sm font-semibold">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCotizacion.detalles && selectedCotizacion.detalles.length > 0 ? (
                            selectedCotizacion.detalles.map((detalle, index) => {
                              const producto = Array.isArray(detalle.producto) ? detalle.producto[0] : detalle.producto
                              return (
                                <tr key={detalle.id_detalle_cotizacion || index} className="border-b border-gris-claro">
                                  <td className="py-3 px-4">
                                    <p className="font-medium">{producto?.nombre || 'Producto sin nombre'}</p>
                                    {producto?.codigo && (
                                      <p className="text-xs text-gris-medio">Código: {producto.codigo}</p>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-center">{detalle.cantidad || 0}</td>
                                  <td className="py-3 px-4 text-right">{formatCurrency(detalle.precio_unitario || 0)}</td>
                                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(detalle.subtotal || 0)}</td>
                                </tr>
                              )
                            })
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-4 text-center text-gris-medio">
                                No hay productos en esta cotización
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="bg-fondo-claro rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <DollarSign className="text-verde-principal" size={20} />
                      Resumen
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gris-medio">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(selectedCotizacion.subtotal || 0)}</span>
                      </div>
                      {selectedCotizacion.descuento > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gris-medio">Descuento:</span>
                          <span className="font-medium text-red-600">-{formatCurrency(selectedCotizacion.descuento || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gris-medio">IGV (18%):</span>
                        <span className="font-medium">{formatCurrency(selectedCotizacion.igv || 0)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gris-claro">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-lg text-verde-principal">{formatCurrency(selectedCotizacion.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fechas y Estado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gris-medio mb-1 flex items-center gap-1">
                        <Calendar size={14} />
                        Fecha de Emisión
                      </p>
                      <p className="font-medium">{formatDate(selectedCotizacion.fecha_emision || selectedCotizacion.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gris-medio mb-1">Estado</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedCotizacion.estado)}`}>
                        {selectedCotizacion.estado || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Observaciones */}
                  {selectedCotizacion.observaciones && (
                    <div>
                      <p className="text-sm text-gris-medio mb-1">Observaciones</p>
                      <p className="bg-fondo-claro p-3 rounded-lg">{selectedCotizacion.observaciones}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gris-claro p-4 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedCotizacion(null)
                }}
                className="px-6 py-2 bg-verde-principal hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-negro-principal mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gris-medio mb-6">
              ¿Estás seguro de eliminar la cotización del cliente <strong>{deleteConfirm.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminCotizaciones

