import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { ArrowLeft, Check, X, FileText, AlertCircle } from 'lucide-react'

const AdminCajaChicaAprobaciones = () => {
    const [pendientes, setPendientes] = useState([
        {
            id: 2,
            tipo: 'egreso',
            monto: 45.50,
            fecha: '2025-12-01T14:30:00',
            motivo: 'Taxi para entrega de documentos',
            responsable: 'Maria Garcia',
            categoria: 'Transporte',
            comprobante: 'ticket-123.jpg'
        },
        {
            id: 4,
            tipo: 'egreso',
            monto: 250.00,
            fecha: '2025-12-02T09:00:00',
            motivo: 'Almuerzo con cliente importante',
            responsable: 'Pedro Sanchez',
            categoria: 'Alimentación',
            comprobante: 'factura-456.pdf'
        }
    ])

    const handleAprobar = (id) => {
        if (confirm('¿Aprobar este gasto?')) {
            setPendientes(pendientes.filter(p => p.id !== id))
        }
    }

    const handleRechazar = (id) => {
        const motivo = prompt('Motivo del rechazo:')
        if (motivo) {
            setPendientes(pendientes.filter(p => p.id !== id))
        }
    }

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
                                Aprobaciones
                            </h1>
                            <p className="text-gris-medio mt-1">Validación de gastos pendientes</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {pendientes.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-card p-12 text-center">
                            <Check className="mx-auto text-green-500 mb-4" size={48} />
                            <h3 className="text-xl font-semibold text-negro-principal">¡Todo al día!</h3>
                            <p className="text-gris-medio mt-2">No hay gastos pendientes de aprobación.</p>
                        </div>
                    ) : (
                        pendientes.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-card p-6 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full mb-2">
                                                Egreso
                                            </span>
                                            <h3 className="text-xl font-bold text-negro-principal">{item.motivo}</h3>
                                            <p className="text-sm text-gris-medio">{new Date(item.fecha).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-red-600">S/ {item.monto.toFixed(2)}</p>
                                            <p className="text-sm text-gris-medio">{item.categoria}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
                                        <div>
                                            <p className="text-xs text-gris-medio uppercase font-semibold">Responsable</p>
                                            <p className="text-sm font-medium text-negro-principal">{item.responsable}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gris-medio uppercase font-semibold">Comprobante</p>
                                            <button className="flex items-center gap-2 text-azul hover:underline text-sm font-medium">
                                                <FileText size={16} />
                                                {item.comprobante}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                    <button
                                        onClick={() => handleAprobar(item.id)}
                                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Check size={20} />
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleRechazar(item.id)}
                                        className="w-full py-2 px-4 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <X size={20} />
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChicaAprobaciones
