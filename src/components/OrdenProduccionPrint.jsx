import React, { useEffect, useState } from 'react'
import { Square } from 'lucide-react'
import { createPortal } from 'react-dom'

const OrdenProduccionPrint = ({ data }) => {
    const [currentDate, setCurrentDate] = useState('')

    useEffect(() => {
        if (data) {
            // Pequeño delay para asegurar que el DOM se actualizó con los datos
            const timer = setTimeout(() => {
                window.print()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [data])

    if (!data) return null

    const producto = Array.isArray(data.producto) ? data.producto[0] : data.producto
    const formattedDate = data.fecha_produccion ? new Date(data.fecha_produccion).toLocaleDateString('es-PE') : 'N/A'

    // Estilos globales de impresión optimizados
    const printStyles = `
        @media print {
            #root {
                display: none !important;
            }
            .print-container {
                display: flex !important;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                z-index: 9999;
            }
            @page {
                size: A4;
                margin: 0;
            }
            /* Asegurar que los textos se vean */
            .print-container * {
                visibility: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        @media screen {
            .print-container {
                display: none;
            }
        }
    `

    // Renderizamos usando Portal para que esté en el body pero aislado visualmente en pantalla normal
    return createPortal(
        <div className="print-container">
            <style>{printStyles}</style>

            <div className="w-full max-w-[210mm] mx-auto p-0 font-sans text-gray-900 leading-tight">
                {/* ENCABEZADO */}
                <header className="flex border border-gray-800 mb-6">
                    {/* Logo */}
                    <div className="w-1/4 p-4 flex items-center justify-center border-r border-gray-800">
                        <img
                            src="/images/logo/logoEmpresa.png"
                            alt="EcoFlexPlast"
                            className="h-16 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>

                    {/* Título Central */}
                    <div className="w-2/4 flex items-center justify-center border-r border-gray-800 bg-gray-50">
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-center">Orden de Producción</h1>
                    </div>

                    {/* Cuadro Lateral Derecho */}
                    <div className="w-1/4">
                        <div className="border-b border-gray-800 p-1 flex justify-between">
                            <span className="font-bold">CÓDIGO:</span>
                            <span>{data.codigo_produccion || '---'}</span>
                        </div>
                        <div className="border-b border-gray-800 p-1 flex justify-between">
                            <span className="font-bold">VERSIÓN:</span>
                            <span>001</span>
                        </div>
                        <div className="p-1 flex justify-between items-center">
                            <span className="font-bold">FECHA:</span>
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </header>

                {/* SECCIÓN: ESTADO INICIAL DEL PRODUCTO */}
                <div className="mb-6">
                    <div className="bg-verde-principal text-white font-bold p-1 border border-black border-b-0 text-center uppercase text-sm print:bg-green-700 print:text-white">
                        Estado Inicial del Producto
                    </div>
                    <table className="w-full border-collapse border border-gray-800 text-center">
                        <thead className="bg-gray-100 print:bg-gray-200">
                            <tr>
                                <th className="border border-gray-800 p-1 font-semibold">Responsable</th>
                                <th className="border border-gray-800 p-1 font-semibold">Tarea</th>
                                <th className="border border-gray-800 p-1 font-semibold">Cargo</th>
                                <th className="border border-gray-800 p-1 font-semibold">Producto</th>
                                <th className="border border-gray-800 p-1 font-semibold">Código</th>
                                <th className="border border-gray-800 p-1 font-semibold">Cant. Plan.</th>
                                <th className="border border-gray-800 p-1 font-semibold">Cant. Prod.</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-800 p-2">Ing. Producción</td>
                                <td className="border border-gray-800 p-2">Producción</td>
                                <td className="border border-gray-800 p-2">Operario</td>
                                <td className="border border-gray-800 p-2 text-left">{producto?.nombre || 'N/A'}</td>
                                <td className="border border-gray-800 p-2">{producto?.codigo || 'N/A'}</td>
                                <td className="border border-gray-800 p-2">{data.cantidad_planificada || 0}</td>
                                <td className="border border-gray-800 p-2">{data.cantidad_producida || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* SECCIÓN: ESTADO FINAL DEL PRODUCTO */}
                <div className="mb-6">
                    <div className="bg-verde-principal text-white font-bold p-1 border border-black border-b-0 text-center uppercase text-sm print:bg-green-700 print:text-white">
                        Estado Final del Producto
                    </div>
                    <table className="w-full border-collapse border border-gray-800 text-center">
                        <thead className="bg-gray-100 print:bg-gray-200">
                            <tr>
                                <th className="border border-gray-800 p-1 font-semibold w-1/4">Producto</th>
                                <th className="border border-gray-800 p-1 font-semibold">Aprovechable</th>
                                <th className="border border-gray-800 p-1 font-semibold">Unidad</th>
                                <th className="border border-gray-800 p-1 font-semibold">Peso (Kg)</th>
                                <th className="border border-gray-800 p-1 font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Fila de ejemplo */}
                            <tr>
                                <td className="border border-gray-800 p-2 text-left">{producto?.nombre || 'Producto Final'}</td>
                                <td className="border border-gray-800 p-2">
                                    <div className="flex justify-center items-center gap-4">
                                        <span className="flex items-center gap-1"><Square size={14} /> SI</span>
                                        <span className="flex items-center gap-1"><Square size={14} /> NO</span>
                                    </div>
                                </td>
                                <td className="border border-gray-800 p-2">UND</td>
                                <td className="border border-gray-800 p-2">   </td>
                                <td className="border border-gray-800 p-2">{data.cantidad_producida || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* SECCIONES ELIMINADAS: COSTO TOTAL Y FIRMAS */}

                {/* USO FINAL DE MERMA */}
                <div className="mb-8 grid grid-cols-2 gap-6">
                    <div className="border border-black">
                        <div className="bg-verde-principal text-white font-bold p-1 text-center uppercase text-xs print:bg-green-700 print:text-white">
                            Uso Final de Merma Desechable
                        </div>
                        <div className="h-24 bg-white"></div>
                    </div>
                    <div className="border border-black">
                        <div className="bg-verde-principal text-white font-bold p-1 text-center uppercase text-xs print:bg-green-700 print:text-white">
                            Uso Final de Merma Consumible
                        </div>
                        <div className="h-24 bg-white"></div>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    )
}

export default OrdenProduccionPrint
