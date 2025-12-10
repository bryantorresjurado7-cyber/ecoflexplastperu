-- Script CORRECTIVO ROBUSTO para roles en admin_profiles
-- Ejecute este script completo en el Editor SQL de Supabase para solucionar el problema de guardado

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Eliminar cualquier CHECK constraint en la columna 'rol'
    -- Busca dinámicamente cualquier restricción CHECK asociada a la columna 'rol' y la elimina
    FOR r IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'admin_profiles' 
          AND ccu.column_name = 'rol' 
          AND tc.constraint_type = 'CHECK'
    LOOP
        RAISE NOTICE 'Eliminando constraint: %', r.constraint_name;
        EXECUTE 'ALTER TABLE admin_profiles DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;

    -- 2. Convertir la columna 'rol' a TEXT
    -- Esto asegura que aceptará cualquier cadena de texto, no solo valores de un ENUM
    BEGIN
        ALTER TABLE admin_profiles ALTER COLUMN rol TYPE text;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo convertir a texto directamente, puede que ya sea texto o haya dependencias: %', SQLERRM;
    END;
    
    RAISE NOTICE 'Script completado. Los roles personalizados deberían funcionar ahora.';
END $$;
