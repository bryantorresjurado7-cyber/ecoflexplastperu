import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import {
    DollarSign,
    Calendar,
    Plus,
    ChevronDown,
    ChevronUp,
    Trash2,
    Save,
    FileText,
    Filter
} from 'lucide-react'

const AdminContabilidad = () => {
    // Estados para filtros
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

    // Estados para datos
    // Estados para datos
    const [cajas, setCajas] = useState(() => {
        const savedCajas = localStorage.getItem('contabilidad_cajas')
        return savedCajas ? JSON.parse(savedCajas) : []
    })
    const [expandedCajaId, setExpandedCajaId] = useState(null)
    const [openFilterMenu, setOpenFilterMenu] = useState(null) // key: `${cajaId}-${column}`
    const [filters, setFilters] = useState({}) // key: `${cajaId}-${column}` -> string val
    const [tempSelectedValues, setTempSelectedValues] = useState([]) // Estado temporal para el menu abierto
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, cajaId: null, itemId: null, itemDescription: '' }) // Estado para el modal de eliminación
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false) // Estado para el menú de fecha personalizado


    // Opciones de filtros
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i)

    // Guardar en localStorage cuando cambian las cajas
    useEffect(() => {
        localStorage.setItem('contabilidad_cajas', JSON.stringify(cajas))
    }, [cajas])

    const handleAddCaja = () => {
        const newCaja = {
            id: Date.now(),
            nombre: `Caja ${cajas.length + 1}`,
            month: selectedMonth,
            year: selectedYear,
            items: [],
            montoInicial: 500
        }
        setCajas(prev => [...prev, newCaja])
        setExpandedCajaId(newCaja.id) // Abrir automáticamente la nueva caja
    }


    const handleDeleteCaja = (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta caja?')) {
            setCajas(prev => prev.filter(c => c.id !== id))
        }
    }

    const toggleCaja = (id) => {
        if (expandedCajaId === id) {
            setExpandedCajaId(null)
        } else {
            setExpandedCajaId(id)
        }
    }

    const handleUpdateCaja = (id, field, value) => {
        setCajas(prev => prev.map(caja => {
            if (caja.id === id) {
                return { ...caja, [field]: value }
            }
            return caja
        }))
    }

    const handleAddItem = (cajaId) => {
        const newItem = {
            id: Date.now(),
            descripcion: '',
            tipo: 'ingreso', // ingreso | egreso
            fecha: new Date().toISOString().split('T')[0],
            tipoDocumento: 'BOLETA',
            numeroDocumento: '',
            monto: 0
        }

        setCajas(prev => prev.map(caja => {
            if (caja.id === cajaId) {
                return { ...caja, items: [...caja.items, newItem] }
            }
            return caja
        }))
    }

    const handleUpdateItem = (cajaId, itemId, field, value) => {
        setCajas(prev => prev.map(caja => {
            if (caja.id === cajaId) {
                const newItems = caja.items.map(item => {
                    if (item.id === itemId) {
                        return { ...item, [field]: value }
                    }
                    return item
                })
                return { ...caja, items: newItems }
            }
            return caja
        }))
    }

    const handleDeleteItem = (cajaId, itemId, description) => {
        setDeleteModal({
            isOpen: true,
            cajaId,
            itemId,
            itemDescription: description || 'este ítem'
        })
    }

    const confirmDelete = () => {
        const { cajaId, itemId } = deleteModal
        setCajas(prev => prev.map(caja => {
            if (caja.id === cajaId) {
                return { ...caja, items: caja.items.filter(item => item.id !== itemId) }
            }
            return caja
        }))
        setDeleteModal({ isOpen: false, cajaId: null, itemId: null, itemDescription: '' })
    }

    // Funciones Helper para Filtros
    const toggleFilterMenu = (key) => {
        if (openFilterMenu === key) {
            setOpenFilterMenu(null)
        } else {
            // Al abrir, inicializar temporal con lo que ya está guardado
            setTempSelectedValues(filters[key] || [])
            setOpenFilterMenu(key)
        }
    }

    const handleToggleTemp = (value) => {
        setTempSelectedValues(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value)
            } else {
                return [...prev, value]
            }
        })
    }

    const handleApplyFilter = (cajaId, column) => {
        const key = `${cajaId}-${column}`
        setFilters(prev => {
            const newFilters = { ...prev }
            if (tempSelectedValues.length === 0) {
                delete newFilters[key]
            } else {
                newFilters[key] = tempSelectedValues
            }
            return newFilters
        })
        setOpenFilterMenu(null)
    }



    const getUniqueValues = (items, column) => {
        if (column === 'originalIndex') {
            return items.map((_, i) => (i + 1).toString())
        }
        if (column === 'tipoDocumento') {
            // Default is 'BOLETA' if undefined, so handle that
            const values = new Set(items.map(i => i.tipoDocumento || 'BOLETA'))
            return Array.from(values).sort()
        }
        const values = new Set(items.map(item => item[column]))
        return Array.from(values).sort()
    }

    const getFilteredItems = (caja) => {
        // First map to add originalIndex so we can filter by it properly
        let items = caja.items.map((item, index) => ({ ...item, originalIndex: index + 1 }))

        // Check active filters for this caja
        const cajaFilters = Object.entries(filters).filter(([key]) => key.startsWith(`${caja.id}-`))

        if (cajaFilters.length === 0) return items

        return items.filter(item => {
            return cajaFilters.every(([key, filterValues]) => {
                const column = key.split('-')[1]
                let itemValue
                if (column === 'originalIndex') {
                    itemValue = item.originalIndex.toString()
                } else if (column === 'tipoDocumento') {
                    itemValue = item.tipoDocumento || 'BOLETA'
                } else {
                    itemValue = item[column]
                }

                // Support array (multi-select) or fall back to single value
                if (Array.isArray(filterValues)) {
                    return filterValues.includes(itemValue)
                }
                return filterValues === itemValue
            })
        })
    }

    const renderFilterHeader = (label, column, caja, widthClass = '') => {
        const menuKey = `${caja.id}-${column}`
        const activeFilters = filters[menuKey] || []
        const hasFilter = activeFilters.length > 0
        const isOpen = openFilterMenu === menuKey
        const uniqueValues = getUniqueValues(caja.items, column)

        return (
            <th className={`py-3 px-2 text-xs font-bold text-white uppercase tracking-wider ${widthClass} border border-verde-claro/20 relative`}>
                <div className="flex items-center justify-between w-full h-full gap-1">
                    <span className="flex-1 text-center">{label}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleFilterMenu(menuKey)
                        }}
                        className={`p-1 rounded hover:bg-white/20 transition-colors ${hasFilter ? 'text-yellow-300' : 'text-white/70'}`}
                    >
                        <Filter size={14} fill={hasFilter ? "currentColor" : "none"} />
                    </button>
                    {isOpen && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 py-1 text-gray-700 border border-gray-200 text-left flex flex-col">
                            <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <span className="text-xs font-bold text-gray-500">Filtrar {label}</span>
                                <button
                                    onClick={() => setTempSelectedValues([])}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                                >
                                    Limpiar
                                </button>
                            </div>
                            <div className="p-1">
                                {uniqueValues.map(val => {
                                    const isChecked = tempSelectedValues.includes(val)
                                    return (
                                        <label
                                            key={val}
                                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer rounded"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleTemp(val)}
                                                className="rounded border-gray-300 text-verde-principal focus:ring-verde-principal/30 w-4 h-4"
                                            />
                                            <span className={`${isChecked ? 'font-medium text-verde-principal' : 'text-gray-700'}`}>
                                                {val}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                            {/* Footer con botón Aplicar */}
                            <div className="p-2 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => handleApplyFilter(caja.id, column)}
                                    className="w-full bg-verde-principal hover:bg-verde-hover text-white text-xs font-bold py-1.5 rounded transition-colors"
                                >
                                    Aplicar Filtro
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </th>
        )
    }

    const calculateTotal = (caja) => {
        const totalItems = caja.items.reduce((acc, item) => {
            const monto = parseFloat(item.monto) || 0
            return item.tipo === 'ingreso' ? acc + monto : acc - monto
        }, 0)

        const inicial = parseFloat(caja.montoInicial) || 0
        return inicial + totalItems
    }

    const shortMonths = ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Oct.', 'Nov.', 'Dic.']

    return (
        <AdminLayout>
            {/* Header y Filtros */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-negro-principal flex items-center gap-2">
                            <DollarSign className="text-verde-principal" />
                            Contabilidad
                        </h1>
                        <p className="text-gris-medio mt-1">Gestión de cajas y movimientos financieros</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-fondo-claro p-2 rounded-lg relative">
                        {/* Selector de Fecha Personalizado */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                                className="flex items-center gap-2 bg-white border border-gray-300 text-negro-principal text-sm font-semibold rounded-md px-4 py-2 hover:bg-gray-50 transition-colors min-w-[180px] justify-between"
                            >
                                <span>{months[selectedMonth]} de {selectedYear}</span>
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>

                            {isDateMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDateMenuOpen(false)}
                                    ></div>
                                    <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg border border-gray-200 p-4 z-20 w-64 animate-in fade-in zoom-in-95 duration-100">
                                        {/* Selector de Año */}
                                        <div className="mb-4 bg-gray-100 rounded-md p-1">
                                            <input
                                                type="number"
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                                                className="w-full bg-transparent border-none text-center font-bold text-gray-800 focus:ring-0 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>

                                        {/* Grid de Meses */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {shortMonths.map((m, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedMonth(idx)
                                                        setIsDateMenuOpen(false)
                                                    }}
                                                    className={`
                                                        p-2 text-xs font-medium rounded-md transition-colors text-center
                                                        ${selectedMonth === idx
                                                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                                    `}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleAddCaja}
                            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm ml-2"
                        >
                            <Plus size={18} />
                            Nueva Caja
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="p-8 max-w-[1600px] mx-auto space-y-6">

                {cajas.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border-dashed border-2 border-gray-300">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay cajas creadas</h3>
                        <p className="text-gray-500 mb-6">Selecciona un mes y año y comienza creando una nueva caja.</p>
                        <button
                            onClick={handleAddCaja}
                            className="text-verde-principal font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
                        >
                            <Plus size={18} />
                            Crear mi primera caja para {months[selectedMonth]} {selectedYear}
                        </button>
                    </div>
                ) : (
                    cajas.map((caja) => (
                        <div key={caja.id} className="bg-white rounded-xl shadow-card transition-all duration-300">
                            {/* Caja Header (Botón desplegable) */}
                            <div
                                className={`
                  p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-l-4
                  ${expandedCajaId === caja.id ? 'border-l-verde-principal bg-gray-50' : 'border-l-transparent'}
                `}
                                onClick={() => toggleCaja(caja.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                    p-2 rounded-lg 
                    ${expandedCajaId === caja.id ? 'bg-verde-claro text-verde-principal' : 'bg-gray-100 text-gris-medio'}
                  `}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-negro-principal">{caja.nombre}</h3>
                                        <p className="text-sm text-gris-medio flex items-center gap-2">
                                            <span>
                                                {new Date(caja.fechaCreacion || caja.id).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            {caja.items.length} movimientos <span className="text-gray-300">|</span> Total:
                                            <span className={`ml-1 font-semibold ${calculateTotal(caja) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                S/ {calculateTotal(caja).toFixed(2)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Boton Eliminar Caja */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteCaja(caja.id)
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Eliminar caja"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    {expandedCajaId === caja.id ?
                                        <ChevronUp className="text-gris-medio" /> :
                                        <ChevronDown className="text-gris-medio" />
                                    }
                                </div>
                            </div>

                            {/* Contenido Expandible (Tabla) */}
                            {expandedCajaId === caja.id && (
                                <div className="border-t border-gray-200 p-6 bg-white animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-6 flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gris-medio uppercase mb-1">Monto Inicial (S/)</label>
                                            <input
                                                type="number"
                                                value={caja.montoInicial || 0}
                                                onChange={(e) => handleUpdateCaja(caja.id, 'montoInicial', e.target.value)}
                                                className="bg-white border border-gray-300 text-negro-principal text-lg font-bold rounded-md focus:ring-verde-principal focus:border-verde-principal block w-32 p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gris-medio">
                                                Este monto se usará como base. Los egresos se restarán de este total.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="">
                                        <table className="w-full min-w-[900px] border border-gray-300 border-collapse">
                                            <thead>
                                                <tr className="bg-verde-principal">
                                                    {renderFilterHeader('ARTÍCULO', 'originalIndex', caja, 'w-24')}
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider border border-verde-claro/20">Descripción</th>
                                                    {renderFilterHeader('TIPO', 'tipo', caja, 'w-32')}
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider w-40 border border-verde-claro/20 text-center">Fecha</th>
                                                    {renderFilterHeader('TIPO RECIBO', 'tipoDocumento', caja, 'w-32')}
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider w-56 border border-verde-claro/20">N° Recibo</th>
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider w-32 border border-verde-claro/20 text-right">Monto (S/)</th>
                                                    <th className="py-3 px-2 w-16 border border-verde-claro/20"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getFilteredItems(caja).map((item, index) => (
                                                    <tr key={item.id} className="group">
                                                        <td className="border border-gray-300 text-sm text-gray-500 text-center font-mono bg-gray-50">
                                                            {item.originalIndex}
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="text"
                                                                value={item.descripcion}
                                                                onChange={(e) => handleUpdateItem(caja.id, item.id, 'descripcion', e.target.value)}
                                                                placeholder="Descripción..."
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 transition-colors"
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <select
                                                                value={item.tipo}
                                                                onChange={(e) => handleUpdateItem(caja.id, item.id, 'tipo', e.target.value)}
                                                                className={`
                                                                    w-full h-full p-2 text-sm border-none focus:ring-0 cursor-pointer
                                                                    ${item.tipo === 'ingreso' ? 'text-green-700 bg-green-50/50' : 'text-red-700 bg-red-50/50'}
                                                                `}
                                                            >
                                                                <option value="ingreso">Ingreso</option>
                                                                <option value="egreso">Egreso</option>
                                                            </select>
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="date"
                                                                value={item.fecha}
                                                                onChange={(e) => handleUpdateItem(caja.id, item.id, 'fecha', e.target.value)}
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 text-center"
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <select
                                                                value={item.tipoDocumento || 'BOLETA'}
                                                                onChange={(e) => handleUpdateItem(caja.id, item.id, 'tipoDocumento', e.target.value)}
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 cursor-pointer bg-white"
                                                            >
                                                                <option value="FACTURA">FACTURA</option>
                                                                <option value="BOLETA">BOLETA</option>
                                                                <option value="TALONARIO">TALONARIO</option>
                                                            </select>
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="text"
                                                                value={item.numeroDocumento}
                                                                onChange={(e) => handleUpdateItem(caja.id, item.id, 'numeroDocumento', e.target.value)}
                                                                placeholder="000-000000"
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 font-mono"
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="number"
                                                                value={item.monto}
                                                                onChange={(e) => handleUpdateItem(caja.id, item.id, 'monto', e.target.value)}
                                                                placeholder="0.00"
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 text-right font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 text-center p-0">
                                                            <button
                                                                onClick={() => setDeleteModal({ isOpen: true, cajaId: caja.id, itemId: item.id, itemDescription: item.descripcion })}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {/* Footer de la tabla con total y botón agregar */}
                                            <tfoot>
                                                <tr className="bg-gray-50">
                                                    <td colSpan="8" className="border border-gray-300 py-3 px-4">
                                                        <div className="flex justify-between items-center">
                                                            <button
                                                                onClick={() => handleAddItem(caja.id)}
                                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 px-2 hover:bg-blue-50 rounded py-1 transition-colors"
                                                            >
                                                                <Plus size={16} />
                                                                Agregar fila
                                                            </button>

                                                            <div className="flex items-center gap-4 text-right">
                                                                <span className="text-sm text-gray-600 font-bold uppercase">Total Caja:</span>
                                                                <span className={`text-xl font-bold ${calculateTotal(caja) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                                    S/ {calculateTotal(caja).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Botón Guardar (Visual por ahora) */}
                                    <div className="mt-6 flex justify-end">
                                        <button className="btn-primary flex items-center gap-2">
                                            <Save size={18} />
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            {/* Modal de Confirmación de Eliminación */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-600 mb-6 text-base leading-relaxed">
                            ¿Estás seguro de eliminar <span className="font-semibold text-gray-800">"{deleteModal.itemDescription}"</span>?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, cajaId: null, itemId: null, itemDescription: '' })}
                                className="px-6 py-2 rounded-xl text-verde-principal font-semibold border-2 border-verde-principal hover:bg-verde-principal/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default AdminContabilidad

