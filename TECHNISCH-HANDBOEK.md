# Polski Leraar — Technisch Handboek

> Dit document is jouw naslagwerk als beheerder van de app.
> Het wordt bijgewerkt als er nieuwe features of configuratie bijkomen.
> Laatst bijgewerkt: 13 mei 2026

---

## 1. Wat is het?

Polski Leraar is een web-app om Poolse woordjes te leren. Het draait als website via GitHub Pages — je opent een URL in Safari en het werkt als een app op je iPhone.

---

## 2. Waar staat alles?

| Wat | Waar | URL/pad |
|-----|------|---------|
| Broncode | GitHub repo | https://github.com/johanvanthul/polski-leraar |
| Live app | GitHub Pages | https://johanvanthul.github.io/polski-leraar/ |
| Database | Supabase | https://supabase.com/dashboard (login met GitHub) |
| Lokale code | Je Mac | `~/Projects/polski-leraar/` |

---

## 3. Belangrijke keys en credentials

### Supabase
- **Project URL**: `https://elcrpgsiyiehxjoerkiu.supabase.co`
- **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsY3JwZ3NpeWllaHhqb2Vya2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjI4NzksImV4cCI6MjA5NDIzODg3OX0.bLlEDZFDC15ih3mfkJzq6ToSVmxUNyFXlSOCGgf1Gd8`
- **Dashboard**: https://supabase.com/dashboard/project/elcrpgsiyiehxjoerkiu

> De anon key is een *publieke* key — die mag in je code staan. De echte beveiliging zit in Row Level Security (RLS) regels in Supabase. Deel nooit je **service_role key** (die staat ook in het Supabase dashboard maar is privé).

### GitHub
- **Username**: johanvanthul
- **Repo**: polski-leraar (publiek)

---

## 4. Hoe de app werkt

```
Jij opent de URL op je iPhone
  → Safari laadt index.html van GitHub Pages
    → JavaScript draait de app
      → App laadt data direct uit localStorage (razendsnel, ook offline)
      → Op de achtergrond: Supabase checkt of je ingelogd bent
        → Ingelogd: data gesynchroniseerd vanuit de cloud
        → Niet ingelogd: localStorage blijft de bron
```

### Datasynchronisatie

| Situatie | Wat gebeurt er |
|----------|---------------|
| Ingelogd + online | Na elke sessie en instelling → automatisch sync naar Supabase |
| Ingelogd + offline | App werkt gewoon via localStorage; sync zodra je weer online bent |
| Niet ingelogd | Alleen localStorage — data verdwijnt als je cache wist |
| Eerste keer inloggen | Bestaande localStorage-data wordt automatisch gemigreerd naar Supabase |

### Niveau-systeem (A0 → B1)

De app beoordeelt je niveau na elke sessie op basis van drie factoren:

| Niveau | Geleerde woorden | Gemiddelde box | Foutrate |
|--------|-----------------|---------------|---------|
| A0 | < 10 | < 1,2 | > 55% |
| A1 | ≥ 10 | ≥ 1,2 | ≤ 55% |
| A2 | ≥ 25 | ≥ 2,0 | ≤ 40% |
| B1 | ≥ 40 | ≥ 3,0 | ≤ 25% |

Op basis van je niveau worden automatisch nieuwe woorden toegevoegd (3 per keer, als 35% van je actieve woorden box 3+ heeft bereikt). De woordselectie spreidt over categorieën en kiest passende moeilijkheidsgraad.

### Belangrijke begrippen

| Term | Wat het betekent |
|------|-----------------|
| **localStorage** | Opslagplek in je browser. Alleen op dat apparaat, verdwijnt als je cache wist. |
| **Supabase** | Online database. Slaat je data veilig op in de cloud, werkt op elk apparaat. |
| **GitHub Pages** | Gratis hosting van GitHub. Zet een HTML-bestand in je repo → krijg een URL. |
| **SRS / Leitner** | Spaced Repetition System — 7 boxen, woorden die je goed kent zie je minder vaak. |
| **PWA** | Progressive Web App — een website die zich gedraagt als een app op je telefoon. |
| **RLS** | Row Level Security — Supabase-beveiliging zodat gebruikers alleen eigen data zien. |

---

## 5. App starten en gebruiken

### Op je iPhone
- Open Safari → ga naar https://johanvanthul.github.io/polski-leraar/
- Of tik op het app-icoon als je "Zet op beginscherm" hebt gedaan
- De app laadt altijd de nieuwste versie

### Inloggen (eenmalig)
1. Open de app → tik op ⚙️ Instellingen
2. Scroll naar **Account & Sync** → tik **Inloggen**
3. Vul e-mailadres en wachtwoord in → **Inloggen**
4. Klaar — je voortgang wordt voortaan automatisch gesynchroniseerd

### Wijzigingen maken (via Claude Code)
```bash
# Open Terminal op je Mac
cd ~/Projects/polski-leraar
claude

