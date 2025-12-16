import React from 'react'
import { X, Printer } from 'lucide-react'

const ClientPrintModal = ({ isOpen, onClose, data }) => {
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
                    <h2 className="text-lg font-semibold text-gray-700">Vista Previa de Ficha</h2>
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
                            <p><strong>Fecha:</strong> {currentDate}</p>
                        </div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-verde-principal uppercase tracking-wide">
                            FICHA DE CLIENTE
                        </h2>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2">
                        {/* Datos del Cliente */}
                        <div className="border border-gray-200 rounded-lg p-6 print:border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                Datos del cliente
                            </h3>
                            <div className="space-y-3 text-sm text-gray-700">
                                <p><span className="font-bold text-gray-900 block mb-1">Nombre / Razón Social:</span> {data.nombre || '-'}</p>
                                <p><span className="font-bold text-gray-900">Tipo Documento:</span> {data.tipo_documento || '-'}</p>
                                <p><span className="font-bold text-gray-900">Número Documento:</span> {data.numero_documento || '-'}</p>
                                <p><span className="font-bold text-gray-900">Estado:</span> <span className={data.estado ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>{data.estado ? 'Activo' : 'Inactivo'}</span></p>
                            </div>
                        </div>

                        {/* Datos de Contacto */}
                        <div className="border border-gray-200 rounded-lg p-6 print:border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                Datos de contacto
                            </h3>
                            <div className="space-y-3 text-sm text-gray-700">
                                <p><span className="font-bold text-gray-900">Correo:</span> {data.email || '-'}</p>
                                <p><span className="font-bold text-gray-900">Teléfono:</span> {data.telefono || '-'}</p>
                                <p><span className="font-bold text-gray-900 block mb-1">Dirección:</span> {data.direccion || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Extra Info / Notes */}
                    {data.descripcion && (
                        <div className="mb-8 border border-gray-200 rounded-lg p-6 print:border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-2">Observaciones</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 print:bg-transparent print:border-none print:p-0">
                                {data.descripcion}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClientPrintModal
