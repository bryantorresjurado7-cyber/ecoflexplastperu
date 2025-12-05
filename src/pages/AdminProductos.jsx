import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Download
} from 'lucide-react'
import { exportToExcel } from '../utils/exportToExcel'
import AdminProductosInsumosModal from '../components/AdminProductosInsumosModal'

const AdminProductos = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('all')
  const [filterStock, setFilterStock] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editingPrice, setEditingPrice] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [isInsumosModalOpen, setIsInsumosModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    loadProductos()
    loadCategorias()
  }, [])

  const loadProductos = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('productos_db')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      setProductos(data || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_productos')
        .select('*')
        .order('orden', { ascending: true })

      if (error) throw error

      setCategorias(data || [])
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }

  const handleUpdatePrice = async (id, campo, valor) => {
    try {
      const updates = {}
      updates[campo] = parseFloat(valor) || 0

      const { error } = await supabase
        .from('productos_db')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Actualizar localmente
      setProductos(productos.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ))

      setEditingPrice(null)
      alert('Precio actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando precio:', error)
      alert('Error al actualizar precio')
    }
  }

  const handleUpdateStock = async (id, nuevoStock) => {
    try {
      const { error } = await supabase
        .from('productos_db')
        .update({ stock_disponible: parseInt(nuevoStock) || 0 })
        .eq('id', id)

      if (error) throw error

      // Actualizar localmente
      setProductos(productos.map(p =>
        p.id === id ? { ...p, stock_disponible: parseInt(nuevoStock) || 0 } : p
      ))

      alert('Stock actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando stock:', error)
      alert('Error al actualizar stock')
    }
  }

  const handleToggleActivo = async (id, activo) => {
    try {
      const { error } = await supabase
        .from('productos_db')
        .update({ activo: !activo })
        .eq('id', id)

      if (error) throw error

      // Actualizar localmente
      setProductos(productos.map(p =>
        p.id === id ? { ...p, activo: !activo } : p
      ))
    } catch (error) {
      console.error('Error actualizando estado:', error)
      alert('Error al actualizar estado')
    }
  }

  const handleDeleteProducto = (id) => {
    const producto = productos.find(p => p.id === id)
    setDeleteConfirm({ id, nombre: producto?.nombre || 'este producto' })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const { error } = await supabase
        .from('productos_db')
        .delete()
        .eq('id', deleteConfirm.id)

      if (error) throw error

      setProductos(productos.filter(p => p.id !== deleteConfirm.id))
      alert('Producto eliminado correctamente')
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error eliminando producto:', error)
      alert('Error al eliminar producto')
      setDeleteConfirm(null)
    }
  }

  // Filtrar productos
  const filteredProductos = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = filterCategoria === 'all' || p.categoria === filterCategoria
    const matchStock = filterStock === 'all' ||
      (filterStock === 'bajo' && p.stock_alerta) ||
      (filterStock === 'sin-stock' && p.stock_disponible === 0) ||
      (filterStock === 'disponible' && p.stock_disponible > p.stock_minimo)

    const matchDate = (!startDate || new Date(p.created_at) >= new Date(startDate)) &&
      (!endDate || new Date(p.created_at) <= new Date(endDate))

    return matchSearch && matchCategoria && matchStock && matchDate
  })

  // Paginación
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex)

  // Reset a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategoria, filterStock, startDate, endDate])

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            <p className="mt-4 text-gris-medio">Cargando productos...</p>
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
                Gestión de Productos
              </h1>
              <p className="text-gris-medio mt-1">
                {productos.length} productos en total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const columns = [
                    { key: 'codigo', label: 'Código' },
                    { key: 'nombre', label: 'Nombre' },
                    { key: 'categoria', label: 'Categoría' },
                    { key: 'precio_unitario', label: 'Precio Unitario' },
                    { key: 'precio_mayorista', label: 'Precio Mayorista' },
                    { key: 'stock_disponible', label: 'Stock Disponible' },
                    { key: 'stock_minimo', label: 'Stock Mínimo' },
                    { key: 'activo', label: 'Activo' },
                    { key: 'created_at', label: 'Fecha Creación' }
                  ]
                  exportToExcel(filteredProductos, columns, 'productos')
                }}
                className="bg-negro-principal hover:bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Download size={20} />
                Exportar Excel
              </button>
              <Link
                to="/admin/productos/nuevo"
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Plus size={20} />
                Nuevo Producto
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-4">
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
              <div className="md:col-span-2">
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
                    <option key={cat.slug} value={cat.slug}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Stock
                </label>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Todos</option>
                  <option value="disponible">Disponible</option>
                  <option value="bajo">Stock Bajo</option>
                  <option value="sin-stock">Sin Stock</option>
                </select>
              </div>

              {/* Fecha Inicio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Fecha Fin */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-negro-principal mb-2">
                  Hasta
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('')
                        setEndDate('')
                      }}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Limpiar fechas"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-fondo-gris">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Precio Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Precio May.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gris-oscuro uppercase tracking-wider">
                    Stock
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
                {filteredProductos.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gris-medio">
                      <Package className="mx-auto mb-3 text-gris-claro" size={48} />
                      <p>No se encontraron productos</p>
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setFilterCategoria('all')
                            setFilterStock('all')
                            setStartDate('')
                            setEndDate('')
                          }}
                          className="mt-2 text-verde-principal hover:text-verde-hover text-sm"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedProductos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-fondo-claro transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-negro-principal">
                              {producto.nombre}
                            </div>
                            <div className="text-sm text-gris-medio">
                              Código: {producto.codigo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-verde-light text-verde-principal">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingPrice === `${producto.id}-unitario` ? (
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={producto.precio_unitario}
                            onBlur={(e) => handleUpdatePrice(producto.id, 'precio_unitario', e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdatePrice(producto.id, 'precio_unitario', e.target.value)
                              }
                            }}
                            className="input-field w-24 text-sm"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingPrice(`${producto.id}-unitario`)}
                            className="text-sm text-negro-principal hover:text-verde-principal flex items-center gap-1"
                          >
                            <DollarSign size={14} />
                            {producto.precio_unitario?.toFixed(2) || '0.00'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingPrice === `${producto.id}-mayorista` ? (
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={producto.precio_mayorista}
                            onBlur={(e) => handleUpdatePrice(producto.id, 'precio_mayorista', e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdatePrice(producto.id, 'precio_mayorista', e.target.value)
                              }
                            }}
                            className="input-field w-24 text-sm"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingPrice(`${producto.id}-mayorista`)}
                            className="text-sm text-negro-principal hover:text-verde-principal flex items-center gap-1"
                          >
                            <DollarSign size={14} />
                            {producto.precio_mayorista?.toFixed(2) || '0.00'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={producto.stock_disponible}
                            onBlur={(e) => handleUpdateStock(producto.id, e.target.value)}
                            className={`input-field w-20 text-sm ${producto.stock_alerta ? 'border-yellow-500' : ''
                              }`}
                          />
                          {producto.stock_alerta && (
                            <AlertCircle size={16} className="text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActivo(producto.id, producto.activo)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${producto.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProducto(producto)
                              setIsInsumosModalOpen(true)
                            }}
                            className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Gestionar Insumos"
                          >
                            <FlaskConical size={18} />
                          </button>
                          <Link
                            to={`/admin/productos/editar/${producto.id}`}
                            className="text-azul hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProducto(producto.id)}
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
          {filteredProductos.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gris-medio">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredProductos.length)}</span> de{' '}
                  <span className="font-medium">{filteredProductos.length}</span> productos
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

        {/* Modal de Insumos */}
        <AdminProductosInsumosModal
          producto={selectedProducto}
          isOpen={isInsumosModalOpen}
          onClose={() => {
            setIsInsumosModalOpen(false)
            setSelectedProducto(null)
          }}
        />

        {/* Modal de Confirmación de Eliminación */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-negro-principal mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-gris-medio mb-6">
                ¿Estás seguro de eliminar el producto <strong>{deleteConfirm.nombre}</strong>? Esta acción no se puede deshacer.
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

export default AdminProductos
