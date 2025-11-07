// Catálogo V2 (opcional). No modifica el contrato V1 ni los imports existentes.
// Este módulo introduce múltiples categorías y utilidades relacionadas manteniendo compatibilidad total.

import { productos as productosV1, colores as coloresV1, filtros as filtrosV1, accesorios as accesoriosV1 } from './productos';

/**
 * @typedef {'zuncho'|'esquinero'|'burbupack'|'manga'|'accesorio'} CategoriaId
 */

/**
 * @typedef {Object} ProductoBaseV2
 * @property {string} id
 * @property {CategoriaId} categoria
 * @property {string} nombre
 * @property {string} codigo
 * @property {string} precio
 * @property {boolean} disponible
 * @property {boolean} [destacado]
 * @property {string} [imagen]
 * @property {string} [descripcion]
 */

/**
 * @typedef {ProductoBaseV2 & {
 *  color: string,
 *  ancho: string, // Ej: "5/8" | "1/2"
 *  largo: number,
 *  resistencia?: string,
 *  material?: string,
 *  aplicaciones?: string[],
 *  idV1?: number
 * }} ProductoZuncho
 */

/**
 * @typedef {ProductoBaseV2 & {
 *  color: string,
 *  medidas: { ladoMM:number, espesorMM:number, longitudM:number|null },
 *  gramajeGxm: number,
 * }} ProductoEsquinero
 */

/**
 * @typedef {ProductoBaseV2 & {
 *  medidas: { anchoM:number, largoM:number }
 * }} ProductoBurbupack
 */

/**
 * @typedef {ProductoBaseV2 & {
 *  color: string,
 *  medidas: { altoM:number, espesorMM:number }
 * }} ProductoManga
 */

/**
 * @typedef {ProductoBaseV2 & {
 *  tags?: string[],
 * }} ProductoAccesorio
 */

/** @typedef {ProductoZuncho|ProductoEsquinero|ProductoBurbupack|ProductoManga|ProductoAccesorio} ProductoV2 */

// -------------------------------------------------------------
// Constantes editables
// -------------------------------------------------------------

export const categorias = [
  { id: 'zuncho', nombre: 'Zunchos PP' },
  { id: 'esquinero', nombre: 'Esquineros plásticos' },
  { id: 'burbupack', nombre: 'Burbupack' },
  { id: 'manga', nombre: 'Mangas plásticas' },
  { id: 'accesorio', nombre: 'Accesorios' }
];

// Esquineros: colores habilitados
export const ESQUINEROS_COLORES = ['negro', 'blanco', 'azul', 'amarillo', 'rojo', 'verde'];

// Esquineros: medidas por defecto (editables)
export const ESQUINERO_LADOS_MM = [37, 42];
export const ESQUINERO_ESPESORES_MM = [2.8, 3.8];
export const ESQUINERO_GRAMAJES_GXM = [0.20, 0.19, 0.18];
export const ESQUINERO_LONGITUD_ETIQUETA = 'A LA MEDIDA QUE SOLICITE EL CLIENTE';
export const ESQUINERO_LONGITUD_MIN_M = 0.14;
export const ESQUINERO_LONGITUD_MAX_M = 2.40;

// Burbupack: medidas típicas y límites de máquina (editables)
export const BURBUPACK_ANCHOS_M = [0.40, 0.50, 0.58, 1.00, 1.50];
export const BURBUPACK_LARGOS_M = [80, 100];
export const BURBUPACK_ANCHO_MAX_M = 1.50;
export const BURBUPACK_LARGO_MAX_M = 200;

// Mangas plásticas (material 100% virgen)
export const MANGA_COLORES = ['transparente', 'blanco', 'amarillo', 'rojo', 'verde', 'azul', 'negro'];
export const MANGA_ALTOS_M = [1.00, 1.50];
export const MANGA_ESPESOR_MM = 2.0;

// -------------------------------------------------------------
// Helpers internos (SKU / formateos)
// -------------------------------------------------------------

const COLOR_CODE_MAP = {
  negro: 'N',
  blanco: 'B',
  azul: 'A',
  amarillo: 'Y',
  rojo: 'R',
  verde: 'V',
  transparente: 'T'
};

const COLOR_SHORT3_MAP = {
  negro: 'NEG',
  blanco: 'BLA',
  azul: 'AZU',
  amarillo: 'AMA',
  rojo: 'ROJ',
  verde: 'VER',
  transparente: 'TRA'
};

/**
 * @param {{ color:string, ancho:string, largo:number }} p
 * @returns {string}
 */
export function skuZuncho(p) {
  const anchoCompacto = String(p.ancho).replace('/', '');
  const colorCode = COLOR_CODE_MAP[p.color] || 'X';
  return `ZP${colorCode}-${anchoCompacto}-${p.largo}`;
}

/**
 * @param {{ ladoMM:number, espesorMM:number, longitudM:number|null, color:string }} p
 * @returns {string}
 */
