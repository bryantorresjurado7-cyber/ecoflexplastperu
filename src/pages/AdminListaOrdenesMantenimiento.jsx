import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Search, Eye, Edit, Trash, Plus,
    Calendar, Filter, FileText, ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminListaOrdenesMantenimiento = () => {
    const navigate = useNavigate();
    // Estado para las órdenes
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrdenes();
    }, []);

    const fetchOrdenes = async () => {
        try {
            setLoading(true);
            // Carga desde LocalStorage por compatibilidad inmediata
            const storedOrders = JSON.parse(localStorage.getItem('ordenes_mantenimiento') || '[]');

            // Simular un pequeño delay para UX
            await new Promise(resolve => setTimeout(resolve, 300));

            const mappedOrders = storedOrders.map(order => ({
                id: order.id_orden,
                numero: order.numero_orden,
                maquina: order.maquinarias ? `${order.maquinarias.codigo_maquinaria} - ${order.maquinarias.nombre}` : 'Desconocida',
                tipo: order.tipo_mantenimiento,
                fecha: order.fecha_creacion,
                estado: order.estado || 'Pendiente',
                tecnico: order.tecnico_responsable || 'No asignado'
            })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            setOrdenes(mappedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'En Proceso': return 'bg-blue-100 text-blue-800';
            case 'Completado': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 bg-fondo-claro min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/admin/maquinarias/orden-mantenimiento" className="text-gris-medio hover:text-verde-principal transition-colors flex items-center gap-1 text-sm">
                            <ChevronLeft size={16} /> Volver a Generar Orden
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                        <ClipboardList className="text-verde-principal" size={32} />
                        Historial de Órdenes
                    </h1>
                    <p className="text-gris-medio mt-1">Gestión y seguimiento de mantenimientos programados</p>
                </div>

                <Link to="/admin/maquinarias/orden-mantenimiento" className="flex items-center gap-2 px-4 py-2 bg-verde-principal text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                    <Plus size={18} />
                    <span>Nueva Orden</span>
                </Link>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por N° Orden, Máquina o Técnico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal/20 transition-all text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gris-oscuro text-sm transition-colors">
                        <Filter size={16} />
                        <span>Filtrar</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gris-oscuro text-sm transition-colors">
                        <Calendar size={16} />
                        <span>Fecha</span>
                    </button>
                </div>
            </div>

            {/* Tabla de Órdenes */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-xs font-bold text-gris-medio uppercase tracking-wider">N° Orden</th>
                                <th className="p-4 text-xs font-bold text-gris-medio uppercase tracking-wider">Máquina</th>
                                <th className="p-4 text-xs font-bold text-gris-medio uppercase tracking-wider">Tipo</th>
                                <th className="p-4 text-xs font-bold text-gris-medio uppercase tracking-wider">Fecha Prog.</th>
                                <th className="p-4 text-xs font-bold text-gris-medio uppercase tracking-wider">Técnico</th>
                                <th className="p-4 text-xs font-bold text-gris-medio uppercase tracking-wider">Estado</th>
                                <th className="p-4 text-xs font-bold text-gris-medio uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ordenes.length > 0 ? (
                                ordenes.map((orden) => (
                                    <tr key={orden.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-mono text-sm font-medium text-verde-oscuro">{orden.numero}</td>
                                        <td className="p-4 text-sm text-negro-principal font-medium">{orden.maquina}</td>
                                        <td className="p-4 text-sm text-gris-oscuro">{orden.tipo}</td>
                                        <td className="p-4 text-sm text-gris-oscuro">{orden.fecha}</td>
                                        <td className="p-4 text-sm text-gris-oscuro">{orden.tecnico}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(orden.estado)}`}>
                                                {orden.estado}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => navigate(`/admin/maquinarias/ordenes/ver/${orden.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver Detalle">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => navigate(`/admin/maquinarias/ordenes/editar/${orden.id}`)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Editar">
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gris-medio">
                                        No hay órdenes de mantenimiento registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminListaOrdenesMantenimiento;
