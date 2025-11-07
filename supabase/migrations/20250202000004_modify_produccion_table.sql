-- ═══════════════════════════════════════════════════════════════
-- MODIFICAR TABLA PRODUCCIÓN
-- Eliminar campos: nombre, operarios
-- Cambiar maquinaria_utilizada de TEXT a FK a maquinarias
-- ═══════════════════════════════════════════════════════════════

-- Paso 1: Eliminar la columna 'nombre'
ALTER TABLE public.produccion 
DROP COLUMN IF EXISTS nombre;

-- Paso 2: Eliminar la columna 'operarios' (TEXT[])
ALTER TABLE public.produccion 
DROP COLUMN IF EXISTS operarios;

-- Paso 3: Renombrar 'maquinaria_utilizada' a 'id_maquinaria' temporalmente si existe
-- Primero eliminamos la columna antigua
ALTER TABLE public.produccion 
DROP COLUMN IF EXISTS maquinaria_utilizada;

-- Paso 4: Agregar nueva columna 'id_maquinaria' como FK
ALTER TABLE public.produccion 
ADD COLUMN IF NOT EXISTS id_maquinaria UUID REFERENCES public.maquinarias(id_maquinaria) ON DELETE SET NULL;

-- Paso 5: Crear índice para la nueva FK
CREATE INDEX IF NOT EXISTS idx_produccion_maquinaria ON public.produccion(id_maquinaria);

-- Comentario
COMMENT ON COLUMN public.produccion.id_maquinaria IS 'Referencia a la maquinaria utilizada en esta producción';

