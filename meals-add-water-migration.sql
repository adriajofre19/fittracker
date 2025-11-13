-- Migració per afegir el camp water_liters a la taula meals
-- Aquest script afegeix un camp per registrar la quantitat d'aigua beguda (en litres)

-- Afegir el camp water_liters a la taula meals
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS water_liters DECIMAL(5, 2) DEFAULT 0;

-- Comentari per documentar el camp
COMMENT ON COLUMN meals.water_liters IS 'Quantitat d''aigua beguda durant el dia en litres';

