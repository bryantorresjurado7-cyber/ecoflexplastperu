-- ═══════════════════════════════════════════════════════════════
-- ARREGLAR CHECK CONSTRAINT DE ESTADO EN COTIZACION
-- ═══════════════════════════════════════════════════════════════

-- Eliminar el constraint actual si existe
ALTER TABLE public.cotizacion 
DROP CONSTRAINT IF EXISTS cotizacion_estado_check;

-- Agregar el nuevo constraint con los valores correctos
ALTER TABLE public.cotizacion 
ADD CONSTRAINT cotizacion_estado_check 
CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada'));

-- Comentario para documentación
COMMENT ON CONSTRAINT cotizacion_estado_check ON public.cotizacion IS 
'Valores permitidos: pendiente, en_proceso, completada, cancelada';


