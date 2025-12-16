import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import usuariosService from '../services/usuariosService'
import NotificationToast from '../components/NotificationToast'
import { exportToXlsx } from '../lib/exportToXlsx'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  UserCheck,
  UserX,
  Shield,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRol, setFilterRol] = useState('all')
  const [filterActivo, setFilterActivo] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [exporting, setExporting] = useState(false)

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const location = useLocation()

  useEffect(() => {
    loadUsuarios()
  }, [location.key])

  useEffect(() => {
    setCurrentPage(1)
    loadUsuarios()
  }, [searchTerm, filterRol, filterActivo])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const result = await usuariosService.loadUsuarios({
        search: searchTerm,
        rol: filterRol,
        activo: filterActivo === 'all' ? undefined : filterActivo === 'activo'
      })

      if (result.error) throw new Error(result.error)

      setUsuarios(result.data || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al cargar usuarios',
        message: 'No se pudieron cargar los usuarios. Por favor, recargue la página.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActivo = async (id, activo) => {
    try {
      const result = await usuariosService.toggleActivo(id, activo)

      if (result.error) throw new Error(result.error)

      setUsuarios(usuarios.map(u =>
        u.id === id ? { ...u, activo: !activo } : u
      ))

      setNotification({
        open: true,
        type: 'success',
        title: 'Estado actualizado',
        message: `El usuario ha sido ${!activo ? 'activado' : 'desactivado'} correctamente.`
      })
    } catch (error) {
      console.error('Error actualizando estado:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al actualizar estado',
        message: 'No se pudo actualizar el estado del usuario. Por favor, intente nuevamente.'
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      const result = await usuariosService.deleteUsuario(deleteConfirm.id)

      if (result.error) throw new Error(result.error)

      setUsuarios(usuarios.filter(u => u.id !== deleteConfirm.id))
      setDeleteConfirm(null)

      setNotification({
        open: true,
        type: 'success',
        title: 'Usuario eliminado',
        message: 'El usuario ha sido eliminado correctamente.'
      })
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      setNotification({
        open: true,
        type: 'error',
        title: 'Error al eliminar usuario',
        message: error.message || 'No se pudo eliminar el usuario. Por favor, intente nuevamente.'
      })
    }
  }

  const getRolColor = (rol) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-blue-100 text-blue-800',
      'operario': 'bg-green-100 text-green-800',
      'supervisor': 'bg-orange-100 text-orange-800',
      'control_calidad': 'bg-yellow-100 text-yellow-800'
    }
    return colors[rol] || 'bg-gray-100 text-gray-800'
  }

  const getRolLabel = (rol) => {
    const labels = {
      'super_admin': 'Super Admin',
      'admin': 'Administrador',
      'operario': 'Operario',
      'supervisor': 'Supervisor',
      'control_calidad': 'Control de Calidad'
    }
    return labels[rol] || rol
  }

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRol = filterRol === 'all' || u.rol === filterRol
    const matchActivo = filterActivo === 'all' ||
      (filterActivo === 'activo' && u.activo) ||
      (filterActivo === 'inactivo' && !u.activo)

    return matchSearch && matchRol && matchActivo
  })

  // Exportar a Excel
  const handleExport = () => {
    try {
      setExporting(true)
      const rows = filteredUsuarios.map(u => [
        u.nombre || '',
        u.apellido || '',
        u.email || '',
        getRolLabel(u.rol),
        u.activo ? 'Activo' : 'Inactivo',
        u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleDateString('es-PE', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Nunca'
      ])

      const columns = [
        'Nombre',
        'Apellido',
        'Email',
        'Rol',
        'Estado',
        'Último Acceso'
      ]

      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `usuarios_${dateStr}`

      exportToXlsx(filename, rows, columns)
    } catch (error) {
      console.error('Error exportando:', error)
    } finally {
      setExporting(false)
    }
  }

  // Paginación
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsuarios = filteredUsuarios.slice(startIndex, endIndex)

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando usuarios...</p>
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
                <Users className="text-verde-principal" size={32} />
                Gestión de Usuarios
              </h1>
              <p className="text-gris-medio mt-1">
                {usuarios.length} usuarios en total
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Link
                to="/admin/usuarios/nuevo"
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Plus size={20} />
                Nuevo Usuario
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
                    placeholder="Buscar por nombre, apellido o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Rol
                </label>
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Todos los roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Administrador</option>
                  <option value="operario">Operario</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="control_calidad">Control de Calidad</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Estado
                </label>
                <select
                  value={filterActivo}
                  onChange={(e) => setFilterActivo(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Usuarios Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-fondo-gris">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gris-medio">
                      <Users className="mx-auto mb-3 text-gris-claro" size={48} />
                      <p>No se encontraron usuarios</p>
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setFilterRol('all')
                            setFilterActivo('all')
                          }}
                          className="mt-2 text-verde-principal hover:text-verde-hover text-sm"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-fondo-claro transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-verde-principal/10 flex items-center justify-center">
                            <Users className="text-verde-principal" size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-negro-principal">
                              {usuario.nombre} {usuario.apellido || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gris-medio" />
                          <span className="text-sm text-negro-principal">{usuario.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolColor(usuario.rol)}`}>
                          <Shield size={12} className="mr-1" />
                          {getRolLabel(usuario.rol)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActivo(usuario.id, usuario.activo)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${usuario.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {usuario.activo ? (
                            <>
                              <UserCheck size={14} />
                              Activo
                            </>
                          ) : (
                            <>
                              <UserX size={14} />
                              Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gris-medio">
                        {usuario.ultimo_acceso
                          ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Nunca'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/usuarios/editar/${usuario.id}`}
                            className="text-azul hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm({ id: usuario.id, nombre: `${usuario.nombre} ${usuario.apellido || ''}`.trim() })}
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
          {filteredUsuarios.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gris-medio">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsuarios.length)} de {filteredUsuarios.length} usuarios
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gris-muy-claro rounded-lg hover:bg-gris-muy-claro disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gris-medio">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gris-muy-claro rounded-lg hover:bg-gris-muy-claro disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-negro-principal mb-2">
              Confirmar Eliminación
            </h3>
            <p className="text-gris-medio mb-6">
              ¿Estás seguro de eliminar el usuario <strong>{deleteConfirm.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gris-medio text-gris-medio rounded-lg hover:bg-gris-muy-claro transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification.open && (
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification({ ...notification, open: false })}
        />
      )}
    </AdminLayout>
  )
}

export default AdminUsuarios

