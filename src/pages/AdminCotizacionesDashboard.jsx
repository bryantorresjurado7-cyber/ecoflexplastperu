import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import NotificationButton from '../components/NotificationButton'
import { supabase } from '../lib/supabase'
import {
    FileText,
    TrendingUp,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Calendar,
    ArrowRight,
    ArrowLeft,
    MessageCircle,
    Globe,
    Phone,
    Mail,
    Plus
} from 'lucide-react'

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMTksImV4cCI6MjA3MjQ0MDAxOX0.EuCWuFr6W-pv8_QBgjbEWzDmnI-iA5L4rFr5CMWpNl4'

const AdminCotizacionesDashboard = () => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalMes: 0,
        enProceso: 0,
        completadas: 0,
        pendientes: 0,
        canceladas: 0,
        conversion: 0,
        montoCotizado: 0,
        montoVendido: 0,
        porVencer: [],
        topClientes: [],
        recientes: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)

            // Obtener sesión igual que en AdminCotizaciones
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            console.log('🔄 Dashboard: Iniciando carga de datos...')

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/crud-cotizaciones/cotizaciones?limit=1000`,
                {
                    method: 'GET',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            const result = await response.json()

            console.log('📦 Dashboard: Datos recibidos:', result)

            if (result.success && result.data) {
                processData(result.data)
            } else {
                console.error('❌ Error en respuesta:', result.error)
            }
        } catch (error) {
            console.error('❌ Error cargando datos de dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const processData = (data) => {
        // Inicializar contadores
        let total = 0
        let enProceso = 0
        let completadas = 0
        let pendientes = 0
        let canceladas = 0
        let montoCotizado = 0
        let montoVendido = 0
        const clientesMap = {}

        data.forEach(cot => {
            total++
            // Sumar montos
            const monto = parseFloat(cot.total || 0)
            montoCotizado += monto

            // Estados (normalizar texto)
            const estado = (cot.estado || '').toLowerCase().trim()
            if (estado === 'completada' || estado === 'aprobada') {
                completadas++
                montoVendido += monto
            } else if (estado === 'pendiente') {
                pendientes++
            } else if (estado === 'en_proceso' || estado === 'en proceso') {
                enProceso++
            } else if (estado === 'cancelada' || estado === 'rechazada') {
                canceladas++
            } else {
                pendientes++ // Default
            }

            // Clientes Stats
            const clienteName = Array.isArray(cot.cliente) ? cot.cliente[0]?.nombre : cot.cliente?.nombre
            if (clienteName) {
                if (!clientesMap[clienteName]) {
                    clientesMap[clienteName] = { count: 0, totalAmount: 0 }
                }
                clientesMap[clienteName].count++
                clientesMap[clienteName].totalAmount += monto
            }
        })

        // Calcular Top Clientes
        const topClientes = Object.entries(clientesMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5)

        // Próximas a vencer (Simulado basado en fecha reciente si no hay fecha_vencimiento)
        // O simplemente mostrar las pendientes más antiguas o recientes
        const porVencer = data
            .filter(c => (c.estado === 'pendiente' || c.estado === 'en_proceso'))
            .sort((a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision)) // Las más antiguas primero
            .slice(0, 5)
            .map(c => ({
                id: c.id_cotizacion || c.id,
                cliente: Array.isArray(c.cliente) ? c.cliente[0]?.nombre : c.cliente?.nombre,
                fecha: c.fecha_emision || c.created_at,
                monto: parseFloat(c.total || 0)
            }))

        const conversion = total > 0 ? ((completadas / total) * 100).toFixed(1) : 0

        setStats({
            totalMes: total,
            enProceso,
            completadas,
            pendientes,
            canceladas,
            montoCotizado,
            montoVendido,
            conversion,
            topClientes,
            porVencer
        })
    }

    // Componente de Gráfico de Barras Simple
    const BarChart = ({ label, value, max, color = "bg-blue-500" }) => (
        <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className="text-gray-900 font-bold">{value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${color}`}
                    style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
                ></div>
            </div>
        </div>
    )

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-4">
                    {/* Botón Volver ahora parte del título */}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Link to="/admin/dashboard" className="p-2 rounded-full border-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-sky-50 transition-colors" title="Volver al Dashboard">
                                <ArrowLeft size={24} strokeWidth={2.5} />
                            </Link>
                            <h1 className="text-3xl font-bold text-negro-principal">
                                Dashboard de Cotizaciones
                            </h1>
                        </div>
                        <p className="text-gris-medio mt-1 ml-16">Visión general del rendimiento comercial</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <NotificationButton />
                        <Link
                            to="/admin/cotizaciones"
                            className="bg-negro-principal hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
                        >
                            <FileText size={20} />
                            Gestionar Cotizaciones
                        </Link>
                        <Link
                            to="/admin/cotizaciones/nueva"
                            className="bg-verde-principal hover:bg-verde-hover text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={20} />
                            Nueva Cotización
                        </Link>
                    </div>
                </div>

                {/* 1. KPIs Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-blue-500">
                        <p className="text-sm text-gray-500 font-medium">Total Cotizaciones</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMes}</h3>
                        <div className="flex items-center gap-1 text-blue-600 text-sm mt-2">
                            <FileText size={16} />
                            <span>Histórico Total</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-green-500">
                        <p className="text-sm text-gray-500 font-medium">Tasa de Cierre</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.conversion}%</h3>
                        <p className="text-sm text-gray-400 mt-2">{stats.completadas} completadas</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-purple-500">
                        <p className="text-sm text-gray-500 font-medium">Monto Cotizado</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">
                            {stats.montoCotizado.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">Total acumulado</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-card border-l-4 border-emerald-600">
                        <p className="text-sm text-gray-500 font-medium">Ventas Cerradas</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">
                            {stats.montoVendido.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">Ingresos confirmados</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* 2. Estado de Cotizaciones */}
                    <div className="bg-white p-6 rounded-xl shadow-card">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            Estado de Cotizaciones
                        </h3>
                        <div className="space-y-4">
                            <BarChart label="Completadas / Aprobadas" value={stats.completadas} max={stats.totalMes} color="bg-emerald-500" />
                            <BarChart label="En Proceso" value={stats.enProceso} max={stats.totalMes} color="bg-blue-500" />
                            <BarChart label="Pendientes" value={stats.pendientes} max={stats.totalMes} color="bg-yellow-400" />
                            <BarChart label="Canceladas" value={stats.canceladas} max={stats.totalMes} color="bg-red-500" />
                        </div>
                    </div>

                    {/* 8. Cotizaciones pendientes (Prioridad) */}
                    <div className="bg-white p-6 rounded-xl shadow-card lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-orange-500" />
                            Pendientes y En Proceso (Más antiguas primero)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Monto</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.porVencer.length > 0 ? (
                                        stats.porVencer.map((cot, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(cot.fecha).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{cot.cliente || 'Sin nombre'}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium">
                                                    {cot.monto.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Link to="/admin/cotizaciones" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                                                        Ver detalle
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500">No hay cotizaciones pendientes</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* 4. Clientes Top */}
                    <div className="bg-white p-6 rounded-xl shadow-card md:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" />
                            Mejores Clientes (Por Monto Cotizado)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Cliente</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">N° Cotizaciones</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Total Acumulado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.topClientes.length > 0 ? (
                                        stats.topClientes.map((cli, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-medium text-gray-900">{cli.name || 'Sin nombre'}</td>
                                                <td className="px-4 py-3 text-center">{cli.count}</td>
                                                <td className="px-4 py-3 text-right text-gray-700">
                                                    {cli.totalAmount.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-gray-500">No hay datos suficientes</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCotizacionesDashboard
