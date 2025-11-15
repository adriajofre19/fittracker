-- Taula per guardar rutines plantilla (templates)
CREATE TABLE IF NOT EXISTS routine_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
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
    yoyo_test_data JSONB DEFAULT NULL, -- { series: [{ start_level: "0", end_level: "19.2", completed: true }] }
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índex per millorar les consultes
CREATE INDEX IF NOT EXISTS idx_routine_templates_user_id ON routine_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_templates_routine_type ON routine_templates(routine_type);
CREATE INDEX IF NOT EXISTS idx_routine_templates_is_favorite ON routine_templates(is_favorite);

-- Trigger per actualitzar updated_at
CREATE TRIGGER update_routine_templates_updated_at 
    BEFORE UPDATE ON routine_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE routine_templates ENABLE ROW LEVEL SECURITY;

-- Política: Els usuaris poden veure només les seves plantilles
CREATE POLICY "Users can view their own routine templates"
    ON routine_templates
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden inserir només les seves plantilles
CREATE POLICY "Users can insert their own routine templates"
    ON routine_templates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Els usuaris poden actualitzar només les seves plantilles
CREATE POLICY "Users can update their own routine templates"
    ON routine_templates
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden eliminar només les seves plantilles
CREATE POLICY "Users can delete their own routine templates"
    ON routine_templates
    FOR DELETE
    USING (auth.uid() = user_id);

