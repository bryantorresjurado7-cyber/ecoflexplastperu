import React from 'react'

const ConfirmDialog = ({ open, title = 'Confirmar', message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, loading = false }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onCancel} />
      <div className="relative bg-white rounded-xl shadow-card w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-negro-principal">{title}</h3>
        {message && <p className="mt-2 text-sm text-gris-medio">{message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 border border-gris-claro rounded-lg hover:bg-fondo-claro disabled:opacity-50">{cancelText}</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Eliminando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
