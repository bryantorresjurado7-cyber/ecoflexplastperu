-- ═══════════════════════════════════════════════════════════════
-- CREAR TABLA DE MOVIMIENTOS
-- Registro de movimientos de inventario (ingresos y salidas)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.movimiento (
    -- Identificación
    id_movimiento SERIAL PRIMARY KEY,
    
    -- Relaciones (Foreign Keys)
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    id_producto UUID REFERENCES public.productos_db(id) ON DELETE SET NULL,
    id_cliente UUID REFERENCES public.cliente(id_cliente) ON DELETE SET NULL,
    id_tipo_movimiento INTEGER REFERENCES public.tipo_movimiento(id_tipo_movimiento) ON DELETE SET NULL,
    
    -- Fechas
    fecha_movimiento DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    
    -- Información del movimiento
    cantidad INTEGER NOT NULL DEFAULT 0,
    producto TEXT NOT NULL, -- Nombre del producto (para referencia rápida)
    medida VARCHAR(100),
    observacion VARCHAR(200),
    solicitante VARCHAR(200),
    
    -- Estado (0 = inactivo, 1 = activo)
    estado SMALLINT DEFAULT 1 CHECK (estado IN (0, 1)),
    
    -- Auditoría
    usuario_creacion VARCHAR(100),
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    usuario_modificacion VARCHAR(100),
    fecha_modificacion DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps adicionales para compatibilidad
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_movimiento_usuario ON public.movimiento(id_usuario);
CREATE INDEX IF NOT EXISTS idx_movimiento_producto ON public.movimiento(id_producto);
CREATE INDEX IF NOT EXISTS idx_movimiento_cliente ON public.movimiento(id_cliente);
CREATE INDEX IF NOT EXISTS idx_movimiento_tipo ON public.movimiento(id_tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON public.movimiento(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimiento_estado ON public.movimiento(estado);
CREATE INDEX IF NOT EXISTS idx_movimiento_created_at ON public.movimiento(created_at);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha_tipo ON public.movimiento(fecha_movimiento, id_tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimiento_producto_fecha ON public.movimiento(id_producto, fecha_movimiento);

-- Comentarios
COMMENT ON TABLE public.movimiento IS 'Registro de movimientos de inventario (ingresos y salidas de productos)';
COMMENT ON COLUMN public.movimiento.id_movimiento IS 'Identificador único del movimiento';
COMMENT ON COLUMN public.movimiento.id_usuario IS 'Usuario que realizó o registró el movimiento';
COMMENT ON COLUMN public.movimiento.id_producto IS 'Producto relacionado con el movimiento';
COMMENT ON COLUMN public.movimiento.id_cliente IS 'Cliente relacionado (principalmente para salidas)';
COMMENT ON COLUMN public.movimiento.id_tipo_movimiento IS 'Tipo de movimiento (INGRESO, SALIDA, etc.)';
COMMENT ON COLUMN public.movimiento.fecha_movimiento IS 'Fecha en que se realizó el movimiento';
COMMENT ON COLUMN public.movimiento.fecha_vencimiento IS 'Fecha de vencimiento del producto (si aplica)';
COMMENT ON COLUMN public.movimiento.cantidad IS 'Cantidad de productos en el movimiento';
COMMENT ON COLUMN public.movimiento.producto IS 'Nombre del producto (para referencia rápida sin join)';
COMMENT ON COLUMN public.movimiento.medida IS 'Unidad de medida (UND, KG, M, etc.)';
COMMENT ON COLUMN public.movimiento.observacion IS 'Observaciones adicionales del movimiento';
COMMENT ON COLUMN public.movimiento.solicitante IS 'Persona o entidad que solicitó el movimiento';
COMMENT ON COLUMN public.movimiento.estado IS 'Estado del movimiento: 1 = activo, 0 = inactivo/anulado';

-- Función para actualizar fecha_modificacion automáticamente
CREATE OR REPLACE FUNCTION update_movimiento_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_DATE;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_modificacion en UPDATE
CREATE TRIGGER trigger_update_movimiento_fecha_modificacion
    BEFORE UPDATE ON public.movimiento
    FOR EACH ROW
    EXECUTE FUNCTION update_movimiento_fecha_modificacion();

