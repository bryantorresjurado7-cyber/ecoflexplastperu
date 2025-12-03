import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { ArrowLeft, Save, Calculator, AlertTriangle } from 'lucide-react'

const AdminCajaChicaArqueo = () => {
    const [arqueo, setArqueo] = useState({
        efectivo: 0,
        tarjetaDebito: 0,
        tarjetaCredito: 0
    })

    const [observaciones, setObservaciones] = useState('')

    const saldoTeorico = 1500.00 // Este valor vendría del sistema

    const calcularTotalFisico = () => {
        return (
            (parseFloat(arqueo.efectivo) || 0) +
            (parseFloat(arqueo.tarjetaDebito) || 0) +
            (parseFloat(arqueo.tarjetaCredito) || 0)
        )
    }

    const totalFisico = calcularTotalFisico()
    const diferencia = totalFisico - saldoTeorico

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setArqueo(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }))
    }

    const handleCerrarCaja = () => {
        if (confirm('¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer.')) {
            alert('Caja cerrada correctamente. Se ha generado el reporte.')
            // Aquí iría la lógica de guardado
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
                                Arqueo de Caja
                            </h1>
                            <p className="text-gris-medio mt-1">Cierre y cuadre de efectivo</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel de Arqueo */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
                        <h2 className="text-xl font-semibold text-negro-principal mb-6 flex items-center gap-2">
                            <Calculator size={24} className="text-verde-principal" />
                            Arqueo de Caja
                        </h2>

                        <div className="space-y-6">
                            {/* Efectivo */}
                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Efectivo
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gris-medio">S/</span>
                                    <input
                                        type="number"
                                        name="efectivo"
                                        value={arqueo.efectivo || ''}
                                        onChange={handleInputChange}
                                        className="input-field w-full pl-12 text-right"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Tarjeta Débito */}
                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Tarjeta Débito
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gris-medio">S/</span>
                                    <input
                                        type="number"
                                        name="tarjetaDebito"
                                        value={arqueo.tarjetaDebito || ''}
                                        onChange={handleInputChange}
                                        className="input-field w-full pl-12 text-right"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Tarjeta Crédito */}
                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Tarjeta Crédito
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gris-medio">S/</span>
                                    <input
                                        type="number"
                                        name="tarjetaCredito"
                                        value={arqueo.tarjetaCredito || ''}
                                        onChange={handleInputChange}
                                        className="input-field w-full pl-12 text-right"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <label className="block text-sm font-medium text-negro-principal mb-2">
                                Observaciones del Cierre
                            </label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                className="input-field w-full"
                                rows="3"
                                placeholder="Notas sobre diferencias, billetes deteriorados, etc."
                            />
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-card p-6">
                            <h2 className="text-xl font-semibold text-negro-principal mb-6">Resumen</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                    <span className="text-gris-medio">Saldo Teórico (Sistema)</span>
                                    <span className="font-bold text-lg">S/ {saldoTeorico.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                    <span className="text-gris-medio">Saldo Físico (Contado)</span>
                                    <span className="font-bold text-lg text-blue-600">S/ {totalFisico.toFixed(2)}</span>
                                </div>

                                <div className={`flex justify-between items-center p-4 rounded-lg ${Math.abs(diferencia) < 0.01
                                        ? 'bg-green-50 text-green-700'
                                        : diferencia > 0
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-red-50 text-red-700'
                                    }`}>
                                    <span className="font-medium">Diferencia</span>
                                    <span className="font-bold text-xl">
                                        {diferencia > 0 ? '+' : ''} S/ {diferencia.toFixed(2)}
                                    </span>
                                </div>

                                {Math.abs(diferencia) > 0.01 && (
                                    <div className="flex gap-2 items-start text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                        <p>Existe una diferencia entre el sistema y el efectivo contado. Por favor justifique en observaciones.</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCerrarCaja}
                                className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                Cerrar Caja
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChicaArqueo
