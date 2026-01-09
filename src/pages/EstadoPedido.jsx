import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';
import {
  Package,
  CheckCircle,
  Circle,
  Calendar,
  Cog,
  ClipboardCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X
} from 'lucide-react';
import SEO from '../components/SEO';
import { obtenerPedidos, obtenerTimelinePedido, actualizarEstadoPedido, ESTADOS_PEDIDO } from '../services/pedidosService';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from '../components/Dropdown';


/**
 * Componente para mostrar el estado de los pedidos del cliente
 * Muestra una línea de tiempo con 7 etapas del proceso de pedido
 */
const EstadoPedido = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pedidoExpandido, setPedidoExpandido] = useState(null);
  const [editandoEstado, setEditandoEstado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Determinar si el usuario puede editar estados
  const puedeEditarEstados = () => {
    const rolesPermitidos = ['admin', 'super_admin', 'vendedor'];
    return rolesPermitidos.includes(user?.rol?.toLowerCase());
  };

  // Determinar si el usuario es cliente
  const esCliente = () => {
    return user?.rol?.toLowerCase() === 'cliente';
  };

  // Cargar pedidos según el rol del usuario
  const cargarPedidos = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Cargando pedidos desde Edge Functions...');
      const data = await obtenerPedidos({ limit: 50 });
      console.log('✅ Pedidos recibidos:', data);
      console.log('📋 Códigos de pedido:', data.map(p => ({ id: p.id_pedido, cod: p.cod_pedido })));
      setPedidos(data);
    } catch (err) {
      console.error('❌ Error al cargar pedidos:', err);
      setError(err.message || 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Estados disponibles para cambiar (usar ESTADOS_PEDIDO del servicio)
  const estadosDisponibles = ESTADOS_PEDIDO.map(estado => ({
    value: estado.value,
    label: estado.label
  }));

  // Iniciar edición de estado
  const iniciarEdicion = (pedido) => {
    setEditandoEstado(pedido.id_pedido);
    setNuevoEstado(pedido.estado_pedido);
    setObservaciones('');
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoEstado(null);
    setNuevoEstado('');
    setObservaciones('');
  };

  // Guardar nuevo estado
  const guardarEstado = async (idPedido) => {
    if (!nuevoEstado) {
      alert('Debe seleccionar un estado');
      return;
    }

    try {
      console.log(`Actualizando estado de pedido ${idPedido} a ${nuevoEstado}...`);

      // Llamar al servicio para actualizar el estado
      const pedidoActualizado = await actualizarEstadoPedido(
        idPedido,
        nuevoEstado,
        observaciones || null
      );

      console.log('Pedido actualizado:', pedidoActualizado);

      // Limpiar estado de edición
      setEditandoEstado(null);
      setNuevoEstado('');
      setObservaciones('');

      // Recargar todos los pedidos desde el servidor para obtener la data más reciente
      await cargarPedidos();

      alert('Estado actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar el estado: ' + err.message);
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  const togglePedido = (idPedido) => {
    setPedidoExpandido(pedidoExpandido === idPedido ? null : idPedido);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener años únicos de los pedidos
  const getAvailableYears = () => {
    const years = pedidos.map(p => new Date(p.fecha_pedido).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  };

  // Filtrar pedidos
  const filteredPedidos = pedidos.filter(pedido => {
    // Filtro por búsqueda (código de pedido)
    const matchSearch = searchTerm === '' ||
      pedido.cod_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.id_pedido?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por año
    const pedidoYear = new Date(pedido.fecha_pedido).getFullYear().toString();
    const matchYear = selectedYear === '' || pedidoYear === selectedYear;

    // Filtro por mes
    const pedidoMonth = (new Date(pedido.fecha_pedido).getMonth() + 1).toString();
    const matchMonth = selectedMonth === '' || pedidoMonth === selectedMonth;

    return matchSearch && matchYear && matchMonth;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPedidos = filteredPedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedMonth]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIconoEstado = (iconKey) => {
    const iconos = {
      'check-circle': CheckCircle,
      'calendar': Calendar,
      'cog': Cog,
      'clipboard-check': ClipboardCheck,
      'package': Package,
      'truck': Truck,
      'check-circle-2': CheckCircle2
    };
    return iconos[iconKey] || Circle;
  };

  const TimelineItem = ({ estado, isLast }) => {
    const Icono = getIconoEstado(estado.icon);
    const esActual = estado.actual;
    const esCompletado = estado.completado;

    return (
      <div className="relative flex items-start group">
        {/* Línea vertical */}
        {!isLast && (
          <div className={`absolute left-4 sm:left-6 top-10 sm:top-12 w-0.5 h-full -ml-px ${esCompletado ? 'bg-verde-principal' : 'bg-gris-muy-claro'
            }`} />
        )}

        {/* Icono */}
        <div className={`relative z-10 flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${esCompletado
            ? 'bg-verde-principal border-verde-principal shadow-lg shadow-verde-principal/30'
            : esActual
              ? 'bg-white border-verde-principal animate-pulse'
              : 'bg-white border-gris-muy-claro'
          }`}>
          <Icono className={`w-4 h-4 sm:w-6 sm:h-6 ${esCompletado
              ? 'text-white'
              : esActual
                ? 'text-verde-principal'
                : 'text-gris-medio'
            }`} />
        </div>

        {/* Contenido */}
        <div className="ml-3 sm:ml-6 flex-1 pb-6 sm:pb-8 min-w-0">
          <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-300 ${esActual
              ? 'bg-verde-light border-verde-principal shadow-md'
              : esCompletado
                ? 'bg-white border-verde-border'
                : 'bg-gris-muy-claro/30 border-gris-muy-claro'
            }`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={`font-semibold text-sm sm:text-base flex-1 ${esActual || esCompletado ? 'text-negro-principal' : 'text-gris-medio'
                }`}>
                {estado.label}
              </h4>
              {esActual && (
                <span className="px-2 py-0.5 sm:py-1 bg-verde-principal text-white text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                  Actual
                </span>
              )}
              {esCompletado && !esActual && (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-verde-principal flex-shrink-0" />
              )}
            </div>
            <p className={`text-xs sm:text-sm mb-2 ${esActual || esCompletado ? 'text-gris-oscuro' : 'text-gris-medio'
              }`}>
              {estado.description}
            </p>
            {estado.fecha && (
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gris-medio">
                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{formatearFecha(estado.fecha)}</span>
                </div>
                {estado.usuario && (
                  <div className="text-xs text-gris-medio">
                    <span className="font-medium">Actualizado por:</span> {estado.usuario}
                  </div>
                )}
                {estado.observaciones && (
                  <div className="text-xs text-gris-oscuro mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <span className="font-medium">Observaciones:</span> {estado.observaciones}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PedidoCard = ({ pedido }) => {
    const timeline = obtenerTimelinePedido(pedido);
    const estaExpandido = pedidoExpandido === pedido.id_pedido;
    const estadoActual = timeline.find(t => t.actual)?.label || 'Desconocido';
    const totalProductos = pedido.detalle_pedido?.length || 0;
    const estaEditando = editandoEstado === pedido.id_pedido;

    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-card hover:shadow-card-hover transition-shadow border border-gris-muy-claro overflow-hidden">
        {/* Header del pedido - clickeable para expandir/contraer */}
        <div
          className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => !estaEditando && togglePedido(pedido.id_pedido)}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-negro-principal mb-2 truncate">
                Pedido {pedido.cod_pedido || pedido.id_pedido?.slice(0, 8) || 'N/A'}
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gris-oscuro">
                <div className="flex items-center whitespace-nowrap">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gris-medio flex-shrink-0" />
                  <span className="truncate">{formatearFecha(pedido.fecha_pedido)}</span>
                </div>
                <div className="flex items-center whitespace-nowrap">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gris-medio flex-shrink-0" />
                  {totalProductos} producto{totalProductos !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Estado y acciones - versión mobile optimizada */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
              {estaEditando ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <Dropdown>
                    <DropdownButton className="!py-1.5 !px-3 border-verde-principal text-verde-principal font-semibold h-[38px]">
                      <span className="truncate">
                        {estadosDisponibles.find(e => e.value === nuevoEstado)?.label || 'Seleccionar'}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </DropdownButton>
                    <DropdownMenu className="min-w-[200px]">
                      {estadosDisponibles.map(estado => (
                        <DropdownItem
                          key={estado.value}
                          onClick={() => setNuevoEstado(estado.value)}
                          active={nuevoEstado === estado.value}
                        >
                          {estado.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>

                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarEstado(pedido.id_pedido)}
                      className="flex-1 sm:flex-none p-1.5 sm:p-2 bg-verde-principal text-white rounded-lg hover:bg-verde-hover transition-colors flex items-center justify-center gap-1.5"
                      title="Guardar cambios"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-xs sm:hidden">Guardar</span>
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="flex-1 sm:flex-none p-1.5 sm:p-2 bg-gris-muy-claro text-gris-oscuro rounded-lg hover:bg-gris-claro transition-colors flex items-center justify-center gap-1.5"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-xs sm:hidden">Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-verde-light text-verde-principal text-xs sm:text-sm font-semibold rounded-lg border border-verde-border whitespace-nowrap">
                    {estadoActual}
                  </span>
                  {puedeEditarEstados() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        iniciarEdicion(pedido);
                      }}
                      className="p-1.5 sm:p-2 bg-azul/10 text-azul rounded-lg hover:bg-azul/20 transition-colors flex-shrink-0"
                      title="Editar estado"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Campo de observaciones cuando se está editando */}
          {estaEditando && (
            <div className="mb-4 p-3 bg-azul/5 rounded-lg border border-azul/20">
              <label htmlFor={`observaciones-${pedido.id_pedido}`} className="block text-xs sm:text-sm font-medium text-gris-oscuro mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                id={`observaciones-${pedido.id_pedido}`}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agrega comentarios sobre el cambio de estado..."
                rows="2"
                className="w-full px-3 py-2 border border-gris-muy-claro rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-verde-principal focus:border-verde-principal resize-none"
              />
            </div>
          )}

          {/* Información resumida */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gris-muy-claro">
            <div>
              <p className="text-xs text-gris-medio mb-1">Total del Pedido</p>
              <p className="text-base sm:text-lg font-bold text-negro-principal">
                S/ {pedido.total?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gris-medio mb-1">Cliente</p>
              <p className="text-xs sm:text-sm font-semibold text-gris-oscuro truncate">
                {Array.isArray(pedido.cliente) ? pedido.cliente[0]?.nombre : pedido.cliente?.nombre || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline expandible */}
        {estaExpandido && (
          <div className="border-t border-gris-muy-claro bg-fondo-claro transition-all duration-300">
            <div className="p-4 sm:p-6">
              {/* Información de entrega */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-xl border border-gris-muy-claro">
                <h4 className="font-semibold text-negro-principal mb-3 flex items-center text-sm sm:text-base">
                  <MapPin className="w-4 h-4 mr-2 text-verde-principal flex-shrink-0" />
                  Información de Entrega
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="min-w-0">
                    <p className="text-gris-medio mb-1">Dirección:</p>
                    <p className="text-gris-oscuro font-medium break-words">
                      {pedido.direccion_entrega || 'No especificada'}
                    </p>
                  </div>
                  {pedido.cliente && (
                    <div className="min-w-0">
                      <p className="text-gris-medio mb-1">Cliente:</p>
                      <p className="text-gris-oscuro font-medium truncate">
                        {Array.isArray(pedido.cliente) ? pedido.cliente[0]?.nombre : pedido.cliente?.nombre || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline de estados */}
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-negro-principal mb-3 sm:mb-4 text-sm sm:text-base">
                  Estado del Pedido
                </h4>
                <div className="space-y-0">
                  {timeline.map((estado, index) => (
                    <TimelineItem
                      key={estado.key}
                      estado={estado}
                      isLast={index === timeline.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Detalles de productos */}
              {pedido.detalle_pedido && pedido.detalle_pedido.length > 0 && (
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-gris-muy-claro">
                  <h4 className="font-semibold text-negro-principal mb-3 text-sm sm:text-base">
                    Productos del Pedido
                  </h4>
                  <div className="space-y-2">
                    {pedido.detalle_pedido.map((detalle, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 py-2 border-b border-gris-muy-claro last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-negro-principal text-xs sm:text-sm truncate">
                            {detalle.producto?.nombre || 'Producto sin nombre'}
                          </p>
                          <p className="text-xs text-gris-medio">
                            Cantidad: {detalle.cantidad || 0}
                            {detalle.producto?.unidad_medida && ` ${detalle.producto.unidad_medida}`}
                          </p>
                        </div>
                        <p className="font-semibold text-gris-oscuro text-xs sm:text-sm whitespace-nowrap">
                          S/ {(detalle.precio_unitario * detalle.cantidad).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <SEO
        title="Estado de Pedidos | EcoFlexPlast Perú"
        description="Consulta el estado de tus pedidos en tiempo real"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-negro-principal mb-1 sm:mb-2">
              Estado de Pedidos
            </h1>
            <p className="text-sm sm:text-base text-gris-medio">
              {esCliente()
                ? 'Consulta el estado de tus pedidos en tiempo real'
                : 'Gestiona y actualiza el estado de todos los pedidos'
              }
            </p>
          </div>
          {!esCliente() && (
            <button
              onClick={cargarPedidos}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
            >
              <Package className="w-4 h-4" />
              <span className="sm:inline">Actualizar</span>
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal mb-4"></div>
            <p className="text-sm sm:text-base text-gris-medio">Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-800 mb-1 text-sm sm:text-base">Error al cargar pedidos</h3>
              <p className="text-red-600 text-xs sm:text-sm break-words">{error}</p>
              <button
                onClick={cargarPedidos}
                className="mt-3 text-xs sm:text-sm text-red-700 hover:text-red-800 font-medium underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gris-muy-claro rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gris-medio" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-negro-principal mb-2">
              {esCliente() ? 'No tienes pedidos activos' : 'No hay pedidos registrados'}
            </h3>
            <p className="text-sm sm:text-base text-gris-medio mb-6">
              {esCliente()
                ? 'Cuando realices un pedido, podrás ver su estado aquí'
                : 'Los pedidos aparecerán aquí cuando se registren'
              }
            </p>
            {esCliente() && (
              <a
                href="/productos"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Ver productos
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-negro-principal">
                  {esCliente() ? `Tus Pedidos (${filteredPedidos.length})` : `Todos los Pedidos (${filteredPedidos.length})`}
                </h2>
                {puedeEditarEstados() && (
                  <span className="text-xs sm:text-sm text-gris-medio flex items-center gap-2">
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Click en el ícono de lápiz para cambiar el estado</span>
                    <span className="sm:hidden">Toca el lápiz para editar</span>
                  </span>
                )}
              </div>

              {/* Controles de filtro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Búsqueda por código */}
                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gris-oscuro mb-1.5">
                    Buscar por código
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="PED-XXX-YYY"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gris-claro rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent outline-none transition-all"
                    />
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris-medio" />
                  </div>
                </div>

                {/* Filtro por año */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gris-oscuro mb-1.5">
                    Año
                  </label>
                  <Dropdown>
                    <DropdownButton outline>
                      <span>{selectedYear || 'Todos'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </DropdownButton>
                    <DropdownMenu>
                      <DropdownItem onClick={() => setSelectedYear('')} active={selectedYear === ''}>
                        Todos
                      </DropdownItem>
                      {getAvailableYears().map(year => (
                        <DropdownItem
                          key={year}
                          onClick={() => setSelectedYear(year.toString())}
                          active={selectedYear === year.toString()}
                        >
                          {year}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {/* Filtro por mes */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gris-oscuro mb-1.5">
                    Mes
                  </label>
                  <Dropdown>
                    <DropdownButton outline>
                      <span>
                        {[
                          { v: '', l: 'Todos' }, { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
                          { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' }, { v: '7', l: 'Julio' },
                          { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' }, { v: '10', l: 'Octubre' },
                          { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' }
                        ].find(m => m.v === selectedMonth)?.l || 'Todos'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </DropdownButton>
                    <DropdownMenu>
                      {[
                        { v: '', l: 'Todos' }, { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
                        { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' }, { v: '7', l: 'Julio' },
                        { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' }, { v: '10', l: 'Octubre' },
                        { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' }
                      ].map(mes => (
                        <DropdownItem
                          key={mes.v}
                          onClick={() => setSelectedMonth(mes.v)}
                          active={selectedMonth === mes.v}
                        >
                          {mes.l}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

              </div>

              {/* Botón para limpiar filtros */}
              {(searchTerm || selectedYear || selectedMonth) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedYear('');
                    setSelectedMonth('');
                  }}
                  className="text-xs sm:text-sm text-verde-principal hover:text-verde-oscuro font-medium flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Lista de pedidos paginada */}
            {currentPedidos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Package className="w-12 h-12 text-gris-claro mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gris-medio">
                  No se encontraron pedidos con los filtros aplicados
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentPedidos.map((pedido) => (
                    <PedidoCard key={pedido.id_pedido} pedido={pedido} />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Info de paginación */}
                      <p className="text-xs sm:text-sm text-gris-medio">
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPedidos.length)} de {filteredPedidos.length} pedidos
                      </p>

                      {/* Controles de paginación */}
                      <div className="flex items-center gap-2">
                        {/* Botón anterior */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gris-claro hover:bg-gris-muy-claro disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>

                        {/* Números de página */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              // Mostrar siempre primera, última, actual y adyacentes
                              return page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1;
                            })
                            .map((page, index, array) => {
                              // Agregar "..." si hay saltos
                              const showEllipsis = index > 0 && page - array[index - 1] > 1;

                              return (
                                <div key={page} className="flex items-center gap-1">
                                  {showEllipsis && (
                                    <span className="px-2 text-gris-medio">...</span>
                                  )}
                                  <button
                                    onClick={() => handlePageChange(page)}
                                    className={`min-w-[2rem] sm:min-w-[2.5rem] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-verde-principal text-white'
                                        : 'border border-gris-claro hover:bg-gris-muy-claro text-gris-oscuro'
                                      }`}
                                  >
                                    {page}
                                  </button>
                                </div>
                              );
                            })}
                        </div>

                        {/* Botón siguiente */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gris-claro hover:bg-gris-muy-claro disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EstadoPedido;
