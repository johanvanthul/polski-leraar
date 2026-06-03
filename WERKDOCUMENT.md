# Polski Leraar — Werkdocument

Dit document beschrijft de volledige werking van de app: doel, achtergrond, architectuur, kernlogica en bekende verbeterpunten. Bedoeld als input voor codereview, AI-tools of andere ontwikkelaars.

---

## 1. Achtergrond en doel

### De gebruiker
Johan is een Nederlandse business analyst, 18 jaar getrouwd met een Poolse vrouw. Hij verstaat passief al redelijk wat Pools door jarenlang contact met zijn schoonfamilie, maar wil actief woordenschat opbouwen zodat hij ook echt kan meepraten. Hij is geen programmeur van beroep, maar heeft eerder met AI-tools apps leren bouwen.

### Het probleem
Bestaande taalapps (Duolingo, Anki) zijn generiek en niet afgestemd op zijn specifieke situatie: Pools voor dagelijks familiegebruik, vertrekpunt vanuit al aanwezig passief begrip, interface in het Nederlands, focus op gesproken taal. Hij wil 10 minuten per dag oefenen, zonder afleidingen, op zijn iPhone.

### De oplossing
Een op maat gemaakte PWA die:
- **Alleen Pools↔Nederlands** doet (geen andere talen, geen ruis)
- **Thematisch** is opgebouwd rondom zijn leefwereld: familie, dagelijks leven, meningen, reizen, eten
- **Progressief** werkt: begint met de meest bruikbare woorden en breidt automatisch uit
- **Overal werkt**: op iPhone via Safari, op het beginscherm gezet als app, ook offline
- **Bijhoudt** wat hij al kent en wat hij nog moet oefenen (spaced repetition)

### Ontstaansgeschiedenis
De app begon als een React-prototype in Claude.ai, maar de `window.localStorage` API werkte niet in dat sandboxed omgeving op iOS Safari. Daarom omgezet naar een enkel HTML-bestand met vanilla JavaScript — een bewuste keuze die de drempel voor aanpassingen laag houdt. Sindsdien iteratief uitgebreid van ~50 woorden/flashcards-only naar de huidige versie met SRS, meerdere oefenmodi, cloud-sync en push-notificaties.

### Wat de app níet is
- Geen volledige taalmethode (geen grammaticacursus, geen leesvaardigheid, geen uitgebreide zinsbouw)
- Geen sociaal platform of gamification-engine
- Niet bedoeld voor andere gebruikers of taalparen
- Geen vervanging voor echte gespreksoefening

---

## 2. Wat is de app?

**Polski Leraar** is een Pools-Nederlands vocabulaire-leerapp als Progressive Web App (PWA). De app is gebouwd voor één specifieke gebruiker (Johan, Nederlandstalig, leert Pools voor zijn Poolse schoonfamilie). De app werkt op iPhone via Safari en kan op het beginscherm worden gezet.

**Kernfunctionaliteiten:**
- Flashcards, type-oefeningen en luisteroefeningen
- Spaced Repetition System (SRS) voor woordherhaling
- Automatisch niveau-systeem (A0 → A1 → A2 → B1)
- Automatisch uitbreiden van de woordenlijst naarmate je vordert
- Cloud-synchronisatie via Supabase (meerdere apparaten)
- Dagelijkse doelen, streaks, statistieken
- Uitspraak via Web Speech API (Pools, rate 0.82)
- Push-notificaties (iOS 16.4+, vereist PWA-modus)

---

## 2. Technische architectuur

### Eén HTML-bestand
De volledige app zit in `index.html` (~1400 regels). Geen buildtool, geen framework, geen dependencies behalve Supabase JS (CDN). Dit is een bewuste keuze voor eenvoud en snelle iteratie.

