import { useState, useEffect } from 'react'
import { supabaseService } from '../lib/supabase'

export const useSupabase = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [error, setError] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await supabaseService.testConnection()
        if (result.success) {
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('error')
          setError(result.message)
        }
      } catch (err) {
        setConnectionStatus('error')
        setError(err.message)
      }
    }

    testConnection()
  }, [])

  return {
    connectionStatus,
    error,
    supabaseService
  }
}

// Hook para manejar operaciones CRUD
export const useSupabaseCRUD = (tableName) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getData = async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await supabaseService.getData(tableName, options)
      if (!result.success) {
        setError(result.error)
        return null
      }
      return result.data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const insertData = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await supabaseService.insertData(tableName, data)
      if (!result.success) {
        setError(result.error)
        return null
      }
      return result.data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateData = async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const result = await supabaseService.updateData(tableName, id, updates)
      if (!result.success) {
        setError(result.error)
        return null
      }
      return result.data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteData = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await supabaseService.deleteData(tableName, id)
      if (!result.success) {
        setError(result.error)
        return null
      }
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getData,
    insertData,
    updateData,
    deleteData
  }
}
