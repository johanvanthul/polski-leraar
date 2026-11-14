# Polski Leraar

Persoonlijke Pools-Nederlands leerapp als PWA. Gebouwd voor gebruik op iPhone via Safari/beginscherm.

## Functies

- Slimme mix, flashcards, typ-oefeningen, luisteroefeningen, zinnen
- Eigen woorden toevoegen en beheren
- Spaced Repetition (SRS, 7 boxen)
- Automatische woorduitbreiding en niveau-indicatie (A0–B1)
- Cloud-sync via Supabase (meerdere apparaten)
- Push-notificaties (iOS 16.4+, PWA-modus)
- Werkt zonder internet: de app en je voortgang staan op het apparaat en synchroniseren zodra er weer verbinding is

## Technisch

- `index.html` + `core.js` + `stories.js` (vanilla JS, geen buildtool)
- Hosting: GitHub Pages
- Backend: Supabase (Auth, PostgreSQL, Edge Functions, pg_cron)

## Supabase schema-migraties

Voer uit in volgorde via Supabase SQL Editor:

| Bestand | Inhoud |
|---------|--------|
| `schema.sql` | Basisschema (user_cards, user_stats, user_settings) |
| `schema-push.sql` | push_subscription kolom + pg_cron job |
| `schema-autospeak.sql` | auto_speak kolom in user_settings |
| `schema-pushlog.sql` | push_log tabel voor notificatie-logging |
| `schema-userwords.sql` | user_words tabel voor eigen woorden |

## Tests

Open `tests/run-tests.html` in een browser.

## Edge Function deployen

```bash
supabase functions deploy send-reminders --project-ref elcrpgsiyiehxjoerkiu
```

Vereiste secrets:
```bash
supabase secrets set VAPID_PUBLIC_KEY=<publieke_sleutel>
supabase secrets set VAPID_PRIVATE_KEY=<private_sleutel>
```

## Security checklist

- **Supabase anon-key** is publiek by design — veilig in frontend-code.
- **RLS** staat aan op alle user-tabellen (`user_cards`, `user_stats`, `user_settings`, `user_words`, `push_log`).
- Elke RLS-policy beperkt rijen tot `auth.uid() = user_id`.
- **Service role key** staat alleen in de omgevingsvariabelen van de Edge Function (`SUPABASE_SERVICE_ROLE_KEY`). Duikt hij op in de code of in een document, vervang hem dan in het Supabase-dashboard.
- **Publieke VAPID-sleutel** mag in frontend staan (is by design publiek).
- **Private VAPID-sleutel** staat alleen als Supabase secret (`VAPID_PRIVATE_KEY`). Duikt hij op in de code, maak dan een nieuw sleutelpaar aan.
- `push_log` wordt alleen geschreven door de Edge Function (service role). Lezen via RLS beperkt tot eigen rijen.
