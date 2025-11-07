import React, { useEffect, useState } from 'react';
import { User, Search, Plus, Mail, Phone, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clientesService } from '../services/clientesService'
import ClienteFormModal from '../components/ClienteFormModal'
import ConfirmDialog from '../components/ConfirmDialog'

const itemsPerPage = 10;

const AdminClientes = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [targetId, setTargetId] = useState(null);

  // Cargar clientes cuando cambia la página
  useEffect(() => {
    loadClientes(currentPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Recargar cuando cambia la búsqueda (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadClientes(1, search);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const loadClientes = async (page, searchTerm = '') => {
    try {
      setLoading(true);
      setError('');
      const { data, pagination } = await clientesService.list({ 
        page, 
        limit: itemsPerPage,
        q: searchTerm
      });
      setClientes(data || []);
      setTotalItems(pagination?.total || 0);
      setTotalPages(pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError(err.message || 'Error cargando clientes');
      setClientes([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const openCreate = () => {
    setEditingCliente(null);
    setFormOpen(true);
  };

  const openEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormOpen(true);
  };

  const handleSubmitForm = async (values) => {
    try {
      setFormSubmitting(true);
      const payload = {
        nombre: values.nombre?.trim(),
        email: values.email?.trim() || null,
        telefono: values.telefono?.trim() || null,
        tipo_documento: values.tipo_documento || 'DNI',
        numero_documento: values.numero_documento?.trim() || null,
        direccion: values.direccion?.trim() || null,
        descripcion: values.descripcion?.trim() || null,
        estado: typeof values.estado === 'boolean' ? values.estado : (values.estado === 'true' || values.estado === true)
      }
      
      const clienteId = editingCliente?.id_cliente || editingCliente?.id
      
      if (clienteId) {
        await clientesService.update(clienteId, payload)
      } else {
        await clientesService.create(payload)
      }
      setFormOpen(false)
      setEditingCliente(null)
      loadClientes(currentPage, search)
    } catch (err) {
      console.error('Error guardando cliente:', err)
      alert(err.message || 'Error guardando cliente')
    } finally {
      setFormSubmitting(false)
    }
  };

  const requestDelete = (cliente) => {
    const clienteId = cliente?.id_cliente || cliente?.id || cliente
    setTargetId(clienteId)
    setConfirmOpen(true)
  };

  const confirmDelete = async () => {
    if (!targetId) return
    try {
      setDeleting(true)
      await clientesService.remove(targetId)
      setConfirmOpen(false)
      setTargetId(null)
      const remainingItems = totalItems - 1
      const nextPage = (remainingItems <= startIndex && currentPage > 1) ? currentPage - 1 : currentPage
      setCurrentPage(nextPage)
      loadClientes(nextPage, search)
    } catch (err) {
      console.error('Error eliminando cliente:', err)
      alert(err.message || 'Error eliminando cliente')
    } finally {
      setDeleting(false)
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-negro-principal flex items-center gap-3">
              <User className="text-verde-principal" size={28} />
              Gestión de Clientes
            </h2>
            <p className="text-gris-medio mt-1">{totalItems} clientes en total</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={20} />
            Nuevo Cliente
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
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gris-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-fondo-claro border-b border-gris-claro">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">NOMBRE</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">EMAIL</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">TELÉFONO</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">TIPO DOC.</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">NÚM. DOC.</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">DIRECCIÓN</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">ESTADO</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gris-medio whitespace-nowrap">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gris-medio">
                          No se encontraron clientes
                        </td>
                      </tr>
                    ) : (
                      clientes.map((cliente) => (
                        <tr key={cliente.id} className="border-b border-gris-claro hover:bg-fondo-claro transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <User size={18} className="text-gris-oscuro flex-shrink-0" />
                              <span className="font-medium text-sm text-negro-principal">{cliente.nombre || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gris-oscuro">
                            {cliente.email ? (
                              <div className="flex items-center gap-1">
                                <Mail size={14} className="flex-shrink-0" />
                                <span>{cliente.email}</span>
                              </div>
                            ) : (
                              <span className="text-gris-medio">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-sm text-gris-oscuro">
                            {cliente.telefono ? (
                              <div className="flex items-center gap-1">
                                <Phone size={14} className="flex-shrink-0" />
                                <span>{cliente.telefono}</span>
                              </div>
                            ) : (
                              <span className="text-gris-medio">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-sm text-gris-oscuro">
                            {cliente.tipo_documento || 'DNI'}
                          </td>
                          <td className="py-4 px-6 text-sm text-gris-oscuro font-mono">
                            {cliente.numero_documento || <span className="text-gris-medio">N/A</span>}
                          </td>
                          <td className="py-4 px-6 text-sm text-gris-oscuro max-w-xs">
                            <span className="truncate block" title={cliente.direccion || ''}>
                              {cliente.direccion || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cliente.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {cliente.estado ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button title="Editar" onClick={() => openEdit(cliente)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                                <Edit size={18} />
                              </button>
                              <button title="Eliminar" onClick={() => requestDelete(cliente)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
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
              
              {/* Paginación - siempre visible cuando hay datos */}
              {totalItems > 0 && (
                <div className="border-t border-gris-claro px-6 py-4 bg-white">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gris-medio">
                      Mostrando <span className="font-semibold">{startIndex + 1}</span> a <span className="font-semibold">{endIndex}</span> de <span className="font-semibold">{totalItems}</span> clientes
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gris-claro rounded-lg hover:bg-fondo-claro transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página anterior"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      
                      {/* Números de página */}
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-verde-principal text-white'
                                  : 'border border-gris-claro hover:bg-fondo-claro text-gris-oscuro'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gris-claro rounded-lg hover:bg-fondo-claro transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página siguiente"
                      >
                        <ChevronRight size={18} />
                      </button>
                      
                      <span className="text-xs text-gris-medio ml-2 whitespace-nowrap">
                        Página {currentPage} de {totalPages}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ClienteFormModal
        open={formOpen}
        initialData={editingCliente}
        submitting={formSubmitting}
        onSubmit={handleSubmitForm}
        onClose={() => { if (!formSubmitting) { setFormOpen(false); setEditingCliente(null) } }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar cliente"
        message="Esta acción no se puede deshacer. ¿Desea continuar?"
        confirmText="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => { if (!deleting) { setConfirmOpen(false); setTargetId(null) } }}
        loading={deleting}
      />
    </>
  );
};

export default AdminClientes;
