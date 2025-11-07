// Mapeo centralizado de precios. Modifica aquí los precios reales por código.
// Ejemplos iniciales variados para demostración.

export const preciosPorCodigo = {
  // Zunchos NEGRO 5/8
  'ZPN-58-1500': 81.76,
  'ZPN-58-1000': 57.68,
  'ZPN-58-800': 56.00,
  'ZPN-58-720': 50.40,
  'ZPN-58-700': 48.94,
  'ZPN-58-680': 47.60,
  'ZPN-58-650': 45.47,
  'ZPN-58-640': 44.80,
  'ZPN-58-600': 42.11,
  'ZPN-58-560': 39.54,
  'ZPN-58-480': 33.94,
  'ZPN-58-400': 28.56,
  'ZPN-58-360': 25.20,

  // Zunchos NEGRO 1/2
  'ZPN-12-1250': 59.36,
  'ZPN-12-1100': 58.80,
  'ZPN-12-1000': 56.80,
  'ZPN-12-800': 57.50,

  // Zunchos BLANCO (muestra)
  'ZPB-58-1500': 128.00,
  'ZPB-58-1000': 88.91,
  'ZPB-58-800': 71.12,
  'ZPB-58-720': 64.06,
  'ZPB-12-1250': 76.90,
  'ZPB-12-1100': 71.12,
  'ZPB-12-1000': 65.30,
  'ZPB-12-800': 55.90,

  // Zunchos AZUL (muestra)
  'ZPA-58-1500': 128.00,
  'ZPA-58-1000': 88.91,
  'ZPA-58-800': 71.12,
  'ZPA-58-720': 64.06,
  'ZPA-12-1250': 76.90,
  'ZPA-12-1100': 71.12,
  'ZPA-12-1000': 65.30,
  'ZPA-12-800': 55.90,

  // Amarillo (ZPY)
  'ZPY-58-1500': 128.00,
  'ZPY-58-1000': 88.91,
  'ZPY-58-800': 71.12,
  'ZPY-58-720': 64.06,
  'ZPY-12-1250': 76.90,
  'ZPY-12-1100': 71.12,
  'ZPY-12-1000': 65.30,
  'ZPY-12-800': 55.90,

  // Rojo (ZPR)
  'ZPR-58-1500': 128.00,
  'ZPR-58-1000': 88.91,
  'ZPR-58-800': 71.12,
  'ZPR-58-720': 64.06,
  'ZPR-12-1250': 76.90,
  'ZPR-12-1100': 71.12,
  'ZPR-12-1000': 65.30,
  'ZPR-12-800': 55.90,

  // -------------------------------
  // Esquineros (ESQ)
  // Formato de código: ESQ-37x37x2_8-VAR-<COLOR>-G<20|19|18>
  // Colores: N (negro), B (blanco), A (azul), Y (amarillo), R (rojo), V (verde)
  // Ajusta los valores a tus precios reales

  // Negro (N)
  'ESQ-37x37x2_8-VAR-N-G20': 82.00,
  'ESQ-37x37x2_8-VAR-N-G19': 79.00,
  'ESQ-37x37x2_8-VAR-N-G18': 76.00,

  // Blanco (B)
  'ESQ-37x37x2_8-VAR-B-G20': 83.00,
  'ESQ-37x37x2_8-VAR-B-G19': 80.00,
  'ESQ-37x37x2_8-VAR-B-G18': 77.00,

  // Azul (A)
  'ESQ-37x37x2_8-VAR-A-G20': 83.00,
  'ESQ-37x37x2_8-VAR-A-G19': 80.00,
  'ESQ-37x37x2_8-VAR-A-G18': 77.00,

  // Amarillo (Y)
  'ESQ-37x37x2_8-VAR-Y-G20': 83.00,
  'ESQ-37x37x2_8-VAR-Y-G19': 80.00, 
  'ESQ-37x37x2_8-VAR-Y-G18': 77.00,

  // Rojo (R)
  'ESQ-37x37x2_8-VAR-R-G20': 83.00,
  'ESQ-37x37x2_8-VAR-R-G19': 80.00,
  'ESQ-37x37x2_8-VAR-R-G18': 77.00,

  // Verde (V)
  'ESQ-37x37x2_8-VAR-V-G20': 83.00,
  'ESQ-37x37x2_8-VAR-V-G19': 80.00,
  'ESQ-37x37x2_8-VAR-V-G18': 77.00,

  // -------------------------------
  // Burbupack (BB)
  // Formato de código: BB-<anchoCM>-<largoM>
  // Anchos: 0.40, 0.50, 0.58, 1.00, 1.50 → 40, 50, 58, 100, 150
  // Largos: 80, 100
  // Ajusta los valores a tus precios reales

  'BB-40-80': 32.00,
  'BB-40-100': 40.00,
  'BB-50-80': 40.00,
  'BB-50-100': 50.00,
  'BB-58-80': 46.40,
  'BB-58-100': 58.00,
  'BB-100-80': 80.00,
  'BB-100-100': 100.00,
  'BB-150-80': 120.00,
  'BB-150-100': 150.00,
  
  // -------------------------------
  // Mangas plásticas (MG)
  // Formato de código: MG-<altoCM>-<COLOR>
  // Colores: N (negro), B (blanco), A (azul), Y (amarillo), R (rojo), V (verde), T (transparente)
  // Ajusta los valores a tus precios reales
  // Alto 1.00 m (100 cm)
  'MG-100-N': 0,
  'MG-100-B': 0,
  'MG-100-A': 0,
  'MG-100-Y': 0,
  'MG-100-R': 0,
  'MG-100-V': 0,
  'MG-100-T': 0,
  // Alto 1.50 m (150 cm)
  'MG-150-N': 0,
  'MG-150-B': 0,
  'MG-150-A': 0,
  'MG-150-Y': 0,
  'MG-150-R': 0,
  'MG-150-V': 0,
  'MG-150-T': 0,
  
  // -------------------------------
  // Accesorios (ACC)
  'ACC-GRAPAS-METALICAS': 38.00,
  'ACC-TENSADOR-MANUAL': 370.00,
  'ACC-TENAZA-CORTADORA': 65.00,
};

