// Utilidades para catálogo V2 (ordenación, paginación, filtros). Opcional para la UI.

/**
 * Ordena una lista de productos por un campo o comparador
 * @param {Array<any>} items
 * @param {{ campo?: string, direccion?: 'asc'|'desc', comparador?: (a:any,b:any)=>number }} opts
 * @returns {Array<any>}
 */
export function ordenarProductos(items, opts = {}) {
  const { campo = 'nombre', direccion = 'asc', comparador } = opts;
  const dir = direccion === 'desc' ? -1 : 1;
  const copy = [...(items || [])];
  if (typeof comparador === 'function') {
    return copy.sort((a, b) => dir * comparador(a, b));
  }
  return copy.sort((a, b) => {
    const va = a?.[campo];
    const vb = b?.[campo];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number' && typeof vb === 'number') {
      return dir * (va - vb);
    }
    return dir * String(va).localeCompare(String(vb), 'es', { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Pagina una lista
 * @param {Array<any>} items
 * @param {{ pagina?: number, tam?: number }} opts
 * @returns {{ items: Array<any>, total: number, pagina: number, tam: number, paginas: number }}
 */
export function paginar(items, opts = {}) {
  const total = (items || []).length;
  const tam = Math.max(1, Math.min(200, opts.tam || 12));
  const paginas = Math.max(1, Math.ceil(total / tam));
  const pagina = Math.max(1, Math.min(paginas, opts.pagina || 1));
  const start = (pagina - 1) * tam;
  const end = start + tam;
  return { items: (items || []).slice(start, end), total, pagina, tam, paginas };
}

/**
 * Filtra productos V2 por criterios comunes y específicos
 * @param {Array<any>} items
 * @param {{ categoria?: string,
 *  color?: string,
 *  ordenar?: { campo?: string, direccion?: 'asc'|'desc' },
 *  // Zuncho
 *  ancho?: string,
 *  largoMin?: number,
 *  largoMax?: number,
 *  // Esquinero
 *  ladoMM?: number,
 *  espesorMM?: number,
 *  // Burbupack
 *  anchoM?: number,
 *  largoM?: number
 * }} filtros
 * @returns {Array<any>}
 */
export function filtrarProductosV2(items, filtros = {}) {
  let out = [...(items || [])];
  if (filtros.categoria) {
    out = out.filter(p => p.categoria === filtros.categoria);
  }
  if (filtros.color) {
    out = out.filter(p => !p.color || p.color === filtros.color);
  }
  // Zuncho
  if (filtros.ancho) {
    out = out.filter(p => p.categoria !== 'zuncho' || p.ancho === filtros.ancho);
  }
  if (typeof filtros.largoMin === 'number') {
    out = out.filter(p => p.categoria !== 'zuncho' || (typeof p.largo === 'number' && p.largo >= filtros.largoMin));
  }
  if (typeof filtros.largoMax === 'number') {
    out = out.filter(p => p.categoria !== 'zuncho' || (typeof p.largo === 'number' && p.largo <= filtros.largoMax));
  }
  // Esquinero
  if (typeof filtros.ladoMM === 'number') {
    out = out.filter(p => p.categoria !== 'esquinero' || p.medidas?.ladoMM === filtros.ladoMM);
  }
  if (typeof filtros.espesorMM === 'number') {
    out = out.filter(p => p.categoria !== 'esquinero' || p.medidas?.espesorMM === filtros.espesorMM);
  }
  if (typeof filtros.largoM === 'number') {
    out = out.filter(p => p.categoria !== 'esquinero' || !p.medidas?.longitudM || Math.abs(p.medidas.longitudM - filtros.largoM) < 1e-9);
  }
  // Burbupack
  if (typeof filtros.anchoM === 'number') {
    out = out.filter(p => p.categoria !== 'burbupack' || p.medidas?.anchoM === filtros.anchoM);
  }
  if (typeof filtros.largoM === 'number') {
    out = out.filter(p => p.categoria !== 'burbupack' || p.medidas?.largoM === filtros.largoM);
  }
  if (filtros.ordenar) {
    out = ordenarProductos(out, filtros.ordenar);
  }
  return out;
}


