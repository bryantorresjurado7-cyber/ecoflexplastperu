-- ═══════════════════════════════════════════════════════════════
-- CONFIGURAR RLS PARA LA TABLA PEDIDO Y DETALLE_PEDIDO
-- ═══════════════════════════════════════════════════════════════

-- ============================================
-- 1. CREAR TABLA DETALLE_PEDIDO (Si no existe)
-- ============================================

-- Crear tabla detalle_pedido basada en la estructura real de detalle_cotizacion
CREATE TABLE IF NOT EXISTS public.detalle_pedido (
    id_detalle_pedido UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_pedido UUID REFERENCES public.pedido(id_pedido) ON DELETE CASCADE,
    id_producto UUID REFERENCES public.productos_db(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    precio_unitario NUMERIC(10,2) DEFAULT 0,
    subtotal NUMERIC(10,2) DEFAULT 0,
    descuento NUMERIC(10,2) DEFAULT 0,
    observaciones TEXT,
    auditoria TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Índices para detalle_pedido
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido ON public.detalle_pedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_producto ON public.detalle_pedido(id_producto);

-- ============================================
-- 2. HABILITAR RLS EN LAS TABLAS
-- ============================================

ALTER TABLE public.pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedido ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ELIMINAR POLÍTICAS EXISTENTES (Si existen)
-- ============================================

DROP POLICY IF EXISTS "Pedidos públicos pueden ver pedidos" ON public.pedido;
DROP POLICY IF EXISTS "Admins pueden gestionar pedidos" ON public.pedido;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear pedidos" ON public.pedido;

DROP POLICY IF EXISTS "Detalle público puede ver detalles" ON public.detalle_pedido;
DROP POLICY IF EXISTS "Detalle admins pueden gestionar" ON public.detalle_pedido;
DROP POLICY IF EXISTS "Detalle usuarios autenticados pueden crear" ON public.detalle_pedido;

-- ============================================
-- 3. POLÍTICAS PARA TABLA PEDIDO
-- ============================================

-- Política: Permitir a todos ver pedidos (público)
CREATE POLICY "Permitir ver pedidos"
ON public.pedido
FOR SELECT
TO public
USING (true);

-- Política: Permitir a usuarios autenticados crear pedidos
CREATE POLICY "Permitir crear pedidos"
ON public.pedido
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Permitir a usuarios autenticados actualizar pedidos
CREATE POLICY "Permitir actualizar pedidos"
ON public.pedido
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política: Permitir a usuarios autenticados eliminar pedidos
CREATE POLICY "Permitir eliminar pedidos"
ON public.pedido
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 4. POLÍTICAS PARA TABLA DETALLE_PEDIDO
-- ============================================

-- Política: Permitir a todos ver detalles (público)
CREATE POLICY "Permitir ver detalles pedido"
ON public.detalle_pedido
FOR SELECT
TO public
USING (true);

-- Política: Permitir a usuarios autenticados crear detalles
CREATE POLICY "Permitir crear detalles pedido"
ON public.detalle_pedido
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Permitir a usuarios autenticados actualizar detalles
CREATE POLICY "Permitir actualizar detalles pedido"
ON public.detalle_pedido
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política: Permitir a usuarios autenticados eliminar detalles
CREATE POLICY "Permitir eliminar detalles pedido"
ON public.detalle_pedido
FOR DELETE
TO authenticated
USING (true);

