-- ═══════════════════════════════════════════════════════════════
-- HACER EL CAMPO EMAIL OPCIONAL EN LA TABLA PROVEEDOR
-- ═══════════════════════════════════════════════════════════════

-- Modificar la columna email para permitir NULL
ALTER TABLE public.proveedor 
ALTER COLUMN email DROP NOT NULL;

-- Comentario
COMMENT ON COLUMN public.proveedor.email IS 'Email del proveedor (opcional)';

