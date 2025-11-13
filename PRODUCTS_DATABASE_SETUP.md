# Configuració de la Base de Dades per Productes

Aquest document explica com configurar la taula `products` a Supabase per gestionar productes/aliments que es poden afegir als àpats.

## Passos per Configurar

1. **Accedeix a Supabase Dashboard**
   - Obre el teu projecte a [Supabase Dashboard](https://app.supabase.com)
   - Vés a la secció "SQL Editor"

2. **Executa l'Esquema SQL**
   - Obre el fitxer `products-schema.sql`
   - Copia tot el contingut
   - Enganxa'l al SQL Editor de Supabase
   - Clica "Run" per executar l'script

3. **Verifica la Creació**
   - Vés a "Table Editor" al dashboard
   - Hauries de veure la nova taula `products`
   - Verifica que hi hagi productes per defecte inserits
   - Verifica que les polítiques RLS estiguin activades

## Estructura de la Taula

La taula `products` conté els següents camps:

- `id` (UUID): Identificador únic del producte
- `user_id` (UUID): Referència a l'usuari (null per productes per defecte)
- `name` (TEXT): Nom del producte
- `category` (TEXT): Categoria del producte (Fruita, Verdura, Carn, etc.)
- `calories_per_100g` (DECIMAL): Calories per 100 grams
- `protein_per_100g` (DECIMAL): Proteïnes per 100 grams
- `carbs_per_100g` (DECIMAL): Carbohidrats per 100 grams
- `fat_per_100g` (DECIMAL): Greixos per 100 grams
- `is_default` (BOOLEAN): Indica si és un producte per defecte del sistema
- `created_at` (TIMESTAMP): Data de creació
- `updated_at` (TIMESTAMP): Data d'actualització

## Productes per Defecte

L'script SQL inclou més de 30 productes per defecte organitzats per categories:

- **Fruites**: Poma, Plàtan, Taronja, Maduixa, Raïm
- **Verdures**: Ensalada, Tomàquet, Pastanaga, Bròquil, Espinacs
- **Carns**: Pollastre, Vedella, Porc
- **Peixos**: Peix blanc, Salmó
- **Làctics**: Llet, Iogurt, Formatge, Ous
- **Cereals i llegums**: Arròs, Pasta, Pa, Avena, Lentilles, Cigrons
- **Fruits secs**: Nous, Ametlles, Avellanes
- **Altres**: Oli d'oliva, Aguacat, Xocolata negra

## Seguretat (RLS)

La taula té Row Level Security (RLS) activat:
- Tothom pot veure productes per defecte (`is_default = true`)
- Cada usuari pot veure els seus propis productes personalitzats
- Els usuaris poden crear, modificar i eliminar només els seus propis productes
- No es poden modificar ni eliminar productes per defecte

## Endpoints API Disponibles

- `GET /api/products` - Obtenir tots els productes (per defecte + del usuari)
  - Paràmetres opcionals: `?search=nom` per cercar, `?category=Categoria` per filtrar
- `POST /api/products` - Crear un nou producte personalitzat
- `GET /api/products/[id]` - Obtenir un producte específic
- `PUT /api/products/[id]` - Actualitzar un producte (només els propis)
- `DELETE /api/products/[id]` - Eliminar un producte (només els propis)

## Funcionalitat a la Pàgina d'Àpats

Un cop configurada la base de dades:
- Pots seleccionar productes des del formulari d'àpats
- Cada producte es pot afegir amb una quantitat personalitzada (en grams)
- El sistema calcula automàticament les calories i macronutrients
- Cada àpat mostra un total de calories, proteïnes, carbohidrats i greixos

