import { supabase } from '../lib/supabase';
import { decryptData, getSessionKey } from '../utils/encryption';

/**
 * Servicio para gestionar operaciones relacionadas con pedidos
 * Usa Edge Functions de Supabase para lógica de negocio y seguridad
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Obtener lista de pedidos según el rol del usuario
 * - Clientes: Solo sus pedidos
 * - Admin/Vendedor: Todos los pedidos
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<Array>} Array de pedidos
 */
export const obtenerPedidos = async (options = {}) => {
  try {
    const { estado, limit = 50, offset = 0 } = options;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No hay sesión activa');

    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-pedidos?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'x-session-key': getSessionKey()
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener pedidos');
    }

    const jsonResult = await response.json();

    // Desencriptar si viene encriptado
    const result = jsonResult.encrypted && jsonResult.data
      ? await decryptData(jsonResult.data)
      : jsonResult;

    return result.data || [];
  } catch (error) {
    console.error('[pedidosService] Error obteniendo pedidos:', error);
    throw error;
  }
};

/**
 * Obtener detalle completo de un pedido incluyendo historial de estados
 * @param {string} idPedido - ID del pedido
 * @returns {Promise<Object>} Objeto del pedido con historial
 */
export const obtenerPedidoPorId = async (idPedido) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No hay sesión activa');

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-pedido-detalle?id_pedido=${idPedido}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'x-session-key': getSessionKey()
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener el pedido');
    }

    const jsonResult = await response.json();

    // Desencriptar si viene encriptado
    const result = jsonResult.encrypted && jsonResult.data
      ? await decryptData(jsonResult.data)
      : jsonResult;

    return result.data;
  } catch (error) {
    console.error('[pedidosService] Error obteniendo pedido:', error);
    throw error;
  }
};

/**
 * Obtener historial de estados del pedido (timeline)
 * Usa el campo estado_historial que viene de la BD
 * @param {Object} pedido - Objeto del pedido con estado_historial
 * @returns {Array} Array de estados con timestamps y status
 */
export const obtenerTimelinePedido = (pedido) => {
  if (!pedido) return [];

  // Definir todos los estados posibles
  const estados = [
    { key: 'confirmado', label: 'Pedido Confirmado', description: 'Orden de venta aprobada y registrada', icon: 'check-circle' },
    { key: 'programacion', label: 'En Programación', description: 'Pedido ingresado al plan de producción', icon: 'calendar' },
    { key: 'proceso', label: 'En Proceso', description: 'Pedido en fabricación', icon: 'cog' },
    { key: 'control_calidad', label: 'Control de Calidad', description: 'Verificación antes del despacho', icon: 'clipboard-check' },
    { key: 'listo_despacho', label: 'Listo para Despacho', description: 'Pedido embalado y preparado para envío', icon: 'package' },
    { key: 'en_transito', label: 'En Tránsito', description: 'Pedido en camino al cliente', icon: 'truck' },
    { key: 'entregado', label: 'Entregado', description: 'Pedido recibido y cerrado', icon: 'check-circle-2' }
  ];

  // Crear mapa de historial desde la BD
  const historialMap = {};
  if (Array.isArray(pedido.estado_historial)) {
    pedido.estado_historial.forEach(item => {
      historialMap[item.estado] = {
        fecha: item.fecha,
        usuario: item.usuario_nombre,
        observaciones: item.observaciones
      };
    });
  }

  // Determinar índice del estado actual
  const currentIndex = estados.findIndex(e => e.key === pedido.estado_pedido);

  // Construir timeline con información del historial
  return estados.map((estado, idx) => {
    const historialInfo = historialMap[estado.key];

    let status = 'pending';
    if (historialInfo) {
      status = idx < currentIndex ? 'completed' : idx === currentIndex ? 'current' : 'pending';
    } else {
      status = idx < currentIndex ? 'completed' : idx === currentIndex ? 'current' : 'pending';
    }

    return {
      ...estado,
      status,
      fecha: historialInfo?.fecha || null,
      usuario: historialInfo?.usuario || null,
      observaciones: historialInfo?.observaciones || null,
      completado: status === 'completed',
      actual: status === 'current'
    };
  });
};

/**
 * Actualizar estado del pedido usando Edge Function
 * @param {string} idPedido - ID del pedido
 * @param {string} nuevoEstado - Nuevo estado del pedido
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const actualizarEstadoPedido = async (idPedido, nuevoEstado, observaciones = null) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No hay sesión activa');

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/update-pedido-estado`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_pedido: idPedido,
          estado_nuevo: nuevoEstado,
          observaciones
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar el estado');
    }

    const jsonResult = await response.json();

    // Desencriptar si viene encriptado
    const result = jsonResult.encrypted && jsonResult.data
      ? await decryptData(jsonResult.data)
      : jsonResult;

    return result.data;
  } catch (error) {
    console.error('[pedidosService] Error actualizando estado:', error);
    throw error;
  }
};

/**
 * Obtener pedidos activos del usuario autenticado
 * @returns {Promise<Array>} Array de pedidos del usuario
 */
export const obtenerMisPedidos = async () => {
  try {
    return await obtenerPedidos();
  } catch (error) {
    console.error('[pedidosService] Error en obtenerMisPedidos:', error);
    throw error;
  }
};

/**
 * Estados válidos del sistema
 */
export const ESTADOS_PEDIDO = [
  { value: 'confirmado', label: 'Pedido Confirmado' },
  { value: 'programacion', label: 'En Programación' },
  { value: 'proceso', label: 'En Proceso' },
  { value: 'control_calidad', label: 'Control de Calidad' },
  { value: 'listo_despacho', label: 'Listo para Despacho' },
  { value: 'en_transito', label: 'En Tránsito' },
  { value: 'entregado', label: 'Entregado' }
];
