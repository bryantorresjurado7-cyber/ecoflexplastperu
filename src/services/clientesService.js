import { supabase } from '../lib/supabase'

export const clientesService = {
  async list({ page = 1, limit = 20, q = '' } = {}) {
    try {
      let query = supabase
        .from('clientes') // Updated table name
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Search by name, email, phone or document number
      if (q && q.trim()) {
        query = query.or(`nombre.ilike.%${q}%,email.ilike.%${q}%,telefono.ilike.%${q}%,numero_documento.ilike.%${q}%`)
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      const mappedData = (data || []).map(c => ({
        id: c.id,
        nombre: c.nombre || '',
        email: c.email || '',
        telefono: c.telefono || '',
        tipo_documento: c.tipo_documento || 'DNI',
        numero_documento: c.numero_documento || '',
        direccion: c.direccion || '',
        descripcion: c.descripcion || '',
        auditoria: c.auditoria || '',
        estado: typeof c.estado === 'boolean' ? c.estado : (c.estado !== false && c.estado !== 'false'),
        created_at: c.created_at,
        updated_at: c.updated_at,
        created_by: c.created_by,
        updated_by: c.updated_by,
      }))

      return {
        data: mappedData,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error en clientesService.list:', error)
      throw error
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const c = data
      return {
        id: c.id,
        nombre: c.nombre || '',
        email: c.email || '',
        telefono: c.telefono || '',
        tipo_documento: c.tipo_documento || 'DNI',
        numero_documento: c.numero_documento || '',
        direccion: c.direccion || '',
        descripcion: c.descripcion || '',
        auditoria: c.auditoria || '',
        estado: typeof c.estado === 'boolean' ? c.estado : (c.estado !== false && c.estado !== 'false'),
        created_at: c.created_at,
        updated_at: c.updated_at,
        created_by: c.created_by,
        updated_by: c.updated_by,
      }
    } catch (error) {
      console.error('Error en clientesService.getById:', error)
      throw error
    }
  },

  async create(payload) {
    try {
      const insertData = {
        nombre: payload.nombre?.trim(),
        tipo_documento: payload.tipo_documento || 'DNI',
        numero_documento: payload.numero_documento?.trim() || null,
        direccion: payload.direccion?.trim() || null,
        telefono: payload.telefono?.trim() || null,
        email: payload.email?.trim() || null,
        descripcion: payload.descripcion?.trim() || null,
        auditoria: payload.auditoria || 'Auto',
        estado: payload.estado !== undefined ? payload.estado : true
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error en clientesService.create:', error)
      throw error
    }
  },

  async update(id, payload) {
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      }

      if (payload.nombre !== undefined) updateData.nombre = payload.nombre?.trim()
      if (payload.tipo_documento !== undefined) updateData.tipo_documento = payload.tipo_documento
      if (payload.numero_documento !== undefined) updateData.numero_documento = payload.numero_documento?.trim() || null
      if (payload.direccion !== undefined) updateData.direccion = payload.direccion?.trim() || null
      if (payload.telefono !== undefined) updateData.telefono = payload.telefono?.trim() || null
      if (payload.email !== undefined) updateData.email = payload.email?.trim() || null
      if (payload.descripcion !== undefined) updateData.descripcion = payload.descripcion?.trim() || null
      if (payload.auditoria !== undefined) updateData.auditoria = payload.auditoria
      if (payload.estado !== undefined) updateData.estado = payload.estado

      const { data, error } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error en clientesService.update:', error)
      throw error
    }
  },

  async remove(id) {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error en clientesService.remove:', error)
      throw error
    }
  }
}

export default clientesService
