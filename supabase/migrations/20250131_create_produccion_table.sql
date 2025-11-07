-- ═══════════════════════════════════════════════════════════════
-- CREAR TABLA DE PRODUCCIÓN
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.produccion (
    -- Identificación
    id_produccion UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_produccion TEXT UNIQUE NOT NULL,
    
    -- Información básica
    nombre TEXT NOT NULL,
    fecha_produccion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    
    -- Relaciones
    id_producto UUID REFERENCES public.productos_db(id),
    
    -- Cantidades
    cantidad_planificada INTEGER NOT NULL DEFAULT 0,
    cantidad_producida INTEGER NOT NULL DEFAULT 0,
    cantidad_buen_estado INTEGER DEFAULT 0,
    cantidad_defectuosa INTEGER DEFAULT 0,
    
    -- Costos
    costo_unitario NUMERIC(10,2) DEFAULT 0,
    costo_total NUMERIC(10,2) DEFAULT 0,
    
    -- Estado
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada', 'pausada')),
    
    -- Información adicional
    observaciones TEXT,
    maquinaria_utilizada TEXT,
    operarios TEXT[],
    turno TEXT, -- 'mañana', 'tarde', 'noche'
    
    -- Calidad
    calidad_controlada BOOLEAN DEFAULT false,
    fecha_control_calidad DATE,
    resultado_control TEXT, -- 'aprobado', 'rechazado', 'parcial'
    
    -- Auditoría
    auditoria TEXT DEFAULT 'Sistema',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produccion_fecha ON public.produccion(fecha_produccion);
CREATE INDEX IF NOT EXISTS idx_produccion_estado ON public.produccion(estado);
CREATE INDEX IF NOT EXISTS idx_produccion_producto ON public.produccion(id_producto);
CREATE INDEX IF NOT EXISTS idx_produccion_codigo ON public.produccion(codigo_produccion);

-- Comentarios
COMMENT ON TABLE public.produccion IS 'Registro de órdenes de producción';
COMMENT ON COLUMN public.produccion.estado IS 'Estados: pendiente, en_proceso, completada, cancelada, pausada';
COMMENT ON COLUMN public.produccion.codigo_produccion IS 'Código único de la orden de producción (formato: PROD-YYYYMMDD-XXXX)';