export function getPrecioPorCodigo(codigo) {
  const val = preciosPorCodigo[codigo];
  return typeof val === 'number' ? val : undefined;
}

// Fallback calculado para mostrar valores distintos si no hay precio explícito
export function getPrecioPorProducto(p) {
  if (!p) return undefined;
  if (typeof p.precio === 'number') return p.precio;

  const byCode = p.codigo ? getPrecioPorCodigo(p.codigo) : undefined;
  if (typeof byCode === 'number') return byCode;

  // Inferir por categoría/atributos
  const colorSurcharge = (id) => ({
    negro: 0,
    blanco: 5,
    azul: 4,
    amarillo: 3,
    rojo: 4,
    verde: 3,
    transparente: 2,
  })[String(id || '').toLowerCase()] || 0;

  if (p.categoria === 'burbupack' && p.medidas) {
    const ancho = Number(p.medidas.anchoM || 0);
    const largo = Number(p.medidas.largoM || 0);
    const price = Math.max(59.9, Number((ancho * largo * 0.8 + colorSurcharge(p.color)).toFixed(2)));
    return price;
  }
  if (p.categoria === 'esquinero') {
    const g = Number(p.gramajeGxm || 0.2);
    const price = Math.max(59.9, Number((60 + g * 100 + colorSurcharge(p.color)).toFixed(2)));
    return price;
  }
  if (p.categoria === 'manga' && p.medidas) {
    const alto = Number(p.medidas.altoM || 0);
    const esp = Number(p.medidas.espesorMM || 2);
    const factor = esp / 2;
    const price = Math.max(59.9, Number((alto * 100 * factor + colorSurcharge(p.color)).toFixed(2)));
    return price;
  }

  // Zuncho (V1 o V2) o fallback genérico
  const anchoStr = String(p.ancho || '').trim();
  const largo = Number(p.largo || 0);
  const anchoMap = { '1/2': 0.5, '5/8': 0.625 };
  const w = anchoMap[anchoStr] || (parseFloat(anchoStr.replace('"', '').replace("'", '')) || 0.5);
  const price = Math.max(49.9, Number((w * largo * 0.1 + colorSurcharge(p.color) + 49.9).toFixed(2)));
  return price;
}


