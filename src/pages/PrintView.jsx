import React, { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'

const PrintView = () => {
    const [data, setData] = useState(null)

    useEffect(() => {
        const storedData = localStorage.getItem('printData')
        if (storedData) {
            setData(JSON.parse(storedData))
        }
    }, [])

    useEffect(() => {
        if (data) {
            // Pequeño delay para asegurar que las imágenes carguen
            setTimeout(() => {
                window.print()
            }, 500)
        }
    }, [data])

    if (!data) return <div className="p-8 text-center">Cargando datos...</div>

    const { type, cliente, detalles, resumen, numero, fecha, valido_hasta, titulo, observaciones, extra } = data

    return (
        <div className="bg-white min-h-screen p-8 md:p-12 max-w-[210mm] mx-auto print:p-0 print:max-w-none font-sans">
            {/* No-print controls */}
            <div className="print:hidden mb-8 flex justify-end">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-verde-principal text-white rounded-lg hover:bg-verde-hover transition-colors"
                >
                    <Printer size={20} />
                    Imprimir
                </button>
            </div>

            {/* Header */}
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

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Col 1 */}
                <div className="border border-gray-200 rounded-lg p-6">
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
                <div className="border border-gray-200 rounded-lg p-6">
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
                        <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-verde-principal uppercase tracking-wider">
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
                                <td className="py-3 px-4 text-right">S/ {parseFloat(item.precio_unitario).toFixed(2)}</td>
                                <td className="py-3 px-4 text-right font-medium">S/ {parseFloat(item.subtotal).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Extra Info */}
                <div className="space-y-6 text-sm text-gray-600">
                    {observaciones && (
                        <div>
                            <h4 className="font-bold text-gray-800 mb-2">Observaciones</h4>
                            <p className="bg-gray-50 p-3 rounded-lg border border-gray-100">{observaciones}</p>
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
                    <div className="bg-gray-50 rounded-lg p-6 w-full max-w-xs border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Resumen</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-800">S/ {parseFloat(resumen?.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Impuestos ({resumen?.impuesto_porcentaje || 18}%)</span>
                                <span className="font-medium text-gray-800">S/ {parseFloat(resumen?.impuestos || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3 mt-2">
                                <span>Total</span>
                                <span>S/ {parseFloat(resumen?.total || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrintView
