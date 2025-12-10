-- Script para permitir roles personalizados en la tabla admin_profiles

-- 1. Eliminar la restricción CHECK en la columna rol si existe
-- Nota: El nombre de la restricción puede variar. Verifique en su base de datos si tiene otro nombre.
ALTER TABLE admin_profiles DROP CONSTRAINT IF EXISTS admin_profiles_rol_check;

-- 2. Alternativamente, si usa un tipo ENUM, debe convertirlo a TEXT o agregar el valor al enum
-- Para convertir a texto (más flexible):
ALTER TABLE admin_profiles ALTER COLUMN rol TYPE text;

-- 3. Si tiene una llave foránea a una tabla de roles, necesitará insertar el nuevo rol en esa tabla primero
-- INSERT INTO roles (nombre) VALUES ('nuevo_rol');
