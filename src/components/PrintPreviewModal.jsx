import React from 'react'
import { X, Printer } from 'lucide-react'

const PrintPreviewModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null

    // Function to handle printing
    const handlePrint = () => {
        window.print()
    }

    const { type, cliente, detalles, resumen, numero, fecha, valido_hasta, titulo, observaciones, extra } = data

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:p-0 print:bg-white print:static print:block">
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[210mm] max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:overflow-visible print:rounded-none">

                {/* Header Actions (No print) */}
                <div className="sticky top-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center print:hidden z-10">
                    <h2 className="text-lg font-semibold text-gray-700">Vista Previa de Impresión</h2>
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

                {/* Print Content Area - This is what gets printed */}
                <div id="print-content" className="p-8 md:p-12 print:p-0">

                    {/* Document Header */}
                    <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                        <img
                            src="/images/logo/logoEmpresa.png"
                            alt="EcoFlexPlast"
                            className="h-16 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="text-right text-sm text-gray-600">
                            <p><strong>Fecha:</strong> {fecha}</p>
                            {valido_hasta && <p><strong>Válido hasta:</strong> {valido_hasta}</p>}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-verde-principal uppercase tracking-wide">
                            {titulo || (type === 'COTIZACION' ? 'COTIZACIÓN' : 'ORDEN DE PRODUCCIÓN')}
                        </h1>
                        {numero && <p className="text-gray-500 mt-1">{numero}</p>}
                    </div>

                    {/* Info Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2">
                        {/* Col 1 */}
                        <div className="border border-gray-200 rounded-lg p-6 print:border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                {type === 'COTIZACION' ? 'Datos del cliente' : 'Información General'}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                {cliente?.nombre && <p><span className="font-semibold text-gray-800">Cliente:</span> {cliente.nombre}</p>}
                                {cliente?.empresa && <p><span className="font-semibold text-gray-800">Empresa:</span> {cliente.empresa}</p>}
                                {cliente?.documento && <p><span className="font-semibold text-gray-800">Documento:</span> {cliente.documento}</p>}

                                {/* Production specific fields */}
                                {extra?.turno && <p><span className="font-semibold text-gray-800">Turno:</span> {extra.turno}</p>}
                                {extra?.maquinaria && <p><span className="font-semibold text-gray-800">Maquinaria:</span> {extra.maquinaria}</p>}
                            </div>
                        </div>

                        {/* Col 2 */}
                        <div className="border border-gray-200 rounded-lg p-6 print:border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                {type === 'COTIZACION' ? 'Datos de contacto' : 'Detalles de Producción'}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                {cliente?.email && <p><span className="font-semibold text-gray-800">Correo:</span> {cliente.email}</p>}
                                {cliente?.telefono && <p><span className="font-semibold text-gray-800">Teléfono:</span> {cliente.telefono}</p>}
                                {cliente?.direccion && <p><span className="font-semibold text-gray-800">Dirección:</span> {cliente.direccion}</p>}

                                {/* Production specific */}
                                {extra?.operarios && <p><span className="font-semibold text-gray-800">Operarios:</span> {extra.operarios}</p>}
                                {extra?.estado && <p><span className="font-semibold text-gray-800">Estado:</span> {extra.estado}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-800 mb-4">Detalle de la oferta</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-verde-principal uppercase tracking-wider print:bg-gray-100">
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">Producto</th>
                                    <th className="py-3 px-4">Descripción</th>
                                    <th className="py-3 px-4 text-center">Cant.</th>
                                    <th className="py-3 px-4 text-right">Precio unit.</th>
                                    <th className="py-3 px-4 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {detalles?.map((item, index) => (
                                    <tr key={index} className="text-sm text-gray-700">
                                        <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                                        <td className="py-3 px-4 font-medium">{item.codigo || '-'}</td>
                                        <td className="py-3 px-4">{item.nombre}</td>
                                        <td className="py-3 px-4 text-center">{item.cantidad}</td>
                                        <td className="py-3 px-4 text-right">
                                            {typeof item.precio_unitario === 'number'
                                                ? `S/ ${item.precio_unitario.toFixed(2)}`
                                                : item.precio_unitario}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {typeof item.subtotal === 'number'
                                                ? `S/ ${item.subtotal.toFixed(2)}`
                                                : item.subtotal}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                        {/* Left: Extra Info */}
                        <div className="space-y-6 text-sm text-gray-600">
                            {observaciones && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-2">Observaciones</h4>
                                    <p className="bg-gray-50 p-3 rounded-lg border border-gray-100 print:bg-transparent print:border-gray-200">{observaciones}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Certificación</h4>
                                <p>Todos los productos se entregan con <span className="font-bold text-gray-800">CERTIFICADO DE CALIDAD</span>.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Cuentas bancarias</h4>
                                <p className="font-bold text-gray-800">Banco: BCP - ECOFLEXPLAST</p>
                                <p>Cuenta: 1917289798020</p>
                                <p>CCI: 00219100728979802056</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Condiciones de pago</h4>
                                <p>50% adelanto, 50% contra entrega.</p>
                            </div>
                        </div>

                        {/* Right: Totals */}
                        <div className="flex justify-end items-start">
                            <div className="bg-gray-50 rounded-lg p-6 w-full max-w-xs border border-gray-100 print:bg-transparent print:border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Resumen</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-800">
                                            {typeof resumen?.subtotal === 'number' ? `S/ ${resumen.subtotal.toFixed(2)}` : resumen?.subtotal || '0.00'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Impuestos ({resumen?.impuesto_porcentaje || 18}%)</span>
                                        <span className="font-medium text-gray-800">
                                            {typeof resumen?.impuestos === 'number' ? `S/ ${resumen.impuestos.toFixed(2)}` : resumen?.impuestos || '0.00'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3 mt-2">
                                        <span>Total</span>
                                        <span>
                                            {typeof resumen?.total === 'number' ? `S/ ${resumen.total.toFixed(2)}` : resumen?.total || '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrintPreviewModal
