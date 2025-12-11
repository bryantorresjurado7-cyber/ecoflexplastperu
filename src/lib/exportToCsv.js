export function exportToCsv(filename, columns, rows) {
    // columns: array de encabezados (strings)
    // rows: array de arrays de valores en el mismo orden que columns

    const csvContent =
        [columns.join(','), ...rows.map(r =>
            r.map(value => {
                if (value === null || value === undefined) return '';
                const str = String(value).replace(/"/g, '""');
                return `"${str}"`;
            }).join(',')
        )].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
