import { useState, useEffect } from 'react'
import {
  Download,
  DollarSign,
  Package,
  Calendar,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { exportToXlsx } from '../lib/exportToXlsx'
import AdminLayout from '../components/AdminLayout'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminVentasLista = () => {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVentas, setTotalVentas] = useState(0)
  const [limit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadVentas()
  }, [page, selectedEstado])

  const loadVentas = async () => {
    setLoading(true)
    try {
      let url = `${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos?page=${page}&limit=${limit}`

      if (selectedEstado) {
        url += `&estado=${selectedEstado}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setVentas(result.data)
        setTotalPages(result.pagination.totalPages)
        setTotalVentas(result.pagination.total)
      }
    } catch (error) {
      console.error('Error cargando ventas:', error)
      alert('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  const loadDetalleVenta = async (idPedido) => {
    setLoadingDetalle(true)
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos/${idPedido}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setVentaSeleccionada(result.data)
        setShowDetalleModal(true)
      }
    } catch (error) {
      console.error('Error cargando detalle:', error)
      alert('Error al cargar detalle')
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleEditar = (idPedido) => {
    // Navegar a la página de edición de venta
    window.location.href = `/admin/venta?id=${idPedido}`
  }

  const handleEliminarClick = (venta) => {
    const ventaId = venta.id_pedido
    const clienteNombre = venta.cliente?.nombre || 'este cliente'
    setDeleteConfirm({ id: ventaId, nombre: clienteNombre })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setDeleteConfirm(null)
        loadVentas()
      } else {
        alert('Error al eliminar venta: ' + (result.error || 'Error desconocido'))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error eliminando venta:', error)
      alert('Error al eliminar venta')
      setDeleteConfirm(null)
    }
  }

  const getEstadoIcon = (estado) => {
    const estados = {
      pendiente: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      confirmado: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
      enviado: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
      entregado: { icon: CheckCircle, color: 'text-verde-principal', bg: 'bg-verde-light' },
      cancelado: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
    }

    const config = estados[estado] || estados.pendiente
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.color}`}>
        <Icon size={14} />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    )
  }

  const filteredVentas = ventas.filter(venta =>
    venta.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.id_pedido?.includes(searchTerm) ||
    venta.direccion_entrega?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Exportar a Excel
  const handleExport = () => {
    try {
      setExporting(true)
      const rows = filteredVentas.map(v => {
        // Formato de fecha
        const fechaPedido = new Date(v.fecha_pedido || v.created_at).toLocaleDateString('es-PE', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        })

        let fechaCelda = fechaPedido
        if (v.fecha_entrega) {
          const fechaEntrega = new Date(v.fecha_entrega).toLocaleDateString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          })
          fechaCelda += `\nEntrega: ${fechaEntrega}`
        }

        // Estado legible
        const estadoLabel = v.estado_pedido ? (v.estado_pedido.charAt(0).toUpperCase() + v.estado_pedido.slice(1)) : 'Pendiente'

        return [
          v.cliente?.nombre || 'Cliente Eliminado', // Cliente
          fechaCelda, // Fecha
          v.direccion_entrega || '', // Dirección
          v.cliente?.email || '', // Correo
          v.metodo_pago || '', // Método de pago
          estadoLabel, // Estado
          `S/ ${Number(v.total || 0).toFixed(2)}` // Total
        ]
      })

      const columns = [
        'Cliente',
        'Fecha',
        'Dirección',
        'Correo',
        'Método de pago',
        'Estado',
        'Total'
      ]

      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `ventas_${dateStr}`

      exportToXlsx(filename, rows, columns)
    } catch (error) {
      console.error('Error exportando:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="w-full min-h-screen bg-fondo-claro p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                <DollarSign className="text-verde-principal" size={32} />
                Gestión de Ventas
              </h1>
              <p className="text-gris-medio mt-1">Historial completo de ventas</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => window.location.href = '/admin/venta'}
                className="bg-verde-principal hover:bg-verde-oscuro text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <Plus size={20} />
                Nueva Venta
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="bg-white border border-verde-principal text-verde-principal hover:bg-verde-light px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                {exporting ? 'Exportando...' : 'Exportar'}
              </button>
            </div>
          </div>
        </div>

        <div>
          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gris-medio" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por cliente, código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none"
                />
              </div>

              <select
                value={selectedEstado}
                onChange={(e) => {
                  setSelectedEstado(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>

              <div className="flex items-center gap-2 text-sm text-gris-medio">
                <Package size={20} />
                <span className="font-semibold">{totalVentas} ventas totales</span>
              </div>
            </div>
          </div>

          {/* Tabla de Ventas */}
          <div className="bg-white rounded-xl shadow-sm w-full">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-verde-principal"></div>
                <p className="text-gris-medio mt-4">Cargando ventas...</p>
              </div>
            ) : filteredVentas.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gris-claro mb-4" size={48} />
                <p className="text-gris-medio">No se encontraron ventas</p>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <table className="w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-fondo-claro">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gris-medio uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gris-medio uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gris-medio uppercase tracking-wider">Dirección</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gris-medio uppercase tracking-wider">Método de Pago</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gris-medio uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gris-medio uppercase tracking-wider">Total</th>
                        <th className="pl-6 pr-10 py-4 text-center text-xs font-semibold text-gris-medio uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gris-claro">
                      {filteredVentas.map((venta) => (
                        <tr key={venta.id_pedido} className="hover:bg-fondo-claro transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-verde-light rounded-full p-2">
                                <User className="text-verde-principal" size={20} />
                              </div>
                              <div>
                                <p className="font-semibold text-negro-principal">
                                  {venta.cliente?.nombre || 'Sin cliente'}
                                </p>
                                <p className="text-sm text-gris-medio">{venta.cliente?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gris-medio" />
                              <span className="text-sm">
                                {new Date(venta.fecha_pedido || venta.created_at).toLocaleDateString('es-PE')}
                              </span>
                            </div>
                            <p className="text-xs text-gris-medio mt-1">
                              Entrega: {venta.fecha_entrega ? new Date(venta.fecha_entrega).toLocaleDateString('es-PE') : 'N/A'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin size={16} className="text-gris-medio" />
                              <span className="max-w-xs truncate">{venta.direccion_entrega}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <CreditCard size={16} className="text-gris-medio" />
                              <span className="text-sm capitalize">{venta.metodo_pago}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getEstadoIcon(venta.estado_pedido)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-verde-principal">
                              S/ {parseFloat(venta.total || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="pl-6 pr-10 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => loadDetalleVenta(venta.id_pedido)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver detalle"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditar(venta.id_pedido)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleEliminarClick(venta)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="px-6 py-4 border-t border-gris-claro flex items-center justify-between">
                  <p className="text-sm text-gris-medio">
                    Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, totalVentas)} de {totalVentas} ventas
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 border border-gris-claro rounded-lg hover:bg-fondo-claro disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 font-semibold">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 border border-gris-claro rounded-lg hover:bg-fondo-claro disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal de Detalle */}
        {showDetalleModal && ventaSeleccionada && (
          <div className="fixed inset-0 bg-negro-principal bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b border-gris-claro p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-negro-principal">Detalle de Venta</h2>
                <button
                  onClick={() => setShowDetalleModal(false)}
                  className="text-gris-medio hover:text-negro-principal"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {loadingDetalle ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-verde-principal"></div>
                  <p className="text-gris-medio mt-4">Cargando detalle...</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Información General */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gris-medio mb-2">Cliente</h3>
                      <p className="font-semibold">{ventaSeleccionada.cliente?.nombre}</p>
                      <p className="text-sm text-gris-medio">{ventaSeleccionada.cliente?.email}</p>
                      <p className="text-sm text-gris-medio">{ventaSeleccionada.cliente?.telefono}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gris-medio mb-2">Estado</h3>
                      {getEstadoIcon(ventaSeleccionada.estado_pedido)}
                    </div>
                  </div>

                  {/* Detalles del Pedido */}
                  <div>
                    <h3 className="text-sm font-semibold text-gris-medio mb-3">Detalles del Pedido</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gris-medio">Fecha Pedido:</span>
                          <p className="font-semibold">
                            {new Date(ventaSeleccionada.fecha_pedido || ventaSeleccionada.created_at).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gris-medio">Fecha Entrega:</span>
                          <p className="font-semibold">
                            {ventaSeleccionada.fecha_entrega ? new Date(ventaSeleccionada.fecha_entrega).toLocaleDateString('es-PE') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Productos */}
                  {ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gris-medio mb-3">Productos</h3>
                      <div className="border border-gris-claro rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-fondo-claro">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Producto</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Cantidad</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold">Precio Unit.</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gris-claro">
                            {ventaSeleccionada.detalles.map((detalle, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3">
                                  <p className="font-semibold">{detalle.producto?.nombre || 'Producto'}</p>
                                  <p className="text-sm text-gris-medio">{detalle.producto?.categoria}</p>
                                </td>
                                <td className="px-4 py-3 text-center">{detalle.cantidad}</td>
                                <td className="px-4 py-3 text-right">S/ {parseFloat(detalle.precio_unitario || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-semibold">
                                  S/ {(detalle.cantidad * parseFloat(detalle.precio_unitario || 0)).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Totales */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gris-medio">Subtotal:</span>
                      <span className="font-semibold">S/ {parseFloat(ventaSeleccionada.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gris-medio">IGV (18%):</span>
                      <span className="font-semibold">S/ {parseFloat(ventaSeleccionada.total_impuesto || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-verde-principal">S/ {parseFloat(ventaSeleccionada.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
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
                ¿Estás seguro de eliminar la venta del cliente <strong>{deleteConfirm.nombre}</strong>? Esta acción no se puede deshacer.
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
      </div>
    </AdminLayout>
  )
}

export default AdminVentasLista

