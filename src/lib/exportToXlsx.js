import * as XLSX from 'xlsx';

export function exportToXlsx(filename, data, columns) {
    // data: array de objetos con las claves correspondientes a las columnas
    // columns: array de strings para los encabezados (opcional, si no se pasa usa las keys del primer objeto)
    // O si data es array de arrays, columns es necesario para el header manual si se desea.

    // Adaptación para que funcione similar a exportToCsv del proyecto
    // Si data es array de arrays y columns son los headers:
    let ws_data = [];

    if (columns) {
        ws_data.push(columns);
    }

    ws_data = ws_data.concat(data);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Ajustar ancho de columnas (simple)
    if (ws_data.length > 0) {
        const colWidths = ws_data[0].map((col, i) => {
            return { wch: Math.max(15, String(col).length + 5) }; // Ancho mínimo 15
        });
        ws['!cols'] = colWidths;
    }

    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    // Generar archivo y descargar
    XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
