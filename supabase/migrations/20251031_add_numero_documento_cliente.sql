-- Migración: Agregar campo numero_documento a la tabla cliente
-- Fecha: 2025-10-31
-- Descripción: Agrega el campo para almacenar el número/valor del documento de identidad

-- Agregar columna numero_documento
ALTER TABLE public.cliente
ADD COLUMN IF NOT EXISTS numero_documento TEXT;

-- Agregar comentario a la columna
COMMENT ON COLUMN public.cliente.numero_documento IS 'Número del documento de identidad (DNI, RUC, CE, etc.)';

-- Crear índice para búsquedas rápidas por número de documento
CREATE INDEX IF NOT EXISTS idx_cliente_numero_documento ON public.cliente(numero_documento);

-- Opcional: Agregar constraint único si se requiere que cada número de documento sea único
-- ALTER TABLE public.cliente ADD CONSTRAINT unique_numero_documento UNIQUE (numero_documento);

