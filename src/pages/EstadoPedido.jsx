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
      console.log('Cargando pedidos desde Edge Functions...');
      const data = await obtenerPedidos({ limit: 50 });
      console.log('Pedidos recibidos:', data);
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError(err.message || 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Estados disponibles para cambiar (usar ESTADOS_PEDIDO del servicio)
  const estadosDisponibles = ESTADOS_PEDIDO.map(estado => ({
    value: estado.key,
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
      
      // Actualizar el estado local con los datos del servidor
      setPedidos(prevPedidos =>
        prevPedidos.map(p => 
          p.id_pedido === idPedido ? pedidoActualizado : p
        )
      );
      
      // Limpiar estado de edición
      setEditandoEstado(null);
      setNuevoEstado('');
      setObservaciones('');
      
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
          <div className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${esCompletado ? 'bg-verde-principal' : 'bg-gris-muy-claro'
            }`} />
        )}

        {/* Icono */}
        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${esCompletado
            ? 'bg-verde-principal border-verde-principal shadow-lg shadow-verde-principal/30'
            : esActual
              ? 'bg-white border-verde-principal animate-pulse'
              : 'bg-white border-gris-muy-claro'
          }`}>
          <Icono className={`w-6 h-6 ${esCompletado
              ? 'text-white'
              : esActual
                ? 'text-verde-principal'
                : 'text-gris-medio'
            }`} />
        </div>

        {/* Contenido */}
        <div className="ml-6 flex-1 pb-8">
          <div className={`p-4 rounded-xl border transition-all duration-300 ${esActual
              ? 'bg-verde-light border-verde-principal shadow-md'
              : esCompletado
                ? 'bg-white border-verde-border'
                : 'bg-gris-muy-claro/30 border-gris-muy-claro'
            }`}>
            <div className="flex items-start justify-between mb-2">
              <h4 className={`font-semibold text-base ${esActual || esCompletado ? 'text-negro-principal' : 'text-gris-medio'
                }`}>
                {estado.label}
              </h4>
              {esActual && (
                <span className="px-2 py-1 bg-verde-principal text-white text-xs font-medium rounded-full">
                  Actual
                </span>
              )}
              {esCompletado && !esActual && (
                <CheckCircle className="w-5 h-5 text-verde-principal" />
              )}
            </div>
            <p className={`text-sm mb-2 ${esActual || esCompletado ? 'text-gris-oscuro' : 'text-gris-medio'
              }`}>
              {estado.description}
            </p>
            {estado.fecha && (
              <div className="flex items-center text-xs text-gris-medio mt-2">
                <Clock className="w-3 h-3 mr-1" />
                {formatearFecha(estado.fecha)}
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
      <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow border border-gris-muy-claro overflow-hidden">
        {/* Header del pedido */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-negro-principal mb-2">
                Pedido #{pedido.id_pedido?.slice(0, 8) || 'N/A'}
              </h3>
              <div className="flex flex-wrap gap-3 text-sm text-gris-oscuro">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-gris-medio" />
                  {formatearFecha(pedido.fecha_pedido)}
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-1.5 text-gris-medio" />
                  {totalProductos} producto{totalProductos !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Estado actual */}
              {estaEditando ? (
                <div className="flex items-center gap-2">
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="px-3 py-2 border border-verde-principal rounded-lg text-sm font-semibold text-verde-principal focus:outline-none focus:ring-2 focus:ring-verde-principal"
                  >
                    {estadosDisponibles.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => guardarEstado(pedido.id_pedido)}
                    className="p-2 bg-verde-principal text-white rounded-lg hover:bg-verde-hover transition-colors"
                    title="Guardar cambios"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelarEdicion}
                    className="p-2 bg-gris-muy-claro text-gris-oscuro rounded-lg hover:bg-gris-claro transition-colors"
                    title="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="px-4 py-2 bg-verde-light text-verde-principal text-sm font-semibold rounded-lg border border-verde-border">
                    {estadoActual}
                  </span>
                  {puedeEditarEstados() && (
                    <button
                      onClick={() => iniciarEdicion(pedido)}
                      className="p-2 bg-azul/10 text-azul rounded-lg hover:bg-azul/20 transition-colors"
                      title="Editar estado"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => togglePedido(pedido.id_pedido)}
                className="p-2 hover:bg-gris-muy-claro rounded-lg transition-colors"
              >
                {estaExpandido ? (
                  <ChevronUp className="w-5 h-5 text-gris-medio" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gris-medio" />
                )}
              </button>
            </div>
          </div>

          {/* Información resumida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gris-muy-claro">
            <div>
              <p className="text-xs text-gris-medio mb-1">Total del Pedido</p>
              <p className="text-lg font-bold text-negro-principal">
                S/ {pedido.total?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gris-medio mb-1">Cliente</p>
              <p className="text-sm font-semibold text-gris-oscuro">
                {Array.isArray(pedido.cliente) ? pedido.cliente[0]?.nombre : pedido.cliente?.nombre || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline expandible */}
        {estaExpandido && (
          <div className="border-t border-gris-muy-claro bg-fondo-claro transition-all duration-300">
              <div className="p-6">
                {/* Información de entrega */}
                <div className="mb-6 p-4 bg-white rounded-xl border border-gris-muy-claro">
                  <h4 className="font-semibold text-negro-principal mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-verde-principal" />
                    Información de Entrega
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gris-medio mb-1">Dirección:</p>
                      <p className="text-gris-oscuro font-medium">
                        {pedido.direccion_entrega || 'No especificada'}
                      </p>
                    </div>
                    {pedido.cliente && (
                      <>
                        <div>
                          <p className="text-gris-medio mb-1">Cliente:</p>
                          <p className="text-gris-oscuro font-medium">
                            {Array.isArray(pedido.cliente) ? pedido.cliente[0]?.nombre : pedido.cliente?.nombre || 'N/A'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Timeline de estados */}
                <div className="mb-6">
                  <h4 className="font-semibold text-negro-principal mb-4">
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
                  <div className="p-4 bg-white rounded-xl border border-gris-muy-claro">
                    <h4 className="font-semibold text-negro-principal mb-3">
                      Productos del Pedido
                    </h4>
                    <div className="space-y-2">
                      {pedido.detalle_pedido.map((detalle, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gris-muy-claro last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-negro-principal text-sm">
                              {Array.isArray(detalle.productos_db)
                                ? detalle.productos_db[0]?.nombre_producto
                                : detalle.productos_db?.nombre_producto || 'Producto'}
                            </p>
                            <p className="text-xs text-gris-medio">
                              Cantidad: {detalle.cantidad || 0}
                            </p>
                          </div>
                          <p className="font-semibold text-gris-oscuro">
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
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-negro-principal mb-2">
              Estado de Pedidos
            </h1>
            <p className="text-gris-medio">
              {esCliente() 
                ? 'Consulta el estado de tus pedidos en tiempo real'
                : 'Gestiona y actualiza el estado de todos los pedidos'
              }
            </p>
          </div>
          <button
            onClick={cargarPedidos}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal mb-4"></div>
            <p className="text-gris-medio">Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error al cargar pedidos</h3>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={cargarPedidos}
                className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <div className="w-16 h-16 bg-gris-muy-claro rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gris-medio" />
            </div>
            <h3 className="text-xl font-semibold text-negro-principal mb-2">
              {esCliente() ? 'No tienes pedidos activos' : 'No hay pedidos registrados'}
            </h3>
            <p className="text-gris-medio mb-6">
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
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-negro-principal">
                {esCliente() ? `Tus Pedidos (${pedidos.length})` : `Todos los Pedidos (${pedidos.length})`}
              </h2>
              {puedeEditarEstados() && (
                <span className="text-sm text-gris-medio flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Click en el ícono de lápiz para cambiar el estado
                </span>
              )}
            </div>
            {pedidos.map((pedido) => (
              <PedidoCard key={pedido.id_pedido} pedido={pedido} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EstadoPedido;