// -------------------------------------------------------------
// Tabla de precios por longitud para Esquinero plástico VERDE
// Datos provistos por el cliente (PEN / unidad)
// Campos: { color: 'verde', longitudM, pesoKg, precioUnidad, gr? }
// Algunos ítems incluyen gramaje específico (gr: 18 o 20)
export const tablaEsquinerosVerde = [
  { color: 'verde', longitudM: 0.17, pesoKg: 0.034, precioUnidad: 0.25, gr: 20 },
  { color: 'verde', longitudM: 0.19, pesoKg: 0.038, precioUnidad: 0.28, gr: 20 },
  { color: 'verde', longitudM: 0.20, pesoKg: 0.040, precioUnidad: 0.30, gr: 20 },
  { color: 'verde', longitudM: 0.23, pesoKg: 0.046, precioUnidad: 0.34, gr: 20 },
  { color: 'verde', longitudM: 0.25, pesoKg: 0.050, precioUnidad: 0.37, gr: 20 },
  { color: 'verde', longitudM: 0.26, pesoKg: 0.052, precioUnidad: 0.39, gr: 20 },
  { color: 'verde', longitudM: 0.30, pesoKg: 0.060, precioUnidad: 0.45, gr: 20 },
  { color: 'verde', longitudM: 0.36, pesoKg: 0.072, precioUnidad: 0.54, gr: 20 },
  { color: 'verde', longitudM: 0.39, pesoKg: 0.078, precioUnidad: 0.58, gr: 20 },
  { color: 'verde', longitudM: 0.54, pesoKg: 0.108, precioUnidad: 0.80, gr: 20 },
  { color: 'verde', longitudM: 0.55, pesoKg: 0.110, precioUnidad: 0.82, gr: 20 },
  { color: 'verde', longitudM: 0.75, pesoKg: 0.150, precioUnidad: 1.12, gr: 20 },
  { color: 'verde', longitudM: 0.85, pesoKg: 0.170, precioUnidad: 1.27, gr: 20 },
  { color: 'verde', longitudM: 0.90, pesoKg: 0.180, precioUnidad: 1.34, gr: 20 },
  { color: 'verde', longitudM: 0.96, pesoKg: 0.192, precioUnidad: 1.43, gr: 20 },
  { color: 'verde', longitudM: 0.95, pesoKg: 0.190, precioUnidad: 1.42, gr: 20 },
  { color: 'verde', longitudM: 0.97, pesoKg: 0.194, precioUnidad: 1.44, gr: 20 },
  { color: 'verde', longitudM: 1.00, pesoKg: 0.200, precioUnidad: 1.49, gr: 20 },
  { color: 'verde', longitudM: 1.03, pesoKg: 0.206, precioUnidad: 1.53, gr: 20 },
  { color: 'verde', longitudM: 1.05, pesoKg: 0.210, precioUnidad: 1.56, gr: 20 },
  { color: 'verde', longitudM: 1.10, pesoKg: 0.220, precioUnidad: 1.64, gr: 20 },
  { color: 'verde', longitudM: 1.14, pesoKg: 0.228, precioUnidad: 1.70, gr: 20 },
  { color: 'verde', longitudM: 1.15, pesoKg: 0.230, precioUnidad: 1.71, gr: 20 },
  { color: 'verde', longitudM: 1.17, pesoKg: 0.234, precioUnidad: 1.74, gr: 20 },
  { color: 'verde', longitudM: 1.20, pesoKg: 0.240, precioUnidad: 1.79, gr: 20 },
  { color: 'verde', longitudM: 1.40, pesoKg: 0.280, precioUnidad: 2.09, gr: 20 },
  { color: 'verde', longitudM: 1.44, pesoKg: 0.288, precioUnidad: 2.15, gr: 20 },
  { color: 'verde', longitudM: 1.45, pesoKg: 0.290, precioUnidad: 2.16, gr: 20 },
  { color: 'verde', longitudM: 1.50, pesoKg: 0.300, precioUnidad: 2.23, gr: 20 },
  { color: 'verde', longitudM: 1.55, pesoKg: 0.310, precioUnidad: 2.31, gr: 20 },
  { color: 'verde', longitudM: 1.56, pesoKg: 0.312, precioUnidad: 2.32, gr: 20 },
  { color: 'verde', longitudM: 1.60, pesoKg: 0.320, precioUnidad: 2.38, gr: 20 },
  { color: 'verde', longitudM: 1.70, pesoKg: 0.340, precioUnidad: 2.53, gr: 20 },
  { color: 'verde', longitudM: 1.75, pesoKg: 0.350, precioUnidad: 2.61, gr: 20 },
  { color: 'verde', longitudM: 1.80, pesoKg: 0.360, precioUnidad: 2.68, gr: 20 },
  { color: 'verde', longitudM: 1.85, pesoKg: 0.370, precioUnidad: 2.76, gr: 20 },
  { color: 'verde', longitudM: 1.90, pesoKg: 0.380, precioUnidad: 2.83, gr: 20 },
  { color: 'verde', longitudM: 1.93, pesoKg: 0.386, precioUnidad: 2.87, gr: 20 },
  { color: 'verde', longitudM: 1.95, pesoKg: 0.390, precioUnidad: 2.90, gr: 20 },
  { color: 'verde', longitudM: 1.98, pesoKg: 0.396, precioUnidad: 2.95, gr: 20 },
  { color: 'verde', longitudM: 2.00, pesoKg: 0.400, precioUnidad: 2.98, gr: 20 },
  { color: 'verde', longitudM: 2.10, pesoKg: 0.420, precioUnidad: 3.13, gr: 20 },
  { color: 'verde', longitudM: 2.20, pesoKg: 0.440, precioUnidad: 3.28, gr: 20 },
  { color: 'verde', longitudM: 2.25, pesoKg: 0.450, precioUnidad: 3.35, gr: 20 },
  { color: 'verde', longitudM: 2.30, pesoKg: 0.460, precioUnidad: 3.43, gr: 20 },
  { color: 'verde', longitudM: 2.30, pesoKg: 0.414, precioUnidad: 3.08, gr: 18 },
  { color: 'verde', longitudM: 2.34, pesoKg: 0.468, precioUnidad: 3.49, gr: 20 },
  { color: 'verde', longitudM: 2.35, pesoKg: 0.470, precioUnidad: 3.50, gr: 20 },
  { color: 'verde', longitudM: 2.40, pesoKg: 0.432, precioUnidad: 3.22, gr: 18 },
  { color: 'verde', longitudM: 2.40, pesoKg: 0.480, precioUnidad: 3.58, gr: 20 },
  { color: 'verde', longitudM: 2.60, pesoKg: 0.520, precioUnidad: 3.87, gr: 20 }
];

// Tabla base para otros colores (curva 20 g). Puedes ampliar/ajustar.
export const tablaEsquinerosColores = [
  { color: 'colores', longitudM: 1.10, precioUnidad: 2.31, gr: 20 },
  { color: 'colores', longitudM: 2.00, precioUnidad: 4.19, gr: 20 },
  { color: 'colores', longitudM: 2.30, precioUnidad: 4.82, gr: 20 }
];