**Structuur van index.html:**
```
<head>      → fonts, CSS variabelen, componentstijlen
<body>
  #auth     → inlogscherm
  #home     → hoofdscherm
  #session  → oefenscherm
  #result   → resultaatscherm na sessie
  #progress → voortgangspagina
  #words    → woordenlijst
  #settings → instellingen
<script>
  WORD_DB        → alle woorden (hardcoded array)
  LEVEL engine   → niveauberekening
  SRS engine     → spaced repetition logica
  State          → cards[], stats{}, settings{}
  Storage        → localStorage helpers
  Navigation     → showScreen()
  Home           → renderHome()
  Session        → startSession(), handleAnswer(), finishSession()
  Result         → renderResult()
  Progress       → renderProgress()
  Words          → renderWords()
  Settings       → renderSettings(), saveSettings()
  Reminders      → Service Worker + Web Push
  Utils          → speak(), levenshtein()
  Supabase       → sbSyncUp(), sbSyncDown(), auth functies
  Init           → initData(), initSupabase()
```

### Hosting
GitHub Pages: `https://johanvanthul.github.io/polski-leraar/`

### Backend
Supabase (project: `elcrpgsiyiehxjoerkiu`, regio: eu-west-1):
- PostgreSQL database voor cloud-sync
- Supabase Auth (email + wachtwoord)
- Edge Function voor push-notificaties (`send-reminders`)
- pg_cron voor dagelijkse pushberichten

---

## 3. Woordendatabase (WORD_DB)

### Samenstelling
De database is een hardcoded JavaScript-array van 109 woorden, verdeeld in twee groepen:

| Groep | Beschrijving | Woorden |
|-------|-------------|---------|
| Basisset | IDs 1–50, `pool: undefined` | Altijd actief bij nieuwe gebruiker |
| Uitbreidingspool | IDs 101–238, `pool: true` | Worden progressief ontgrendeld |

### Velden per woord
```js
{
  id: 1,                          // uniek getal
  pl: "rozumieć",                 // Pools woord/frase
  nl: "begrijpen",                // Nederlandse vertaling
  cat: "familie",                 // categorie (zie hieronder)
  ex_pl: "Rozumiem, co mówisz",   // voorbeeldzin Pools
  ex_nl: "Ik begrijp wat je zegt",// voorbeeldzin Nederlands
  diff: 1,                        // moeilijkheid 1-3
  gram: "Ik-vorm: rozumiem...",   // grammaticatip
  pool: true,                     // optioneel: uit uitbreidingspool
  level: 'A1'                     // optioneel: doelniveau (A1/A2/B1)
}
```

### Categorieën
```
familie    👨‍👩‍👧‍👦  rood
dagelijks  🏠  blauw
meningen   💬  paars
reizen     ✈️  groen
eten       🍽️  geel
```

### Niveauverdeling uitbreidingspool
- IDs 101–115: geen `level` veld → vallen onder A0
- IDs 201–215: `level: 'A1'` (15 woorden)
- IDs 216–228: `level: 'A2'` (13 woorden)
- IDs 229–238: `level: 'B1'` (10 woorden)

---

## 4. SRS Engine (Spaced Repetition System)

### Box-systeem
Elk woord heeft een box (0–6). Hogere box = langere herhaalinterval:

| Box | Interval | Betekenis |
|-----|----------|-----------|
| 0   | 0 dagen (min. 4u cooldown na eerste review) | Nieuw / gefaald |
| 1   | 1 dag    | Kort onthouden |
| 2   | 3 dagen  | Aan het leren |
| 3   | 7 dagen  | Redelijk geleerd |
| 4   | 14 dagen | Goed geleerd |
| 5   | 30 dagen | Sterk geleerd |
| 6   | 60 dagen | Lang-termijn geheugen |

**Definitie "geleerd":** box ≥ 3 (7-dageninterval bereikt)

### Promotie (correct antwoord)
```js
promote(c, mode) {
  const ns = c.streak + 1;
  const needed = requiredStreak(c.misses);
  // needed = 4 als misses>=5, 3 als misses>=3, 2 als misses>=1, anders 1
  if (ns >= needed) {
    box = Math.min(box + 1, 6);
    misses = Math.max(misses - 1, 0);
  }
  // Als ns < needed: box blijft gelijk, streak stijgt wel
}
```

**Streakeis bij fouten:** een woord dat eerder fout was, moet meerdere keren achtereen goed beantwoord worden voordat het promoveert. Dit voorkomt dat je een woord "geluk" kunt raden.

### Demotie (fout antwoord)
```js
demote(c, mode) {
  box = Math.max(box - 2, 0);   // twee boxen terug
  streak = 0;
  misses += 1;
}
```

