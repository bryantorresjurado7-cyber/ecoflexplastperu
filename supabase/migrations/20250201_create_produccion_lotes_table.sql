-- ═══════════════════════════════════════════════════════════════
-- CREAR TABLA DE RELACIÓN PRODUCCIÓN - LOTES
-- Relación muchos a muchos entre produccion y lotes
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.produccion_lotes (
    -- Identificación
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relaciones
    id_produccion UUID NOT NULL REFERENCES public.produccion(id_produccion) ON DELETE CASCADE,
    id_lote UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
    
    -- Información del lote en esta producción
    cantidad_asignada INTEGER NOT NULL DEFAULT 0,
    observaciones TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraint: un lote no puede estar duplicado en la misma producción
    UNIQUE(id_produccion, id_lote)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produccion_lotes_produccion ON public.produccion_lotes(id_produccion);
CREATE INDEX IF NOT EXISTS idx_produccion_lotes_lote ON public.produccion_lotes(id_lote);

-- Comentarios
COMMENT ON TABLE public.produccion_lotes IS 'Relación muchos a muchos entre órdenes de producción y lotes';
COMMENT ON COLUMN public.produccion_lotes.cantidad_asignada IS 'Cantidad del lote asignada a esta orden de producción';