# Claude Code start — geef je opdracht in het Nederlands
# Voorbeeld: "Voeg 10 woorden toe over het thema werk"
# Claude Code past het bestand aan, commit, en pusht
# → App is binnen 1 minuut bijgewerkt op je telefoon
```

### Handmatig een wijziging pushen
```bash
cd ~/Projects/polski-leraar
# pas een bestand aan
git add .
git commit -m "beschrijving van wat je deed"
git push
```

---

## 6. Handige Terminal commando's

### Navigatie
```bash
cd ~/Projects/polski-leraar    # Ga naar je project
ls                              # Bekijk bestanden in huidige folder
cat index.html                  # Bekijk inhoud van een bestand
```

### Git (versiebeheer)
```bash
git status                      # Wat is er gewijzigd?
git log --oneline               # Overzicht van alle wijzigingen
git add .                       # Markeer alles als "klaar om op te slaan"
git commit -m "bericht"         # Sla op met beschrijving
git push                        # Stuur naar GitHub (→ live op Pages)
git pull                        # Haal laatste versie op van GitHub
```

### Git noodgevallen
```bash
# Laatste wijziging ongedaan maken (nog niet gecommit):
git checkout -- index.html

# Terug naar een eerdere versie:
git log --oneline               # Zoek de code (bijv. abc1234)
git checkout abc1234 -- index.html
git add .
git commit -m "terug naar eerdere versie"
git push
```

### Claude Code
```bash
claude                          # Start Claude Code
claude --version                # Versie checken
```

Binnen Claude Code:
```
/help                           # Alle commando's
/exit                           # Afsluiten
Ctrl+C                          # Forceer afsluiten
```

---

## 7. Supabase beheren

### Dashboard openen
1. Ga naar https://supabase.com/dashboard
2. Log in met je GitHub account
3. Klik op project `polski-leraar`

### Belangrijke plekken in het dashboard
- **Table Editor** → je data bekijken en bewerken (als een spreadsheet)
- **SQL Editor** → database-commando's uitvoeren
- **Authentication → Users** → gebruikersaccounts beheren
- **Settings → API** → je keys bekijken

### Database tabellen

| Tabel | Inhoud |
|-------|--------|
| `user_cards` | Voortgang per woord (box, reviews, fouten, streak) |
| `user_stats` | Statistieken (streak, totaal reviews, dagelijks doel) |
| `user_settings` | Instellingen (dagelijks doel, sessiegrootte, richting) |

Alle tabellen hebben **Row Level Security** — elke gebruiker ziet alleen zijn eigen rijen.

### Account beheren
- **Bevestigingslink verlopen?** → Dashboard → Authentication → Users → klik je e-mail → "Confirm user"
- **Wachtwoord vergeten?** → Nieuw account aanmaken of via dashboard resetten
- **Data bekijken?** → Table Editor → kies een tabel

### Wat als Supabase niet werkt?
De app valt automatisch terug op localStorage — je kunt altijd blijven oefenen. De sync-badge op het beginscherm toont de status.

---

## 8. Bestanden in het project

```
polski-leraar/
├── index.html                  # De hele app (HTML + CSS + JavaScript)
├── schema.sql                  # Supabase database schema (eenmalig uitgevoerd)
├── CLAUDE-CODE-BRIEFING.md     # Context-document voor Claude Code
├── TECHNISCH-HANDBOEK.md       # Dit document
└── README.md                   # GitHub repo beschrijving (optioneel)
```

---

## 9. Veel voorkomende taken

### "Ik wil nieuwe woorden toevoegen"
```
# In Claude Code:
Voeg 20 nieuwe woorden toe over het thema 'X'. Commit en push.
```

### "De app doet iets raars"
```
# In Claude Code:
Er is een bug: [beschrijf wat er gebeurt]. Fix het.
```

### "Ik wil een backup van mijn voortgang"
- Open de app → ⚙️ Instellingen → **Exporteer**
- Slaat een JSON-bestand op

### "Ik wil mijn voortgang terugzetten"
- Open de app → ⚙️ Instellingen → **Importeer**
- Selecteer een eerder geëxporteerd JSON-bestand

### "De app laadt niet"
1. Check of GitHub Pages actief is: https://github.com/johanvanthul/polski-leraar/settings/pages
2. Check of `index.html` in de repo staat
3. Wacht 1-2 minuten na een push — Pages heeft even nodig

### "Ik wil uitloggen"
- Open de app → ⚙️ Instellingen → **Account & Sync** → **Uitloggen**

### "Ik wil op een ander apparaat inloggen"
- Open de app op het nieuwe apparaat → ⚙️ Instellingen → **Inloggen**
- Zelfde e-mailadres en wachtwoord — al je voortgang verschijnt automatisch

---

## 10. Wijzigingslog

| Datum | Versie | Wat |
|-------|--------|-----|
| 11 mei 2026 | v1.0 | App gebouwd in Claude.ai — 50 woorden, SRS, flashcards + type modus |
| 12 mei 2026 | v2.0 | Instellingenmenu, export/import, notificaties, sessiegrootte slider |
| 12 mei 2026 | v2.0 | Gehost op GitHub Pages |
| 13 mei 2026 | v3.0 | Intelligent niveau-systeem A0→B1; 38 nieuwe woorden (A1/A2/B1); LEVEL engine; niveau-badge op home en voortgang-scherm; level-up banner |
| 13 mei 2026 | v3.1 | Supabase backend: auth-scherm, automatische sync, offline fallback, migratie van localStorage |
| 13 mei 2026 | v3.2 | Auth-scherm overgeslagen bij laden (altijd direct naar home); auth-scherm overflow:hidden gefixed; Pools vlaggetje hersteld |
| 13 mei 2026 | v3.3 | Luistermodus (🎧): hoor Pools, typ Nederlands; 🔊 uitspraakknop op kaarten, woordenlijst en voorbeeldzinnen; auto-uitspraak instelbaar; type-modus altijd NL→PL, alleen woorden met ≥1 flashcard-review, toont verschil bij fout antwoord |
