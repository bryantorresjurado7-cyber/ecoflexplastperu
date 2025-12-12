import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import NotificationToast from '../components/NotificationToast'
import { exportToCsv } from '../lib/exportToCsv'
import {
  FlaskConical,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminInsumos = () => {
  const [insumos, setInsumos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('all')
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
    loadInsumos()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategoria, filterEstado])

  const loadInsumos = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || SUPABASE_ANON_KEY

      let query = supabase
        .from('insumos')
        .select('*')
        .order('nombre', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      setInsumos(data || [])
    } catch (error) {
      console.error('Error cargando insumos:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar insumos',
        message: 'No se pudieron cargar los insumos. Por favor, recargue la página.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActivo = async (id, activo) => {
    try {
      const { error } = await supabase
        .from('insumos')
        .update({ activo: !activo })
        .eq('id_insumo', id)

      if (error) throw error

      setInsumos(insumos.map(i =>
        i.id_insumo === id ? { ...i, activo: !activo } : i
      ))

      setNotification({
        open: true,
        type: 'success',
        title: 'Estado actualizado',
        message: `El insumo ha sido ${!activo ? 'activado' : 'desactivado'} correctamente.`
      })
    } catch (error) {
      console.error('Error actualizando estado:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al actualizar estado',
        message: 'No se pudo actualizar el estado del insumo. Por favor, intente nuevamente.'
      })
    }
  }

  const handleDeleteInsumo = (id) => {
    const insumo = insumos.find(i => i.id_insumo === id)
    setDeleteConfirm({ id, nombre: insumo?.nombre || 'este insumo' })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const { error } = await supabase
        .from('insumos')
        .delete()
        .eq('id_insumo', deleteConfirm.id)

      if (error) throw error

      setInsumos(insumos.filter(i => i.id_insumo !== deleteConfirm.id))

      setNotification({
        open: true,
        type: 'success',
        title: '¡Insumo eliminado exitosamente!',
        message: 'El insumo ha sido eliminado correctamente.'
      })

      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error eliminando insumo:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al eliminar insumo',
        message: 'No se pudo eliminar el insumo. Verifica que no esté siendo usado en ninguna receta.'
      })
      setDeleteConfirm(null)
    }
  }

  const handleUpdateStock = async (id, nuevoStock) => {
    try {
      const { error } = await supabase
        .from('insumos')
        .update({ stock_disponible: parseFloat(nuevoStock) || 0 })
        .eq('id_insumo', id)

      if (error) throw error

      setInsumos(insumos.map(i =>
        i.id_insumo === id ? { ...i, stock_disponible: parseFloat(nuevoStock) || 0 } : i
      ))

      setNotification({
        open: true,
        type: 'success',
        title: 'Stock actualizado',
        message: `El stock del insumo ha sido actualizado a ${parseFloat(nuevoStock) || 0}.`
      })
    } catch (error) {
      console.error('Error actualizando stock:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al actualizar stock',
        message: 'No se pudo actualizar el stock del insumo. Por favor, intente nuevamente.'
      })
    }
  }

  // Filtrar insumos
  const filteredInsumos = insumos.filter(i => {
    const matchSearch = i.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.codigo_insumo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = filterCategoria === 'all' || i.categoria === filterCategoria
    const matchEstado = filterEstado === 'all' ||
      (filterEstado === 'activo' && i.activo) ||
      (filterEstado === 'inactivo' && !i.activo) ||
      (filterEstado === 'stock-bajo' && i.stock_alerta)

    return matchSearch && matchCategoria && matchEstado
  })

  // Exportar a CSV
  const handleExport = () => {
    const columns = [
      'Insumo',
      'Código',
      'Categoría',
      'Unidad',
      'Stock',
      'Stock Mínimo',
      'Costo Unit.',
      'Estado'
    ]

    const rows = filteredInsumos.map(i => [
      i.nombre || '',
      i.codigo_insumo || '',
      i.categoria || '',
      i.unidad_medida || '',
      i.stock_disponible || 0,
      i.stock_minimo || 0,
      Number(i.costo_unitario || 0).toFixed(2),
      i.activo ? 'Activo' : 'Inactivo'
    ])

    exportToCsv('insumos', columns, rows)
  }

  // Paginación
  const totalPages = Math.ceil(filteredInsumos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInsumos = filteredInsumos.slice(startIndex, endIndex)

  // Obtener categorías únicas
  const categorias = [...new Set(insumos.map(i => i.categoria).filter(Boolean))]

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando insumos...</p>
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
              <h1 className="text-3xl font-bold text-negro-principal">
                Gestión de Insumos
              </h1>
              <p className="text-gris-medio mt-1">
                {insumos.length} insumos en total
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Link
                to="/admin/insumos/nuevo"
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Plus size={20} />
                Nuevo Insumo
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Categoría
                </label>
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
                  <option value="stock-bajo">Stock Bajo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Insumos Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-fondo-gris">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Insumo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Stock Mín.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Costo Unit.
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
                {filteredInsumos.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gris-medio">
                      <FlaskConical className="mx-auto mb-3 text-gris-claro" size={48} />
                      <p>No se encontraron insumos</p>
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setFilterCategoria('all')
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
                  paginatedInsumos.map((insumo) => (
                    <tr key={insumo.id_insumo} className="hover:bg-fondo-claro transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-negro-principal">
                              {insumo.nombre}
                            </div>
                            <div className="text-sm text-gris-medio">
                              Código: {insumo.codigo_insumo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-azul-light text-azul">
                          {insumo.categoria || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gris-medio">
                        {insumo.unidad_medida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.001"
                            defaultValue={insumo.stock_disponible}
                            onBlur={(e) => handleUpdateStock(insumo.id_insumo, e.target.value)}
                            className={`input-field w-24 text-sm ${insumo.stock_alerta ? 'border-yellow-500' : ''
                              }`}
                          />
                          {insumo.stock_alerta && (
                            <AlertCircle size={16} className="text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gris-medio">
                        {insumo.stock_minimo || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-negro-principal">
                        S/ {(insumo.costo_unitario || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActivo(insumo.id_insumo, insumo.activo)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${insumo.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {insumo.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/insumos/editar/${insumo.id_insumo}`}
                            className="text-azul hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteInsumo(insumo.id_insumo)}
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
          {filteredInsumos.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gris-medio">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredInsumos.length)}</span> de{' '}
                  <span className="font-medium">{filteredInsumos.length}</span> insumos
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
                ¿Estás seguro de eliminar el insumo <strong>{deleteConfirm.nombre}</strong>? Esta acción no se puede deshacer.
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

export default AdminInsumos


