import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, Upload, Printer } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import CajaChicaPrintModal from '../components/CajaChicaPrintModal'

const AdminCajaChicaMovimientoForm = () => {
    const navigate = useNavigate()
    const [tipo, setTipo] = useState('egreso') // Default to egreso as per previous button behavior
    const [submitting, setSubmitting] = useState(false)
    const [showPrintModal, setShowPrintModal] = useState(false)

    // Using react-hook-form for better management, though migration from state-based form is also fine.
    // Given the previous file used simple state, I will stick to a similar simple state approach to minimize friction, 
    // or upgrade to react-hook-form for consistency with ClientForm.
    // Let's use standard state to match the logic I'm extracting, but wrapped in a clean component.

    // actually, let's use the local state approach from the modal to be safe and quick, 
    // but structure it nicely.
    const [formData, setFormData] = useState({
        monto: '',
        motivo: '',
        categoria: '', // will be set based on tipo
        responsable: '',
        fecha: new Date().toISOString().split('T')[0],
        comprobante: null
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            console.log('Saving:', { ...formData, tipo })
            alert(tipo === 'ingreso' ? 'Ingreso registrado correctamente' : 'Gasto registrado correctamente')
            setSubmitting(false)
            navigate('/admin/transacciones/movimientos')
        }, 1000)
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/transacciones/movimientos')}
                        className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver a Movimientos
                    </button>
                    <h1 className="text-3xl font-bold text-negro-principal">
                        Nuevo Registro
                    </h1>
                </div>

                {/* Form Card */}
                <div className="max-w-2xl">
                    <div className="bg-white rounded-xl shadow-card p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Tipo Selection */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="block text-sm font-semibold text-negro-principal mb-3">
                                    Tipo de Movimiento
                                </label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tipo"
                                            value="ingreso"
                                            checked={tipo === 'ingreso'}
                                            onChange={() => {
                                                setTipo('ingreso')
                                                setFormData({ ...formData, categoria: 'Reposición' })
                                            }}
                                            className="w-4 h-4 text-verde-principal focus:ring-verde-principal"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Ingreso (Reposición)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tipo"
                                            value="egreso"
                                            checked={tipo === 'egreso'}
                                            onChange={() => {
                                                setTipo('egreso')
                                                setFormData({ ...formData, categoria: '' })
                                            }}
                                            className="w-4 h-4 text-red-600 focus:ring-red-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Gasto / Egreso</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Monto (S/) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Motivo / Descripción *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                    className="input-field w-full"
                                    placeholder={tipo === 'ingreso' ? 'Ej: Reposición semanal' : 'Ej: Taxi a cliente'}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Categoría
                                    </label>
                                    <select
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                        className="input-field w-full"
                                    >
                                        {tipo === 'ingreso' ? (
                                            <option value="Reposición">Reposición</option>
                                        ) : (
                                            <>
                                                <option value="">Seleccionar...</option>
                                                <option value="Transporte">Transporte</option>
                                                <option value="Alimentación">Alimentación</option>
                                                <option value="Materiales">Materiales</option>
                                                <option value="Limpieza">Limpieza</option>
                                                <option value="Otros">Otros</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">
                                        Responsable
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.responsable}
                                        onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="Nombre del responsable"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Comprobante (Opcional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Upload className="mx-auto text-gris-medio mb-3" size={32} />
                                    <span className="text-sm text-gris-medio font-medium">Click para subir foto o PDF</span>
                                    <p className="text-xs text-gris-claro mt-1">PNG, JPG o PDF hasta 5MB</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/transacciones/movimientos')}
                                    className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPrintModal(true)}
                                    className="px-6 py-3 border border-verde-principal text-verde-principal rounded-xl font-medium hover:bg-verde-light transition-colors flex items-center gap-2"
                                    disabled={submitting}
                                >
                                    <Printer size={20} />
                                    Imprimir
                                </button>
                                <button
                                    type="submit"
                                    className={`px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg transition-all ${tipo === 'ingreso'
                                        ? 'bg-verde-principal hover:bg-green-700 hover:shadow-green-200'
                                        : 'bg-red-600 hover:bg-red-700 hover:shadow-red-200'
                                        }`}
                                    disabled={submitting}
                                >
                                    <Save size={20} />
                                    {submitting ? 'Guardando...' : `Guardar ${tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}`}
                                </button>
                            </div>

                            {/* Print Modal */}
                            <CajaChicaPrintModal
                                isOpen={showPrintModal}
                                onClose={() => setShowPrintModal(false)}
                                data={{ ...formData, tipo }}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChicaMovimientoForm
