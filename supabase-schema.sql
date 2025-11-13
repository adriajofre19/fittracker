-- Taula per guardar les hores de son i les fases de son
CREATE TABLE IF NOT EXISTS sleep_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL,
    bedtime TIMESTAMP WITH TIME ZONE NOT NULL,
    wake_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_sleep_hours DECIMAL(4, 2) NOT NULL,
    sleep_phases JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sleep_date)
);

-- Índex per millorar les consultes per usuari i data
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_id ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_sleep_date ON sleep_records(sleep_date);
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_date ON sleep_records(user_id, sleep_date);

-- Funció per actualitzar updated_at automàticament
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per actualitzar updated_at
CREATE TRIGGER update_sleep_records_updated_at 
    BEFORE UPDATE ON sleep_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Els usuaris només poden veure/modificar les seves pròpies dades
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

-- Política: Els usuaris poden veure només els seus propis registres
CREATE POLICY "Users can view their own sleep records"
    ON sleep_records
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden inserir només els seus propis registres
CREATE POLICY "Users can insert their own sleep records"
    ON sleep_records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Els usuaris poden actualitzar només els seus propis registres
CREATE POLICY "Users can update their own sleep records"
    ON sleep_records
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden eliminar només els seus propis registres
CREATE POLICY "Users can delete their own sleep records"
    ON sleep_records
    FOR DELETE
    USING (auth.uid() = user_id);

