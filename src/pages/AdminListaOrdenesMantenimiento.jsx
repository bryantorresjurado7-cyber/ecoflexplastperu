import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Search, Eye, Edit, Trash, Plus,
    Calendar, Filter, FileText, ChevronLeft, Printer
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminListaOrdenesMantenimiento = () => {
    const navigate = useNavigate();
    // Estado para las órdenes
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterSolicitante, setFilterSolicitante] = useState('');
    const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
    const [maquinaInfoForPrint, setMaquinaInfoForPrint] = useState(null);

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
                tecnico: order.tecnico_responsable || 'No asignado',
                solicitante: order.solicitanteNombre || ''
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

    const handlePrint = (orderId) => {
        const storedOrders = JSON.parse(localStorage.getItem('ordenes_mantenimiento') || '[]');
        const order = storedOrders.find(o => o.id_orden === orderId);

        if (order) {
            // Map to format expected by print template (camelCase matching AdminOrdenMantenimiento logic)
            const printData = {
                numeroOrden: order.numero_orden,
                fechaCreacion: order.fecha_creacion,
                tipoMantenimiento: order.tipo_mantenimiento,
                prioridad: order.prioridad,
                maquinaId: order.maquinaId,
                descripcionFallo: order.descripcion_fallo,
                sintomas: order.sintomas,
                tecnicoResponsable: order.tecnico_responsable,
                fechaInicio: order.fecha_inicio,
                fechaFinEstimada: order.fecha_fin_estimada,
                estado: order.estado,
                repuestos: order.repuestos || [],
                equipoApoyo: order.equipo_apoyo,
                metodosSeguridad: order.metodos_seguridad,
                actividadesProcedimiento: order.actividades_procedimiento,
                solicitanteNombre: order.solicitanteNombre,
                solicitanteCargo: order.solicitanteCargo,
                turno: order.turno
            };

            const mInfo = {
                nombre: order.maquinarias?.nombre,
                codigo_maquinaria: order.maquinarias?.codigo_maquinaria,
                ubicacion: '---', // Data might be missing in stored order if not fully flattened
            };

            // If we want full machine info, we might need to fetch it or rely on what's saved.
            // For now, use what's in the order object or defaults.

            setSelectedOrderForPrint(printData);
            setMaquinaInfoForPrint(mInfo);

            setTimeout(() => {
                window.print();
            }, 300);
        }
    };

    const filteredOrdenes = ordenes.filter(orden => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchSearch =
            orden.numero.toLowerCase().includes(lowerSearch) ||
            orden.maquina.toLowerCase().includes(lowerSearch) ||
            orden.tecnico.toLowerCase().includes(lowerSearch);

        const matchEstado = filterEstado ? orden.estado === filterEstado : true;
        const matchTipo = filterTipo ? orden.tipo === filterTipo : true;
        const matchSolicitante = filterSolicitante ? orden.solicitante.toLowerCase().includes(filterSolicitante.toLowerCase()) : true;

        return matchSearch && matchEstado && matchTipo && matchSolicitante;
    });

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
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="relative w-full xl:w-96 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-medio" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por N° Orden, Máquina o Técnico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal/20 transition-all text-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Filtro Estado */}
                    <div className="relative min-w-[140px] flex-1">
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gris-oscuro focus:outline-none focus:border-verde-principal bg-white"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="Abierto">Abierto</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Completado">Completado</option>
                            <option value="Cerrado">Cerrado</option>
                        </select>
                        <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-gris-medio pointer-events-none" size={16} />
                    </div>

                    {/* Filtro Tipo */}
                    <div className="relative min-w-[140px] flex-1">
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gris-oscuro focus:outline-none focus:border-verde-principal bg-white"
                        >
                            <option value="">Todos los Tipos</option>
                            <option value="Preventivo">Preventivo</option>
                            <option value="Correctivo">Correctivo</option>
                            <option value="Predictivo">Predictivo</option>
                            <option value="Emergencia">Emergencia</option>
                        </select>
                        <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-gris-medio pointer-events-none" size={16} />
                    </div>

                    {/* Filtro Solicitante */}
                    <div className="relative min-w-[180px] flex-1">
                        <input
                            type="text"
                            placeholder="Persona que reporta..."
                            value={filterSolicitante}
                            onChange={(e) => setFilterSolicitante(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gris-oscuro focus:outline-none focus:border-verde-principal text-ellipsis"
                        />
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gris-medio pointer-events-none" size={16} />
                    </div>
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
                            {filteredOrdenes.length > 0 ? (
                                filteredOrdenes.map((orden) => (
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
                                                <button onClick={() => handlePrint(orden.id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Imprimir">
                                                    <Printer size={18} />
                                                </button>
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

            {/* Print Template - Copied from AdminOrdenMantenimiento */}
            {selectedOrderForPrint && (
                <div id="print-section" className="hidden print:block fixed inset-0 bg-white z-[9999] text-black">
                    <style>{`
                        @media print {
                            body * { visibility: hidden; }
                            #print-section, #print-section * { visibility: visible; }
                            #print-section { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; background: white; }
                            @page { margin: 1cm; size: auto; }
                        }
                        .print-table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
                        .print-table th, .print-table td { border: 1px solid black; padding: 4px; font-size: 11px; }
                        .print-header-cell { background-color: #f3f4f6; font-weight: bold; }
                        .print-box { border: 1px solid black; padding: 5px; height: 100%; }
                    `}</style>

                    <div className="max-w-[210mm] mx-auto border-2 border-black font-sans text-xs">
                        {/* Header */}
                        <div className="flex border-b border-black">
                            <div className="w-1/4 border-r border-black p-4 flex items-center justify-center">
                                <h2 className="text-xl font-bold text-verde-principal">EcoFlexPlast</h2>
                            </div>
                            <div className="w-2/4 border-r border-black p-2 flex items-center justify-center text-center">
                                <h1 className="text-lg font-bold">FORMATO ORDEN DE TRABAJO</h1>
                            </div>
                            <div className="w-1/4 text-[10px]">
                                <div className="flex border-b border-black">
                                    <span className="w-1/2 p-1 bg-gray-100 border-r border-black font-bold">CODIGO</span>
                                    <span className="w-1/2 p-1 text-center">MANT-OT-01</span>
                                </div>
                                <div className="flex border-b border-black">
                                    <span className="w-1/2 p-1 bg-gray-100 border-r border-black font-bold">FECHA</span>
                                    <span className="w-1/2 p-1 text-center">{new Date().getFullYear()}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-1/2 p-1 bg-gray-100 border-r border-black font-bold">VERSION</span>
                                    <span className="w-1/2 p-1 text-center">02</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 1: Info */}
                        <table className="print-table border-t-0">
                            <tbody>
                                <tr>
                                    <td className="print-header-cell w-[150px]">SECCIÓN O AREA:</td>
                                    <td>{maquinaInfoForPrint?.ubicacion || '---'}</td>
                                    <td className="print-header-cell w-[120px]">NUMERO OT:</td>
                                    <td>{selectedOrderForPrint.numeroOrden}</td>
                                </tr>
                                <tr>
                                    <td className="print-header-cell">EQUIPO O MAQUINA:</td>
                                    <td>{maquinaInfoForPrint?.nombre || '---'}</td>
                                    <td className="print-header-cell">CODIGO MAQ O EQ:</td>
                                    <td>{maquinaInfoForPrint?.codigo_maquinaria || '---'}</td>
                                </tr>
                                <tr>
                                    <td className="print-header-cell">FECHA DE SOLICITUD:</td>
                                    <td>{selectedOrderForPrint.fechaCreacion}</td>
                                    <td className="print-header-cell">HORA DE SOLICITUD:</td>
                                    <td>08:00 AM</td>
                                </tr>
                                <tr>
                                    <td className="print-header-cell">NOMBRE SOLICITANTE:</td>
                                    <td colSpan="3">{selectedOrderForPrint.solicitanteNombre || '---'} ({selectedOrderForPrint.solicitanteCargo || 'Cargo N/A'})</td>
                                </tr>
                                <tr>
                                    <td className="print-header-cell">NOMBRE DEL TECNICO:</td>
                                    <td colSpan="3">{selectedOrderForPrint.tecnicoResponsable || 'POR ASIGNAR'}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Section 2: Description */}
                        <div className="border-b border-black">
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold text-xs uppercase">Descripción del Servicio de Mantenimiento</div>
                            <div className="h-[100px] p-2 text-sm whitespace-pre-wrap">
                                {selectedOrderForPrint.descripcionFallo || 'Sin descripción detallada.'}
                                {selectedOrderForPrint.sintomas && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        <span className="font-bold">Síntomas:</span> {selectedOrderForPrint.sintomas}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3 & 4: Checkboxes */}
                        <div className="flex border-b border-black">
                            <div className="w-1/3 border-r border-black">
                                <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">TIPO MANTENIMIENTO</div>
                                <div className="p-2 space-y-1">
                                    {['Preventivo', 'Correctivo', 'Predictivo', 'Otro'].map(type => (
                                        <div key={type} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 border border-black flex items-center justify-center ${selectedOrderForPrint.tipoMantenimiento === type ? 'bg-black text-white' : ''}`}>
                                                {selectedOrderForPrint.tipoMantenimiento === type ? 'X' : ''}
                                            </div>
                                            <span>{type.toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-1/3 border-r border-black">
                                <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">PRIORIDAD</div>
                                <div className="p-2 space-y-1">
                                    {['Alta', 'Media', 'Baja'].map(prio => (
                                        <div key={prio} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 border border-black flex items-center justify-center ${selectedOrderForPrint.prioridad === prio ? 'bg-black text-white' : ''}`}>
                                                {selectedOrderForPrint.prioridad === prio ? 'X' : ''}
                                            </div>
                                            <span>{prio.toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-1/3">
                                <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">CAUSA DE FALLA</div>
                                <div className="p-2 grid grid-cols-2 gap-2">
                                    {['MECÁNICA', 'ELÉCTRICA', 'NEUMÁTICA', 'HIDRAULICA'].map(cause => (
                                        <div key={cause} className="flex items-center gap-2">
                                            <div className="w-4 h-4 border border-black"></div>
                                            <span className="text-[10px]">{cause}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PERSONAL Y PLANIFICACIÓN */}
                        <div className="border-b border-black">
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">PERSONAL Y PLANIFICACIÓN</div>
                            <table className="print-table border-none">
                                <tbody>
                                    <tr>
                                        <td className="print-header-cell w-[150px]">TÉCNICO RESPONSABLE:</td>
                                        <td>{selectedOrderForPrint.tecnicoResponsable || '---'}</td>
                                        <td className="print-header-cell w-[100px]">TURNO:</td>
                                        <td>{selectedOrderForPrint.turno || '---'}</td>
                                    </tr>
                                    <tr>
                                        <td className="print-header-cell">EQUIPO DE APOYO:</td>
                                        <td colSpan="3">{selectedOrderForPrint.equipoApoyo || 'Sin equipo de apoyo asignado'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* PROCEDIMIENTOS Y ACTIVIDADES */}
                        <div className="border-b border-black">
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">PROCEDIMIENTOS Y ACTIVIDADES</div>
                            <div className="p-2 min-h-[50px] text-xs whitespace-pre-wrap">
                                {selectedOrderForPrint.actividadesProcedimiento || 'Sin procedimientos específicos registrados.'}
                            </div>
                        </div>

                        {/* Section 5: Repuestos */}
                        <div>
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">MATERIALES Y/O REPUESTOS</div>
                            <table className="print-table border-t-0 border-x-0 border-b-black">
                                <thead>
                                    <tr>
                                        <th className="w-10">ITEM</th>
                                        <th>DESCRIPCION / CODIGO</th>
                                        <th className="w-20">UNIDAD</th>
                                        <th className="w-20">CANTIDAD</th>
                                        <th className="w-32">FECHA REQ.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrderForPrint.repuestos.length > 0 ? (
                                        selectedOrderForPrint.repuestos.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="text-center">{idx + 1}</td>
                                                <td>{item.codigo}</td>
                                                <td className="text-center">UND</td>
                                                <td className="text-center">{item.cantidad}</td>
                                                <td className="text-center">{selectedOrderForPrint.fechaCreacion}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <>
                                            {[1, 2, 3, 4].map(i => (
                                                <tr key={i}><td className="text-center">{i}</td><td></td><td></td><td></td><td></td></tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Section 6: Tiempos */}
                        <div className="border-b border-black">
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">REGISTRO DE TIEMPO</div>
                            <table className="print-table border-none">
                                <thead>
                                    <tr>
                                        <th>FECHA INICIAL</th>
                                        <th>HORA INICIAL</th>
                                        <th>HORA FINAL</th>
                                        <th>FECHA FINAL</th>
                                        <th>FECHA DE ENTREGA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="h-8 text-center">{selectedOrderForPrint.fechaInicio ? new Date(selectedOrderForPrint.fechaInicio).toLocaleDateString() : ''}</td>
                                        <td className="text-center">{selectedOrderForPrint.fechaInicio ? new Date(selectedOrderForPrint.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                                        <td className="text-center"></td>
                                        <td className="text-center">{selectedOrderForPrint.fechaFinEstimada ? new Date(selectedOrderForPrint.fechaFinEstimada).toLocaleDateString() : ''}</td>
                                        <td className="text-center"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Section 7: Seguridad */}
                        <div className="border-b border-black">
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">INDICACIONES DE SEGURIDAD</div>
                            <div className="p-2 h-16 border-b border-black">
                                {selectedOrderForPrint.metodosSeguridad || 'Usar EPP estandar: Guantes, Lentes, Zapatos de seguridad, Casco.'}
                            </div>
                        </div>

                        {/* Footer: Firmas */}
                        <div className="flex h-32">
                            <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between">
                                <span className="text-[10px] font-bold">SOLICITADO POR:</span>
                                <div className="text-center border-t border-black pt-1">
                                    {selectedOrderForPrint.solicitanteNombre || 'Firma Solicitante'}
                                </div>
                            </div>
                            <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between">
                                <span className="text-[10px] font-bold">REALIZADO POR:</span>
                                <div className="text-center border-t border-black pt-1">
                                    {selectedOrderForPrint.tecnicoResponsable || 'Firma Técnico'}
                                </div>
                            </div>
                            <div className="w-1/3 p-2 flex flex-col justify-between">
                                <span className="text-[10px] font-bold">VISTO BUENO:</span>
                                <div className="text-center border-t border-black pt-1">
                                    Jefe de Mantenimiento
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminListaOrdenesMantenimiento;
