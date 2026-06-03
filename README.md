# Polski Leraar

Persoonlijke Pools-Nederlands leerapp als PWA. Gebouwd voor gebruik op iPhone via Safari/beginscherm.

## Functies

- Flashcards, typ-oefeningen, luisteroefeningen
- Spaced Repetition (SRS, 7 boxen)
- Automatische woorduitbreiding en niveau-indicatie (A0–B1)
- Cloud-sync via Supabase (meerdere apparaten)
- Push-notificaties (iOS 16.4+, PWA-modus)
- Offline-gebruik via localStorage

## Technisch

- Één `index.html` (vanilla JS, geen buildtool)
- Hosting: GitHub Pages
- Backend: Supabase (Auth, PostgreSQL, Edge Functions, pg_cron)

## Supabase schema-migraties

Voer uit in volgorde via Supabase SQL Editor:

| Bestand | Inhoud |
|---------|--------|
| `schema.sql` | Basisschema (user_cards, user_stats, user_settings) |
| `schema-push.sql` | push_subscription kolom + pg_cron job |
| `schema-autospeak.sql` | auto_speak kolom |
| `schema-pushlog.sql` | push_log tabel voor notificatie-logging |

## Edge Function deployen

```bash
supabase functions deploy send-reminders
```

Vereiste secrets:
```bash
supabase secrets set VAPID_PUBLIC_KEY=<publieke_sleutel>
supabase secrets set VAPID_PRIVATE_KEY=<private_sleutel>
```

## Security checklist

- **Supabase anon-key** is publiek by design — veilig in frontend-code.
- **RLS** staat aan op alle user-tabellen (`user_cards`, `user_stats`, `user_settings`, `push_log`).
- Elke RLS-policy beperkt rijen tot `auth.uid() = user_id`.
- **Service role key** staat nooit in frontend-code — alleen in Edge Function env vars (`SUPABASE_SERVICE_ROLE_KEY`).
- **Publieke VAPID-sleutel** mag in frontend staan (is by design publiek).
- **Private VAPID-sleutel** staat uitsluitend als Supabase secret (`VAPID_PRIVATE_KEY`) — nooit in frontend.
- `push_log` wordt alleen geschreven door de Edge Function (service role). Lezen via RLS beperkt tot eigen rijen.
