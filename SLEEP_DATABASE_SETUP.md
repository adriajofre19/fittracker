# Configuració de la Base de Dades de Son

Aquest document explica com configurar la base de dades per guardar les hores de son i les fases de son dels usuaris.

## Pas 1: Crear la Taula a Supabase

1. Accedeix al teu projecte de Supabase
2. Ves a **SQL Editor**
3. Crea una nova query i executa el contingut del fitxer `supabase-schema.sql`

Això crearà:
- La taula `sleep_records` amb tots els camps necessaris
- Els índexs per millorar el rendiment
- Les polítiques de seguretat (RLS) per assegurar que cada usuari només pot veure/modificar les seves pròpies dades

## Estructura de la Taula

### `sleep_records`

| Camp | Tipus | Descripció |
|------|-------|------------|
| `id` | UUID | Identificador únic del registre |
| `user_id` | UUID | ID de l'usuari (relació amb auth.users) |
| `sleep_date` | DATE | Data del son (YYYY-MM-DD) |
| `bedtime` | TIMESTAMP | Hora d'anar a dormir |
| `wake_time` | TIMESTAMP | Hora de despertar |
| `total_sleep_hours` | DECIMAL(4,2) | Hores totals de son |
| `sleep_phases` | JSONB | Array de fases de son |
| `notes` | TEXT | Notes opcionals |
| `created_at` | TIMESTAMP | Data de creació |
| `updated_at` | TIMESTAMP | Data d'actualització |

### Estructura de `sleep_phases` (JSONB)

```json
[
  {
    "phase": "light" | "deep" | "rem" | "awake",
    "start_time": "2024-01-01T22:00:00Z",
    "end_time": "2024-01-01T23:00:00Z",
    "duration_minutes": 60
  }
]
```

## Endpoints API Disponibles

### GET `/api/sleep`
Obtenir tots els registres de son de l'usuari autenticat.

**Query parameters opcionals:**
- `limit`: Nombre màxim de registres (default: 100)
- `offset`: Offset per paginació (default: 0)
- `start_date`: Data d'inici (YYYY-MM-DD)
- `end_date`: Data de fi (YYYY-MM-DD)

**Exemple:**
```javascript
fetch('/api/sleep?limit=10&start_date=2024-01-01')
```

### POST `/api/sleep`
Crear un nou registre de son.

**Body:**
```json
{
  "sleep_date": "2024-01-01",
  "bedtime": "2024-01-01T22:00:00Z",
  "wake_time": "2024-01-02T07:00:00Z",
  "total_sleep_hours": 9.0,
  "sleep_phases": [
    {
      "phase": "light",
      "start_time": "2024-01-01T22:00:00Z",
      "end_time": "2024-01-01T23:00:00Z",
      "duration_minutes": 60
    }
  ],
  "notes": "Vaig dormir molt bé"
}
```

### GET `/api/sleep/[id]`
Obtenir un registre específic per ID.

### PUT `/api/sleep/[id]`
Actualitzar un registre existent.

**Body:** (tots els camps són opcionals)
```json
{
  "total_sleep_hours": 8.5,
  "notes": "Notes actualitzades"
}
```

### DELETE `/api/sleep/[id]`
Eliminar un registre.

## Seguretat

Tots els endpoints requereixen autenticació mitjançant cookies (`sb-access-token` i `sb-refresh-token`).

Les polítiques RLS asseguren que:
- Cada usuari només pot veure els seus propis registres
- Cada usuari només pot crear registres amb el seu propi `user_id`
- Cada usuari només pot modificar/eliminar els seus propis registres

## Exemple d'Ús

```typescript
// Crear un registre de son
const response = await fetch('/api/sleep', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sleep_date: '2024-01-01',
    bedtime: '2024-01-01T22:00:00Z',
    wake_time: '2024-01-02T07:00:00Z',
    total_sleep_hours: 9.0,
    sleep_phases: [
      {
        phase: 'light',
        start_time: '2024-01-01T22:00:00Z',
        end_time: '2024-01-01T23:00:00Z',
        duration_minutes: 60
      },
      {
        phase: 'deep',
        start_time: '2024-01-01T23:00:00Z',
        end_time: '2024-01-02T02:00:00Z',
        duration_minutes: 180
      }
    ],
    notes: 'Vaig dormir molt bé'
  })
});

const data = await response.json();
```

