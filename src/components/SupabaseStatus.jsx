import { useSupabase } from '../hooks/useSupabase'

const SupabaseStatus = () => {
  const { connectionStatus, error } = useSupabase()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢 Conectado a Supabase'
      case 'error':
        return '🔴 Error de conexión'
      default:
        return '🟡 Verificando conexión...'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg shadow-lg border ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <p className="font-semibold text-sm">{getStatusText()}</p>
            {error && (
              <p className="text-xs opacity-75 mt-1">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupabaseStatus
