-- SOLUCIÓN FINAL V2: Habilitar encriptación y función de actualización
-- COPIE Y PEGUE TODO ESTE CONTENIDO EN EL EDITOR SQL DE SUPABASE Y EJECUTE (RUN)

-- 1. Habilitar la extensión pgcrypto (CRUCIAL para que funcione el cambio de contraseña)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Crear función de actualización de credenciales segura
CREATE OR REPLACE FUNCTION update_user_credentials(
  target_user_id uuid,
  new_email text DEFAULT NULL,
  new_password text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Permisos de "Super Usuario" para editar auth.users
SET search_path = public, auth, extensions -- Asegurar acceso a las extensiones
AS $$
BEGIN
  -- 1. Actualizar Email si se proporciona y es diferente
  IF new_email IS NOT NULL AND new_email != '' THEN
    UPDATE auth.users
    SET email = new_email, 
        updated_at = now(),
        email_confirmed_at = now() -- Auto-confirmar
    WHERE id = target_user_id;
  END IF;

  -- 2. Actualizar Contraseña si se proporciona
  IF new_password IS NOT NULL AND new_password != '' THEN
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')), 
        updated_at = now()
    WHERE id = target_user_id;
  END IF;
END;
$$;

-- 3. Otorgar permisos
GRANT EXECUTE ON FUNCTION update_user_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_credentials TO service_role;
GRANT EXECUTE ON FUNCTION update_user_credentials TO anon;
