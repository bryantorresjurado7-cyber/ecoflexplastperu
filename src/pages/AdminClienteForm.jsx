import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { clientesService } from '../services/clientesService'
import { ArrowLeft, Save, User, Printer } from 'lucide-react'
import ClientPrintModal from '../components/ClientPrintModal'

const AdminClienteForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [showPrintModal, setShowPrintModal] = useState(false)

    const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            nombre: '',
            email: '',
            telefono: '',
            tipo_documento: 'DNI',
            numero_documento: '',
            direccion: '',
            descripcion: '',
            estado: true
        }
    })

    useEffect(() => {
        if (id) {
            loadCliente()
        }
    }, [id])

    const loadCliente = async () => {
        setLoading(true)
        try {
            const data = await clientesService.getById(id)
            if (data) {
                reset({
                    nombre: data.nombre || '',
                    email: data.email || '',
                    telefono: data.telefono || '',
                    tipo_documento: data.tipo_documento || 'DNI',
                    numero_documento: data.numero_documento || '',
                    direccion: data.direccion || '',
                    descripcion: data.descripcion || '',
                    estado: typeof data.estado === 'boolean' ? data.estado : true
                })
            }
        } catch (error) {
            console.error('Error cargando cliente:', error)
            alert('Error al cargar el cliente')
            navigate('/admin/clientes')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (values) => {
        setSubmitting(true)
        try {
            const payload = {
                nombre: values.nombre?.trim(),
                email: values.email?.trim() || null,
                telefono: values.telefono?.trim() || null,
                tipo_documento: values.tipo_documento || 'DNI',
                numero_documento: values.numero_documento?.trim() || null,
                direccion: values.direccion?.trim() || null,
                descripcion: values.descripcion?.trim() || null,
                estado: typeof values.estado === 'boolean' ? values.estado : (values.estado === 'true' || values.estado === true)
            }

            if (id) {
                await clientesService.update(id, payload)
            } else {
                await clientesService.create(payload)
            }
            navigate('/admin/clientes')
        } catch (error) {
            console.error('Error guardando cliente:', error)
            alert(error.message || 'Error guardando cliente')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-principal"></div>
                        <p className="mt-4 text-gris-medio">Cargando...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/clientes')}
                        className="flex items-center gap-2 text-gris-medio hover:text-negro-principal mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver a Clientes
                    </button>
                    <h1 className="text-3xl font-bold text-negro-principal">
                        {id ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h1>
                </div>

                {/* Form */}
                <div className="max-w-4xl">
                    <div className="bg-white rounded-xl shadow-card p-8">
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-negro-principal flex items-center gap-2">
                                <User size={24} className="text-verde-principal" />
                                Información General
                            </h2>
                            <p className="text-sm text-gris-medio mt-1">
                                Complete la información del cliente.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Nombre *</label>
                                    <input
                                        className="input-field"
                                        placeholder="Ej: Juan Pérez o Empresa SAC"
                                        {...register('nombre', { required: 'El nombre es obligatorio' })}
                                    />
                                    {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Email *</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        placeholder="correo@ejemplo.com"
                                        {...register('email', { required: 'El email es obligatorio' })}
                                    />
                                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Teléfono</label>
                                    <input
                                        className="input-field"
                                        placeholder="Ej: 999 999 999"
                                        {...register('telefono')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Estado</label>
                                    <select
                                        className="input-field"
                                        {...register('estado')}
                                    >
                                        <option value={true}>Activo</option>
                                        <option value={false}>Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Tipo Documento</label>
                                    <select
                                        className="input-field"
                                        {...register('tipo_documento')}
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                        <option value="CE">CE</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Número de Documento</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Ej: 12345678"
                                        {...register('numero_documento')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-gray-50">
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Dirección</label>
                                    <input
                                        className="input-field"
                                        placeholder="Dirección completa..."
                                        {...register('direccion')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-negro-principal mb-2">Descripción / Notas</label>
                                    <textarea
                                        rows={3}
                                        className="input-field"
                                        placeholder="Información adicional..."
                                        {...register('descripcion')}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gris-muy-claro">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/clientes')}
                                    className="px-6 py-3 border border-gris-muy-claro rounded-xl font-medium text-gris-oscuro hover:bg-fondo-claro transition-colors"
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
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            <span>Guardar Cliente</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>


                <ClientPrintModal
                    isOpen={showPrintModal}
                    onClose={() => setShowPrintModal(false)}
                    data={getValues()}
                />
            </div >
        </AdminLayout >
    )
}

export default AdminClienteForm