### nextReview berekening
```js
getNextReview(c) {
  const iv = intervals[Math.min(box, 6)];           // basisdagen
  const mf = misses>3 ? 0.5 : misses>1 ? 0.75 : 1; // foutfactor
  const base = lastReview + floor(iv * mf) * 86400000;
  // Minimum 4u cooldown voor box-0 woorden die al gezien zijn:
  const cooldown = (box===0 && lastReview>0) ? lastReview + 14400000 : 0;
  return Math.max(base, cooldown);
}
```

De 4-uur cooldown zorgt dat woorden die je net oefend hebt niet direct in de volgende sessie terugkomen.

---

## 5. Level Engine

### Niveaus
```
A0 → Absolute Beginner (startpunt)
A1 → Beginner
A2 → Elementair
B1 → Drempelwaarde
```

### Drempelwaarden (cumulatief)
| Niveau | Geleerde woorden (box≥3) | Gemiddelde box | Foutpercentage |
|--------|--------------------------|----------------|----------------|
| A1     | ≥ 10                     | ≥ 1.2          | ≤ 55%          |
| A2     | ≥ 25                     | ≥ 2.0          | ≤ 40%          |
| B1     | ≥ 40                     | ≥ 3.0          | ≤ 25%          |

**Let op:** het niveau is puur gebaseerd op in-app activiteit. Er wordt geen rekening gehouden met voorkennis van de gebruiker.

### Automatische woorduitbreiding (checkExpansion)
Aan het einde van elke sessie wordt gecontroleerd of uitbreiding nodig is:
```js
if (mastered / cards.length >= 0.35) {
  // Voeg 3 nieuwe woorden toe uit de pool
  // Keuze: woorden van het huidige en aangrenzende niveaus
  // Sortering: categorie met minste woorden eerst, dan laagste moeilijkheid
}
```

Dit zorgt voor een geleidelijke uitbreiding naarmate je vordert. Nieuwe woorden worden getoond in het resultaatscherm als "✨ Nieuwe woorden toegevoegd".

---

## 6. Sessieopbouw

### Modi
| Modus | Richting | Invoer | Bijzonderheid |
|-------|----------|--------|---------------|
| Flashcard | PL→NL of NL→PL (instelbaar) | Tap om te zien, dan ✓/✗ | Standaardmodus |
| Typen | NL→PL | Tekstinvoer | Alleen woorden die al 1× als flashcard gezien zijn |
| Luisteren | PL→NL (audio) | Tekstinvoer | Pools woord wordt uitgesproken, NL intypen |

### Selectielogica
```
1. Due-pool: woorden waarvan nextReview <= nu, gesorteerd op:
   a. Meeste fouten eerst
   b. Laagste box
   c. Oudste review
2. Neem tot sessionSize woorden uit de due-pool
3. Als due-pool < sessionSize: vul aan met niet-due woorden,
   gesorteerd op: minste modus-gebruik, dan laagste box
4. Shuffle de selectie
```

### Retry-ronde
Na de hoofdronde worden fout beantwoorde woorden nogmaals aangeboden (als `retryWrong` instelling aan staat). SRS-updates gelden ook voor de retry-ronde, maar deze tellen niet mee voor dagelijkse statistieken.

### Sessiegrootte
Standaard 10 woorden, instelbaar van 5 tot 20.

---

## 7. State en opslag

### Globale variabelen
```js
cards[]   // array van kaartobjecten met SRS-data
stats{}   // streaks, reviews, dagelijkse tellers
settings{}// gebruikersinstellingen
sess{}    // actieve sessie (tijdelijk)
```

### Kaartobject (in-memory + localStorage)
```js
{
  id, pl, nl, cat, ex_pl, ex_nl, diff, gram,  // uit WORD_DB
  box,           // SRS box (0-6)
  lastReview,    // timestamp laatste review (ms)
  reviews,       // totaal aantal reviews
  streak,        // huidige juiste-antwoorden-reeks
  misses,        // totaal foute antwoorden
  modeStats: {flashcard: n, type: n},  // reviews per modus
  added          // timestamp toegevoegd
}
```

