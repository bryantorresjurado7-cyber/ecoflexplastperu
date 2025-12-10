-- SOLUCIÓN DEFINITIVA PARA CREACIÓN DE USUARIOS
-- Permite crear usuarios saltándose las validaciones externas de Supabase API (Edge Functions/Auth)
-- Ejecute este script en el EDITOR SQL de Supabase para instalar la función.

-- 1. Asegurar extensión de encriptación
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Función segura para crear usuario y perfil atómicamente
CREATE OR REPLACE FUNCTION create_new_user_rpc(
  email text,
  password text,
  nombre text,
  apellido text,
  rol text,
  activo boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos de superusuario
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Validar que el email no exista
  IF EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = create_new_user_rpc.email) THEN
    RAISE EXCEPTION 'El email ya está registrado.';
  END IF;

  -- Generar ID
  new_id := gen_random_uuid();

  -- Insertar en auth.users (Tabla de sistema de Supabase)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    create_new_user_rpc.email,
    crypt(create_new_user_rpc.password, gen_salt('bf')),
    now(), -- Marcar como confirmado automáticamente
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('nombre', nombre, 'rol', rol),
    now(),
    now(),
    false
  );

  -- Insertar en admin_profiles (perfil público)
  -- Usamos ON CONFLICT por si existe algún trigger que ya creó el perfil
  INSERT INTO public.admin_profiles (id, nombre, apellido, email, rol, activo)
  VALUES (new_id, nombre, apellido, create_new_user_rpc.email, rol, activo)
  ON CONFLICT (id) DO UPDATE
  SET nombre = EXCLUDED.nombre,
      apellido = EXCLUDED.apellido,
      email = EXCLUDED.email,
      rol = EXCLUDED.rol,
      activo = EXCLUDED.activo;

  RETURN new_id;
END;
$$;

-- 3. Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION create_new_user_rpc TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_user_rpc TO service_role;
