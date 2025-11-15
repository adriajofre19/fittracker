-- Migració per afegir les columnes football_match_data i yoyo_test_data a la taula routines
-- Aquest script és idempotent: es pot executar múltiples vegades sense problemes

-- Afegir columna football_match_data si no existeix
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'routines' 
        AND column_name = 'football_match_data'
    ) THEN
        ALTER TABLE routines ADD COLUMN football_match_data JSONB DEFAULT NULL;
        COMMENT ON COLUMN routines.football_match_data IS '{ total_kms: 8.5, calories: 650 }';
    END IF;
END $$;

-- Afegir columna yoyo_test_data si no existeix
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'routines' 
        AND column_name = 'yoyo_test_data'
    ) THEN
        ALTER TABLE routines ADD COLUMN yoyo_test_data JSONB DEFAULT NULL;
        COMMENT ON COLUMN routines.yoyo_test_data IS '{ series: [{ start_level: "0", end_level: "19.2", completed: true }] }';
    END IF;
END $$;

-- Actualitzar la constraint CHECK per incloure els nous tipus si no estan inclosos
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Obtenir el nom de la constraint CHECK existent per routine_type
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'routines'::regclass
    AND contype = 'c'
    AND conname LIKE '%routine_type%'
    LIMIT 1;
    
    -- Si existeix una constraint antiga, eliminar-la
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE routines DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
    END IF;
    
    -- Afegir la nova constraint amb tots els tipus (només si no existeix ja)
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint
        WHERE conrelid = 'routines'::regclass
        AND conname = 'routines_routine_type_check'
    ) THEN
        ALTER TABLE routines ADD CONSTRAINT routines_routine_type_check 
        CHECK (routine_type IN ('athletics', 'running', 'gym', 'steps', 'football_match', 'yoyo_test'));
    END IF;
END $$;

