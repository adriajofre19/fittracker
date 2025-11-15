-- Taula per guardar exercicis disponibles
CREATE TABLE IF NOT EXISTS exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'strength', 'cardio', 'flexibility', 'sport'
    muscle_groups TEXT[], -- Array de grups musculars
    equipment TEXT[], -- Array d'equipament necessari
    description TEXT,
    is_default BOOLEAN DEFAULT true, -- Exercicis per defecte del sistema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índex per millorar les consultes
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_is_default ON exercises(is_default);

-- Trigger per actualitzar updated_at
CREATE TRIGGER update_exercises_updated_at 
    BEFORE UPDATE ON exercises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Política: Tothom pot veure exercicis per defecte
CREATE POLICY "Anyone can view default exercises"
    ON exercises
    FOR SELECT
    USING (is_default = true);

-- Taula per guardar les rutines d'entrenament
CREATE TABLE IF NOT EXISTS routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_date DATE NOT NULL,
    routine_type TEXT NOT NULL CHECK (routine_type IN ('athletics', 'running', 'gym', 'steps', 'football_match', 'yoyo_test')),
    -- Per atletisme (sèries)
    athletics_data JSONB DEFAULT NULL, -- { series: [{ distance: "100m", time: "12.5s", rest: "2min" }] }
    -- Per rodatges
    running_data JSONB DEFAULT NULL, -- { distance_km: 5.0, duration_minutes: 25, pace_per_km: "5:00", notes: "..." }
    -- Per gimnàs
    gym_data JSONB DEFAULT NULL, -- { exercises: [{ exercise_id: UUID, sets: [{ reps: 10, weight_kg: 50, rest_seconds: 60 }] }] }
    -- Per passos
    steps_count INTEGER DEFAULT NULL,
    -- Per partits de futbol
    football_match_data JSONB DEFAULT NULL, -- { total_kms: 8.5, calories: 650 }
    -- Per Yo-Yo Test
    yoyo_test_data JSONB DEFAULT NULL, -- { series: [{ level: "0", completed: true }, { level: "19.2", completed: true }] }
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, routine_date, routine_type)
);

-- Índex per millorar les consultes
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_routine_date ON routines(routine_date);
CREATE INDEX IF NOT EXISTS idx_routines_routine_type ON routines(routine_type);
CREATE INDEX IF NOT EXISTS idx_routines_user_date_type ON routines(user_id, routine_date, routine_type);

-- Trigger per actualitzar updated_at
CREATE TRIGGER update_routines_updated_at 
    BEFORE UPDATE ON routines 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Política: Els usuaris poden veure només els seus propis registres
CREATE POLICY "Users can view their own routines"
    ON routines
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden inserir només els seus propis registres
CREATE POLICY "Users can insert their own routines"
    ON routines
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Els usuaris poden actualitzar només els seus propis registres
CREATE POLICY "Users can update their own routines"
    ON routines
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden eliminar només els seus propis registres
CREATE POLICY "Users can delete their own routines"
    ON routines
    FOR DELETE
    USING (auth.uid() = user_id);

