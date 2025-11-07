import { supabaseService } from '../lib/supabase'

export const quoteService = {
  // Guardar cotización en Supabase
  async saveQuote(quoteData) {
    try {
      const quote = {
        cliente_nombre: quoteData.cliente.nombre,
        cliente_email: quoteData.cliente.email,
        cliente_telefono: quoteData.cliente.telefono,
        cliente_empresa: quoteData.cliente.empresa,
        cliente_direccion: quoteData.cliente.direccion,
        productos: JSON.stringify(quoteData.productos),
        total_items: quoteData.productos.reduce((total, item) => total + item.cantidad, 0),
        total_productos: quoteData.productos.length,
        observaciones: quoteData.observaciones || '',
        estado: 'pendiente',
        fecha_creacion: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const result = await supabaseService.insertData('cotizaciones', quote)
      return result
    } catch (error) {
      console.error('Error guardando cotización:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener cotizaciones
  async getQuotes(options = {}) {
    try {
      const result = await supabaseService.getData('cotizaciones', {
        orderBy: { column: 'fecha_creacion', ascending: false },
        ...options
      })
      
      if (result.success && result.data) {
        // Parsear productos JSON
        result.data = result.data.map(quote => ({
          ...quote,
          productos: JSON.parse(quote.productos || '[]')
        }))
      }
      
      return result
    } catch (error) {
      console.error('Error obteniendo cotizaciones:', error)
      return { success: false, error: error.message }
    }
  },

  // Actualizar estado de cotización
  async updateQuoteStatus(id, status) {
    try {
      const result = await supabaseService.updateData('cotizaciones', id, {
        estado: status,
        updated_at: new Date().toISOString()
      })
      return result
    } catch (error) {
      console.error('Error actualizando estado de cotización:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener cotización por ID
  async getQuoteById(id) {
    try {
      const result = await supabaseService.getData('cotizaciones', {
        filters: [{ column: 'id', value: id }],
        limit: 1
      })
      
      if (result.success && result.data && result.data.length > 0) {
        const quote = result.data[0]
        quote.productos = JSON.parse(quote.productos || '[]')
        return { success: true, data: quote }
      }
      
      return { success: false, error: 'Cotización no encontrada' }
    } catch (error) {
      console.error('Error obteniendo cotización:', error)
      return { success: false, error: error.message }
    }
  },

  // Eliminar cotización
  async deleteQuote(id) {
    try {
      const result = await supabaseService.deleteData('cotizaciones', id)
      return result
    } catch (error) {
      console.error('Error eliminando cotización:', error)
      return { success: false, error: error.message }
    }
  },

  // Guardar contacto/lead
  async saveContact(contactData) {
    try {
      const contact = {
        nombre: contactData.nombre,
        email: contactData.email,
        telefono: contactData.telefono,
        empresa: contactData.empresa || '',
        mensaje: contactData.mensaje || '',
        tipo_consulta: contactData.tipo || 'general',
        fecha_creacion: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const result = await supabaseService.insertData('contactos', contact)
      return result
    } catch (error) {
      console.error('Error guardando contacto:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener contactos
  async getContacts(options = {}) {
    try {
      const result = await supabaseService.getData('contactos', {
        orderBy: { column: 'fecha_creacion', ascending: false },
        ...options
      })
      return result
    } catch (error) {
      console.error('Error obteniendo contactos:', error)
      return { success: false, error: error.message }
    }
  }
}

export default quoteService
