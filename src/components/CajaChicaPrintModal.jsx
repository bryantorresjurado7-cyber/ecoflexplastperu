import React from 'react'
import { X, Printer } from 'lucide-react'

const CajaChicaPrintModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null

    const handlePrint = () => {
        window.print()
    }

    const currentDate = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:p-0 print:bg-white print:static print:block">
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[210mm] max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:overflow-visible print:rounded-none">

                {/* Header Actions (No print) */}
                <div className="sticky top-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center print:hidden z-10">
                    <h2 className="text-lg font-semibold text-gray-700">Vista Previa</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-verde-principal text-white rounded-lg hover:bg-verde-hover transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                            <Printer size={18} />
                            Imprimir
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Print Content Area */}
                <div id="print-content" className="p-8 md:p-12 print:p-0">

                    {/* Branding Header */}
                    <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4">
                            <img
                                src="/images/logo/logoEmpresa.png"
                                alt="EcoFlexPlast"
                                className="h-16 object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-verde-principal uppercase tracking-tighter">ECO FLEX PLAST</h1>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">PACKAGING SOSTENIBLE AVANZADO</p>
                            </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                            <p><strong>Fecha Impresión:</strong> {currentDate}</p>
                            <p><strong>Válido hasta:</strong> {new Date(new Date().setDate(new Date().getDate() + 15)).toLocaleDateString('es-PE')}</p>
                        </div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-verde-principal uppercase tracking-wide">
                            COMPROBANTE DE CAJA CHICA
                        </h2>
                        {data.id && <p className="text-sm text-gray-500">N° Movimiento: {String(data.id).padStart(6, '0')}</p>}
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2">
                        {/* Datos del Responsable */}
                        <div className="border border-gray-200 rounded-lg p-6 print:border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                Datos del Responsable
                            </h3>
                            <div className="space-y-3 text-sm text-gray-700">
                                <p><span className="font-bold text-gray-900 block mb-1">Nombre:</span> {data.responsable || '-'}</p>
                                <p><span className="font-bold text-gray-900">Categoría:</span> {data.categoria || '-'}</p>
                                <p><span className="font-bold text-gray-900">Tipo:</span> <span className={data.tipo === 'ingreso' ? "text-green-700 font-semibold uppercase" : "text-red-700 font-semibold uppercase"}>{data.tipo}</span></p>
                            </div>
                        </div>

                        {/* Datos del Movimiento */}
                        <div className="border border-gray-200 rounded-lg p-6 print:border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                Detalles del Registro
                            </h3>
                            <div className="space-y-3 text-sm text-gray-700">
                                <p><span className="font-bold text-gray-900">Fecha Movimiento:</span> {data.fecha || currentDate}</p>
                                {data.comprobante && <p><span className="font-bold text-gray-900">Comprobante:</span> Adjunto</p>}
                            </div>
                        </div>
                    </div>

                    {/* Detalle de la oferta / Movimiento */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-800 mb-2">Detalle del Movimiento</h3>
                        <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
                                <tr>
                                    <th className="py-2 px-4 text-left border-r border-gray-200 font-bold text-verde-principal">#</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200 font-bold text-verde-principal">Motivo / Descripción</th>
                                    <th className="py-2 px-4 text-center border-r border-gray-200 font-bold text-verde-principal">Tipo</th>
                                    <th className="py-2 px-4 text-right font-bold text-verde-principal">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-center border-r border-gray-100">1</td>
                                    <td className="py-3 px-4 border-r border-gray-100">{data.motivo || '-'}</td>
                                    <td className="py-3 px-4 text-center border-r border-gray-100 capitalize">{data.tipo}</td>
                                    <td className="py-3 px-4 text-right">S/ {parseFloat(data.monto || 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Resumen / Totales - Aligning to right like invoice */}
                    <div className="flex justify-end mb-8">
                        <div className="w-1/3 min-w-[200px] border border-gray-200 rounded-lg p-4 print:border-gray-300 bg-gray-50 print:bg-transparent">
                            <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Resumen</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span>S/ {parseFloat(data.monto || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Impuestos</span>
                                    <span>S/ 0.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-negro-principal border-t border-gray-200 pt-2 mt-2">
                                    <span>Total</span>
                                    <span>S/ {parseFloat(data.monto || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Bank Info (Optional but in reference) */}
                    <div className="mt-8 text-xs text-gray-500 border-t border-gray-200 pt-4">
                        <p className="mb-1 font-bold">Información Adicional:</p>
                        <p>Este documento es un comprobante interno de movimiento de caja chica.</p>
                        <p>Generado automáticamente por el sistema EcoFlexPlast. <br /> {currentDate}</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default CajaChicaPrintModal
