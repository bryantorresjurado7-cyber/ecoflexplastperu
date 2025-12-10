import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Filter, Download, TrendingUp, DollarSign, Package, Calendar, X, Settings, ArrowUpRight } from 'lucide-react';
import * as XLSX from 'xlsx';

// Credenciales y URL API
const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4';

const AdminProyeccionVentas = () => {
    // Configuración inicial de fechas: 1 de Enero del año actual hasta Hoy
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    // Función para formatear fechas a YYYY-MM-DD string local
    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const [startDate, setStartDate] = useState(formatDate(firstDayOfYear));
    const [endDate, setEndDate] = useState(formatDate(today));

    // Configuración de Proyección (Escenarios)
    const [projSettings, setProjSettings] = useState({
        // 6. Administrativas
        nombreEscenario: 'Escenario Base',

        // 1. Ventas Básicas
        precioPromedio: 25,
        unidadesEstimadas: 1000,
        ticketPromedio: 0,

        // 2. Crecimiento
        crecimientoMensual: 15, // % Base
        mesesProyectar: 12,

        // Estacionalidad (Nuevo)
        variacionesMensuales: {
            0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
            6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0
        },

        // 3. Costos
        costosFijos: 15000,
        costoVariable: 10,

        // 4. Inventario
        stockInicial: 500,
        puntoReposicion: 100,
        tiempoReposicion: 7, // días

        // 5. Metas
        metaMensual: 50000, // Valor referencial / fallback
        metasMensuales: {
            0: 50000, 1: 50000, 2: 50000, 3: 50000, 4: 50000, 5: 50000,
            6: 50000, 7: 50000, 8: 50000, 9: 50000, 10: 50000, 11: 50000
        },
        metaAnual: 600000,
        metaUnidades: 2000,

        // Legacy/Computed
        capacidad: 10000,
        diasOperativos: 26
    });
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Datos y estados de carga
    const [productData, setProductData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState('');

    useEffect(() => {
        loadSalesAnalytics();
    }, [startDate, endDate, projSettings]); // Recargar si cambian los settings

    const loadSalesAnalytics = async () => {
        setLoading(true);
        setLoadingProgress('Cargando lista de ventas...');

        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos?limit=2000&estado=confirmado`, {
                headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });

            const result = await response.json();
            if (!result.success || !result.data) throw new Error('Error al cargar ventas');

            const allSales = result.data;
            const filteredSales = filterSalesByDateRange(allSales, startDate, endDate);

            // Procesar Tendencia Global usando los settings
            processTrendData(filteredSales, startDate, endDate);

            if (filteredSales.length === 0) {
                setProductData([]);
                setLoading(false);
                return;
            }

            setLoadingProgress(`Analizando detalle de productos (${filteredSales.length} ventas)...`);
            await processProductDetails(filteredSales);

        } catch (error) {
            console.error('Error cargando analítica:', error);
            setMonthlyData([]);
            setProductData([]);
        } finally {
            setLoading(false);
            setLoadingProgress('');
        }
    };

    const filterSalesByDateRange = (sales, start, end) => {
        // Parsear manualmente para asegurar comparación local
        const [sy, sm, sd] = start.split('-').map(Number);
        const [ey, em, ed] = end.split('-').map(Number);

        const startDateObj = new Date(sy, sm - 1, sd, 0, 0, 0); // Inicio del día
        const endDateObj = new Date(ey, em - 1, ed, 23, 59, 59); // Fin del día

        return sales.filter(sale => {
            const saleDate = new Date(sale.fecha_pedido || sale.created_at);
            return saleDate >= startDateObj && saleDate <= endDateObj;
        });
    };

    const processTrendData = (sales, start, end) => {
        // Parsear manualmente para asegurar hora local 00:00 y evitar desfase de zona horaria
        const [sy, sm, sd] = start.split('-').map(Number);
        const [ey, em, ed] = end.split('-').map(Number);

        const startD = new Date(sy, sm - 1, sd);
        const endD = new Date(ey, em - 1, ed);

        const diffTime = Math.abs(endD - startD);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isDaily = diffDays <= 60;

        let trendMap = new Map();

        // Max Revenue Cap = Capacidad * Precio Promedio
        const maxRevenue = projSettings.capacidad * projSettings.precioPromedio;
        const growthFactor = 1 + (projSettings.crecimientoMensual / 100);

        if (isDaily) {
            for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
                // Generar etiqueta en español
                const label = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
                // Clave YYYY-MM-DD local
                const year = d.getFullYear();
                const monthInfo = d.getMonth(); // 0-11
                const monthStr = String(monthInfo + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const key = `${year}-${monthStr}-${day}`;

                trendMap.set(key, { name: label, real: 0, proyectado: 0, sortKey: key, monthIndex: monthInfo });
            }
        } else {
            let current = new Date(startD.getFullYear(), startD.getMonth(), 1);
            const endMonth = new Date(endD.getFullYear(), endD.getMonth(), 1);
            while (current <= endMonth) {
                const label = current.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
                const key = `${current.getFullYear()}-${current.getMonth()}`;
                trendMap.set(key, { name: label, real: 0, proyectado: 0, sortKey: current.getTime(), monthIndex: current.getMonth() });
                current.setMonth(current.getMonth() + 1);
            }
        }

        sales.forEach(sale => {
            const date = new Date(sale.fecha_pedido || sale.created_at);
            let key;

            if (isDaily) {
                // Usar métodos locales del objeto date original
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                key = `${year}-${month}-${day}`;
            } else {
                key = `${date.getFullYear()}-${date.getMonth()}`;
            }

            if (trendMap.has(key)) {
                const current = trendMap.get(key);
                current.real += parseFloat(sale.total || 0);
                trendMap.set(key, current);
            }
        });

        const sortedData = Array.from(trendMap.values()).map(item => {
            // Obtener meta específica del mes o fallback a la global
            const monthlyGoal = projSettings.metasMensuales[item.monthIndex] !== undefined
                ? projSettings.metasMensuales[item.monthIndex]
                : projSettings.metaMensual;

            // Calcular factor de crecimiento (Escenario)
            const monthAdj = projSettings.variacionesMensuales[item.monthIndex] || 0;
            const totalGrowthPercent = projSettings.crecimientoMensual + monthAdj;
            const growthFactor = 1 + (totalGrowthPercent / 100);

            let projectedBase = isDaily
                ? (monthlyGoal / projSettings.diasOperativos)
                : monthlyGoal;

            // La proyección es la Meta Mensual ajustada por el factor de crecimiento del escenario
            let projected = projectedBase * growthFactor;
            const periodCap = isDaily ? (maxRevenue / projSettings.diasOperativos) : maxRevenue;

            if (projected > periodCap) projected = periodCap;

            return {
                ...item,
                real: parseFloat(item.real.toFixed(2)),
                proyectado: parseFloat(projected.toFixed(2))
            };
        });

        setMonthlyData(sortedData);
    };

    const processProductDetails = async (sales) => {
        const productMap = {};
        const BATCH_SIZE = 5;
        const growthFactor = 1 + (projSettings.crecimientoMensual / 100);

        for (let i = 0; i < sales.length; i += BATCH_SIZE) {
            const batch = sales.slice(i, i + BATCH_SIZE);
            setLoadingProgress(`Analizando productos... ${Math.min(i + BATCH_SIZE, sales.length)} / ${sales.length}`);
            await Promise.all(batch.map(async (sale) => {
                try {
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/crud-pedidos/pedidos/${sale.id_pedido}`, {
                        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
                    });
                    const resJson = await res.json();
                    if (resJson.success && resJson.data && resJson.data.detalles) {
                        resJson.data.detalles.forEach(detalle => {
                            if (!detalle.producto) return;
                            const prodName = detalle.producto.nombre;
                            const prodCat = detalle.producto.categoria || 'General';
                            const cantidad = parseFloat(detalle.cantidad || 0);
                            if (!productMap[prodName]) {
                                productMap[prodName] = { name: prodName, categoria: prodCat, cantidadReal: 0 };
                            }
                            productMap[prodName].cantidadReal += cantidad;
                        });
                    }
                } catch (err) { console.error('Error fetching details', err); }
            }));
        }

        const productsList = Object.values(productMap).map(p => {
            const projectedUnits = Math.ceil(p.cantidadReal * growthFactor);
            const growth = ((projectedUnits - p.cantidadReal) / p.cantidadReal) * 100;
            return {
                ...p,
                proyeccion: projectedUnits,
                crecimiento: `+${growth.toFixed(0)}%`
            };
        }).sort((a, b) => b.cantidadReal - a.cantidadReal);

        setProductData(productsList);
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.json_to_sheet(monthlyData);
        XLSX.utils.book_append_sheet(wb, ws1, "Tendencia");
        XLSX.writeFile(wb, `Proyeccion_${startDate}.xlsx`);
    };

    const totalRealAnnual = monthlyData.reduce((acc, curr) => acc + curr.real, 0);
    const totalProjectedAnnual = monthlyData.reduce((acc, curr) => acc + curr.proyectado, 0);
    const topProduct = productData.length > 0 ? productData[0] : { name: '-', cantidadReal: 0 };

    return (
        <div className="p-6 md:p-8 space-y-8 bg-fondo-claro min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-negro-principal flex items-center gap-3">
                        <TrendingUp className="text-verde-principal" size={32} />
                        Proyección de Ventas
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold uppercase">{projSettings.nombreEscenario}</span>
                        <p className="text-gris-medio">Analítica avanzada y simulación</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-verde-principal text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm h-[42px]"
                    >
                        <Settings size={18} />
                        <span className="hidden md:inline">Configurar Escenario</span>
                    </button>

                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-negro-principal hover:bg-gray-50 transition-colors shadow-sm h-[42px]"
                    >
                        <Download size={18} />
                        <span className="hidden md:inline">Exportar</span>
                    </button>

                    {/* Filtro de Rango de Fechas */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 px-2 border-r border-gray-200">
                            <span className="text-xs text-gris-medio font-medium uppercase">Desde</span>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="py-1 text-sm font-medium text-negro-principal focus:outline-none focus:text-verde-principal bg-transparent min-w-[120px]" />
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-xs text-gris-medio font-medium uppercase">Hasta</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="py-1 text-sm font-medium text-negro-principal focus:outline-none focus:text-verde-principal bg-transparent min-w-[120px]" />
                        </div>
                        <button onClick={() => { setStartDate(formatDate(firstDayOfYear)); setEndDate(formatDate(today)); }} title="Limpiar fechas (Ver este año)" className="p-2 text-gris-medio hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><X size={16} /></button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-card flex items-center gap-4 border-l-4 border-verde-principal">
                    <div className="p-3 bg-gray-50 rounded-lg"><DollarSign className="text-negro-principal" size={24} /></div>
                    <div>
                        <p className="text-sm text-gris-medio font-medium">Venta Real Periodo</p>
                        <p className="text-2xl font-bold text-negro-principal">S/ {totalRealAnnual.toLocaleString('es-PE')}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-card flex items-center gap-4 border-l-4 border-blue-500">
                    <div className="p-3 bg-gray-50 rounded-lg"><Package className="text-negro-principal" size={24} /></div>
                    <div>
                        <p className="text-sm text-gris-medio font-medium">Producto Top</p>
                        <p className="text-xl font-bold text-negro-principal truncate max-w-[150px]" title={topProduct.name}>{topProduct.name}</p>
                        <span className="text-xs text-blue-600 font-medium">{topProduct.cantidadReal} un.</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-card flex items-center gap-4 border-l-4 border-purple-500">
                    <div className="p-3 bg-gray-50 rounded-lg"><ArrowUpRight className="text-negro-principal" size={24} /></div>
                    <div>
                        <p className="text-sm text-gris-medio font-medium">Proyección ({projSettings.crecimientoMensual}% crec.)</p>
                        <p className="text-2xl font-bold text-negro-principal text-purple-600">S/ {totalProjectedAnnual.toLocaleString('es-PE')}</p>
                        <span className="text-xs text-gris-medio">Meta Mensual: S/ {projSettings.metaMensual.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-card h-[600px] flex flex-col">
                    <h3 className="text-lg font-bold text-negro-principal mb-2">Tendencia de Valor (S/)</h3>
                    <p className="text-sm text-gris-medio mb-6">Escenario: {projSettings.nombreEscenario}</p>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00A859" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#00A859" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(val) => [`S/ ${val.toLocaleString()}`, undefined]} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="real" stroke="#00A859" fill="url(#colorReal)" name="Venta Real" activeDot={{ r: 6 }} />
                                <Area type="monotone" dataKey="proyectado" stroke="#7C3AED" fill="url(#colorProy)" name="Meta / Proyección" activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-card h-[600px] flex flex-col">
                    <h3 className="text-lg font-bold text-negro-principal mb-2">Composición (Unidades)</h3>
                    <p className="text-sm text-gris-medio mb-6">Desglose vs Meta ({projSettings.metaUnidades} un. objetivo)</p>
                    {productData.length > 0 ? (
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div style={{ height: `${Math.max(450, productData.length * 60)}px` }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={productData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={130} tick={{ fill: '#4B5563', fontSize: 11 }} interval={0} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(val) => [`${val} un.`, undefined]} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="cantidadReal" name="Real" fill="#00A859" radius={[0, 4, 4, 0]} barSize={16} />
                                        <Bar dataKey="proyeccion" name="Proyectado" fill="#1F2937" radius={[0, 4, 4, 0]} barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gris-medio">
                            <Package size={48} className="mb-4 opacity-20" />
                            <p>No hay datos disponibles.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Configuración REDESIGNED */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-200">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-bold text-negro-principal flex items-center gap-2">
                                    <Settings size={20} className="text-verde-principal" />
                                    Configuración de Escenario
                                </h3>
                                <p className="text-sm text-gris-medio mt-1">Ajusta las variables para simular proyecciones futuras.</p>
                            </div>
                            <button onClick={() => setShowSettingsModal(false)} className="text-gris-medio hover:text-negro-principal transition-colors bg-gray-100 p-2 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* 6. Administrativas */}
                            <div className="lg:col-span-3">
                                <label className="block text-sm font-bold text-gris-oscuro mb-2">🟦 Nombre del Escenario</label>
                                <input
                                    type="text"
                                    value={projSettings.nombreEscenario}
                                    onChange={(e) => setProjSettings({ ...projSettings, nombreEscenario: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal/20 focus:border-verde-principal outline-none font-medium"
                                    placeholder="Ej. Proyección Optimista 2025"
                                />
                            </div>

                            {/* 1. Ventas Básicas */}
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">1. Ventas Básicas</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Precio Promedio (S/)</label>
                                        <input type="number" value={projSettings.precioPromedio} onChange={(e) => setProjSettings({ ...projSettings, precioPromedio: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Unidades Est. / Mes</label>
                                        <input type="number" value={projSettings.unidadesEstimadas} onChange={(e) => setProjSettings({ ...projSettings, unidadesEstimadas: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Ticket Promedio (Alt.)</label>
                                        <input type="number" value={projSettings.ticketPromedio} onChange={(e) => setProjSettings({ ...projSettings, ticketPromedio: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Crecimiento */}
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">2. Crecimiento</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Crecimiento Mensual (%)</label>
                                        <input type="number" value={projSettings.crecimientoMensual} onChange={(e) => setProjSettings({ ...projSettings, crecimientoMensual: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Meses a Proyectar</label>
                                        <input type="number" value={projSettings.mesesProyectar} onChange={(e) => setProjSettings({ ...projSettings, mesesProyectar: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Días Operativos / Mes</label>
                                        <input type="number" value={projSettings.diasOperativos} onChange={(e) => setProjSettings({ ...projSettings, diasOperativos: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                </div>
                            </div>

                            {/* 5. Metas (Objetivos) */}
                            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 lg:col-span-3">
                                <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">5. Metas y Objetivos</h4>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1/3">
                                            <label className="block text-xs font-bold text-gris-oscuro mb-1">Meta Mensual Base (S/)</label>
                                            <input
                                                type="number"
                                                value={projSettings.metaMensual}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    // Actualizar base y todas las metas individuales por defecto para facilitar edición
                                                    const newMetas = {};
                                                    for (let i = 0; i < 12; i++) newMetas[i] = val;
                                                    setProjSettings({ ...projSettings, metaMensual: val, metasMensuales: newMetas });
                                                }}
                                                className="w-full border border-purple-300 bg-white rounded px-2 py-1 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-xs font-medium text-gris- medio mb-1">Meta Anual Global (S/)</label>
                                            <input type="number" value={projSettings.metaAnual} onChange={(e) => setProjSettings({ ...projSettings, metaAnual: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-xs font-medium text-gris- medio mb-1">Meta Unidades (Total)</label>
                                            <input type="number" value={projSettings.metaUnidades} onChange={(e) => setProjSettings({ ...projSettings, metaUnidades: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                        </div>
                                    </div>

                                    {/* Grid de Metas Mensuales */}
                                    <div>
                                        <label className="block text-xs font-bold text-gris-oscuro mb-2">Metas Específicas por Mes (S/)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'].map((mes, idx) => (
                                                <div key={idx} className="flex flex-col">
                                                    <span className="text-[10px] text-gris-medio uppercase font-bold mb-1">{mes}</span>
                                                    <input
                                                        type="number"
                                                        value={projSettings.metasMensuales[idx]}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setProjSettings(prev => ({
                                                                ...prev,
                                                                metasMensuales: {
                                                                    ...prev.metasMensuales,
                                                                    [idx]: val
                                                                }
                                                            }));
                                                        }}
                                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-negro-principal focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Costos */}
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">3. Estructura de Costos</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Costos Fijos (Mes)</label>
                                        <input type="number" value={projSettings.costosFijos} onChange={(e) => setProjSettings({ ...projSettings, costosFijos: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Costo Var. Unidad</label>
                                        <input type="number" value={projSettings.costoVariable} onChange={(e) => setProjSettings({ ...projSettings, costoVariable: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Capacidad Máxima (Unid)</label>
                                        <input type="number" value={projSettings.capacidad} onChange={(e) => setProjSettings({ ...projSettings, capacidad: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Inventario */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">4. Inventario / Stock</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gris- medio mb-1">Stock Inicial</label>
                                        <input type="number" value={projSettings.stockInicial} onChange={(e) => setProjSettings({ ...projSettings, stockInicial: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gris- medio mb-1">Punto Repos.</label>
                                            <input type="number" value={projSettings.puntoReposicion} onChange={(e) => setProjSettings({ ...projSettings, puntoReposicion: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gris- medio mb-1">Tiempo (Días)</label>
                                            <input type="number" value={projSettings.tiempoReposicion} onChange={(e) => setProjSettings({ ...projSettings, tiempoReposicion: Number(e.target.value) })} className="input-field-sm w-full border-gray-300 rounded px-2 py-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="bg-verde-principal/5 p-4 rounded-xl border border-verde-principal/20 h-full flex flex-col justify-center items-center text-center">
                                    <TrendingUp className="text-verde-principal mb-2" size={32} />
                                    <p className="text-sm font-medium text-gris-oscuro">Simulación en Tiempo Real</p>
                                    <p className="text-xs text-gris-medio mt-1">Los cambios se aplican automáticamente a los gráficos.</p>
                                </div>
                            </div>

                        </div>

                        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="py-2 px-6 border border-gray-300 rounded-lg text-negro-principal font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="py-2 px-6 bg-verde-principal text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
                            >
                                Guardar Escenario
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal mb-4"></div>
                        <p className="font-semibold text-negro-principal">Actualizando escenarios...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProyeccionVentas;
