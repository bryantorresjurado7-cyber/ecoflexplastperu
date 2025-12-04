import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { ArrowLeft, Download, FileText, BarChart2 } from 'lucide-react'

const AdminCajaChicaReportes = () => {
    const [periodo, setPeriodo] = useState('mes')

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            to="/admin/caja-chica"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gris-medio"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-negro-principal">
                                Reportes
                            </h1>
                            <p className="text-gris-medio mt-1">Estadísticas y exportación de datos</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-card">
                        <h3 className="font-semibold text-negro-principal mb-4">Exportar Movimientos</h3>
                        <p className="text-sm text-gris-medio mb-4">Descarga el historial completo de ingresos y egresos.</p>
                        <div className="flex gap-2">
                            <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                <FileText size={18} /> PDF
                            </button>
                            <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                <Download size={18} /> Excel
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-card">
                        <h3 className="font-semibold text-negro-principal mb-4">Reporte de Cierre</h3>
                        <p className="text-sm text-gris-medio mb-4">Informe detallado del último arqueo de caja.</p>
                        <button className="w-full btn-secondary flex items-center justify-center gap-2">
                            <FileText size={18} /> Generar Informe
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-card">
                        <h3 className="font-semibold text-negro-principal mb-4">Gastos por Categoría</h3>
                        <p className="text-sm text-gris-medio mb-4">Resumen visual de distribución de gastos.</p>
                        <button className="w-full btn-secondary flex items-center justify-center gap-2">
                            <BarChart2 size={18} /> Ver Gráficos
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-8 text-center">
                    <BarChart2 size={64} className="mx-auto text-gris-claro mb-4" />
                    <h3 className="text-xl font-semibold text-negro-principal">Panel de Estadísticas</h3>
                    <p className="text-gris-medio mt-2">Próximamente: Gráficos interactivos de evolución de gastos.</p>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChicaReportes
