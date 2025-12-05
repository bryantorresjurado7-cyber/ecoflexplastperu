import * as XLSX from 'xlsx'

/**
 * Exporta datos a un archivo Excel (.xlsx)
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {Array} columns - Array de objetos con la configuración de columnas { key, label }
 * @param {String} filename - Nombre del archivo sin extensión
 */
export const exportToExcel = (data, columns, filename = 'exportacion') => {
  try {
    // Si no hay datos, mostrar mensaje
    if (!data || data.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    // Preparar los datos para Excel
    const excelData = data.map(item => {
      const row = {}
      columns.forEach(col => {
        // Obtener el valor del campo
        let value = item[col.key]
        
        // Manejar valores anidados (ej: cliente.nombre)
        if (col.key.includes('.')) {
          const keys = col.key.split('.')
          value = keys.reduce((obj, key) => {
            if (obj && typeof obj === 'object') {
              return obj[key]
            }
            return undefined
          }, item)
        }
        
        // Formatear valores especiales
        if (value === null || value === undefined) {
          value = ''
        } else if (typeof value === 'boolean') {
          value = value ? 'Sí' : 'No'
        } else if (value instanceof Date) {
          value = new Date(value).toLocaleDateString('es-PE')
        } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
          // Formatear strings que parecen fechas ISO
          try {
            value = new Date(value).toLocaleDateString('es-PE')
          } catch (e) {
            // Si falla, dejar el valor original
          }
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Si es un objeto, intentar obtener propiedades comunes
          if (value.nombre) {
            value = value.nombre
          } else if (value.email) {
            value = value.email
          } else {
            value = JSON.stringify(value)
          }
        } else if (Array.isArray(value)) {
          value = value.length > 0 ? value.map(v => typeof v === 'object' ? v.nombre || JSON.stringify(v) : v).join(', ') : ''
        }
        
        row[col.label] = value
      })
      return row
    })

    // Crear workbook y worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')

    // Ajustar ancho de columnas
    const columnWidths = columns.map(col => ({
      wch: Math.max(col.label.length, 15)
    }))
    worksheet['!cols'] = columnWidths

    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Crear URL y descargar
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    alert('Error al exportar los datos. Por favor, intente nuevamente.')
  }
}

