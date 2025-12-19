import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SortAsc, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ColorChip from '../components/ColorChip';
import FancySelect from '../components/FancySelect';
import { colores, filtros } from '../data/productos';
import { useQuote } from '../contexts/QuoteContext';
import { loadProductos, loadProductosByCategoria } from '../services/productosService';

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToQuote, isInQuote } = useQuote();

  // Cache para almacenar productos por categoría y evitar recargas
  const productCache = useRef({});

  // 1. Derivar estado de filtros directamente de la URL (Single Source of Truth)
  const categoryParam = searchParams.get('cat') || 'zuncho';
  const colorParam = searchParams.get('color');
  const anchoParam = searchParams.get('ancho');
  const largoMinParam = searchParams.get('largoMin');
  const largoMaxParam = searchParams.get('largoMax');
  const ordenParam = searchParams.get('orden') || 'popularidad';
  const paginaParam = searchParams.get('pagina');
  const largoBurbupackParam = searchParams.get('largo');

  // Estado local solo para los datos y carga
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Derivar valores complejos
  const coloresFiltro = useMemo(() => colorParam ? [colorParam] : [], [colorParam]);
  const largoRango = useMemo(() => [
    largoMinParam ? parseInt(largoMinParam, 10) : filtros.largos.min,
    largoMaxParam ? parseInt(largoMaxParam, 10) : filtros.largos.max
  ], [largoMinParam, largoMaxParam]);

  const paginaActual = useMemo(() => {
    const p = parseInt(paginaParam, 10);
    return !isNaN(p) && p > 0 ? p : 1;
  }, [paginaParam]);

  // Constantes
  const productosPorPagina = 12;

  // 2. Efecto para cargar productos cuando cambia la categoría
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      // Verificar caché primero
      if (productCache.current[categoryParam]) {
        if (isMounted) {
          setProductos(productCache.current[categoryParam]);
          setLoading(false);
        }
        return;
      }

      if (isMounted) setLoading(true);

      try {
        let result;
        if (categoryParam) {
          result = await loadProductosByCategoria(categoryParam);
        } else {
          result = await loadProductos();
        }

        if (isMounted) {
          const { data, error } = result;
          if (!error && data && Array.isArray(data)) {
            // Guardar en caché
            productCache.current[categoryParam] = data;
            setProductos(data);
          } else {
            console.error("Error cargando productos:", error);
            setProductos([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Excepción al cargar productos:", err);
        if (isMounted) {
          setProductos([]);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryParam]);

  // 3. Manejadores de actualización de URL (Filtros)
  const updateParams = (newParams) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          updated.delete(key);
        } else {
          updated.set(key, value);
        }
      });
      // Resetear página al filtrar
      if (!newParams.pagina) {
        updated.delete('pagina');
      }
      return updated;
    });
  };

  const setCategoria = (catId) => {
    // Al cambiar categoría, limpiamos otros filtros pero mantenemos la navegación limpia
    setSearchParams({ cat: catId });
  };

  const toggleColorFiltro = (color) => {
    const isSelected = coloresFiltro.includes(color.id);
    updateParams({
      color: isSelected ? null : color.id // Toggle: si está, lo quita (null), si no, lo pone
    });
  };

  const handleAnchoChange = (val) => updateParams({ ancho: val });

  const handleLargoRangoChange = (val) => {
    if (val === '') {
      updateParams({ largoMin: null, largoMax: null });
    } else {
      const [min, max] = val.split('-').map(Number);
      updateParams({ largoMin: min, largoMax: max });
    }
  };

  const handleLargoBurbupackChange = (val) => {
    updateParams({ largo: val });
  };

  const handleOrdenChange = (val) => updateParams({ orden: val });

  const irAPagina = (pagina) => {
    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateParams({ pagina: pagina.toString() });
  };

  const limpiarFiltros = () => {
    // Mantiene solo la categoría
    setSearchParams({ cat: categoryParam });
  };

  // 4. Lógica de Filtrado (Memoizada)
  const productosFiltrados = useMemo(() => {
    if (!productos) return [];

    let resultado = productos.filter(producto => {
      // Filtro Color
      if (coloresFiltro.length > 0 && !coloresFiltro.includes(producto.color)) {
        return false;
      }

      // Filtro Ancho (Zuncho)
      if (categoryParam === 'zuncho' && anchoParam && producto.ancho && producto.ancho !== anchoParam) {
        return false;
      }

      // Filtro Ancho (Burbupack)
      if (categoryParam === 'burbupack' && anchoParam) {
        const anchoProducto = producto.especificaciones?.ancho_m;
        const anchoBuscado = parseFloat(anchoParam);
        // Comparación laxa para float o string
        if (anchoProducto != null && anchoProducto != anchoBuscado) {
          return false;
        }
      }

      // Filtro Largo (Zuncho - Rango)
      if (categoryParam === 'zuncho') {
        const minLargo = largoRango[0];
        const maxLargo = largoRango[1];
        const esRangoPorDefecto = minLargo === filtros.largos.min && maxLargo === filtros.largos.max;

        if (!esRangoPorDefecto && producto.largo != null) {
          if (producto.largo < minLargo || producto.largo > maxLargo) {
            return false;
          }
        }
      }
      // Filtro Largo (Burbupack - Valor exacto)
      else if (categoryParam === 'burbupack' && largoBurbupackParam) {
        const largoBuscado = parseInt(largoBurbupackParam, 10);
        // Algunos productos tienen largo en especificaciones.largo_m o en root largo
        const largoProducto = producto.especificaciones?.largo_m || producto.largo;
        if (largoProducto != null && largoProducto !== largoBuscado) {
          return false;
        }
      }

      return true;
    });

    // Ordenamiento
    const orden = filtros.ordenarPor.find(o => o.id === ordenParam);
    if (orden) {
      resultado.sort((a, b) => {
        switch (orden.campo) {
          case 'destacado':
            return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0);
          case 'largo':
            return (b.largo || 0) - (a.largo || 0);
          case 'nombre':
            return (a.nombre || '').localeCompare(b.nombre || '');
          case 'codigo':
            return (a.codigo || '').localeCompare(b.codigo || '');
          default:
            return 0;
        }
      });
    }

    return resultado;
  }, [productos, categoryParam, coloresFiltro, anchoParam, largoRango, largoBurbupackParam, ordenParam]);

  // 5. Paginación
  const { productosEnPagina, totalPaginas, indiceInicio, indiceFin } = useMemo(() => {
    const total = productosFiltrados.length;
    const totalPags = Math.ceil(total / productosPorPagina);
    const pag = Math.min(Math.max(1, paginaActual), Math.max(1, totalPags === 0 ? 1 : totalPags)); // Asegurar página válida

    const inicio = (pag - 1) * productosPorPagina;
    const fin = Math.min(inicio + productosPorPagina, total);
    const prods = productosFiltrados.slice(inicio, fin);

    return {
      productosEnPagina: prods,
      totalPaginas: totalPags,
      indiceInicio: total > 0 ? inicio + 1 : 0,
      indiceFin: fin
    };
  }, [productosFiltrados, paginaActual, productosPorPagina]);

  const tienesFiltrosActivos = colorParam || anchoParam ||
    (largoRango[0] !== filtros.largos.min || largoRango[1] !== filtros.largos.max) ||
    largoBurbupackParam;

  if (loading) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-verde-principal mb-4"></div>
          <p className="text-gris-oscuro text-lg">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro">
      {/* Header de la página */}
      <div className="bg-white border-b border-gris-muy-claro">
        <div className="container-max section-padding py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-2">
                Catálogo de Productos
              </h1>
              <p className="text-gris-oscuro mb-4">
                {productos.length > 0 ? `${productos.length} productos disponibles` : 'Encuentra el producto perfecto para tu industria'}
              </p>

              {/* Botones de categorías */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { id: 'zuncho', nombre: 'ZUNCHO' },
                  { id: 'esquinero', nombre: 'ESQUINERO' },
                  { id: 'burbupack', nombre: 'BURBUPACK' },
                  { id: 'manga', nombre: 'MANGAS' },
                  { id: 'accesorio', nombre: 'ACCESORIOS' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${categoryParam === cat.id
                        ? 'bg-verde-principal text-white border-verde-principal shadow-md'
                        : 'bg-white text-negro-principal border-gris-muy-claro hover:bg-gris-muy-claro'
                      }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>

              {categoryParam && (
                <p className="text-sm text-verde-principal mt-3">
                  Filtrando por: {categoryParam.toUpperCase()} ({productosFiltrados.length} productos)
                </p>
              )}
            </div>

            {/* Breadcrumb */}
            <nav className="text-sm">
              <Link to="/" className="text-gris-medio hover:text-verde-principal">
                Inicio
              </Link>
              <span className="mx-2 text-gris-muy-claro">/</span>
              <span className="text-negro-principal">Productos</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar de filtros */}
          <div className={`lg:w-80 ${mostrarFiltros ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-negro-principal">
                  Filtros
                </h3>
                {tienesFiltrosActivos && (
                  <button
                    onClick={limpiarFiltros}
                    className="text-sm text-verde-principal hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Color - Solo para Zuncho, Esquinero y Manga */}
                {['zuncho', 'esquinero', 'manga'].includes(categoryParam) && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-3">
                      Color ({coloresFiltro.length})
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {colores.map(color => (
                        <div key={color.id} className="flex flex-col items-center">
                          <ColorChip
                            color={color}
                            size="lg"
                            isSelected={coloresFiltro.includes(color.id)}
                            onClick={() => toggleColorFiltro(color)}
                          />
                          <span className="text-xs text-gris-medio mt-1">
                            {color.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ancho - Solo para Zuncho (en pulgadas) */}
                {categoryParam === 'zuncho' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Ancho
                    </label>
                    <FancySelect
                      value={anchoParam || ''}
                      onChange={handleAnchoChange}
                      options={[{ value: '', label: 'Todos los anchos' }, ...filtros.anchos.map(ancho => ({ value: ancho, label: `${ancho}\" (pulgadas)` }))]}
                      placeholder="Todos los anchos"
                    />
                  </div>
                )}

                {/* Ancho en metros - Solo para Burbupack */}
                {categoryParam === 'burbupack' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Ancho (metros)
                    </label>
                    <FancySelect
                      value={anchoParam || ''}
                      onChange={handleAnchoChange}
                      options={[
                        { value: '', label: 'Todos los anchos' },
                        { value: '0.40', label: '0.40m' },
                        { value: '0.50', label: '0.50m' },
                        { value: '0.60', label: '0.60m' },
                        { value: '0.80', label: '0.80m' },
                        { value: '1.00', label: '1.00m' },
                        { value: '1.20', label: '1.20m' },
                        { value: '1.50', label: '1.50m' }
                      ]}
                      placeholder="Todos los anchos"
                    />
                  </div>
                )}

                {/* Largo en metros - Solo para Zuncho (rango) */}
                {categoryParam === 'zuncho' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Longitud (metros)
                    </label>
                    <FancySelect
                      value={largoRango[0] === filtros.largos.min && largoRango[1] === filtros.largos.max ? '' : `${largoRango[0]}-${largoRango[1]}`}
                      onChange={handleLargoRangoChange}
                      options={[
                        { value: '', label: 'Todas las longitudes' },
                        { value: '360-480', label: '360m - 480m (Cortos)' },
                        { value: '560-720', label: '560m - 720m (Medianos)' },
                        { value: '800-1000', label: '800m - 1000m (Largos)' },
                        { value: '1100-1500', label: '1100m - 1500m (Extra Largos)' }
                      ]}
                      placeholder="Todas las longitudes"
                    />

                    {/* Mostrar el rango seleccionado */}
                    {(largoRango[0] !== filtros.largos.min || largoRango[1] !== filtros.largos.max) && (
                      <div className="mt-2 text-sm text-verde-principal font-medium">
                        📏 Filtrando: {largoRango[0]}m - {largoRango[1]}m
                      </div>
                    )}
                  </div>
                )}

                {/* Largo en metros - Solo para Burbupack (valores específicos) */}
                {categoryParam === 'burbupack' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Longitud (metros)
                    </label>
                    <FancySelect
                      value={largoBurbupackParam || ''}
                      onChange={handleLargoBurbupackChange}
                      options={[
                        { value: '', label: 'Todas las longitudes' },
                        { value: '50', label: '50m' },
                        { value: '80', label: '80m' },
                        { value: '100', label: '100m' },
                        { value: '150', label: '150m' },
                        { value: '200', label: '200m' }
                      ]}
                      placeholder="Todas las longitudes"
                    />
                  </div>
                )}


              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Barra de herramientas */}
            <div className="bg-white rounded-xl shadow-card p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className="lg:hidden btn-secondary text-sm"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </button>

                  <span className="text-sm text-gris-oscuro">
                    {productosFiltrados.length > 0 && totalPaginas > 1
                      ? `Mostrando ${indiceInicio}-${indiceFin} de ${productosFiltrados.length} productos`
                      : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} encontrado${productosFiltrados.length !== 1 ? 's' : ''}`
                    }
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Ordenar */}
                  <div className="flex items-center space-x-2">
                    <SortAsc className="w-4 h-4 text-gris-medio" />
                    <select
                      value={ordenParam}
                      onChange={(e) => handleOrdenChange(e.target.value)}
                      className="text-sm border border-gris-muy-claro rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-verde-principal"
                    >
                      {filtros.ordenarPor.map(opcion => (
                        <option key={opcion.id} value={opcion.id}>
                          {opcion.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              {/* Filtros activos */}
              {tienesFiltrosActivos && (
                <div className="mt-4 pt-4 border-t border-gris-muy-claro">
                  <div className="flex flex-wrap gap-2">
                    {coloresFiltro.map(colorId => {
                      const color = colores.find(c => c.id === colorId);
                      return color ? (
                        <span
                          key={colorId}
                          className="inline-flex items-center bg-verde-light text-verde-principal px-3 py-1 rounded-full text-sm"
                        >
                          Color: {color.nombre}
                          <button
                            onClick={() => toggleColorFiltro(color)}
                            className="ml-2 hover:text-verde-hover"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Grid de productos */}
            {productosFiltrados.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {productosEnPagina.map((producto) => (
                    <div key={`producto-${producto.id}`} className="h-full">
                      <ProductCard
                        producto={producto}
                        onAddToQuote={addToQuote}
                        isInQuote={isInQuote(producto.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Componente de Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex flex-col items-center space-y-4">
                    {/* Información de página */}
                    <p className="text-sm text-gris-medio">
                      Página {paginaActual} de {totalPaginas}
                    </p>

                    {/* Navegación */}
                    <div className="flex items-center space-x-2">
                      {/* Botón Anterior */}
                      <button
                        onClick={() => irAPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${paginaActual === 1
                            ? 'text-gris-medio bg-gris-muy-claro cursor-not-allowed'
                            : 'text-gris-oscuro bg-white border border-gris-claro hover:bg-gris-muy-claro hover:text-negro-principal'
                          }`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </button>

                      {/* Números de página */}
                      <div className="flex space-x-1">
                        {(() => {
                          let numerosPagina;

                          if (totalPaginas <= 7) {
                            // Mostrar todas las páginas si son 7 o menos
                            numerosPagina = Array.from({ length: totalPaginas }, (_, j) => j + 1);
                          } else {
                            // Lógica para páginas con puntos suspensivos
                            if (paginaActual <= 4) {
                              numerosPagina = [1, 2, 3, 4, 5, '...', totalPaginas];
                            } else if (paginaActual >= totalPaginas - 3) {
                              numerosPagina = [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
                            } else {
                              numerosPagina = [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
                            }
                          }

                          return numerosPagina.map((numero, index) => (
                            <button
                              key={`pagina-${index}`}
                              onClick={() => typeof numero === 'number' ? irAPagina(numero) : null}
                              disabled={typeof numero !== 'number'}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${numero === paginaActual
                                  ? 'bg-verde-principal text-white'
                                  : typeof numero === 'number'
                                    ? 'text-gris-oscuro bg-white border border-gris-claro hover:bg-gris-muy-claro hover:text-negro-principal'
                                    : 'text-gris-medio cursor-default'
                                }`}
                            >
                              {numero}
                            </button>
                          ));
                        })()}
                      </div>

                      {/* Botón Siguiente */}
                      <button
                        onClick={() => irAPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${paginaActual === totalPaginas
                            ? 'text-gris-medio bg-gris-muy-claro cursor-not-allowed'
                            : 'text-gris-oscuro bg-white border border-gris-claro hover:bg-gris-muy-claro hover:text-negro-principal'
                          }`}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl text-gris-muy-claro mb-4">📦</div>
                <h3 className="text-xl font-semibold text-negro-principal mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gris-medio mb-6">
                  Intenta ajustar los filtros para encontrar lo que buscas
                </p>
                <button
                  onClick={limpiarFiltros}
                  className="btn-primary"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productos;
