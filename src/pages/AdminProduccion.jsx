import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import produccionService from '../services/produccionService'
import { exportToXlsx } from '../lib/exportToXlsx'
import {
  Factory,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Calendar,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  ClipboardCheck,
  Download,
  Printer
} from 'lucide-react'
import OrdenProduccionPrint from '../components/OrdenProduccionPrint'

const AdminProduccion = () => {
  const [producciones, setProducciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('all')
  const [productos, setProductos] = useState([])
  const [exporting, setExporting] = useState(false)
  const [selectedProduccion, setSelectedProduccion] = useState(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    loadProducciones()
    loadProductos()
  }, [])

  const loadProducciones = async () => {
    try {
      setLoading(true)
      const result = await produccionService.loadProducciones({
        search: searchTerm,
        estado: filterEstado
      })

      if (result.error) throw new Error(result.error)

      setProducciones(result.data || [])
    } catch (error) {
      console.error('Error cargando producciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos_db')
        .select('id, nombre, codigo')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }

  useEffect(() => {
    loadProducciones()
  }, [searchTerm, filterEstado])

  const handleDeleteProduccion = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta orden de producción?')) return

    try {
      const result = await produccionService.deleteProduccion(id)

      if (result.error) throw new Error(result.error)

      setProducciones(producciones.filter(p => p.id_produccion !== id))
      alert('Orden de producción eliminada correctamente')
    } catch (error) {
      console.error('Error eliminando producción:', error)
      alert('Error al eliminar orden de producción')
    }
  }

  const handleToggleEstado = async (id, nuevoEstado) => {
    try {
      const result = await produccionService.updateProduccion(id, { estado: nuevoEstado })

      if (result.error) throw new Error(result.error)

      setProducciones(producciones.map(p =>
        p.id_produccion === id ? { ...p, estado: nuevoEstado } : p
      ))
    } catch (error) {
      console.error('Error actualizando estado:', error)
      alert('Error al actualizar estado')
    }
  }

  const getEstadoColor = (estado) => {
    const colors = {
      planificada: 'bg-gray-100 text-gray-800',
      en_proceso: 'bg-blue-100 text-blue-800',
      pendiente_validacion: 'bg-orange-100 text-orange-800',
      validada: 'bg-green-100 text-green-800',
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      pausada: 'bg-gray-100 text-gray-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filtrar producciones
  const filteredProducciones = producciones.filter(p => {
    const matchSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_produccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filterEstado === 'all' || p.estado === filterEstado

    return matchSearch && matchEstado
  })

  // Exportar a Excel
  const handleExport = () => {
    try {
      setExporting(true)
      const rows = filteredProducciones.map(p => {
        const producto = Array.isArray(p.producto) ? p.producto[0] : p.producto
        return [
          p.codigo_produccion || '',
          p.nombre || '',
          producto?.nombre || '',
          p.cantidad_planificada || 0,
          p.cantidad_producida || 0,
          Number(p.costo_total || 0).toFixed(2),
          p.fecha_produccion ? new Date(p.fecha_produccion).toLocaleDateString('es-PE') : '',
          p.estado || ''
        ]
      })

      const columns = [
        'Código',
        'Nombre Orden',
        'Producto',
        'Planificada',
        'Producida',
        'Costo Total',
        'Fecha',
        'Estado'
      ]

      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `produccion_${dateStr}`

      exportToXlsx(filename, rows, columns)
    } catch (error) {
      console.error('Error exportando:', error)
    } finally {
      setExporting(false)
    }
  }

  // Paginación
  const totalPages = Math.ceil(filteredProducciones.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducciones = filteredProducciones.slice(startIndex, endIndex)

  // Reset a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterEstado])

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando órdenes de producción...</p>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                <Factory className="text-verde-principal" size={32} />
                Gestión de Producción
              </h1>
              <p className="text-gris-medio mt-1">
                {producciones.length} órdenes de producción en total
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Link
                to="/admin/produccion/nuevo"
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Plus size={20} />
                Nueva Orden de Producción
              </Link>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="bg-white border border-verde-principal text-verde-principal hover:bg-verde-light px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                {exporting ? 'Exportando...' : 'Exportar'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por código, nombre o producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Estado
                </label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Todos</option>
                  <option value="planificada">Planificada</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="pendiente_validacion">Pendiente Validación</option>
                  <option value="validada">Validada</option>
                  <option value="completada">Completada</option>
                  <option value="pausada">Pausada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Producciones Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-fondo-gris">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Código / Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gris-medio">
                      <Factory className="mx-auto mb-3 text-gris-claro" size={48} />
                      <p>No se encontraron órdenes de producción</p>
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setFilterEstado('all')
                          }}
                          className="mt-2 text-verde-principal hover:text-verde-hover text-sm"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedProducciones.map((produccion) => {
                    const producto = Array.isArray(produccion.producto)
                      ? produccion.producto[0]
                      : produccion.producto

                    return (
                      <tr key={produccion.id_produccion} className="hover:bg-fondo-claro transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-negro-principal">
                              {produccion.codigo_produccion}
                            </div>
                            <div className="text-sm text-gris-medio">
                              {produccion.nombre}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {producto ? (
                            <div>
                              <div className="text-sm font-medium text-negro-principal">
                                {producto.nombre}
                              </div>
                              <div className="text-xs text-gris-medio">
                                {producto.codigo}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gris-medio">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-gris-medio" />
                            <div>
                              <div className="text-sm font-medium">
                                {produccion.cantidad_producida || 0} / {produccion.cantidad_planificada || 0}
                              </div>
                              <div className="text-xs text-gris-medio">
                                Producida / Planificada
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} className="text-gris-medio" />
                            <span className="text-sm font-medium">
                              {formatCurrency(produccion.costo_total || 0)}
                            </span>
                          </div>
                          {produccion.costo_unitario > 0 && (
                            <div className="text-xs text-gris-medio">
                              Unit: {formatCurrency(produccion.costo_unitario)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gris-medio" />
                            <span className="text-sm">
                              {formatDate(produccion.fecha_produccion)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={produccion.estado}
                            onChange={(e) => handleToggleEstado(produccion.id_produccion, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-none ${getEstadoColor(produccion.estado)}`}
                          >
                            <option value="planificada">Planificada</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="pendiente_validacion">Pendiente Validación</option>
                            <option value="validada">Validada</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="pausada">Pausada</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {(produccion.estado === 'en_proceso' || produccion.estado === 'pendiente_validacion') && (
                              <Link
                                to={`/admin/produccion/validar/${produccion.id_produccion}`}
                                className="text-verde-principal hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Validar Producción"
                              >
                                <ClipboardCheck size={18} />
                              </Link>
                            )}
                            <Link
                              to={`/admin/produccion/editar/${produccion.id_produccion}`}
                              className="text-azul hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedProduccion(null) // Reset first to force re-render if same item
                                setTimeout(() => setSelectedProduccion(produccion), 0)
                              }}
                              className="text-verde-principal hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                              title="Imprimir"
                            >
                              <Printer size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduccion(produccion.id_produccion)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredProducciones.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gris-medio">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredProducciones.length)}</span> de{' '}
                  <span className="font-medium">{filteredProducciones.length}</span> órdenes
                </p>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="input-field py-1 px-2 text-sm"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${currentPage === 1
                    ? 'text-gris-claro cursor-not-allowed'
                    : 'text-negro-principal hover:bg-fondo-claro'
                    }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                          ? 'bg-verde-principal text-white'
                          : 'text-negro-principal hover:bg-fondo-claro'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                    ? 'text-gris-claro cursor-not-allowed'
                    : 'text-negro-principal hover:bg-fondo-claro'
                    }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Componente de Impresión Directa (Oculto en pantalla) */}
        <OrdenProduccionPrint data={selectedProduccion} />
      </div>
    </AdminLayout>
  )
}

export default AdminProduccion

