import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { ArrowLeft, Save, Calculator, AlertTriangle } from 'lucide-react'

const AdminCajaChicaArqueo = () => {
    const [step, setStep] = useState(1) // 1: Conteo, 2: Resumen
    const [conteo, setConteo] = useState({
        billetes200: 0,
        billetes100: 0,
        billetes50: 0,
        billetes20: 0,
        billetes10: 0,
        monedas5: 0,
        monedas2: 0,
        monedas1: 0,
        monedas050: 0,
        monedas020: 0,
        monedas010: 0
    })

    const [observaciones, setObservaciones] = useState('')

    const saldoTeorico = 1500.00 // Este valor vendría del sistema

    const calcularTotalFisico = () => {
        return (
            (conteo.billetes200 * 200) +
            (conteo.billetes100 * 100) +
            (conteo.billetes50 * 50) +
            (conteo.billetes20 * 20) +
            (conteo.billetes10 * 10) +
            (conteo.monedas5 * 5) +
            (conteo.monedas2 * 2) +
            (conteo.monedas1 * 1) +
            (conteo.monedas050 * 0.5) +
            (conteo.monedas020 * 0.2) +
            (conteo.monedas010 * 0.1)
        )
    }

    const totalFisico = calcularTotalFisico()
    const diferencia = totalFisico - saldoTeorico

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setConteo(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
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
                    {/* Panel de Conteo */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
                        <h2 className="text-xl font-semibold text-negro-principal mb-6 flex items-center gap-2">
                            <Calculator size={24} className="text-verde-principal" />
                            Conteo de Efectivo
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-4">
                                <h3 className="font-medium text-gris-oscuro border-b pb-2">Billetes</h3>
                                {[200, 100, 50, 20, 10].map(denom => (
                                    <div key={`billete-${denom}`} className="flex items-center justify-between">
                                        <label className="text-sm text-gris-medio">S/ {denom}.00</label>
                                        <input
                                            type="number"
                                            name={`billetes${denom}`}
                                            value={conteo[`billetes${denom}`]}
                                            onChange={handleInputChange}
                                            className="input-field w-24 text-right"
                                            min="0"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-gris-oscuro border-b pb-2">Monedas</h3>
                                {[5, 2, 1].map(denom => (
                                    <div key={`moneda-${denom}`} className="flex items-center justify-between">
                                        <label className="text-sm text-gris-medio">S/ {denom}.00</label>
                                        <input
                                            type="number"
                                            name={`monedas${denom}`}
                                            value={conteo[`monedas${denom}`]}
                                            onChange={handleInputChange}
                                            className="input-field w-24 text-right"
                                            min="0"
                                        />
                                    </div>
                                ))}
                                {['050', '020', '010'].map(denom => (
                                    <div key={`moneda-${denom}`} className="flex items-center justify-between">
                                        <label className="text-sm text-gris-medio">S/ 0.{denom.substring(1)}</label>
                                        <input
                                            type="number"
                                            name={`monedas${denom}`}
                                            value={conteo[`monedas${denom}`]}
                                            onChange={handleInputChange}
                                            className="input-field w-24 text-right"
                                            min="0"
                                        />
                                    </div>
                                ))}
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
