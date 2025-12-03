-- ═══════════════════════════════════════════════════════════════
-- CREAR TABLA DE TIPOS DE MOVIMIENTO
-- Catálogo de tipos de movimientos (INGRESO, SALIDA, etc.)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.tipo_movimiento (
    id_tipo_movimiento SERIAL PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insertar tipos básicos de movimiento
INSERT INTO public.tipo_movimiento (codigo, nombre, descripcion) VALUES
    ('INGRESO', 'Ingreso', 'Entrada de productos al inventario'),
    ('SALIDA', 'Salida', 'Salida de productos del inventario'),
    ('AJUSTE_INVENTARIO', 'Ajuste de Inventario', 'Ajuste manual de inventario'),
    ('DEVOLUCION', 'Devolución', 'Devolución de productos')
ON CONFLICT (codigo) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_tipo_movimiento_codigo ON public.tipo_movimiento(codigo);
CREATE INDEX IF NOT EXISTS idx_tipo_movimiento_activo ON public.tipo_movimiento(activo);

-- Comentarios
COMMENT ON TABLE public.tipo_movimiento IS 'Catálogo de tipos de movimientos de inventario';
COMMENT ON COLUMN public.tipo_movimiento.codigo IS 'Código único del tipo de movimiento';
COMMENT ON COLUMN public.tipo_movimiento.nombre IS 'Nombre del tipo de movimiento';

