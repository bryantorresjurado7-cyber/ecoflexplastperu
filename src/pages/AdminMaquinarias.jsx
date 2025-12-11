import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import NotificationToast from '../components/NotificationToast'
import { exportToCsv } from '../lib/exportToCsv'
import {
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Download
} from 'lucide-react'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminMaquinarias = () => {
  const [maquinarias, setMaquinarias] = useState([])
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
    loadMaquinarias()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterEstado])

  const loadMaquinarias = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY

      const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-maquinarias`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setMaquinarias(result.data || [])
    } catch (error) {
      console.error('Error cargando maquinarias:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar maquinarias',
        message: 'No se pudieron cargar las maquinarias. Por favor, recargue la página.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY

      // Determinar nuevo estado
      const estados = ['activa', 'inactiva', 'mantenimiento', 'reparacion']
      const indiceActual = estados.indexOf(estadoActual)
      const nuevoEstado = estados[(indiceActual + 1) % estados.length]

      const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-maquinarias?id=${id}`, {
        method: 'PUT',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setMaquinarias(maquinarias.map(m =>
        m.id_maquinaria === id ? { ...m, estado: nuevoEstado } : m
      ))

      setNotification({
        open: true,
        type: 'success',
        title: 'Estado actualizado',
        message: `La maquinaria ha sido actualizada a estado "${nuevoEstado}".`
      })
    } catch (error) {
      console.error('Error actualizando estado:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al actualizar estado',
        message: 'No se pudo actualizar el estado de la maquinaria. Por favor, intente nuevamente.'
      })
    }
  }

  const handleDeleteMaquinaria = (id) => {
    const maquinaria = maquinarias.find(m => m.id_maquinaria === id)
    setDeleteConfirm({ id, nombre: maquinaria?.nombre || 'esta maquinaria' })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY

      const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-maquinarias?id=${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setMaquinarias(maquinarias.filter(m => m.id_maquinaria !== deleteConfirm.id))

      setNotification({
        open: true,
        type: 'success',
        title: '¡Maquinaria eliminada exitosamente!',
        message: 'La maquinaria ha sido eliminada correctamente.'
      })

      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error eliminando maquinaria:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al eliminar maquinaria',
        message: error.message || 'No se pudo eliminar la maquinaria. Verifica que no esté siendo usada en órdenes de producción.'
      })
      setDeleteConfirm(null)
    }
  }

  // Filtrar maquinarias
  const filteredMaquinarias = maquinarias.filter(m => {
    const matchSearch = m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codigo_maquinaria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filterEstado === 'all' || m.estado === filterEstado

    return matchSearch && matchEstado
  })

  // Exportar a CSV
  const handleExport = () => {
    const columns = [
      'Nombre',
      'Código',
      'Marca',
      'Modelo',
      'Serie',
      'Ubicación',
      'Estado'
    ]

    const rows = filteredMaquinarias.map(m => [
      m.nombre || '',
      m.codigo_maquinaria || '',
      m.marca || '',
      m.modelo || '',
      m.numero_serie || '',
      m.ubicacion || '',
      getEstadoLabel(m.estado)
    ])

    exportToCsv('maquinarias', columns, rows)
  }

  // Paginación
  const totalPages = Math.ceil(filteredMaquinarias.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMaquinarias = filteredMaquinarias.slice(startIndex, endIndex)

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-800'
      case 'inactiva':
        return 'bg-gray-100 text-gray-800'
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800'
      case 'reparacion':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      'activa': 'Activa',
      'inactiva': 'Inactiva',
      'mantenimiento': 'Mantenimiento',
      'reparacion': 'Reparación'
    }
    return labels[estado] || estado
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando maquinarias...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                <Settings className="text-verde-principal" size={32} />
                Gestión de Maquinarias
              </h1>
              <p className="text-gris-medio mt-1">
                {maquinarias.length} maquinarias en total
              </p>
            </div>
            <Link
              to="/admin/maquinarias/nuevo"
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Nueva Maquinaria
            </Link>
            <button
              onClick={handleExport}
              className="bg-white border border-verde-principal text-verde-principal hover:bg-verde-light px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Exportar
            </button>
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
                    placeholder="Buscar por nombre, código, marca o modelo..."
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
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="reparacion">Reparación</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Maquinarias Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-fondo-gris">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Maquinaria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Especificaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Ubicación
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
                {filteredMaquinarias.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gris-medio">
                      <Settings className="mx-auto mb-3 text-gris-claro" size={48} />
                      <p>No se encontraron maquinarias</p>
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
                  paginatedMaquinarias.map((maquinaria) => (
                    <tr key={maquinaria.id_maquinaria} className="hover:bg-fondo-claro transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-negro-principal">
                              {maquinaria.nombre}
                            </div>
                            {maquinaria.descripcion && (
                              <div className="text-sm text-gris-medio mt-1">
                                {maquinaria.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-negro-principal">
                          {maquinaria.codigo_maquinaria}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {maquinaria.marca && (
                            <div className="text-sm text-gris-medio">
                              <span className="font-medium">Marca:</span> {maquinaria.marca}
                            </div>
                          )}
                          {maquinaria.modelo && (
                            <div className="text-sm text-gris-medio">
                              <span className="font-medium">Modelo:</span> {maquinaria.modelo}
                            </div>
                          )}
                          {maquinaria.numero_serie && (
                            <div className="text-sm text-gris-medio">
                              <span className="font-medium">Serie:</span> {maquinaria.numero_serie}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {maquinaria.ubicacion ? (
                          <div className="flex items-start gap-2 text-sm text-gris-medio">
                            <MapPin size={14} className="mt-1 flex-shrink-0" />
                            <span>{maquinaria.ubicacion}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gris-claro">Sin ubicación</span>
                        )}
                        {maquinaria.proximo_mantenimiento && (
                          <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                            <AlertCircle size={12} />
                            <span>Mant. próximo: {new Date(maquinaria.proximo_mantenimiento).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleEstado(maquinaria.id_maquinaria, maquinaria.estado)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeClass(maquinaria.estado)}`}
                        >
                          {getEstadoLabel(maquinaria.estado)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/maquinarias/editar/${maquinaria.id_maquinaria}`}
                            className="text-azul hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteMaquinaria(maquinaria.id_maquinaria)}
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
          {filteredMaquinarias.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gris-medio">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredMaquinarias.length)}</span> de{' '}
                  <span className="font-medium">{filteredMaquinarias.length}</span> maquinarias
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
                ¿Estás seguro de eliminar la maquinaria <strong>{deleteConfirm.nombre}</strong>? Esta acción no se puede deshacer.
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

export default AdminMaquinarias