### Stats-object
```js
{
  streak,          // huidige dag-streak
  bestStreak,      // beste dag-streak ooit
  totalReviews,    // totaal reviews ooit
  todayReviews,    // reviews vandaag
  todayCorrect,    // juiste antwoorden vandaag
  lastSessionDate, // timestamp laatste sessie
  sessionsCompleted,
  todayDate,       // "YYYY-MM-DD" voor dagelijkse reset
  wordsLearned     // snapshot: woorden met box>=3
}
```

### localStorage keys
```
polski_cards     → cards array
polski_stats     → stats object
polski_settings  → settings object
polski_sbSkip    → boolean (gebruiker heeft login overgeslagen)
```

### Supabase tabellen
```
user_cards    → één rij per gebruiker per woord (SRS-data)
user_stats    → één rij per gebruiker (statistieken)
user_settings → één rij per gebruiker (instellingen incl. push-subscription)
```

---

## 8. Sync-logica

### Sync-down (bij inloggen / app openen)
1. Laad kaarten van Supabase → overschrijf lokale kaarten
2. Bewaar lokale pool-woorden die nog niet in Supabase staan (offline-extensies)
3. Voeg ontbrekende basiswoorden toe (non-pool woorden altijd aanwezig)
4. Stats: meest recente wint (vergelijk `lastSessionDate`)
5. Dagelijkse reset als `todayDate` niet vandaag is
6. Settings: spread over bestaande waarden (velden niet in DB blijven bewaard)

### Sync-up (na elke sessie + bij instellingen opslaan)
- Alle kaarten als upsert naar `user_cards`
- Stats als upsert naar `user_stats`
- Settings als upsert naar `user_settings`
- Stille fout bij netwerk-probleem (geen retry)

### Conflict-resolutie
Stats: `lastSessionDate` van Supabase vs lokaal — nieuwste wint. Als gelijk: lokale `todayReviews` wint als die hoger is.

---

## 9. Instellingen

| Instelling | Standaard | Bereik | Opgeslagen in |
|-----------|-----------|--------|---------------|
| dailyGoal | 20 | 5–50 | localStorage + Supabase |
| sessionSize | 10 | 5–20 | localStorage + Supabase |
| direction | 'mix' | mix/pl-nl/nl-pl | localStorage + Supabase |
| retryWrong | true | bool | localStorage + Supabase |
| showGrammar | true | bool | localStorage + Supabase |
| showExamples | true | bool | localStorage + Supabase |
| autoSpeak | true | bool | localStorage + Supabase |
| reminderEnabled | false | bool | localStorage + Supabase |
| reminderTime | '20:00' | HH:MM | localStorage + Supabase |
| push_subscription | null | JSON | Supabase only |

---

## 10. Push-notificaties

- Service Worker: `/polski-leraar/sw.js`
- VAPID-sleutels: hardcoded in index.html en sw.js
- Flow: gebruiker zet reminder aan → vraagt toestemming → abonneert via PushManager → slaat subscription op in Supabase
- Edge Function (`send-reminders`): draait elk uur via pg_cron, stuurt push naar gebruikers die op dat uur een reminder hebben ingesteld
- Fallback: als SW niet beschikbaar is, gebruikt de app `setTimeout` (werkt alleen als de app open is)
- Vereisten iOS: iOS 16.4+, app op beginscherm (PWA-modus)

---

## 11. Bekende beperkingen en verbeterpunten

### Architectuur
- **Één groot bestand:** alle HTML, CSS en JS zitten in één bestand van ~1400 regels. Schaalbaar tot ~200 woorden, daarna wordt het onhandelbaar.
- **Hardcoded woordendatabase:** woorden toevoegen vereist code-aanpassing. Geen beheerscherm.
- **Geen offline-first strategie:** de Service Worker serveert alleen de app-shell; als Supabase niet bereikbaar is, werkt sync niet maar de app zelf wel (via localStorage).
- **Geen retry bij sync-fout:** als `sbSyncUp()` mislukt, gaat data verloren tot de volgende succesvolle sync.

