# Migració: Afegir camp d'aigua a la taula meals

Aquest document explica com afegir el camp `water_liters` a la taula `meals` per poder registrar la quantitat d'aigua beguda.

## Passos per Executar la Migració

1. **Accedeix a Supabase Dashboard**
   - Obre el teu projecte a [Supabase Dashboard](https://app.supabase.com)
   - Vés a la secció "SQL Editor"

2. **Executa l'Script de Migració**
   - Obre el fitxer `meals-add-water-migration.sql`
   - Copia tot el contingut
   - Enganxa'l al SQL Editor de Supabase
   - Clica "Run" per executar l'script

3. **Verifica la Migració**
   - Vés a "Table Editor" al dashboard
   - Selecciona la taula `meals`
   - Verifica que hi hagi un nou camp `water_liters` de tipus `DECIMAL(5, 2)`

## Canvis Realitzats

- S'ha afegit el camp `water_liters` a la taula `meals`
- El camp permet emmagatzemar valors decimals fins a 99.99 litres
- El valor per defecte és 0
- El camp és opcional (pot ser NULL)

## Funcionalitat

Després d'executar la migració:
- Els usuaris podran registrar la quantitat d'aigua beguda (en litres) per cada dia
- El camp apareixerà al formulari d'àpats
- La quantitat d'aigua es mostrarà a la visualització del registre d'àpats

## Productes Afegits

També s'han afegit els següents productes a la base de dades:
- Cafè amb llet d'avena
- Carn arrebossada
- Mongetes verdes amb patata
- Castanyes

**Nota**: Si ja tens productes inserits, hauràs d'executar només la part d'INSERT dels nous productes del fitxer `products-schema.sql` o inserir-los manualment.

