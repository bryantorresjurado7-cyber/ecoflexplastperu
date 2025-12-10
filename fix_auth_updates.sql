-- Función SQL para permitir a los administradores actualizar credenciales (Email/Password)
-- Ejecute este script en el Editor SQL de Supabase

CREATE OR REPLACE FUNCTION update_user_credentials(
  target_user_id uuid,
  new_email text DEFAULT NULL,
  new_password text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos de administrador para poder tocar auth.users
AS $$
BEGIN
  -- 1. Actualizar Email si se proporciona
  IF new_email IS NOT NULL AND new_email != '' THEN
    UPDATE auth.users
    SET email = new_email, 
        updated_at = now(),
        email_confirmed_at = now() -- Confirmamos automáticamente para evitar bloqueos
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

-- Otorgar permiso de ejecución a usuarios autenticados (la validación de rol debe hacerse en frontend o con RLS adicional si se requiere)
GRANT EXECUTE ON FUNCTION update_user_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_credentials TO service_role;
