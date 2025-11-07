-- ═══════════════════════════════════════════════════════════════
-- ELIMINAR TABLA insumo_producto
-- ═══════════════════════════════════════════════════════════════
-- Esta tabla no se está utilizando en ninguna Edge Function
-- y no contiene registros. Se elimina para limpiar la base de datos.

-- Eliminar la tabla si existe
DROP TABLE IF EXISTS public.insumo_producto CASCADE;

-- Comentario: La tabla insumo_producto fue eliminada porque no se estaba utilizando
-- en ninguna Edge Function del proyecto y estaba vacía (0 registros).






