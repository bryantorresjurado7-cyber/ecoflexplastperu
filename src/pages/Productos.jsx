import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  // Leer parámetros iniciales de la URL
  // Si no hay parámetro 'cat', usar 'zuncho' por defecto
  const initialCatParam = searchParams.get('cat') || 'zuncho';
  const initialColorParam = searchParams.get('color') || '';
  const initialAnchoParam = searchParams.get('ancho') || '';
  const initialLargoMinParam = searchParams.get('largoMin');
  const initialLargoMaxParam = searchParams.get('largoMax');
  const initialOrdenParam = searchParams.get('orden') || 'popularidad';
  const initialPaginaParam = searchParams.get('pagina');
  
  // Estado para productos de Supabase
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del filtro - inicializados desde URL
  const [categoriaFiltro, setCategoriaFiltro] = useState(initialCatParam);
  const [coloresFiltro, setColoresFiltro] = useState(initialColorParam ? [initialColorParam] : []);
  const [anchoFiltro, setAnchoFiltro] = useState(initialAnchoParam);
  const [largoRango, setLargoRango] = useState([
    initialLargoMinParam ? parseInt(initialLargoMinParam, 10) : filtros.largos.min,
    initialLargoMaxParam ? parseInt(initialLargoMaxParam, 10) : filtros.largos.max
  ]);
  const [largoBurbupack, setLargoBurbupack] = useState(''); // Estado específico para largo de burbupack
  const [ordenarPor, setOrdenarPor] = useState(initialOrdenParam);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(
    initialPaginaParam ? parseInt(initialPaginaParam, 10) : 1
  );
  const productosPorPagina = 12;

  // Flag para evitar loops en la sincronización inicial
  const [isInitialized, setIsInitialized] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState(initialCatParam || null);
  const fetchingRef = useRef(false); // Prevenir múltiples llamadas simultáneas

  // Efecto para redirigir a ?cat=zuncho si no hay parámetro cat
  useEffect(() => {
    const catParam = searchParams.get('cat');
    if (!catParam) {
      // Si no hay parámetro cat, redirigir a zuncho por defecto
      setSearchParams({ cat: 'zuncho' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Cargar productos de Supabase SOLO cuando cambie la categoría (no otros filtros)
  const catParamRef = useRef(null); // Para trackear si ya cargamos esta categoría
  const isInitialLoadRef = useRef(false); // Para detectar carga inicial
  
  useEffect(() => {
    const catParam = searchParams.get('cat') || 'zuncho'; // Usar 'zuncho' por defecto si no hay cat
    
    // Si la categoría no cambió y ya la cargamos antes, no hacer nada
    if (catParam === categoriaActual && catParamRef.current === catParam && isInitialLoadRef.current) {
      return;
    }
    
    // Prevenir múltiples llamadas simultáneas
    if (fetchingRef.current) {
      return;
    }
    
    // Actualizar referencias
    setCategoriaActual(catParam);
    catParamRef.current = catParam;
    
    const fetchProductos = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      
      try {
        setLoading(true);
        
        let result;
        
        if (catParam) {
          result = await loadProductosByCategoria(catParam);
        } else {
          result = await loadProductos();
        }
        
        const { data, error } = result;
        
        if (!error && data && Array.isArray(data)) {
          setProductos(data);
        } else {
          setProductos([]);
        }
        
        setLoading(false);
        isInitialLoadRef.current = true; // Marcar que ya cargamos inicialmente
      } catch (error) {
        setProductos([]);
        setLoading(false);
        isInitialLoadRef.current = true;
      } finally {
        fetchingRef.current = false;
      }
    };
    
    fetchProductos();
  }, [searchParams.get('cat'), categoriaActual]); // Solo depende del parámetro cat

  // Sincronizar estados con URL SOLO cuando cambian parámetros específicos (no en cada cambio)
  const prevUrlParamsRef = useRef('');
  
  useEffect(() => {
    const currentParamsString = searchParams.toString();
    
    // Solo sincronizar si realmente cambió la URL (no en cada render)
    if (currentParamsString === prevUrlParamsRef.current && prevUrlParamsRef.current !== '') {
      return; // No cambió, omitir sincronización
    }
    
    prevUrlParamsRef.current = currentParamsString;
    
    const catParam = searchParams.get('cat');
    const colorParam = searchParams.get('color');
    const anchoParam = searchParams.get('ancho');
    const largoMinParam = searchParams.get('largoMin');
    const largoMaxParam = searchParams.get('largoMax');
    const ordenParam = searchParams.get('orden');
    const paginaParam = searchParams.get('pagina');

    setCategoriaFiltro(catParam || '');
    setColoresFiltro(colorParam ? [colorParam] : []);
    setAnchoFiltro(anchoParam || '');
    
    // Validar y procesar parámetros de largo
    const minValue = largoMinParam ? parseInt(largoMinParam, 10) : filtros.largos.min;
    const maxValue = largoMaxParam ? parseInt(largoMaxParam, 10) : filtros.largos.max;
    
    setLargoRango([
      !isNaN(minValue) ? minValue : filtros.largos.min,
      !isNaN(maxValue) ? maxValue : filtros.largos.max
    ]);
    setOrdenarPor(ordenParam || 'popularidad');
    
    // Configurar página actual
    const pagina = paginaParam ? parseInt(paginaParam, 10) : 1;
    setPaginaActual(!isNaN(pagina) && pagina > 0 ? pagina : 1);
    
    // Marcar como inicializado después de la primera carga
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // Actualizar URL cuando cambien los filtros (solo después de la inicialización)
  // PERO no cuando se sincroniza desde la URL
  const prevFiltersRef = useRef({
    categoriaFiltro: '',
    coloresFiltro: [],
    anchoFiltro: '',
    largoRango: [filtros.largos.min, filtros.largos.max],
    ordenarPor: 'popularidad',
    paginaActual: 1
  });
  
  // Flag para saber si estamos actualizando desde un botón de categoría
  const isUpdatingFromCategoryButton = useRef(false);
  
  useEffect(() => {
    if (!isInitialized) {
      // Guardar valores iniciales
      prevFiltersRef.current = {
        categoriaFiltro,
        coloresFiltro: [...coloresFiltro],
        anchoFiltro,
        largoRango: [...largoRango],
        ordenarPor,
        paginaActual
      };
      return;
    }
    
    // Si acabamos de cambiar de categoría desde un botón, ya actualizamos la URL ahí
    // No necesitamos actualizar aquí también
    if (isUpdatingFromCategoryButton.current) {
      isUpdatingFromCategoryButton.current = false;
      // Actualizar valores previos para reflejar el cambio
      prevFiltersRef.current = {
        categoriaFiltro,
        coloresFiltro: [...coloresFiltro],
        anchoFiltro,
        largoRango: [...largoRango],
        ordenarPor,
        paginaActual
      };
      return;
    }
    
    // Verificar si realmente cambió algo (comparar con valores previos)
    const filtersChanged = 
      prevFiltersRef.current.categoriaFiltro !== categoriaFiltro ||
      JSON.stringify(prevFiltersRef.current.coloresFiltro) !== JSON.stringify(coloresFiltro) ||
      prevFiltersRef.current.anchoFiltro !== anchoFiltro ||
      prevFiltersRef.current.largoRango[0] !== largoRango[0] ||
      prevFiltersRef.current.largoRango[1] !== largoRango[1] ||
      prevFiltersRef.current.ordenarPor !== ordenarPor ||
      prevFiltersRef.current.paginaActual !== paginaActual;
    
    if (!filtersChanged) {
      return; // No cambió nada, no actualizar URL
    }
    
    // Actualizar valores previos
    prevFiltersRef.current = {
      categoriaFiltro,
      coloresFiltro: [...coloresFiltro],
      anchoFiltro,
      largoRango: [...largoRango],
      ordenarPor,
      paginaActual
    };
    
    const newParams = new URLSearchParams();
    
    if (categoriaFiltro) newParams.set('cat', categoriaFiltro);
    if (coloresFiltro.length > 0) newParams.set('color', coloresFiltro[0]);
    if (anchoFiltro) newParams.set('ancho', anchoFiltro);
    if (largoRango[0] !== filtros.largos.min) newParams.set('largoMin', largoRango[0].toString());
    if (largoRango[1] !== filtros.largos.max) newParams.set('largoMax', largoRango[1].toString());
    if (ordenarPor !== 'popularidad') newParams.set('orden', ordenarPor);
    if (paginaActual > 1) newParams.set('pagina', paginaActual.toString());
    
    const newParamsString = newParams.toString();
    const currentParamsString = searchParams.toString();
    
    // Solo actualizar si realmente cambió
    if (currentParamsString !== newParamsString) {
      setSearchParams(newParams, { replace: true });
    }
  }, [categoriaFiltro, coloresFiltro, anchoFiltro, largoRango, ordenarPor, paginaActual, isInitialized, setSearchParams, searchParams]);

  // Nota: ya no reseteamos la página vía efecto para evitar
  // que se vuelva a 1 al cambiar solo el parámetro "pagina" en la URL.

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {

    // Los productos ya vienen filtrados por categoría desde el servidor (edge function)
    // Solo aplicamos filtros adicionales (color, ancho, largo)
    let resultado = productos.filter(producto => {
      // No necesitamos filtrar por categoría aquí porque ya viene filtrado del servidor

      // Filtro de color
      if (coloresFiltro.length > 0 && !coloresFiltro.includes(producto.color)) {
        return false;
      }

      // Filtro de ancho (solo para zunchos y burbupack, pero con diferentes formatos)
      if (categoriaFiltro === 'zuncho' && anchoFiltro && producto.ancho && producto.ancho !== anchoFiltro) {
        return false;
      }
      if (categoriaFiltro === 'burbupack' && anchoFiltro) {
        // Para burbupack, ancho está en especificaciones.ancho_m
        const anchoProducto = producto.especificaciones?.ancho_m;
        const anchoBuscado = parseFloat(anchoFiltro);
        if (anchoProducto != null && anchoProducto !== anchoBuscado) {
          return false;
        }
      }

      // Filtro de largo según categoría
      if (categoriaFiltro === 'zuncho') {
        // Para zunchos: filtro por rango
        const minLargo = largoRango[0] || filtros.largos.min;
        const maxLargo = largoRango[1] || filtros.largos.max;
        const esRangoPorDefecto = minLargo === filtros.largos.min && maxLargo === filtros.largos.max;
        
        if (!esRangoPorDefecto && producto.largo != null) {
          if (producto.largo < minLargo || producto.largo > maxLargo) {
            return false;
          }
        }
      } else if (categoriaFiltro === 'burbupack' && largoBurbupack) {
        // Para burbupack: filtro por valor específico
        const largoBuscado = parseInt(largoBurbupack, 10);
        const largoProducto = producto.especificaciones?.largo_m || producto.largo;
        if (largoProducto != null && largoProducto !== largoBuscado) {
          return false;
        }
      }

      return true;
    });

    // Ordenar
    const orden = filtros.ordenarPor.find(o => o.id === ordenarPor);
    if (orden) {
      resultado.sort((a, b) => {
        switch (orden.campo) {
          case 'destacado':
            return b.destacado - a.destacado;
          case 'largo':
            return b.largo - a.largo;
          case 'nombre':
            return a.nombre.localeCompare(b.nombre);
          case 'codigo':
            return a.codigo.localeCompare(b.codigo);
          default:
            return 0;
        }
      });
    }

    return resultado;
  }, [productos, categoriaFiltro, coloresFiltro, anchoFiltro, largoRango, largoBurbupack, ordenarPor]);

  // Calcular productos paginados
  const { productosEnPagina, totalPaginas, indiceInicio, indiceFin } = useMemo(() => {
    const total = productosFiltrados.length;
    const totalPags = Math.ceil(total / productosPorPagina);
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = Math.min(inicio + productosPorPagina, total);
    const productos = productosFiltrados.slice(inicio, fin);
    
    return {
      productosEnPagina: productos,
      totalPaginas: totalPags,
      indiceInicio: total > 0 ? inicio + 1 : 0,
      indiceFin: fin
    };
  }, [productosFiltrados, paginaActual, productosPorPagina]);

  const toggleColorFiltro = (color) => {
    setColoresFiltro(prev => 
      prev.includes(color.id) 
        ? prev.filter(c => c !== color.id)
        : [color.id] // Solo permitir un color a la vez
    );
  };

  const limpiarFiltros = () => {
    // Mantener la categoría actual si existe, solo limpiar otros filtros
    const categoriaActual = categoriaFiltro || searchParams.get('cat') || '';
    
    // Limpiar estados de filtros (excepto categoría)
    setColoresFiltro([]);
    setAnchoFiltro('');
    setLargoRango([filtros.largos.min, filtros.largos.max]);
    setLargoBurbupack('');
    setOrdenarPor('popularidad');
    setPaginaActual(1);
    
    // Actualizar URL: mantener categoría si existe, de lo contrario establecer zuncho por defecto
    if (categoriaActual) {
      setSearchParams({ cat: categoriaActual }, { replace: true });
    } else {
      setSearchParams({ cat: 'zuncho' }, { replace: true });
    }
  };

  // Navegación de páginas
  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      // Scroll al top de la sección de productos
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tienesFiltrosActivos = categoriaFiltro || coloresFiltro.length > 0 || anchoFiltro || 
    largoRango[0] !== filtros.largos.min || largoRango[1] !== filtros.largos.max;

  // Loading state
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
                    onClick={() => {
                      // Marcar que estamos actualizando desde un botón de categoría
                      isUpdatingFromCategoryButton.current = true;
                      
                      // Limpiar TODOS los filtros excepto la categoría
                      setCategoriaFiltro(cat.id);
                      setColoresFiltro([]);
                      setAnchoFiltro('');
                      setLargoRango([filtros.largos.min, filtros.largos.max]);
                      setLargoBurbupack('');
                      setOrdenarPor('popularidad');
                      setPaginaActual(1);
                      
                      // Actualizar URL SOLO con la categoría (sin otros filtros)
                      setSearchParams({ cat: cat.id }, { replace: true });
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      categoriaFiltro === cat.id
                        ? 'bg-verde-principal text-white border-verde-principal shadow-md'
                        : 'bg-white text-negro-principal border-gris-muy-claro hover:bg-gris-muy-claro'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
              
              {categoriaFiltro && (
                <p className="text-sm text-verde-principal mt-3">
                  Filtrando por: {categoriaFiltro.toUpperCase()} ({productosFiltrados.length} productos)
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
                {['zuncho', 'esquinero', 'manga'].includes(categoriaFiltro) && (
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
                            onClick={toggleColorFiltro}
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
                {categoriaFiltro === 'zuncho' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Ancho
                    </label>
                    <FancySelect
                      value={anchoFiltro}
                      onChange={(v) => setAnchoFiltro(v)}
                      options={[{ value: '', label: 'Todos los anchos' }, ...filtros.anchos.map(ancho => ({ value: ancho, label: `${ancho}\" (pulgadas)` }))]}
                      placeholder="Todos los anchos"
                    />
                  </div>
                )}

                {/* Ancho en metros - Solo para Burbupack */}
                {categoriaFiltro === 'burbupack' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Ancho (metros)
                    </label>
                    <FancySelect
                      value={anchoFiltro}
                      onChange={(v) => setAnchoFiltro(v)}
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
                {categoriaFiltro === 'zuncho' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Longitud (metros)
                    </label>
                    <FancySelect
                      value={largoRango[0] === filtros.largos.min && largoRango[1] === filtros.largos.max ? '' : `${largoRango[0]}-${largoRango[1]}`}
                      onChange={(v) => {
                        if (v === '') {
                          setLargoRango([filtros.largos.min, filtros.largos.max]);
                        } else {
                          const [min, max] = v.split('-').map(Number);
                          setLargoRango([min, max]);
                        }
                      }}
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
                {categoriaFiltro === 'burbupack' && (
                  <div>
                    <label className="block text-sm font-medium text-negro-principal mb-2">
                      Longitud (metros)
                    </label>
                    <FancySelect
                      value={largoBurbupack}
                      onChange={(v) => setLargoBurbupack(v)}
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
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
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

            {/* Grid de productos (sin AnimatePresence para estabilidad) */}
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
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          paginaActual === 1
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
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                numero === paginaActual
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
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          paginaActual === totalPaginas
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
