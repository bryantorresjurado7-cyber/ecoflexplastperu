import { tablaEsquinerosVerde, tablaEsquinerosColores } from '../data/precios.js';

function redondeoComercial(x) {
  const entero = Math.floor(x);
  const candidates = [0.39, 0.49, 0.59, 0.69, 0.79, 0.89, 0.99].map(fr => entero + fr);
  const above = candidates.find(c => c >= x);
  return Number((above ?? (entero + 0.99)).toFixed(2));
}

function sourceByColor(color) {
  const c = String(color || '').toLowerCase();
  if (c === 'verde') return tablaEsquinerosVerde;
  if (c === 'colores') return tablaEsquinerosColores;
  return tablaEsquinerosVerde.filter(r => String(r.color || '').toLowerCase() === c);
}

function buildBase20Curve(color) {
  const src = sourceByColor(color)
    .filter(r => Number(r.gr || 20) === 20)
    .map(r => ({ L: Number(r.longitudM), P: Number(r.precioUnidad) }));
  const byL = new Map();
  for (const { L, P } of src) {
    if (!byL.has(L) || P > byL.get(L)) byL.set(L, P);
  }
  return Array.from(byL.entries()).map(([L, P]) => ({ L, P })).sort((a, b) => a.L - b.L);
}

function interpolateLinear(curve, L) {
  const exact = curve.find(p => Math.abs(p.L - L) < 1e-9);
  if (exact) return exact.P;
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i], b = curve[i + 1];
    if (L > a.L && L < b.L) {
      const t = (L - a.L) / (b.L - a.L);
      return a.P + t * (b.P - a.P);
    }
  }
  if (L <= curve[0].L) {
    const a = curve[0], b = curve[1];
    const t = (L - a.L) / (b.L - a.L);
    return a.P + t * (b.P - a.P);
  } else {
    const a = curve[curve.length - 2], b = curve[curve.length - 1];
    const t = (L - a.L) / (b.L - a.L);
    return a.P + t * (b.P - a.P);
  }
}

function pickPrecio(tabla, len, g) {
  // Entre múltiples filas del mismo L y g, usar SIEMPRE el mayor precioUnidad
  const matches = tabla.filter(r => Math.abs(r.longitudM - len) < 1e-9 && Number(r.gr || 20) === Number(g));
  if (matches.length === 0) return undefined;
  return matches.reduce((max, r) => (Number(r.precioUnidad) > Number(max) ? Number(r.precioUnidad) : Number(max)), Number(matches[0].precioUnidad));
}

function computeKStar(color, L) {
  const srcColor = sourceByColor(color);
  const srcVerde = sourceByColor('verde');

  const P20_230 = pickPrecio(srcColor, 2.30, 20) ?? pickPrecio(srcVerde, 2.30, 20);
  const P18_230 = pickPrecio(srcColor, 2.30, 18) ?? pickPrecio(srcVerde, 2.30, 18);
  const P20_240 = pickPrecio(srcColor, 2.40, 20) ?? pickPrecio(srcVerde, 2.40, 20);
  const P18_240 = pickPrecio(srcColor, 2.40, 18) ?? pickPrecio(srcVerde, 2.40, 18);

  const k230 = Math.log(P18_230 / P20_230) / Math.log(18 / 20);
  const k240 = Math.log(P18_240 / P20_240) / Math.log(18 / 20);

  if (L <= 2.30) return k230;
  if (L >= 2.40) return k240;
  const t = (L - 2.30) / (2.40 - 2.30);
  return k230 + t * (k240 - k230);
}

export function calcularPrecioEsquinero(color, L, g, opciones = {}) {
  const curve20 = buildBase20Curve(color);
  if (!Array.isArray(curve20) || curve20.length < 2) {
    throw new Error(`No hay suficientes puntos 20 g para el color "${color}"`);
  }
  const P20_star = interpolateLinear(curve20, Number(L));
  const kStar = computeKStar(color, Number(L));
  const factorG = Math.pow(Number(g) / 20, kStar);

  let price = P20_star * factorG;
  price = opciones.modoRedondeo === 'comercial'
    ? redondeoComercial(price)
    : Number(price.toFixed(2));
  return price;
}


