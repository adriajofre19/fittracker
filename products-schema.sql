-- Taula per guardar productes/aliments disponibles
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    calories_per_100g DECIMAL(6, 2),
    protein_per_100g DECIMAL(6, 2),
    carbs_per_100g DECIMAL(6, 2),
    fat_per_100g DECIMAL(6, 2),
    is_default BOOLEAN DEFAULT false, -- Productes per defecte del sistema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índex per millorar les consultes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_default ON products(is_default);

-- Funció per actualitzar updated_at automàticament (reutilitzant la funció existent)

-- Trigger per actualitzar updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Tothom pot veure productes per defecte i els seus propis productes
CREATE POLICY "Users can view default products and their own products"
    ON products
    FOR SELECT
    USING (is_default = true OR auth.uid() = user_id);

-- Política: Els usuaris poden inserir només els seus propis productes
CREATE POLICY "Users can insert their own products"
    ON products
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Els usuaris poden actualitzar només els seus propis productes
CREATE POLICY "Users can update their own products"
    ON products
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Els usuaris poden eliminar només els seus propis productes
CREATE POLICY "Users can delete their own products"
    ON products
    FOR DELETE
    USING (auth.uid() = user_id);

-- Inserir alguns productes per defecte
INSERT INTO products (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_default)
VALUES
    -- Fruites
    ('Poma', 'Fruita', 52, 0.3, 14, 0.2, true),
    ('Plàtan', 'Fruita', 89, 1.1, 23, 0.3, true),
    ('Taronja', 'Fruita', 47, 0.9, 12, 0.1, true),
    ('Maduixa', 'Fruita', 32, 0.7, 8, 0.3, true),
    ('Raïm', 'Fruita', 69, 0.7, 18, 0.2, true),
    
    -- Verdures
    ('Ensalada', 'Verdura', 15, 1.4, 3, 0.2, true),
    ('Tomàquet', 'Verdura', 18, 0.9, 4, 0.2, true),
    ('Pastanaga', 'Verdura', 41, 0.9, 10, 0.2, true),
    ('Bròquil', 'Verdura', 34, 2.8, 7, 0.4, true),
    ('Espinacs', 'Verdura', 23, 2.9, 4, 0.4, true),
    
    -- Carns
    ('Pollastre', 'Carn', 165, 31, 0, 3.6, true),
    ('Vedella', 'Carn', 250, 26, 0, 17, true),
    ('Porc', 'Carn', 242, 27, 0, 14, true),
    ('Peix blanc', 'Peix', 84, 18, 0, 1, true),
    ('Salmó', 'Peix', 208, 20, 0, 13, true),
    
    -- Làctics
    ('Llet', 'Làctic', 42, 3.4, 5, 1, true),
    ('Iogurt', 'Làctic', 59, 10, 4, 0.4, true),
    ('Formatge', 'Làctic', 113, 7, 1, 9, true),
    ('Ous', 'Làctic', 155, 13, 1.1, 11, true),
    
    -- Cereals i llegums
    ('Arròs', 'Cereal', 130, 2.7, 28, 0.3, true),
    ('Pasta', 'Cereal', 131, 5, 25, 1.1, true),
    ('Pa', 'Cereal', 265, 9, 49, 3.2, true),
    ('Avena', 'Cereal', 389, 17, 66, 7, true),
    ('Lentilles', 'Llegum', 116, 9, 20, 0.4, true),
    ('Cigrons', 'Llegum', 164, 8.9, 27, 2.6, true),
    
    -- Fruits secs
    ('Nous', 'Fruit sec', 654, 15, 14, 65, true),
    ('Ametlles', 'Fruit sec', 579, 21, 22, 50, true),
    ('Avellanes', 'Fruit sec', 628, 15, 17, 61, true),
    
    -- Altres
    ('Oli d''oliva', 'Greix', 884, 0, 0, 100, true),
    ('Aguacat', 'Fruita', 160, 2, 9, 15, true),
    ('Xocolata negra', 'Dolç', 546, 7.8, 46, 31, true),
    
    -- Begudes i preparats
    ('Cafè amb llet d''avena', 'Beguda', 45, 1.2, 6, 1.5, true),
    ('Carn arrebossada', 'Carn', 280, 18, 15, 16, true),
    ('Mongetes verdes amb patata', 'Verdura', 55, 2.5, 10, 0.3, true),
    ('Castanyes', 'Fruit sec', 213, 2.4, 46, 1.4, true);