export function skuEsquinero(p) {
  const colorCode = COLOR_CODE_MAP[p.color] || 'X';
  const longToken = p.longitudM && p.longitudM > 0 ? `${p.longitudM.toString().replace('.', '_')}m` : 'VAR';
  return `ESQ-${p.ladoMM}x${p.ladoMM}x${String(p.espesorMM).replace('.', '_')}-${longToken}-${colorCode}`;
}

/**
 * Genera un código corto y amigable para mostrar en UI
 * Formato: ESQU-<COLOR>-<consecutivo>
 * El consecutivo se deriva de lado y espesor para que sea estable
 * @param {{ ladoMM:number, espesorMM:number, color:string }} p
 * @returns {string}
 */
export function shortCodeEsquinero(p) {
  const color3 = COLOR_SHORT3_MAP[p.color] || 'XXX';
  if (typeof p.gramajeGxm === 'number') {
    const g = Math.round(Number(p.gramajeGxm) * 100);
    return `ESQU-${color3}-G${g}`;
  }
  const lado = Number(p.ladoMM) || 0;
  const esp = Number(p.espesorMM);
  const espStr = Number.isFinite(esp) ? esp.toString() : String(p.espesorMM);
  return `ESQU-${color3}-${lado}x${espStr}`;
}

/**
 * @param {{ anchoM:number, largoM:number }} p
 * @returns {string}
 */
export function skuBurbupack(p) {
  const anchoCM = Math.round(p.anchoM * 100);
  return `BB-${anchoCM}-${p.largoM}`;
}

/**
 * @param {{ altoM:number, color:string }} p
 * @returns {string}
 */
