import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const ClienteFormModal = ({ open, initialData, onSubmit, onClose, submitting }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
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
    if (open) {
      reset({
        nombre: initialData?.nombre || '',
        email: initialData?.email || '',
        telefono: initialData?.telefono || '',
        tipo_documento: initialData?.tipo_documento || 'DNI',
        numero_documento: initialData?.numero_documento || '',
        direccion: initialData?.direccion || '',
        descripcion: initialData?.descripcion || '',
        estado: typeof initialData?.estado === 'boolean' ? initialData.estado : true
      })
    }
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-xl shadow-card w-full max-w-2xl mx-4 p-6">
        <h3 className="text-lg font-semibold text-negro-principal">
          {initialData?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gris-medio">Nombre</label>
            <input className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" {...register('nombre', { required: 'El nombre es obligatorio' })} />
            {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gris-medio">Email</label>
            <input type="email" className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" {...register('email', { required: 'El email es obligatorio' })} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gris-medio">Teléfono</label>
            <input className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" {...register('telefono')} />
          </div>
          <div>
            <label className="text-sm text-gris-medio">Tipo Documento</label>
            <select className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" {...register('tipo_documento')}>
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="CE">CE</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gris-medio">Número de Documento</label>
            <input 
              type="text" 
              className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" 
              placeholder="Ej: 12345678"
              {...register('numero_documento')} 
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gris-medio">Dirección</label>
            <input className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" {...register('direccion')} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gris-medio">Descripción</label>
            <textarea rows={3} className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" {...register('descripcion')} />
          </div>
          <div>
            <label className="text-sm text-gris-medio">Estado</label>
            <select className="mt-1 w-full border border-gris-claro rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-principal" {...register('estado')}>
              <option value={true}>Activo</option>
              <option value={false}>Inactivo</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 border border-gris-claro rounded-lg hover:bg-fondo-claro disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-verde-principal text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClienteFormModal
