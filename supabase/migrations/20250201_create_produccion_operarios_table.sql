-- ═══════════════════════════════════════════════════════════════
-- CREAR TABLA DE RELACIÓN PRODUCCIÓN - OPERARIOS
-- Relación muchos a muchos entre produccion y admin_profiles
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.produccion_operarios (
    -- Identificación
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relaciones
    id_produccion UUID NOT NULL REFERENCES public.produccion(id_produccion) ON DELETE CASCADE,
    id_operario UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE CASCADE,
    
    -- Información del operario en esta producción
    rol TEXT, -- 'operario', 'supervisor', 'control_calidad', etc.
    horas_trabajadas NUMERIC(5,2) DEFAULT 0,
    observaciones TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraint: un operario no puede estar duplicado en la misma producción
    UNIQUE(id_produccion, id_operario)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produccion_operarios_produccion ON public.produccion_operarios(id_produccion);
CREATE INDEX IF NOT EXISTS idx_produccion_operarios_operario ON public.produccion_operarios(id_operario);
CREATE INDEX IF NOT EXISTS idx_produccion_operarios_rol ON public.produccion_operarios(rol);

-- Comentarios
COMMENT ON TABLE public.produccion_operarios IS 'Relación muchos a muchos entre órdenes de producción y operarios (admin_profiles)';
COMMENT ON COLUMN public.produccion_operarios.rol IS 'Rol del operario en esta producción específica';

