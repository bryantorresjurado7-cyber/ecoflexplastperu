-- ═══════════════════════════════════════════════════════════════
-- CREAR TABLA DE MAQUINARIAS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.maquinarias (
    -- Identificación
    id_maquinaria UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_maquinaria TEXT UNIQUE NOT NULL,
    
    -- Información básica
    nombre TEXT NOT NULL,
    descripcion TEXT,
    marca TEXT,
    modelo TEXT,
    numero_serie TEXT,
    
    -- Estado
    estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva', 'mantenimiento', 'reparacion')),
    
    -- Información adicional
    ubicacion TEXT,
    fecha_adquisicion DATE,
    fecha_ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE,
    observaciones TEXT,
    
    -- Auditoría
    auditoria TEXT DEFAULT 'Sistema',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_maquinarias_codigo ON public.maquinarias(codigo_maquinaria);
CREATE INDEX IF NOT EXISTS idx_maquinarias_estado ON public.maquinarias(estado);
CREATE INDEX IF NOT EXISTS idx_maquinarias_nombre ON public.maquinarias(nombre);

-- Comentarios
COMMENT ON TABLE public.maquinarias IS 'Registro de maquinarias y equipos de producción';
COMMENT ON COLUMN public.maquinarias.estado IS 'Estados: activa, inactiva, mantenimiento, reparacion';
COMMENT ON COLUMN public.maquinarias.codigo_maquinaria IS 'Código único de identificación de la maquinaria';

