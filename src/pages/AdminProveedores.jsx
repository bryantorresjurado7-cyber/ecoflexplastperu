import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import NotificationToast from '../components/NotificationToast'
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'
import { exportToCsv } from '../lib/exportToCsv'

const AdminProveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    loadProveedores()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterEstado])

  const loadProveedores = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('proveedor')
        .select('*')
        .order('nombre', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      setProveedores(data || [])
    } catch (error) {
      console.error('Error cargando proveedores:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar proveedores',
        message: 'No se pudieron cargar los proveedores. Por favor, recargue la página.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEstado = async (id, estado) => {
    try {
      const { error } = await supabase
        .from('proveedor')
        .update({ estado: !estado })
        .eq('id_proveedor', id)

      if (error) throw error

      setProveedores(proveedores.map(p =>
        p.id_proveedor === id ? { ...p, estado: !estado } : p
      ))

      setNotification({
        open: true,
        type: 'success',
        title: 'Estado actualizado',
        message: `El proveedor ha sido ${!estado ? 'activado' : 'desactivado'} correctamente.`
      })
    } catch (error) {
      console.error('Error actualizando estado:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al actualizar estado',
        message: 'No se pudo actualizar el estado del proveedor. Por favor, intente nuevamente.'
      })
    }
  }

  const handleDeleteProveedor = (id) => {
    const proveedor = proveedores.find(p => p.id_proveedor === id)
    setDeleteConfirm({ id, nombre: proveedor?.nombre || 'este proveedor' })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const { error } = await supabase
        .from('proveedor')
        .delete()
        .eq('id_proveedor', deleteConfirm.id)

      if (error) throw error

      setProveedores(proveedores.filter(p => p.id_proveedor !== deleteConfirm.id))

      setNotification({
        open: true,
        type: 'success',
        title: '¡Proveedor eliminado exitosamente!',
        message: 'El proveedor ha sido eliminado correctamente.'
      })

      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error eliminando proveedor:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al eliminar proveedor',
        message: 'No se pudo eliminar el proveedor. Verifica que no esté siendo usado en insumos u otras tablas.'
      })
      setDeleteConfirm(null)
    }
  }

  // Filtrar proveedores
  const filteredProveedores = proveedores.filter(p => {
    const matchSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefono?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filterEstado === 'all' ||
      (filterEstado === 'activo' && p.estado) ||
      (filterEstado === 'inactivo' && !p.estado)

    return matchSearch && matchEstado
  })

  // Exportar a CSV
  const handleExport = () => {
    const columns = [
      'Nombre',
      'Email',
      'Teléfono',
      'Tipo Documento',
      'Número Documento',
      'Dirección',
      'Estado'
    ]

    const rows = filteredProveedores.map(p => [
      p.nombre || '',
      p.email || '',
      p.telefono || '',
      p.tipo_documento || '',
      p.numero_documento || '',
      p.direccion || '',
      p.estado ? 'Activo' : 'Inactivo'
    ])

    exportToCsv('proveedores', columns, rows)
  }

  // Paginación
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProveedores = filteredProveedores.slice(startIndex, endIndex)

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando proveedores...</p>
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
                <Truck className="text-verde-principal" size={32} />
                Gestión de Proveedores
              </h1>
              <p className="text-gris-medio mt-1">
                {proveedores.length} proveedores en total
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Link
                to="/admin/proveedores/nuevo"
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Plus size={20} />
                Nuevo Proveedor
              </Link>
              <button
                onClick={handleExport}
                className="bg-white border border-verde-principal text-verde-principal hover:bg-verde-light px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Exportar
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
                    placeholder="Buscar por nombre, email, teléfono o documento..."
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
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Proveedores Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-fondo-gris">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Dirección
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
                {filteredProveedores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gris-medio">
                      <Truck className="mx-auto mb-3 text-gris-claro" size={48} />
                      <p>No se encontraron proveedores</p>
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
                  paginatedProveedores.map((proveedor) => (
                    <tr key={proveedor.id_proveedor} className="hover:bg-fondo-claro transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-negro-principal">
                              {proveedor.nombre}
                            </div>
                            {proveedor.descripcion && (
                              <div className="text-sm text-gris-medio mt-1">
                                {proveedor.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gris-medio">{proveedor.tipo_documento}</div>
                          <div className="font-medium text-negro-principal">{proveedor.numero_documento}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {proveedor.email && (
                            <div className="flex items-center gap-2 text-sm text-gris-medio">
                              <Mail size={14} />
                              {proveedor.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gris-medio">
                            <Phone size={14} />
                            {proveedor.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 text-sm text-gris-medio">
                          <MapPin size={14} className="mt-1 flex-shrink-0" />
                          <span>{proveedor.direccion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleEstado(proveedor.id_proveedor, proveedor.estado)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${proveedor.estado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {proveedor.estado ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/proveedores/editar/${proveedor.id_proveedor}`}
                            className="text-azul hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProveedor(proveedor.id_proveedor)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredProveedores.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gris-medio">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredProveedores.length)}</span> de{' '}
                  <span className="font-medium">{filteredProveedores.length}</span> proveedores
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

        {/* Modal de Confirmación de Eliminación */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-negro-principal mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-gris-medio mb-6">
                ¿Estás seguro de eliminar el proveedor <strong>{deleteConfirm.nombre}</strong>? Esta acción no se puede deshacer.
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

export default AdminProveedores