export function skuManga(p) {
  const colorCode = COLOR_CODE_MAP[p.color] || 'X';
  const altoCM = Math.round(p.altoM * 100);
  return `MG-${altoCM}-${colorCode}`;
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function skuAccesorio(slug) {
  return `ACC-${String(slug).toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// -------------------------------------------------------------
// Adaptadores / mapeos V1 -> V2
// -------------------------------------------------------------

/**
 * @param {any} v1
 * @returns {ProductoZuncho}
 */
export function mapZunchoV1toV2(v1) {
  return {
    id: `zuncho-${v1.codigo}`,
    categoria: 'zuncho',
    nombre: v1.nombre,
    codigo: v1.codigo || skuZuncho({ color: v1.color, ancho: v1.ancho, largo: v1.largo }),
    precio: v1.precio || 'Consultar',
    disponible: v1.disponible !== false,
    destacado: !!v1.destacado,
    descripcion: v1.descripcion,
    color: v1.color,
    ancho: v1.ancho,
    largo: v1.largo,
    resistencia: v1.resistencia,
    material: v1.material,
    aplicaciones: v1.aplicaciones,
    imagen: v1.imagen,
    idV1: v1.id
  };
}

// -------------------------------------------------------------
// Generación de productos V2
// -------------------------------------------------------------

/** @type {ProductoZuncho[]} */
export const productosZunchosV2 = productosV1.map(mapZunchoV1toV2);

/** @type {ProductoEsquinero[]} */
export const productosEsquinerosV2 = ESQUINEROS_COLORES.flatMap((colorId) =>
  ESQUINERO_GRAMAJES_GXM.map((gramaje) => {
    const nombreColor = (coloresV1.find(c => c.id === colorId)?.nombre) || capitalize(colorId);
    const ladoMM = ESQUINERO_LADOS_MM[0];
    const espesorMM = ESQUINERO_ESPESORES_MM[0];
    const longitudM = null; // Por defecto: a la medida
    const codigoBase = skuEsquinero({ ladoMM, espesorMM, longitudM, color: colorId });
    const gToken = `G${Math.round(gramaje * 100)}`;
    const codigo = `${codigoBase}-${gToken}`;
    const codigoCorto = shortCodeEsquinero({ ladoMM, espesorMM, color: colorId, gramajeGxm: gramaje });
    /** @type {ProductoEsquinero} */
    const p = {
      id: `esquinero-${codigo}`,
      categoria: 'esquinero',
      nombre: `Esquinero plástico ${ESQUINERO_LONGITUD_ETIQUETA.toLowerCase()} (${nombreColor.toLowerCase()})`,
      codigo,
      codigoCorto,
      precio: 'Consultar',
      disponible: true,
      destacado: false,
      imagen: `/images/productos/Esquineros/${nombreColor}/paquete.png`,
      descripcion: `Esquinero plástico con alas de 39.5 mm y espesor 3.3 mm. Longitud a medida (${ESQUINERO_LONGITUD_MIN_M} m a ${ESQUINERO_LONGITUD_MAX_M} m). Gramaje: ${gramaje.toFixed(2)} g/m.`,
      color: colorId,
      medidas: { ladoMM, espesorMM, longitudM },
      gramajeGxm: gramaje
    };
    return p;
  })
);

/** @type {ProductoBurbupack[]} */
export const productosBurbupackV2 = BURBUPACK_ANCHOS_M.flatMap((anchoM) =>
  BURBUPACK_LARGOS_M
    .filter((largoM) => anchoM <= BURBUPACK_ANCHO_MAX_M && largoM <= BURBUPACK_LARGO_MAX_M)
    .map((largoM) => {
      const codigo = skuBurbupack({ anchoM, largoM });
      const anchoFmt = anchoM.toFixed(2);
      /** @type {ProductoBurbupack} */
      const p = {
        id: `burbupack-${codigo}`,
        categoria: 'burbupack',
        nombre: `Burbupack ${anchoFmt} m x ${largoM} m`,
        codigo,
        precio: 'Consultar',
        disponible: true,
        destacado: [80, 100].includes(largoM),
        imagen: `/images/productos/Burbupack/${anchoFmt}/burbupack_${anchoFmt}Mx${largoM}.png`,
        descripcion: `Rollo de burbuja ${anchoFmt} m x ${largoM} m.`,
        medidas: { anchoM, largoM }
      };
      return p;
    })
);

/** @type {ProductoManga[]} */
export const productosMangasV2 = MANGA_COLORES.flatMap((colorId) =>
  MANGA_ALTOS_M.map((altoM) => {
    const nombreColor = (coloresV1.find(c => c.id === colorId)?.nombre) || capitalize(colorId);
    const codigo = skuManga({ altoM, color: colorId });
    /** @type {ProductoManga} */
    const p = {
      id: `manga-${codigo}`,
      categoria: 'manga',
      nombre: `Manga plástica virgen ${altoM.toFixed(2)} m (${nombreColor.toLowerCase()})`,
      codigo,
      precio: 'Consultar',
      disponible: true,
      destacado: (colorId === 'azul' && Number(altoM) === 1.00),
      imagen: `/images/productos/Mangas/${nombreColor}/${altoM.toFixed(2)}/principal.png`,
      descripcion: `Manga plástica 100% virgen. Altura ${altoM.toFixed(2)} m. Espesor ${MANGA_ESPESOR_MM} mm. Apta para múltiples sectores.`,
      color: colorId,
      medidas: { altoM, espesorMM: MANGA_ESPESOR_MM }
    };
    return p;
  })
);

/** @type {ProductoAccesorio[]} */
export const productosAccesoriosV2 = (accesoriosV1 || []).map((a) => {
  const codigo = skuAccesorio(a.id || a.nombre || 'ACC');
  return {
    id: `accesorio-${codigo}`,
    categoria: 'accesorio',
    nombre: a.nombre,
    codigo,
    precio: 'Consultar',
    disponible: true,
    destacado: false,
    // imagen: a.imagen, // Removido para usar la nueva lógica de ProductCardV2
    descripcion: a.descripcion,
    tags: Array.isArray(a.tipos) ? a.tipos : (Array.isArray(a.caracteristicas) ? a.caracteristicas : undefined)
  };
});

/** @type {ProductoV2[]} */
export const catalogoV2 = [
  ...productosZunchosV2,
  ...productosEsquinerosV2,
  ...productosBurbupackV2,
  ...productosMangasV2,
  ...productosAccesoriosV2
];

// -------------------------------------------------------------
// Filtros V2 (opcionales, no reemplazan filtros V1)
// -------------------------------------------------------------

export const filtrosV2 = {
  comunes: {
    colores: coloresV1.filter(c => c.disponible),
    ordenarPor: filtrosV1?.ordenarPor || [
      { id: 'popularidad', nombre: 'Popularidad', campo: 'destacado' },
      { id: 'nombre', nombre: 'Nombre A-Z', campo: 'nombre' },
      { id: 'codigo', nombre: 'Código', campo: 'codigo' }
    ]
  },
  porCategoria: {
    zuncho: {
      anchos: filtrosV1?.anchos || ['1/2', '5/8'],
      largos: filtrosV1?.largos || { min: 360, max: 1500, step: 20 },
      resistencias: filtrosV1?.resistencias || ['Básica', 'Media', 'Alta']
    },
    esquinero: {
      ladoMM: ESQUINERO_LADOS_MM,
      espesorMM: ESQUINERO_ESPESORES_MM,
      longitudM: { min: ESQUINERO_LONGITUD_MIN_M, max: ESQUINERO_LONGITUD_MAX_M, variable: true },
      colores: ESQUINEROS_COLORES
    },
    burbupack: {
      anchoM: BURBUPACK_ANCHOS_M,
      largoM: BURBUPACK_LARGOS_M,
      limites: { anchoMax: BURBUPACK_ANCHO_MAX_M, largoMax: BURBUPACK_LARGO_MAX_M }
    },
    manga: {
      altoM: MANGA_ALTOS_M,
      espesorMM: [MANGA_ESPESOR_MM],
      colores: MANGA_COLORES
    },
    accesorio: {
      // Sin filtros específicos por ahora
    }
  }
};

// -------------------------------------------------------------
// Utilidades
// -------------------------------------------------------------

/**
 * @param {CategoriaId} categoria
 * @returns {ProductoV2[]}
 */
export function getProductosPorCategoriaV2(categoria) {
  return catalogoV2.filter(p => p.categoria === categoria);
}


