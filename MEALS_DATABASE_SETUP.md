# Configuració de la Base de Dades per Àpats

Aquest document explica com configurar la taula `meals` a Supabase per guardar els àpats del dia (esmorzar, dinar, berenar, sopar).

## Passos per Configurar

1. **Accedeix a Supabase Dashboard**
   - Obre el teu projecte a [Supabase Dashboard](https://app.supabase.com)
   - Vés a la secció "SQL Editor"

2. **Executa l'Esquema SQL**
   - Obre el fitxer `meals-schema.sql`
   - Copia tot el contingut
   - Enganxa'l al SQL Editor de Supabase
   - Clica "Run" per executar l'script

3. **Verifica la Creació**
   - Vés a "Table Editor" al dashboard
   - Hauries de veure la nova taula `meals`
   - Verifica que les polítiques RLS estiguin activades

## Estructura de la Taula

La taula `meals` conté els següents camps:

- `id` (UUID): Identificador únic del registre
- `user_id` (UUID): Referència a l'usuari autenticat
- `meal_date` (DATE): Data de l'àpat (format YYYY-MM-DD)
- `breakfast` (JSONB): Informació sobre l'esmorzar (opcional)
- `lunch` (JSONB): Informació sobre el dinar (opcional)
- `snack` (JSONB): Informació sobre el berenar (opcional)
- `dinner` (JSONB): Informació sobre el sopar (opcional)
- `notes` (TEXT): Notes addicionals (opcional)
- `created_at` (TIMESTAMP): Data de creació
- `updated_at` (TIMESTAMP): Data d'actualització

## Seguretat (RLS)

La taula té Row Level Security (RLS) activat, el que significa que:
- Cada usuari només pot veure els seus propis registres d'àpats
- Cada usuari només pot crear, modificar i eliminar els seus propis registres
- No hi ha accés entre usuaris

## Endpoints API Disponibles

Un cop configurada la base de dades, pots utilitzar els següents endpoints:

- `GET /api/meals` - Obtenir tots els àpats de l'usuari
- `POST /api/meals` - Crear un nou registre d'àpats
- `GET /api/meals/[id]` - Obtenir un àpat específic
- `PUT /api/meals/[id]` - Actualitzar un àpat
- `DELETE /api/meals/[id]` - Eliminar un àpat

## Exemple d'Ús

### Crear un registre d'àpats:

```json
POST /api/meals
{
  "meal_date": "2025-11-10",
  "breakfast": {
    "time": "08:00",
    "foods": ["Pa amb tomàquet", "Ous"],
    "calories": 350
  },
  "lunch": {
    "time": "14:00",
    "foods": ["Ensalada", "Pollastre"],
    "calories": 500
  },
  "snack": {
    "time": "17:00",
    "foods": ["Fruita"],
    "calories": 100
  },
  "dinner": {
    "time": "20:00",
    "foods": ["Peix", "Verdures"],
    "calories": 400
  },
  "notes": "Menjar saludable avui"
}
```

### Obtenir àpats d'un rang de dates:

```
GET /api/meals?start_date=2025-11-01&end_date=2025-11-30&limit=30
```

