import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SortAsc, Grid, List, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { categorias, catalogoV2, filtrosV2 } from '../data/catalogo.v2';
import { colores as coloresV1 } from '../data/productos';
import { filtrarProductosV2, ordenarProductos, paginar } from '../utils/catalogoV2';
import ProductCardV2 from '../components/ProductCardV2';
import { useQuote } from '../contexts/QuoteContext';

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToQuote, isInQuote } = useQuote();

  const [categoria, setCategoria] = useState(searchParams.get('cat') || 'zuncho');
  const [coloresSel, setColoresSel] = useState([]);
  const [orden, setOrden] = useState('popularidad');
  const [vista, setVista] = useState('grid');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // específicos por categoría
  const [ancho, setAncho] = useState(''); // zuncho
  const [largoMin, setLargoMin] = useState(filtrosV2.porCategoria.zuncho.largos.min);
  const [largoMax, setLargoMax] = useState(filtrosV2.porCategoria.zuncho.largos.max);

  const [ladoMM, setLadoMM] = useState(39.5); // esquinero fijo
  const [espesorMM, setEspesorMM] = useState(3.3);
  const [largoEsq, setLargoEsq] = useState(''); // filtro de largo para esquinero

  const [anchoM, setAnchoM] = useState(''); // burbupack
  const [largoM, setLargoM] = useState('');

  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;

  useEffect(() => {
    const params = { cat: categoria };
    setSearchParams(params);
    setPaginaActual(1);
  }, [categoria]);

  // Leer color desde query param para compatibilidad con página Colores
  useEffect(() => {
    const colorParam = searchParams.get('color');
    const catParam = searchParams.get('cat');
    const anchoMParam = searchParams.get('anchoM');
    if (colorParam) {
      const catForColor = ['zuncho', 'esquinero', 'burbupack', 'manga', 'accesorio'].includes(catParam) ? catParam : categoria;
      const coloresSet = new Set(
        catalogoV2
          .filter(p => p.categoria === catForColor)
          .map(p => p.color)
          .filter(Boolean)
      );
      if (coloresSet.has(colorParam)) setColoresSel([colorParam]);
      else setColoresSel([]);
    }
    if (catParam && ['zuncho', 'esquinero', 'burbupack', 'manga', 'accesorio'].includes(catParam)) setCategoria(catParam);
    if (anchoMParam) setAnchoM(anchoMParam);
  }, [searchParams]);

  const listaFiltrada = useMemo(() => {
    const base = catalogoV2;
    const criterios = {
      categoria,
      ordenar: { campo: filtrosV2.comunes.ordenarPor.find(o => o.id === orden)?.campo || 'destacado', direccion: orden === 'nombre' ? 'asc' : 'desc' }
    };
    if (['zuncho', 'esquinero', 'manga'].includes(categoria) && coloresSel.length > 0) criterios.color = coloresSel[0];
    if (categoria === 'zuncho') {
      if (ancho) criterios.ancho = ancho;
      criterios.largoMin = largoMin;
      criterios.largoMax = largoMax;
    }
    // Esquinero: filtro por color y por largo
    if (categoria === 'esquinero') {
      if (largoEsq) criterios.largoM = Number(largoEsq);
    }
    if (categoria === 'burbupack') {
      if (anchoM) criterios.anchoM = Number(anchoM);
      if (largoM) criterios.largoM = Number(largoM);
    }
    const filtrados = filtrarProductosV2(base, criterios);
    return ordenarProductos(filtrados, criterios.ordenar);
  }, [categoria, coloresSel, orden, ancho, largoMin, largoMax, ladoMM, espesorMM, anchoM, largoM]);

  const { items: productosEnPagina, total, pagina, paginas } = paginar(listaFiltrada, { pagina: paginaActual, tam: productosPorPagina });

  // Colores disponibles según categoría (oculta colores sin productos, p.ej., 'verde' en zunchos)
  const coloresDisponibles = useMemo(() => {
    if (!['zuncho', 'esquinero', 'manga'].includes(categoria)) return [];
    const setColores = new Set(
      catalogoV2
        .filter(p => p.categoria === categoria)
        .map(p => p.color)
        .filter(Boolean)
    );
    return filtrosV2.comunes.colores.filter(c => setColores.has(c.id));
  }, [categoria]);

  const limpiarFiltros = () => {
    setColoresSel([]);
    setAncho('');
    setLargoMin(filtrosV2.porCategoria.zuncho.largos.min);
    setLargoMax(filtrosV2.porCategoria.zuncho.largos.max);
    // Esquineros: no se limpian ladoMM y espesorMM - son estándar
    setAnchoM('');
    setLargoM('');
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-fondo-claro">
        <div className="container-max section-padding py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gris-medio">
                <Link to="/" className="hover:underline">Inicio</Link>
                <span>/</span>
                <span>Catálogo</span>
              </div>
              <h1 className="text-3xl font-bold mt-2">Catálogo de Productos</h1>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/documentos/Catalogo.pdf"
                download="Catalogo_EcoFlexPlast.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-verde-principal text-white rounded-lg text-sm font-medium hover:bg-verde-hover transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Catálogo PDF
              </a>
              <a
                href="/documentos/brochure%20ecoflexplast.pdf"
                download="Brochure_EcoFlexPlast.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white text-negro-principal border border-gris-claro rounded-lg text-sm font-medium hover:bg-gris-muy-claro transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Brochure
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-8">
        {/* Tabs de categorías */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categorias.map(c => (
            <button
              key={c.id}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${categoria === c.id ? 'bg-verde-principal text-white border-verde-principal' : 'bg-white text-negro-principal border-gris-muy-claro hover:bg-gris-muy-claro'}`}
              onClick={() => setCategoria(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filtros */}
          <div className={`lg:w-80 ${mostrarFiltros ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-negro-principal">Filtros</h3>
                <button onClick={limpiarFiltros} className="text-sm text-verde-principal hover:underline">Limpiar</button>
              </div>

              <div className="space-y-6">
                {/* Color (si aplica) */}
                {['zuncho', 'esquinero', 'manga'].includes(categoria) && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Color</h4>
                    <div className="flex items-center gap-3">
                      {(coloresDisponibles.length > 0 ? coloresDisponibles : filtrosV2.comunes.colores).map(c => (
                        <button
                          key={c.id}
                          className={`w-8 h-8 rounded-full border-2 ${coloresSel[0] === c.id ? 'border-verde-principal' : 'border-white'} shadow`}
                          style={{ backgroundColor: c.hex }}
                          title={c.nombre}
                          onClick={() => setColoresSel(coloresSel[0] === c.id ? [] : [c.id])}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Zuncho */}
                {categoria === 'zuncho' && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Ancho</h4>
                      <select className="w-full input" value={ancho} onChange={e => setAncho(e.target.value)}>
                        <option value="">Todos</option>
                        {filtrosV2.porCategoria.zuncho.anchos.map(a => (
                          <option key={a} value={a}>{a}"</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Longitud (m)</h4>
                      <div className="flex items-center gap-2">
                        <input className="input w-24" type="number" value={largoMin} onChange={e => setLargoMin(Number(e.target.value))} />
                        <span>-</span>
                        <input className="input w-24" type="number" value={largoMax} onChange={e => setLargoMax(Number(e.target.value))} />
                      </div>
                    </div>
                  </>
                )}

                {/* Esquinero - Solo filtro de color, medidas estándar */}
                {categoria === 'esquinero' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gris-medio p-3 bg-gris-muy-claro rounded-lg">
                      <p className="font-medium mb-1">Medidas estándar:</p>
                      <p>• Ala: 39.5 mm</p>
                      <p>• Espesor: 3.3 mm</p>
                      <p>• Gramaje: 0.20 g/m (ajustable 0.18–0.20)</p>
                      <p className="mt-2 text-xs">El largo se personaliza según necesidad del cliente</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Largo (m)</h4>
                      <input className="input w-full" type="number" step="0.01" min={0.14} max={2.40} placeholder="Ej: 1.20 (requerido para calcular precio)" value={largoEsq} onChange={(e) => setLargoEsq(e.target.value)} />
                      <p className="mt-1 text-xs text-gris-medio">Rango: 0.14 m a 2.40 m</p>
                    </div>
                  </div>
                )}

                {/* Mangas - Info */}
                {categoria === 'manga' && (
                  <div className="text-sm text-gris-medio p-3 bg-gris-muy-claro rounded-lg">
                    <p className="font-medium mb-1">Especificaciones:</p>
                    <p>• Alturas: 1.00 m o 1.50 m</p>
                    <p>• Espesor: 2.0 mm</p>
                    <p>• Material: 100% virgen</p>
                  </div>
                )}

                {/* Burbupack */}
                {categoria === 'burbupack' && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Ancho (m)</h4>
                      <select className="w-full input" value={anchoM} onChange={e => setAnchoM(e.target.value)}>
                        <option value="">Todos</option>
                        {filtrosV2.porCategoria.burbupack.anchoM.map(v => (
                          <option key={v} value={v}>{v.toFixed(2)} m</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Largo (m)</h4>
                      <select className="w-full input" value={largoM} onChange={e => setLargoM(e.target.value)}>
                        <option value="">Todos</option>
                        {filtrosV2.porCategoria.burbupack.largoM.map(v => (
                          <option key={v} value={v}>{v} m</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-card p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="lg:hidden btn-secondary text-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </button>
                  <span className="text-sm text-gris-oscuro">{total} producto{total !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <SortAsc className="w-4 h-4 text-gris-medio" />
                    <select className="input" value={orden} onChange={e => setOrden(e.target.value)}>
                      {filtrosV2.comunes.ordenarPor.map(o => (
                        <option key={o.id} value={o.id}>{o.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden md:flex items-center border rounded-lg">
                    <button className={`px-3 py-2 ${vista === 'grid' ? 'bg-gris-muy-claro' : ''}`} onClick={() => setVista('grid')}><Grid className="w-4 h-4" /></button>
                    <button className={`px-3 py-2 ${vista === 'list' ? 'bg-gris-muy-claro' : ''}`} onClick={() => setVista('list')}><List className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            {productosEnPagina.length > 0 ? (
              <>
                <div className={vista === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8' : 'space-y-4 mb-8'}>
                  {productosEnPagina.map((producto) => {
                    const productoForCard =
                      producto.categoria === 'esquinero'
                        ? {
                          ...producto,
                          nombre: `Esquinero plástico ${(coloresV1.find(c => c.id === producto.color)?.nombre) || producto.color
                            }`
                        }
                        : producto;
                    return (
                      <div key={`producto-v2-${producto.id}`} className="h-full">
                        <ProductCardV2
                          producto={productoForCard}
                          vista={vista}
                          onAddToQuote={addToQuote}
                          isInQuote={isInQuote(producto.id)}
                          largoSeleccionado={categoria === 'esquinero' ? Number(largoEsq) : undefined}
                        />
                      </div>
                    );
                  })}
                </div>

                {paginas > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button className="btn-secondary" disabled={pagina <= 1} onClick={() => setPaginaActual(paginaActual - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm">Página {pagina} de {paginas}</span>
                    <button className="btn-secondary" disabled={pagina >= paginas} onClick={() => setPaginaActual(paginaActual + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gris-medio">Sin resultados con los filtros actuales.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogo;
