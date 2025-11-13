-- Taula per guardar els àpats del dia (esmorzar, dinar, berenar, sopar)
CREATE TABLE IF NOT EXISTS meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL,
    breakfast JSONB DEFAULT NULL,
    lunch JSONB DEFAULT NULL,
    snack JSONB DEFAULT NULL,
    dinner JSONB DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, meal_date)
);

-- Índex per millorar les consultes per usuari i data
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_date ON meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date);

-- Funció per actualitzar updated_at automàticament (reutilitzant la funció existent)
-- Si ja existeix update_updated_at_column(), no cal crear-la de nou

-- Trigger per actualitzar updated_at
CREATE TRIGGER update_meals_updated_at 
    BEFORE UPDATE ON meals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Els usuaris només poden veure/modificar les seves pròpies dades
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Política: Els usuaris poden veure només els seus propis registres
CREATE POLICY "Users can view their own meals"
    ON meals
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden inserir només els seus propis registres
CREATE POLICY "Users can insert their own meals"
    ON meals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Els usuaris poden actualitzar només els seus propis registres
CREATE POLICY "Users can update their own meals"
    ON meals
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden eliminar només els seus propis registres
CREATE POLICY "Users can delete their own meals"
    ON meals
    FOR DELETE
    USING (auth.uid() = user_id);