### Leersysteem
- **Geen adaptieve sessiesamenstelling:** de verhouding nieuwe/herhalingswoorden is niet instelbaar. Een ervaren gebruiker met veel due-woorden ziet nooit nieuwe woorden.
- **Niveau houdt geen rekening met voorkennis:** iemand met A2-voorkennis begint op A0.
- **Geen gesproken input:** alleen tekstinvoer, geen spraakherkenning.
- **Moeilijkheidsgraad per woord is statisch:** `diff: 1/2/3` is hardcoded, niet gebaseerd op werkelijke foutfrequentie.
- **Geen zinsoefeningen:** alleen losse woorden/frasen, geen context-oefeningen.
- **Één richting per sessie bij "mix":** de richting (PL→NL of NL→PL) wordt bepaald bij het starten van de sessie, niet per kaart.

### UX
- **Sessieknoppen tonen altijd dezelfde subtitels:** dit is opgelost in v3.9, maar de HTML-broncode heeft nog hardcoded "~10 woorden" als fallback.
- **Geen zoekfunctie in de woordenlijst.**
- **Geen sortering op fouten/box in de woordenlijst** (alleen gesorteerd op box, laagste eerst).
- **Geen uitleg bij niveaudrempels:** gebruiker ziet niet wat er nodig is voor het volgende niveau.

### Technisch
- **VAPID-sleutels hardcoded:** staan in index.html en sw.js, zichtbaar in broncode. Voor productie zouden deze uit environment variables moeten komen.
- **Supabase anon-key zichtbaar in broncode:** dit is normaal voor Supabase (de key is publiek), maar RLS moet dan goed geconfigureerd zijn.
- **Geen foutafhandeling bij audio:** als de browser geen Pools ondersteunt in Speech Synthesis, faalt dit stil.
- **Geen loading states bij sync:** de gebruiker ziet geen indicator wanneer data wordt geladen.

---

## 12. Versiehistorie (relevant voor context)

| Versie | Wijzigingen |
|--------|-------------|
| v3.9 | Fix: consistente "geleerd"-definitie (overal box≥3), SRS 4u cooldown voor box-0, instellingen gaan niet verloren na sync (autoSpeak bewaard), nieuwe woorden behouden bij offline sync-fout, sessieknop-subtitels dynamisch |
| v3.8 | Fix: dagelijkse reset na syncDown overschrijft niet meer lokale reset |
| v3.7 | Fix: hogere lokale todayReviews bewaard bij inloggen |
| v3.5 | Web Push notificaties, Edge Function, pg_cron |
| v3.4 | Supabase sync, authenticatie, multi-device |
| v3.0 | Herhalingspool, niveau-engine, automatische uitbreiding |
| v2.0 | SRS box-systeem, meerdere oefenmodi |
| v1.0 | Basis flashcards, localStorage |

---

## 13. Bestandsstructuur

```
polski-leraar/
├── index.html              # volledige app (~1400 regels)
├── sw.js                   # Service Worker voor PWA + push
├── manifest.json           # PWA-manifest (naam, iconen, kleuren)
├── icon.png                # app-icoon
├── schema.sql              # volledige Supabase database schema
├── schema-push.sql         # migratie: push_subscription kolom + pg_cron
├── schema-autospeak.sql    # migratie: auto_speak kolom
├── supabase/
│   └── functions/
│       └── send-reminders/ # Edge Function voor push-notificaties
├── README.md
├── CLAUDE-CODE-BRIEFING.md # instructies voor AI-tools
└── TECHNISCH-HANDBOEK.md   # uitgebreide technische documentatie
```

---

## 14. Mogelijke uitbreidingen (brainstorm)

1. **React/Vue migratie** — component-gebaseerde architectuur voor betere onderhoudbaarheid
2. **Beheerscherm voor woorden** — woorden toevoegen/bewerken zonder code
3. **Meerdere gebruikers / gezinsprofielen** — nu hardcoded voor Johan
4. **Spraakherkenning** — antwoorden inspreken in plaats van typen
5. **Zinsoefeningen** — van losse woorden naar volledige zinnen
6. **Progressieve moeilijkheid** — `diff` aanpassen op basis van echte foutfrequentie
7. **Offline-first met IndexedDB** — betere offline-ondersteuning dan localStorage
8. **Export naar Anki** — standaard SRS-formaat voor gebruik in andere apps
9. **Voortgangsgrafieken** — reviews per dag, foutrate over tijd
10. **Beginnersmodus met voorkennis-selectie** — aantikken welke woorden je al kent
