import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Save, Printer, Mail, Upload, Plus, Trash, Calendar,
    Wrench, AlertTriangle, User, FileText, CheckCircle,
    Clock, DollarSign, PenTool, ClipboardList, Edit, Eye
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4';

const AdminOrdenMantenimiento = () => {
    const navigate = useNavigate();
    // Estado del formulario
    const [formData, setFormData] = useState({
        numeroOrden: `OM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        fechaCreacion: new Date().toISOString().split('T')[0],
        tipoMantenimiento: 'Preventivo',
        prioridad: 'Media',
        maquinaId: '',
        descripcionFallo: '',
        sintomas: '',
        tecnicoResponsable: '',
        fechaInicio: '',
        fechaFinEstimada: '',
        estado: 'Abierto',
        tareas: [],
        repuestos: [],
        equipoApoyo: '',
        metodosSeguridad: '',
        equipoApoyo: '',
        metodosSeguridad: '',
        actividadesProcedimiento: '',
        solicitanteNombre: '',
        solicitanteCargo: '',
        solicitanteCargo: '',
        solicitanteContacto: '',
        turno: ''
    });

    const [maquinas, setMaquinas] = useState([]);
    const [maquinaInfo, setMaquinaInfo] = useState(null);
    const [loadingMaquinas, setLoadingMaquinas] = useState(true);

    const { id } = useParams();
    const location = useLocation();
    const isViewMode = location.pathname.includes('/ver/');
    const isEditMode = !!id && !isViewMode;

    useEffect(() => {
        loadMaquinarias();
        if (id) loadOrder(id);
    }, [id]);

    useEffect(() => {
        if (maquinas.length > 0) {
            if (formData.maquinaId) {
                const maquina = maquinas.find(m => String(m.id_maquinaria) === String(formData.maquinaId));
                if (maquina) {
                    setMaquinaInfo(maquina);
                }
            } else if (id) {
                // Recuperación: Si falta el ID (datos legacy), buscar por código guardado
                const stored = JSON.parse(localStorage.getItem('ordenes_mantenimiento') || '[]');
                const order = stored.find(o => String(o.id_orden) === String(id));
                if (order && order.maquinarias?.codigo_maquinaria) {
                    const found = maquinas.find(m => m.codigo_maquinaria === order.maquinarias.codigo_maquinaria);
                    if (found) {
                        setFormData(prev => ({ ...prev, maquinaId: found.id_maquinaria }));
                    }
                }
            }
        }
    }, [formData.maquinaId, maquinas, id]);

    const loadOrder = (orderId) => {
        const stored = JSON.parse(localStorage.getItem('ordenes_mantenimiento') || '[]');
        const order = stored.find(o => String(o.id_orden) === String(orderId));
        if (order) {
            setFormData({
                numeroOrden: order.numero_orden,
                fechaCreacion: order.fecha_creacion,
                maquinaId: order.maquinaId || '',
                tipoMantenimiento: order.tipo_mantenimiento,
                prioridad: order.prioridad,
                descripcionFallo: order.descripcion_fallo || '',
                sintomas: order.sintomas || '',
                tecnicoResponsable: order.tecnico_responsable,
                equipoApoyo: order.equipo_apoyo || '',
                fechaInicio: order.fecha_inicio || '',
                fechaFinEstimada: order.fecha_fin_estimada || '',
                estado: order.estado,
                repuestos: order.repuestos || [],
                metodosSeguridad: order.metodos_seguridad || '',
                actividadesProcedimiento: order.actividades_procedimiento || '',
                tareas: order.tareas || []
            });
        }
    };

    const loadMaquinarias = async () => {
        try {
            setLoadingMaquinas(true);
            // Obtener sesión actual para usar el token correcto (importante para RLS)
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || SUPABASE_ANON_KEY;

            const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-maquinarias`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success && result.data) {
                setMaquinas(result.data);
            } else {
                console.error('Error fetching maquinarias:', result.error);
            }
        } catch (error) {
            console.error('Error loading maquinarias:', error);
        } finally {
            setLoadingMaquinas(false);
        }
    };

    const handleMaquinaChange = (e) => {
        const id = e.target.value;
        // Buscar coincidencia (loose equality para manejar string/number id)
        const maquina = maquinas.find(m => String(m.id_maquinaria) === String(id));
        setFormData({ ...formData, maquinaId: id });
        setMaquinaInfo(maquina || null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const addRepuesto = () => {
        setFormData({
            ...formData,
            repuestos: [...formData.repuestos, { codigo: '', cantidad: 1, disponible: true }]
        });
    };

    const updateRepuesto = (index, field, value) => {
        const newRepuestos = [...formData.repuestos];
        newRepuestos[index][field] = value;
        setFormData({ ...formData, repuestos: newRepuestos });
    };

    const removeRepuesto = (index) => {
        const newRepuestos = formData.repuestos.filter((_, i) => i !== index);
        setFormData({ ...formData, repuestos: newRepuestos });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.maquinaId) {
            alert('Por favor seleccione una maquinaria.');
            return;
        }

        try {
            // Guardar en LocalStorage (Fallback por error de tabla faltante)
            const orderData = {
                id_orden: id ? Number(id) : Date.now(),
                numero_orden: formData.numeroOrden,
                fecha_creacion: formData.fechaCreacion,
                maquinaId: formData.maquinaId,
                maquinarias: maquinaInfo ? { codigo_maquinaria: maquinaInfo.codigo_maquinaria, nombre: maquinaInfo.nombre } : { codigo_maquinaria: '?', nombre: '?' },
                tipo_mantenimiento: formData.tipoMantenimiento,
                prioridad: formData.prioridad,
                tecnico_responsable: formData.tecnicoResponsable,
                estado: formData.estado,
                descripcion_fallo: formData.descripcionFallo,
                sintomas: formData.sintomas,
                equipo_apoyo: formData.equipoApoyo,
                fecha_inicio: formData.fechaInicio,
                fecha_fin_estimada: formData.fechaFinEstimada,
                repuestos: formData.repuestos,
                metodos_seguridad: formData.metodosSeguridad,
                actividades_procedimiento: formData.actividadesProcedimiento
            };

            const existing = JSON.parse(localStorage.getItem('ordenes_mantenimiento') || '[]');

            if (isEditMode) {
                const index = existing.findIndex(o => String(o.id_orden) === String(id));
                if (index !== -1) {
                    existing[index] = { ...existing[index], ...orderData };
                }
            } else {
                existing.push(orderData);
            }

            localStorage.setItem('ordenes_mantenimiento', JSON.stringify(existing));

            alert(`Orden de mantenimiento ${isEditMode ? 'actualizada' : 'generada'} exitosamente (Local).`);
            navigate('/admin/maquinarias/lista-ordenes');
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Error al guardar la orden: ' + error.message);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 md:p-8 space-y-8 bg-fondo-claro min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                        {isViewMode ? <Eye className="text-blue-500" size={32} /> :
                            isEditMode ? <Edit className="text-orange-500" size={32} /> :
                                <Wrench className="text-verde-principal" size={32} />}
                        {isViewMode ? 'Ver Orden de Mantenimiento' :
                            isEditMode ? 'Editar Orden de Mantenimiento' :
                                'Generar Orden de Mantenimiento'}
                    </h1>
                    <p className="text-gris-medio mt-2">
                        {isViewMode ? 'Visualización de detalles de la orden' :
                            isEditMode ? 'Modificación de la orden existente' :
                                'Creación y asignación de nuevas tareas de mantenimiento'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/admin/maquinarias/lista-ordenes')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
                        <ClipboardList size={18} />
                        <span>Ver Órdenes Generadas</span>
                    </button>
                    <button type="button" onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gris-oscuro">
                        <Printer size={18} />
                        <span>Imprimir</span>
                    </button>
                    {!isViewMode && (
                        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-verde-principal text-white rounded-lg hover:bg-green-700 font-medium shadow-md">
                            <Save size={18} />
                            <span>{isEditMode ? 'Actualizar Orden' : 'Guardar Orden'}</span>
                        </button>
                    )}
                </div>
            </div>

            {isViewMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300">
                    {/* 1. Datos Generales - Card Compacta */}
                    <div className="bg-white p-5 rounded-xl shadow-card border-l-4 border-l-blue-500 col-span-1">
                        <h3 className="font-bold text-negro-principal mb-3 flex items-center gap-2 border-b pb-2">
                            <FileText size={18} className="text-blue-500" /> General
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="block text-xs text-gris-medio uppercase font-bold">N° Orden</span>
                                <span className="font-mono text-lg font-bold text-negro-principal">{formData.numeroOrden}</span>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <span className="block text-xs text-gris-medio uppercase font-bold">Fecha</span>
                                    <span className="text-sm">{formData.fechaCreacion}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gris-medio uppercase font-bold">Prioridad</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${formData.prioridad === 'Alta' ? 'bg-orange-100 text-orange-700' :
                                            formData.prioridad === 'Crítica' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>{formData.prioridad}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gris-medio uppercase font-bold">Tipo</span>
                                <span className="text-sm border border-gray-200 px-2 py-1 rounded inline-block bg-gray-50">{formData.tipoMantenimiento}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Maquinaria - Card Detalle */}
                    <div className="bg-white p-5 rounded-xl shadow-card border-l-4 border-l-verde-principal col-span-1 md:col-span-2 lg:col-span-1">
                        <h3 className="font-bold text-negro-principal mb-3 flex items-center gap-2 border-b pb-2">
                            <PenTool size={18} className="text-verde-principal" /> Máquina
                        </h3>
                        <div className="space-y-2 text-sm">
                            {maquinaInfo ? (
                                <>
                                    <div className="flex justify-between"><span className="text-gris-medio">Equipo:</span> <span className="font-medium text-right">{maquinaInfo.nombre}</span></div>
                                    <div className="flex justify-between"><span className="text-gris-medio">Código:</span> <span className="font-mono font-medium">{maquinaInfo.codigo_maquinaria}</span></div>
                                    <div className="flex justify-between"><span className="text-gris-medio">Ubicación:</span> <span className="font-medium text-right">{maquinaInfo.ubicacion}</span></div>
                                    <div className="flex justify-between"><span className="text-gris-medio">Marca/Modelo:</span> <span className="text-right text-xs text-gray-500">{maquinaInfo.marca} - {maquinaInfo.modelo}</span></div>
                                </>
                            ) : (
                                <p className="text-gris-medio italic">Sin máquina asignada</p>
                            )}
                        </div>
                    </div>

                    {/* 3. Personal - Card */}
                    <div className="bg-white p-5 rounded-xl shadow-card border-l-4 border-l-orange-500 col-span-1">
                        <h3 className="font-bold text-negro-principal mb-3 flex items-center gap-2 border-b pb-2">
                            <User size={18} className="text-orange-500" /> Personal
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="block text-xs text-gris-medio uppercase font-bold">Técnico</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                        {formData.tecnicoResponsable ? formData.tecnicoResponsable.charAt(0) : '?'}
                                    </div>
                                    <span className="font-medium">{formData.tecnicoResponsable || 'Sin asignar'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gris-medio uppercase font-bold">Turno</span>
                                <span className="text-gray-700">{formData.turno || 'General'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Tiempos - Card */}
                    <div className="bg-white p-5 rounded-xl shadow-card border-l-4 border-l-gray-500 col-span-1">
                        <h3 className="font-bold text-negro-principal mb-3 flex items-center gap-2 border-b pb-2">
                            <Clock size={18} className="text-gray-500" /> Planificación
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="block text-[10px] text-gris-medio uppercase font-bold">Inicio</span>
                                    <span className="block font-medium">{formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString() : 'Pendiente'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gris-medio uppercase font-bold">Fin Est.</span>
                                    <span className="block font-medium">{formData.fechaFinEstimada ? new Date(formData.fechaFinEstimada).toLocaleDateString() : 'Pendiente'}</span>
                                </div>
                            </div>
                            {formData.fechaInicio && formData.fechaFinEstimada && (
                                <div className="text-xs bg-gray-50 p-1.5 rounded text-center text-gray-600">
                                    Duración Est: {Math.ceil((new Date(formData.fechaFinEstimada) - new Date(formData.fechaInicio)) / (1000 * 60 * 60))} hrs
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Descripción y Fallo - Wide */}
                    <div className="bg-white p-5 rounded-xl shadow-card border-t-4 border-t-yellow-500 col-span-1 md:col-span-2 lg:col-span-2">
                        <h3 className="font-bold text-negro-principal mb-3 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-yellow-500" /> Descripción del Problema
                        </h3>
                        <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100 min-h-[120px]">
                            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                                {formData.descripcionFallo || 'Sin descripción detallada.'}
                            </p>
                            {formData.sintomas && (
                                <div className="mt-3 pt-3 border-t border-yellow-200">
                                    <span className="text-xs font-bold text-yellow-800 uppercase">Síntomas:</span>
                                    <span className="text-sm text-yellow-900 ml-2">{formData.sintomas}</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-gris-medio uppercase font-bold">Solicitado Por</span>
                                <span className="text-sm">{formData.solicitanteNombre} <span className="text-gray-400 text-xs">({formData.solicitanteCargo})</span></span>
                            </div>
                            <div>
                                <span className="block text-xs text-gris-medio uppercase font-bold">Contacto</span>
                                <span className="text-sm">{formData.solicitanteContacto || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 6. Repuestos - Table Style */}
                    <div className="bg-white p-5 rounded-xl shadow-card border-t-4 border-t-purple-500 col-span-1 md:col-span-2 lg:col-span-2">
                        <h3 className="font-bold text-negro-principal mb-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-purple-500" /> Repuestos y Materiales
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-xs uppercase">Item / Código</th>
                                        <th className="px-3 py-2 text-center font-medium text-xs uppercase">Cant.</th>
                                        <th className="px-3 py-2 text-right font-medium text-xs uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {formData.repuestos.length > 0 ? (
                                        formData.repuestos.map((r, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 text-gray-800 font-medium">{r.codigo}</td>
                                                <td className="px-3 py-2 text-center text-gray-600">{r.cantidad}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="px-3 py-4 text-center text-gray-400 italic">No hay repuestos solicitados</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 7. Procedimiento - Wide */}
                    <div className="bg-white p-5 rounded-xl shadow-card border-t-4 border-t-indigo-500 col-span-1 md:col-span-2 lg:col-span-4">
                        <h3 className="font-bold text-negro-principal mb-3 flex items-center gap-2">
                            <ClipboardList size={18} className="text-indigo-500" /> Procedimientos y Seguridad
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-gris-medio uppercase mb-2">Pasos a Seguir</h4>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 h-full">
                                    <p className="text-sm whitespace-pre-line text-gray-700">{formData.actividadesProcedimiento || 'No especificado.'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gris-medio uppercase mb-1">EPP / Seguridad</h4>
                                    <p className="text-sm text-indigo-900 bg-indigo-50 p-2 rounded border border-indigo-100">{formData.metodosSeguridad || 'Estándar'}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-white rounded p-2 border border-blue-100 flex-1">
                                        <span className="block text-[10px] text-blue-500 font-bold uppercase">Estado Actual</span>
                                        <span className="font-bold text-lg text-negro-principal capitalize">{formData.estado}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <fieldset disabled={isViewMode || isEditMode} className="contents">

                        {/* 1. Datos Generales */}
                        <section className="bg-white p-6 rounded-xl shadow-card border-l-4 border-l-blue-500">
                            <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-500" /> 1. Datos Generales
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Número de Orden</label>
                                    <input type="text" value={formData.numeroOrden} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gris-medio font-mono" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Fecha de Creación</label>
                                    <input type="date" value={formData.fechaCreacion} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gris-medio" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Tipo de Mantenimiento</label>
                                    <select name="tipoMantenimiento" value={formData.tipoMantenimiento} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal/20 outline-none">
                                        <option>Preventivo</option>
                                        <option>Correctivo</option>
                                        <option>Predictivo</option>
                                        <option>Emergencia</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Prioridad</label>
                                    <select name="prioridad" value={formData.prioridad} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal/20 outline-none">
                                        <option className="text-green-600">Baja</option>
                                        <option className="text-blue-600">Media</option>
                                        <option className="text-orange-500">Alta</option>
                                        <option className="text-red-600 font-bold">Crítica</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 2. Información de Maquinaria */}
                        <section className="bg-white p-6 rounded-xl shadow-card border-l-4 border-l-verde-principal">
                            <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                <PenTool size={20} className="text-verde-principal" /> 2. Información de Maquinaria
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Seleccionar Máquina</label>
                                    <select onChange={handleMaquinaChange} value={formData.maquinaId} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal/20 outline-none" disabled={loadingMaquinas}>
                                        <option value="">{loadingMaquinas ? 'Cargando lista...' : '-- Seleccione Maquinaria --'}</option>
                                        {maquinas.map(m => (
                                            <option key={m.id_maquinaria} value={m.id_maquinaria}>
                                                {m.codigo_maquinaria} - {m.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Campos automáticos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-1">Código Maquinaria</label>
                                        <input type="text" value={maquinaInfo?.codigo_maquinaria || ''} readOnly className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-negro-principal" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-1">Número de Serie</label>
                                        <input type="text" value={maquinaInfo?.numero_serie || ''} readOnly className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-negro-principal" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-1">Marca</label>
                                        <input type="text" value={maquinaInfo?.marca || ''} readOnly className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-negro-principal" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gris-medio uppercase mb-1">Modelo</label>
                                        <input type="text" value={maquinaInfo?.modelo || ''} readOnly className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-negro-principal" />
                                    </div>

                                    {maquinaInfo && (
                                        <>
                                            <div className="md:col-span-2 border-t border-gray-200 pt-3 flex flex-wrap gap-4 text-sm mt-1">
                                                <div>
                                                    <span className="block text-xs text-gris-medio uppercase">Ubicación</span>
                                                    <span className="font-semibold text-negro-principal">{maquinaInfo.ubicacion || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-gris-medio uppercase">Último Mantenimiento</span>
                                                    <span className="font-semibold text-negro-principal">
                                                        {maquinaInfo.ultimo_mantenimiento ? new Date(maquinaInfo.ultimo_mantenimiento).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-gris-medio uppercase">Estado Actual</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold 
                              ${maquinaInfo.estado === 'activa' ? 'bg-green-100 text-green-700' :
                                                            maquinaInfo.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'}`}>
                                                        {maquinaInfo.estado ? maquinaInfo.estado.toUpperCase() : 'DESCONOCIDO'}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                    </fieldset>
                    <fieldset disabled={isViewMode} className="contents">

                        {/* 3. Descripción del Problema */}
                        <section className="bg-white p-6 rounded-xl shadow-card lg:col-span-2 border-l-4 border-l-yellow-500">
                            <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-yellow-500" /> 3. Descripción del Problema
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gris-oscuro mb-1">Descripción del Fallo</label>
                                        <textarea name="descripcionFallo" rows="3" onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-verde-principal" placeholder="Detalle qué está fallando..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gris-oscuro mb-1">Síntomas Observados</label>
                                        <input type="text" name="sintomas" onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-verde-principal" placeholder="Ruidos, vibraciones, fugas..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gris-oscuro mb-1">Adjuntar Evidencia (Fotos/Videos)</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                            <Upload className="mx-auto text-gris-medio mb-2" size={24} />
                                            <p className="text-sm text-gris-medio">Click para subir archivos</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg h-fit">
                                    <h3 className="font-semibold text-sm text-negro-principal mb-3">Persona que reporta</h3>
                                    <div className="space-y-3">
                                        <input type="text" name="solicitanteNombre" value={formData.solicitanteNombre} onChange={handleInputChange} placeholder="Nombre completo" className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm" />
                                        <input type="text" name="solicitanteCargo" value={formData.solicitanteCargo} onChange={handleInputChange} placeholder="Cargo" className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm" />
                                        <input type="text" name="solicitanteContacto" value={formData.solicitanteContacto} onChange={handleInputChange} placeholder="Contacto / Anexo" className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Recursos Necesarios */}
                        <section className="bg-white p-6 rounded-xl shadow-card border-l-4 border-l-purple-500">
                            <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-purple-500" /> 4. Recursos y Repuestos
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gris-medio">Lista de Materiales</span>
                                    <button type="button" onClick={addRepuesto} className="text-xs flex items-center gap-1 text-verde-principal font-bold hover:underline">
                                        <Plus size={14} /> Agregar Item
                                    </button>
                                </div>

                                {formData.repuestos.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input type="text" placeholder="Cód. Repuesto" value={item.codigo} onChange={(e) => updateRepuesto(idx, 'codigo', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                                        <input type="number" placeholder="Cant." value={item.cantidad} onChange={(e) => updateRepuesto(idx, 'cantidad', e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                                        <button type="button" onClick={() => removeRepuesto(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash size={14} /></button>
                                    </div>
                                ))}
                                {formData.repuestos.length === 0 && <p className="text-sm text-gray-400 italic text-center py-2">No se han añadido repuestos.</p>}

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Herramientas Especiales</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. Extractor de rodamientos..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Presupuesto Estimado (S/)</label>
                                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                                </div>
                            </div>
                        </section>

                        {/* 5. Personal y 6. Planificación */}
                        <section className="bg-white p-6 rounded-xl shadow-card border-l-4 border-l-orange-500">
                            <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                <User size={20} className="text-orange-500" /> 5. Personal y Planificación (6)
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Técnico Responsable</label>
                                    <select name="tecnicoResponsable" onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none">
                                        <option value="">-- Asignar Técnico --</option>
                                        <option>Juan Pérez (Mecánico)</option>
                                        <option>Carlos Díaz (Eléctrico)</option>
                                        <option>Empresa Externa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Equipo de Apoyo</label>
                                    <input type="text" name="equipoApoyo" onChange={handleInputChange} value={formData.equipoApoyo || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nombres separados por comas" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 bg-orange-50/50 p-3 rounded-lg">
                                    <div>
                                        <label className="block text-xs font-bold text-gris-oscuro uppercase mb-1">Fecha Inicio</label>
                                        <input type="datetime-local" name="fechaInicio" onChange={handleInputChange} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gris-oscuro uppercase mb-1">Fecha Fin Est.</label>
                                        <input type="datetime-local" name="fechaFinEstimada" onChange={handleInputChange} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Turno / Horario</label>
                                    <input type="text" name="turno" value={formData.turno} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. Turno Noche (22:00 - 06:00)" />
                                </div>

                            </div>
                        </section>

                        {/* 7. Procedimiento */}
                        <section className="bg-white p-6 rounded-xl shadow-card lg:col-span-2 border-l-4 border-l-indigo-500">
                            <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-indigo-500" /> 7. Procedimientos y Actividades
                            </h2>
                            <div className="space-y-4">
                                <textarea name="actividadesProcedimiento" onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[100px] outline-none" placeholder="1. Verificar desconexión eléctrica&#10;2. Desmontar cubierta protectora..."></textarea>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gris-oscuro mb-1">Métodos de Seguridad (EPP)</label>
                                        <input type="text" name="metodosSeguridad" onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Guantes, Lentes, Bloqueo LOTO..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gris-oscuro mb-1">Normativas Aplicables</label>
                                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="ISO 45001, Manual Fabricante..." />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Estado y Seguimiento (Inicial) */}
                        <section className="bg-white p-6 rounded-xl shadow-card border-l-4 border-l-gray-500">
                            <h2 className="text-lg font-bold text-negro-principal mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-gray-500" /> 8. Estado Inicial
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Estado de la Orden</label>
                                    <div className="px-3 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100">
                                        Abierto (Borrador)
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gris-oscuro mb-1">Comentarios Iniciales</label>
                                    <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows="2" placeholder="Notas adicionales para el técnico..."></textarea>
                                </div>
                            </div>
                        </section>

                        {/* 9. Cierre (Deshabilitado en creación) */}
                        <section className="bg-white p-6 rounded-xl shadow-card opacity-60 border-l-4 border-l-gray-300 relative group">
                            <h2 className="text-lg font-bold text-negro-principal mb-2 flex items-center gap-2">
                                <CheckCircle size={20} className="text-gray-400" /> 9. Cierre (Solo Técnico)
                            </h2>
                            <p className="text-sm text-gris-medio mb-4">Esta sección se habilitará cuando la orden pase a ejecución.</p>
                            <div className="grid grid-cols-2 gap-4 pointer-events-none filter blur-[1px]">
                                <input type="text" disabled placeholder="Trabajo Realizado" className="col-span-2 border border-gray-200 p-2 rounded" />
                                <input type="text" disabled placeholder="Costo Final" className="border border-gray-200 p-2 rounded" />
                                <input type="text" disabled placeholder="Firma Supervisor" className="border border-gray-200 p-2 rounded" />
                            </div>
                            {/* Overlay tooltip */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm font-bold text-gris-oscuro">
                                Disponible al completar orden
                            </div>
                        </section>

                        {/* 10. Reportes (Actions) */}
                        <section className="bg-white p-6 rounded-xl shadow-card lg:col-span-2 flex justify-between items-center border-t-4 border-t-verde-principal/20">
                            <div>
                                <h2 className="text-lg font-bold text-negro-principal mb-1">10. Reportes y Acciones</h2>
                                <p className="text-sm text-gris-medio">Opciones disponibles tras generar la orden</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-verde-principal text-white rounded-lg hover:bg-green-700 font-medium shadow-md">
                                    <Save size={18} />
                                    <span>Guardar Orden</span>
                                </button>
                            </div>
                        </section>

                    </fieldset>
                </form>
            )}

            {/* Print Template - Only visible when printing */}
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
                                <td>{maquinaInfo?.ubicacion || '---'}</td>
                                <td className="print-header-cell w-[120px]">NUMERO OT:</td>
                                <td className="font-mono text-lg">{formData.numeroOrden}</td>
                            </tr>
                            <tr>
                                <td className="print-header-cell">EQUIPO O MAQUINA:</td>
                                <td>{maquinaInfo?.nombre || '---'}</td>
                                <td className="print-header-cell">CODIGO MAQ O EQ:</td>
                                <td>{maquinaInfo?.codigo_maquinaria || '---'}</td>
                            </tr>
                            <tr>
                                <td className="print-header-cell">FECHA DE SOLICITUD:</td>
                                <td>{formData.fechaCreacion}</td>
                                <td className="print-header-cell">HORA DE SOLICITUD:</td>
                                <td>08:00 AM</td>
                            </tr>
                            <tr>
                                <td className="print-header-cell">NOMBRE SOLICITANTE:</td>
                                <td colSpan="3">{formData.solicitanteNombre || '---'} ({formData.solicitanteCargo || 'Cargo N/A'})</td>
                            </tr>
                            <tr>
                                <td className="print-header-cell">NOMBRE DEL TECNICO:</td>
                                <td colSpan="3">{formData.tecnicoResponsable || 'POR ASIGNAR'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Section 2: Description */}
                    <div className="border-b border-black">
                        <div className="bg-gray-100 border-b border-black p-1 text-center font-bold text-xs uppercase">Descripción del Servicio de Mantenimiento</div>
                        <div className="h-[100px] p-2 text-sm whitespace-pre-wrap">
                            {formData.descripcionFallo || 'Sin descripción detallada.'}
                            {formData.sintomas && (
                                <div className="mt-2 text-xs text-gray-600">
                                    <span className="font-bold">Síntomas:</span> {formData.sintomas}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3 & 4: Checkboxes */}
                    <div className="flex border-b border-black">
                        {/* Tipo Mantenimiento */}
                        <div className="w-1/3 border-r border-black">
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">TIPO MANTENIMIENTO</div>
                            <div className="p-2 space-y-1">
                                {['Preventivo', 'Correctivo', 'Predictivo', 'Otro'].map(type => (
                                    <div key={type} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border border-black flex items-center justify-center ${formData.tipoMantenimiento === type ? 'bg-black text-white' : ''}`}>
                                            {formData.tipoMantenimiento === type ? 'X' : ''}
                                        </div>
                                        <span>{type.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Priority */}
                        <div className="w-1/3 border-r border-black">
                            <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">PRIORIDAD</div>
                            <div className="p-2 space-y-1">
                                {['Alta', 'Media', 'Baja'].map(prio => (
                                    <div key={prio} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border border-black flex items-center justify-center ${formData.prioridad === prio ? 'bg-black text-white' : ''}`}>
                                            {formData.prioridad === prio ? 'X' : ''}
                                        </div>
                                        <span>{prio.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Causa */}
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

                    {/* Section: Personal y Planificación (Added as requested) */}
                    <div className="border-b border-black">
                        <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">PERSONAL Y PLANIFICACIÓN</div>
                        <table className="print-table border-none">
                            <tbody>
                                <tr>
                                    <td className="print-header-cell w-[150px]">TÉCNICO RESPONSABLE:</td>
                                    <td>{formData.tecnicoResponsable || '---'}</td>
                                    <td className="print-header-cell w-[100px]">TURNO:</td>
                                    <td>{formData.turno || '---'}</td>
                                </tr>
                                <tr>
                                    <td className="print-header-cell">EQUIPO DE APOYO:</td>
                                    <td colSpan="3">{formData.equipoApoyo || 'Sin equipo de apoyo asignado'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section: Procedimientos y Actividades (Added as requested) */}
                    <div className="border-b border-black">
                        <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">PROCEDIMIENTOS Y ACTIVIDADES</div>
                        <div className="p-2 min-h-[50px] text-xs whitespace-pre-wrap">
                            {formData.actividadesProcedimiento || 'Sin procedimientos específicos registrados.'}
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
                                {formData.repuestos.length > 0 ? (
                                    formData.repuestos.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td>{item.codigo}</td>
                                            <td className="text-center">UND</td>
                                            <td className="text-center">{item.cantidad}</td>
                                            <td className="text-center">{formData.fechaCreacion}</td>
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
                                    <td className="h-8 text-center">{formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString() : ''}</td>
                                    <td className="text-center">{formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                                    <td className="text-center"></td>
                                    <td className="text-center">{formData.fechaFinEstimada ? new Date(formData.fechaFinEstimada).toLocaleDateString() : ''}</td>
                                    <td className="text-center"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 7: Seguridad */}
                    <div className="border-b border-black">
                        <div className="bg-gray-100 border-b border-black p-1 text-center font-bold">INDICACIONES DE SEGURIDAD</div>
                        <div className="p-2 h-16 border-b border-black">
                            {formData.metodosSeguridad || 'Usar EPP estandar: Guantes, Lentes, Zapatos de seguridad, Casco.'}
                        </div>
                    </div>

                    {/* Footer: Firmas */}
                    <div className="flex h-32">
                        <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between">
                            <span className="text-[10px] font-bold">SOLICITADO POR:</span>
                            <div className="text-center border-t border-black pt-1">
                                {formData.solicitanteNombre || 'Firma Solicitante'}
                            </div>
                        </div>
                        <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between">
                            <span className="text-[10px] font-bold">REALIZADO POR:</span>
                            <div className="text-center border-t border-black pt-1">
                                {formData.tecnicoResponsable || 'Firma Técnico'}
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
        </div>
    );
};

export default AdminOrdenMantenimiento;
