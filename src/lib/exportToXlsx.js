import * as XLSX from 'xlsx'

export const exportToXlsx = (data, fileName = 'export.xlsx', sheetName = 'Hoja1') => {
    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Ajustar ancho de columnas automáticamente (simple)
    const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, 20)
    }))
    ws['!cols'] = colWidths

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Generar y descargar archivo
    XLSX.writeFile(wb, fileName)
}
