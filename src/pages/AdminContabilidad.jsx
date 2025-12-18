import { useState, useEffect, useCallback } from 'react'
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
    Filter,
    Loader2,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Lock,
    TrendingUp,
    TrendingDown,
    X
} from 'lucide-react'
import { contabilidadService } from '../services/contabilidadService'

const AdminContabilidad = () => {
    // Estados para filtros
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

    // Estados para datos
    const [cajas, setCajas] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    
    const [expandedCajaId, setExpandedCajaId] = useState(null)
    const [openFilterMenu, setOpenFilterMenu] = useState(null)
    const [filters, setFilters] = useState({})
    const [tempSelectedValues, setTempSelectedValues] = useState([])
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, cajaId: null, itemId: null, itemDescription: '', type: 'item' })
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
    const [newCajaModal, setNewCajaModal] = useState({ isOpen: false, nombre: '', montoInicial: 500 })
    const [resumenMes, setResumenMes] = useState(null)

    // Opciones de filtros
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    const shortMonths = ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Oct.', 'Nov.', 'Dic.']

    // Cargar cajas al montar y cuando cambie el mes/año
    const loadCajas = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await contabilidadService.getCajas({
                mes: selectedMonth + 1,
                anio: selectedYear
            })
            
            if (fetchError) throw fetchError
            
            // Para cada caja, cargar sus movimientos
            const cajasConMovimientos = await Promise.all(
                (data || []).map(async (caja) => {
                    const { data: movimientos } = await contabilidadService.getMovimientos(caja.id_caja)
                    return {
                        ...caja,
                        items: movimientos || []
                    }
                })
            )
            
            setCajas(cajasConMovimientos)
            
            // Cargar resumen del mes
            const { data: resumen } = await contabilidadService.getResumenMes(selectedMonth, selectedYear)
            setResumenMes(resumen)
            
        } catch (err) {
            console.error('Error loading cajas:', err)
            setError('Error al cargar las cajas. Por favor intente de nuevo.')
        } finally {
            setLoading(false)
        }
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        loadCajas()
    }, [loadCajas])

    // Mostrar mensaje de éxito temporalmente
    const showSuccess = (message) => {
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(null), 3000)
    }

    const handleAddCaja = async () => {
        if (!newCajaModal.nombre.trim()) {
            setError('El nombre de la caja es requerido')
            return
        }
        
        setSaving(true)
        try {
            const { data, error: createError } = await contabilidadService.createCaja({
                nombre: newCajaModal.nombre,
                mes: selectedMonth + 1,
                anio: selectedYear,
                monto_inicial: parseFloat(newCajaModal.montoInicial) || 0
            })
            
            if (createError) throw createError
            
            const newCaja = {
                ...data,
                items: []
            }
            
            setCajas(prev => [...prev, newCaja])
            setExpandedCajaId(data.id_caja)
            setNewCajaModal({ isOpen: false, nombre: '', montoInicial: 500 })
            showSuccess('Caja creada exitosamente')
        } catch (err) {
            console.error('Error creating caja:', err)
            if (err.code === '23505') {
                setError('Ya existe una caja con ese nombre para este mes')
            } else {
                setError('Error al crear la caja: ' + (err.message || 'Error desconocido'))
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteCaja = async (id) => {
        setSaving(true)
        try {
            const { error: deleteError } = await contabilidadService.deleteCaja(id)
            if (deleteError) throw deleteError
            
            setCajas(prev => prev.filter(c => c.id_caja !== id))
            setDeleteModal({ isOpen: false, cajaId: null, itemId: null, itemDescription: '', type: 'item' })
            showSuccess('Caja eliminada exitosamente')
        } catch (err) {
            console.error('Error deleting caja:', err)
            setError('Error al eliminar la caja')
        } finally {
            setSaving(false)
        }
    }

    const toggleCaja = (id) => {
        setExpandedCajaId(expandedCajaId === id ? null : id)
    }

    const handleUpdateCaja = async (id, field, value) => {
        // Actualizar localmente primero
        setCajas(prev => prev.map(caja => 
            caja.id_caja === id ? { ...caja, [field]: value } : caja
        ))
    }

    const handleSaveCaja = async (cajaId) => {
        const caja = cajas.find(c => c.id_caja === cajaId)
        if (!caja) return

        setSaving(true)
        try {
            // 1) Guardar la información de la caja (nombre, monto inicial)
            const { error: updateError } = await contabilidadService.updateCaja(cajaId, {
                nombre: caja.nombre,
                monto_inicial: parseFloat(caja.monto_inicial) || 0
            })

            if (updateError) throw updateError

            // 2) Guardar todos los movimientos locales de la caja (sin llamadas automáticas al cambiar campos)
            const items = caja.items || []
            const updatePromises = items.map(item => {
                return contabilidadService.updateMovimiento(item.id_movimiento, {
                    tipo: item.tipo,
                    descripcion: item.descripcion,
                    monto: item.monto,
                    fecha: item.fecha,
                    tipo_documento: item.tipo_documento,
                    numero_documento: item.numero_documento
                })
            })

            // Ejecutar todas las actualizaciones en paralelo
            const results = await Promise.all(updatePromises)
            // Comprobar si alguno devolvió error
            const firstError = results.find(r => r && r.error)
            if (firstError && firstError.error) throw firstError.error

            // 3) Recalcular saldo y recargar cajas para obtener estados actualizados
            await contabilidadService.recalcularSaldoCaja(cajaId)
            await loadCajas()

            showSuccess('Caja y movimientos guardados exitosamente')
        } catch (err) {
            console.error('Error saving caja:', err)
            setError('Error al guardar la caja y/o movimientos')
        } finally {
            setSaving(false)
        }
    }

    const handleAddItem = async (cajaId) => {
        setSaving(true)
        try {
            const { data, error: createError } = await contabilidadService.createMovimiento({
                id_caja: cajaId,
                tipo: 'ingreso',
                descripcion: '',
                monto: 0,
                fecha: new Date().toISOString().split('T')[0],
                tipo_documento: 'BOLETA',
                numero_documento: ''
            })
            
            if (createError) throw createError
            
            setCajas(prev => prev.map(caja => {
                if (caja.id_caja === cajaId) {
                    return { ...caja, items: [...caja.items, data] }
                }
                return caja
            }))
        } catch (err) {
            console.error('Error creating item:', err)
            setError('Error al agregar el movimiento')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateItem = async (cajaId, itemId, field, value) => {
        // Actualizar localmente primero para UI responsiva
        setCajas(prev => prev.map(caja => {
            if (caja.id_caja === cajaId) {
                const newItems = caja.items.map(item => {
                    if (item.id_movimiento === itemId) {
                        return { ...item, [field]: value }
                    }
                    return item
                })
                return { ...caja, items: newItems }
            }
            return caja
        }))
    }

    const handleSaveItem = async (cajaId, itemId, fieldOverride = null, valueOverride = null) => {
        const caja = cajas.find(c => c.id_caja === cajaId)
        let item = caja?.items.find(i => i.id_movimiento === itemId)
        if (!item) return
        
        // Si se pasaron valores override, usarlos (para selects que actualizan y guardan inmediatamente)
        if (fieldOverride && valueOverride !== null) {
            item = { ...item, [fieldOverride]: valueOverride }
        }
        
        setSaving(true)
        try {
            const { error: updateError } = await contabilidadService.updateMovimiento(itemId, {
                tipo: item.tipo,
                descripcion: item.descripcion,
                monto: item.monto,
                fecha: item.fecha,
                tipo_documento: item.tipo_documento,
                numero_documento: item.numero_documento
            })
            
            if (updateError) throw updateError
            
            // Recargar para tener el saldo actualizado
            await loadCajas()
        } catch (err) {
            console.error('Error saving item:', err)
            setError('Error al guardar el movimiento')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteItem = async () => {
        const { cajaId, itemId } = deleteModal
        
        setSaving(true)
        try {
            const { error: deleteError } = await contabilidadService.deleteMovimiento(itemId)
            if (deleteError) throw deleteError
            
            setCajas(prev => prev.map(caja => {
                if (caja.id_caja === cajaId) {
                    return { ...caja, items: caja.items.filter(item => item.id_movimiento !== itemId) }
                }
                return caja
            }))
            
            setDeleteModal({ isOpen: false, cajaId: null, itemId: null, itemDescription: '', type: 'item' })
            showSuccess('Movimiento eliminado')
            
            // Recargar para tener el saldo actualizado
            await loadCajas()
        } catch (err) {
            console.error('Error deleting item:', err)
            setError('Error al eliminar el movimiento')
        } finally {
            setSaving(false)
        }
    }

    // Funciones Helper para Filtros
    const toggleFilterMenu = (key) => {
        if (openFilterMenu === key) {
            setOpenFilterMenu(null)
        } else {
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
        if (column === 'tipo_documento') {
            const values = new Set(items.map(i => i.tipo_documento || 'BOLETA'))
            return Array.from(values).sort()
        }
        const values = new Set(items.map(item => item[column]))
        return Array.from(values).sort()
    }

    const getFilteredItems = (caja) => {
        let items = caja.items.map((item, index) => ({ ...item, originalIndex: index + 1 }))
        const cajaFilters = Object.entries(filters).filter(([key]) => key.startsWith(`${caja.id_caja}-`))

        if (cajaFilters.length === 0) return items

        return items.filter(item => {
            return cajaFilters.every(([key, filterValues]) => {
                const column = key.split('-')[1]
                let itemValue
                if (column === 'originalIndex') {
                    itemValue = item.originalIndex.toString()
                } else if (column === 'tipo_documento') {
                    itemValue = item.tipo_documento || 'BOLETA'
                } else {
                    itemValue = item[column]
                }
                if (Array.isArray(filterValues)) {
                    return filterValues.includes(itemValue)
                }
                return filterValues === itemValue
            })
        })
    }

    const renderFilterHeader = (label, column, caja, widthClass = '') => {
        const menuKey = `${caja.id_caja}-${column}`
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
                            <div className="p-1 max-h-48 overflow-y-auto">
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
                            <div className="p-2 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => handleApplyFilter(caja.id_caja, column)}
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
        const inicial = parseFloat(caja.monto_inicial) || 0
        return inicial + totalItems
    }

    const calculateIngresos = (caja) => {
        return caja.items
            .filter(item => item.tipo === 'ingreso')
            .reduce((acc, item) => acc + (parseFloat(item.monto) || 0), 0)
    }

    const calculateEgresos = (caja) => {
        return caja.items
            .filter(item => item.tipo === 'egreso')
            .reduce((acc, item) => acc + (parseFloat(item.monto) || 0), 0)
    }

    return (
        <AdminLayout>
            {/* Toast de error */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Toast de éxito */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                    <CheckCircle size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Header y Filtros */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-negro-principal flex items-center gap-2">
                            <DollarSign className="text-verde-principal" />
                            Contabilidad - Caja
                        </h1>
                        <p className="text-gris-medio mt-1">Gestión de cajas y movimientos financieros</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-fondo-claro p-2 rounded-lg relative">
                        {/* Selector de Fecha */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                                className="flex items-center gap-2 bg-white border border-gray-300 text-negro-principal text-sm font-semibold rounded-md px-4 py-2 hover:bg-gray-50 transition-colors min-w-[180px] justify-between"
                            >
                                <Calendar size={16} className="text-verde-principal" />
                                <span>{months[selectedMonth]} {selectedYear}</span>
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>

                            {isDateMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDateMenuOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg border border-gray-200 p-4 z-20 w-64">
                                        <div className="mb-4 bg-gray-100 rounded-md p-1">
                                            <input
                                                type="number"
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(parseInt(e.target.value) || currentDate.getFullYear())}
                                                className="w-full bg-transparent border-none text-center font-bold text-gray-800 focus:ring-0 text-lg"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {shortMonths.map((m, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedMonth(idx)
                                                        setIsDateMenuOpen(false)
                                                    }}
                                                    className={`p-2 text-xs font-medium rounded-md transition-colors text-center
                                                        ${selectedMonth === idx
                                                            ? 'bg-verde-principal text-white shadow-md'
                                                            : 'text-gray-600 hover:bg-gray-100'}`}
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
                            onClick={() => loadCajas()}
                            className="p-2 text-gris-medio hover:text-verde-principal hover:bg-verde-claro/20 rounded-md transition-colors"
                            title="Actualizar"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={() => setNewCajaModal({ isOpen: true, nombre: `Caja ${cajas.length + 1}`, montoInicial: 500 })}
                            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm ml-2"
                            disabled={saving}
                        >
                            <Plus size={18} />
                            Nueva Caja
                        </button>
                    </div>
                </div>

                {/* Resumen del mes */}
                {resumenMes && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                <TrendingUp size={16} />
                                Ingresos del Mes
                            </div>
                            <p className="text-xl font-bold text-green-700 mt-1">
                                S/ {(resumenMes.caja?.ingresos || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                <TrendingDown size={16} />
                                Egresos del Mes
                            </div>
                            <p className="text-xl font-bold text-red-700 mt-1">
                                S/ {(resumenMes.caja?.egresos || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                                <DollarSign size={16} />
                                Balance Caja
                            </div>
                            <p className={`text-xl font-bold mt-1 ${(resumenMes.caja?.balance || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                S/ {(resumenMes.caja?.balance || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                                <FileText size={16} />
                                Cajas Activas
                            </div>
                            <p className="text-xl font-bold text-purple-700 mt-1">
                                {cajas.filter(c => c.estado === 'abierta').length}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido Principal */}
            <div className="p-8 max-w-[1600px] mx-auto space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="animate-spin text-verde-principal mb-4" />
                        <p className="text-gris-medio">Cargando cajas...</p>
                    </div>
                ) : cajas.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border-dashed border-2 border-gray-300">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay cajas para {months[selectedMonth]} {selectedYear}</h3>
                        <p className="text-gray-500 mb-6">Comienza creando una nueva caja para este período.</p>
                        <button
                            onClick={() => setNewCajaModal({ isOpen: true, nombre: `Caja ${months[selectedMonth]} ${selectedYear}`, montoInicial: 500 })}
                            className="text-verde-principal font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
                        >
                            <Plus size={18} />
                            Crear mi primera caja
                        </button>
                    </div>
                ) : (
                    cajas.map((caja) => (
                        <div key={caja.id_caja} className="bg-white rounded-xl shadow-card transition-all duration-300">
                            {/* Caja Header */}
                            <div
                                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-l-4
                                    ${expandedCajaId === caja.id_caja ? 'border-l-verde-principal bg-gray-50' : 'border-l-transparent'}
                                    ${caja.estado === 'cerrada' ? 'opacity-75' : ''}`}
                                onClick={() => toggleCaja(caja.id_caja)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${expandedCajaId === caja.id_caja ? 'bg-verde-claro text-verde-principal' : 'bg-gray-100 text-gris-medio'}`}>
                                        {caja.estado === 'cerrada' ? <Lock size={20} /> : <FileText size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-negro-principal">{caja.nombre}</h3>
                                            {caja.estado === 'cerrada' && (
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Cerrada</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gris-medio flex items-center gap-2 flex-wrap">
                                            <span>{new Date(caja.fecha_apertura || caja.created_at).toLocaleDateString('es-PE')}</span>
                                            <span className="text-gray-300">|</span>
                                            <span>{caja.items.length} movimientos</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-green-600">+S/ {calculateIngresos(caja).toFixed(2)}</span>
                                            <span className="text-red-600">-S/ {calculateEgresos(caja).toFixed(2)}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className={`font-semibold ${calculateTotal(caja) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                Saldo: S/ {calculateTotal(caja).toFixed(2)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {caja.estado !== 'cerrada' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteModal({ isOpen: true, cajaId: caja.id_caja, itemId: null, itemDescription: caja.nombre, type: 'caja' })
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Eliminar caja"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    {expandedCajaId === caja.id_caja ? <ChevronUp className="text-gris-medio" /> : <ChevronDown className="text-gris-medio" />}
                                </div>
                            </div>

                            {/* Contenido Expandible */}
                            {expandedCajaId === caja.id_caja && (
                                <div className="border-t border-gray-200 p-6 bg-white">
                                    {/* Monto Inicial */}
                                    <div className="mb-6 flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gris-medio uppercase mb-1">Monto Inicial (S/)</label>
                                            <input
                                                type="number"
                                                value={caja.monto_inicial || 0}
                                                onChange={(e) => handleUpdateCaja(caja.id_caja, 'monto_inicial', e.target.value)}
                                                disabled={caja.estado === 'cerrada'}
                                                className="bg-white border border-gray-300 text-negro-principal text-lg font-bold rounded-md focus:ring-verde-principal focus:border-verde-principal block w-32 p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gris-medio">
                                                Este monto se usará como base. Los egresos se restarán y los ingresos se sumarán.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tabla de movimientos */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[900px] border border-gray-300 border-collapse">
                                            <thead>
                                                <tr className="bg-verde-principal">
                                                    {renderFilterHeader('N°', 'originalIndex', caja, 'w-16')}
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider border border-verde-claro/20">Descripción</th>
                                                    {renderFilterHeader('TIPO', 'tipo', caja, 'w-32')}
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider w-40 border border-verde-claro/20 text-center">Fecha</th>
                                                    {renderFilterHeader('DOCUMENTO', 'tipo_documento', caja, 'w-32')}
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider w-44 border border-verde-claro/20">N° Documento</th>
                                                    <th className="py-3 px-2 text-xs font-bold text-white uppercase tracking-wider w-32 border border-verde-claro/20 text-right">Monto (S/)</th>
                                                    <th className="py-3 px-2 w-24 border border-verde-claro/20"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getFilteredItems(caja).map((item) => (
                                                    <tr key={item.id_movimiento} className="group hover:bg-gray-50">
                                                        <td className="border border-gray-300 text-sm text-gray-500 text-center font-mono bg-gray-50">
                                                            {item.originalIndex}
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="text"
                                                                value={item.descripcion || ''}
                                                                onChange={(e) => handleUpdateItem(caja.id_caja, item.id_movimiento, 'descripcion', e.target.value)}
                                                                placeholder="Descripción del movimiento..."
                                                                disabled={caja.estado === 'cerrada'}
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 transition-colors disabled:bg-gray-100"
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <select
                                                                value={item.tipo}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.value
                                                                    handleUpdateItem(caja.id_caja, item.id_movimiento, 'tipo', newValue)
                                                                }}
                                                                disabled={caja.estado === 'cerrada'}
                                                                className={`w-full h-full p-2 text-sm border-none focus:ring-0 cursor-pointer font-medium
                                                                    ${item.tipo === 'ingreso' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}
                                                                    disabled:cursor-not-allowed`}
                                                            >
                                                                <option value="ingreso">✓ Ingreso</option>
                                                                <option value="egreso">✗ Egreso</option>
                                                            </select>
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="date"
                                                                value={item.fecha?.split('T')[0] || ''}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.value
                                                                    handleUpdateItem(caja.id_caja, item.id_movimiento, 'fecha', newValue)
                                                                }}
                                                                disabled={caja.estado === 'cerrada'}
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 text-center disabled:bg-gray-100"
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <select
                                                                value={item.tipo_documento || 'BOLETA'}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.value
                                                                    handleUpdateItem(caja.id_caja, item.id_movimiento, 'tipo_documento', newValue)
                                                                }}
                                                                disabled={caja.estado === 'cerrada'}
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 cursor-pointer bg-white disabled:bg-gray-100"
                                                            >
                                                                <option value="FACTURA">FACTURA</option>
                                                                <option value="BOLETA">BOLETA</option>
                                                                <option value="RECIBO">RECIBO</option>
                                                                <option value="TALONARIO">TALONARIO</option>
                                                                <option value="OTRO">OTRO</option>
                                                            </select>
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="text"
                                                                value={item.numero_documento || ''}
                                                                onChange={(e) => handleUpdateItem(caja.id_caja, item.id_movimiento, 'numero_documento', e.target.value)}
                                                                placeholder="000-000000"
                                                                disabled={caja.estado === 'cerrada'}
                                                                className="w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 font-mono disabled:bg-gray-100"
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 p-0">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={item.monto || 0}
                                                                onChange={(e) => handleUpdateItem(caja.id_caja, item.id_movimiento, 'monto', e.target.value)}
                                                                placeholder="0.00"
                                                                disabled={caja.estado === 'cerrada'}
                                                                className={`w-full h-full p-2 text-sm border-none focus:ring-0 focus:bg-blue-50 text-right font-bold disabled:bg-gray-100
                                                                    ${item.tipo === 'ingreso' ? 'text-green-700' : 'text-red-700'}`}
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 text-center p-0">
                                                            {caja.estado !== 'cerrada' && (
                                                                <button
                                                                    onClick={() => setDeleteModal({ 
                                                                        isOpen: true, 
                                                                        cajaId: caja.id_caja, 
                                                                        itemId: item.id_movimiento, 
                                                                        itemDescription: item.descripcion || 'este movimiento',
                                                                        type: 'item'
                                                                    })}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50">
                                                    <td colSpan="8" className="border border-gray-300 py-3 px-4">
                                                        <div className="flex justify-between items-center">
                                                            {caja.estado !== 'cerrada' && (
                                                                <button
                                                                    onClick={() => handleAddItem(caja.id_caja)}
                                                                    disabled={saving}
                                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 px-2 hover:bg-blue-50 rounded py-1 transition-colors disabled:opacity-50"
                                                                >
                                                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                                    Agregar movimiento
                                                                </button>
                                                            )}
                                                            <div className="flex items-center gap-6 text-right">
                                                                <div>
                                                                    <span className="text-xs text-gray-500 uppercase">Ingresos</span>
                                                                    <p className="text-green-700 font-bold">+S/ {calculateIngresos(caja).toFixed(2)}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs text-gray-500 uppercase">Egresos</span>
                                                                    <p className="text-red-700 font-bold">-S/ {calculateEgresos(caja).toFixed(2)}</p>
                                                                </div>
                                                                <div className="border-l border-gray-300 pl-6">
                                                                    <span className="text-xs text-gray-500 uppercase">Total Caja</span>
                                                                    <p className={`text-xl font-bold ${calculateTotal(caja) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                                        S/ {calculateTotal(caja).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Botones de acción */}
                                    {caja.estado !== 'cerrada' && (
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleSaveCaja(caja.id_caja)}
                                                disabled={saving}
                                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                Guardar Cambios
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal Nueva Caja */}
            {newCajaModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="text-verde-principal" />
                            Nueva Caja
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Caja</label>
                                <input
                                    type="text"
                                    value={newCajaModal.nombre}
                                    onChange={(e) => setNewCajaModal(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-verde-principal focus:border-verde-principal"
                                    placeholder="Ej: Caja Principal Diciembre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial (S/)</label>
                                <input
                                    type="number"
                                    value={newCajaModal.montoInicial}
                                    onChange={(e) => setNewCajaModal(prev => ({ ...prev, montoInicial: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-verde-principal focus:border-verde-principal"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <p>Se creará una caja para <strong>{months[selectedMonth]} {selectedYear}</strong></p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setNewCajaModal({ isOpen: false, nombre: '', montoInicial: 500 })}
                                className="px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCaja}
                                disabled={saving || !newCajaModal.nombre.trim()}
                                className="px-4 py-2 rounded-lg bg-verde-principal text-white font-medium hover:bg-verde-hover disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Crear Caja
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="text-red-500" />
                            Confirmar Eliminación
                        </h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de eliminar <span className="font-semibold">"{deleteModal.itemDescription}"</span>?
                            {deleteModal.type === 'caja' && (
                                <span className="block mt-2 text-red-600 text-sm">
                                    ⚠️ Se eliminarán también todos los movimientos de esta caja.
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, cajaId: null, itemId: null, itemDescription: '', type: 'item' })}
                                className="px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => deleteModal.type === 'caja' ? handleDeleteCaja(deleteModal.cajaId) : handleDeleteItem()}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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

