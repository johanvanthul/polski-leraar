# Polski Leraar — Overdrachtsdocument voor Claude Code

## Projectoverzicht

**Polski Leraar** is een standalone PWA (Progressive Web App) voor het leren van Poolse woordenschat. Het is gebouwd als één HTML-bestand met inline CSS en JavaScript, gehost op GitHub Pages.

### Voor wie
Johan — Nederlandse business analyst, 18 jaar getrouwd met een Poolse vrouw. Hij begrijpt passief al veel Pools (gesprekken volgen, context oppikken), maar kan zelf geen gesprekken voeren met Poolse familie. Doel: actief vocabulaire opbouwen, 10 minuten per dag, alle onderwerpen, met minimale grammaticafocus (wel hints, geen lessen).

### Live URL
`https://johanvanthul.github.io/polski-leraar/`

### Huidige tech stack
- **Eén HTML-bestand** (`index.html`, ~1300 regels, ~100KB) — alle CSS, JS en data inline
- **Service Worker** (`sw.js`) — ontvangt Web Push en toont notificaties via Supabase Edge Function
- **Geen framework** — vanilla JavaScript
- **Opslag**: Supabase (primair) + `localStorage` (offline fallback)
- **Auth**: Supabase Auth (email/wachtwoord)
- **Hosting**: GitHub Pages (publieke repo)
- **Fonts**: DM Sans + JetBrains Mono via Google Fonts CDN
- **Supabase JS**: CDN (`@supabase/supabase-js@2`)
- **PWA**: meta tags voor "Zet op beginscherm" op iOS

---

## Huidige features (v3.8)

### Leer-engine (Spaced Repetition)
- **Leitner-systeem** met 7 boxen, intervallen: [0, 1, 3, 7, 14, 30, 60] dagen
- **Dynamische intervallen**: woorden met veel fouten krijgen kortere intervallen (>3 misses = 50%, >1 = 75%)
- **Promotie-gating**: woorden met fouten moeten meerdere keer achter elkaar goed beantwoord worden voordat ze omhoog gaan (1 miss → 2× goed nodig, 3 → 3×, 5+ → 4×)
- **Succesvolle promotie** vermindert de miss-teller met 1

### Drie oefenmodi
1. **Flashcards**: tap om antwoord te zien, zelf beoordelen (Wist ik / Wist ik niet). Richting instelbaar (mix/PL→NL/NL→PL). 🔊 replay-knop aanwezig.
2. **Type**: altijd NL→PL. Alleen woorden met ≥1 flashcard-review. Fuzzy matching (Levenshtein, 20% tolerantie). Bij fout/bijna-goed: vergelijk-blok "Jij: X / Goed: Y". Bijna-goed toont ≈ Bijna! in geel.
3. **Luisteren**: altijd PL→NL. Kaart toont grote 🔊-knop i.p.v. tekst, Pools woord speelt automatisch. Antwoord typen in het Nederlands.

### Audio-logica (belangrijk voor toekomstige wijzigingen)
- `speakCurrentCard()` spreekt **altijd Pools** — nooit Nederlands
- **Flashcard PL→NL**: 🔊 knop bij de vraag (Pools is zichtbaar) + 🔊 in antwoordgebied
- **Flashcard NL→PL**: géén 🔊 bij de Nederlandse vraag; knop verschijnt ná antwoord tonen (bij Pools)
- **Na antwoord tonen**: altijd Pools prominent (groot, accent kleur, 🔊) + Nederlands eronder — ongeacht richting
- **Type/luister-modus**: 🔊 naast het Poolse antwoord in resultaat; auto-uitspraak bij antwoord tonen
- `showInfoArea()`: 🔊 op voorbeeldzin speelt `c.ex_pl` (Pools voorbeeld)

### Sessie-logica
- Configureerbare sessiegrootte (5-20 woorden, default 10)
- Prioriteit: eerst due cards (op volgorde: meeste fouten → laagste box → langst niet gezien), daarna aanvullen met minst geoefende woorden
- **Retry-systeem**: fout beantwoorde woorden komen terug in een herhalingsronde (shuffled). Maximaal één retry-ronde, geen oneindige loops.
- Retries tellen NIET mee voor het dagelijkse doel
- **Richting**: Mix (willekeurig PL→NL of NL→PL), of vast PL→NL of NL→PL
- **Mode-specifieke tracking**: elke kaart houdt bij hoe vaak per modus geoefend

### Woordendatabase
- **103 woorden** totaal: 50 basis (A0, direct actief) + 53 pool (worden dynamisch ontgrendeld)
- **5 categorieën**: Familie, Dagelijks, Meningen, Reizen, Eten
- **4 niveaus**: A0 (15 pool-woorden), A1 (15 woorden), A2 (13 woorden), B1 (10 woorden)
- Elk woord bevat: PL, NL, categorie, voorbeeldzin (PL+NL), moeilijkheidsgraad (1-3), grammaticahint, level-tag

### Intelligent niveau-systeem (LEVEL engine)
- **Niveaus**: A0 → A1 → A2 → B1 (conform CEFR-indeling)
- **Berekening** na elke sessie op basis van:
  - Aantal woorden in box 3+ (mastered)
  - Gemiddelde box-score over gereviewde woorden
  - Foutpercentage (misses / reviews)
- **Drempelwaarden**:
  - A1: ≥10 geleerd, avgBox ≥1,2, errorRate ≤55%
  - A2: ≥25 geleerd, avgBox ≥2,0, errorRate ≤40%
  - B1: ≥40 geleerd, avgBox ≥3,0, errorRate ≤25%
- **Auto-expansie**: als 35%+ van actieve woorden op box 3+, worden 3 woorden toegevoegd via `LEVEL.getNextWords()` — pikt woorden op huidig niveau + één niveau erboven, spreidt over categorieën
- **Level-up detectie**: `finishSession()` vergelijkt niveau vóór/na checkExpansion en toont een banner als je niveau stijgt

### Dagelijks doelsysteem
- Configureerbaar doel (5-50 woorden/dag, default 20)
- Alleen eerste-ronde reviews tellen (retries niet)
- Dagelijkse tellers resetten automatisch om middernacht (date-string vergelijking)
- Na doel bereikt: knoppen schakelen naar "Bonus" modus
- **Streak**: +1 als gisteren ook geoefend, reset als dag gemist

### Supabase backend
- **Auth**: email/wachtwoord via Supabase Auth
- **Tabellen**: `user_cards`, `user_stats`, `user_settings` (+ `push_subscription` kolom) — alle met RLS
- **Sync-flow**:
  - App laadt altijd eerst localStorage (razendsnel, offline-first)
  - Na login: `syncDown()` haalt Supabase-data op; conflict resolution op `lastSessionDate` — lokaal wint als nieuwer
  - Na elke sessie/instelling: `syncUp()` pusht naar Supabase (async, non-blocking)
  - Eerste login: bestaande localStorage-data wordt automatisch gemigreerd
  - Bigint-kolommen uit PostgREST komen als string — altijd `parseInt()` gebruiken bij inlezen
- **Offline**: app werkt volledig zonder verbinding via localStorage
- **Credentials**: URL `https://elcrpgsiyiehxjoerkiu.supabase.co`, anon key in `index.html`

### UI/UX
- **Dark theme**, mobile-optimized, max 480px breed
- **Home**: niveau-badge (A0/A1/A2/B1), sync-badge (☁️ Gesynchroniseerd / ☁️ Niet opgeslagen), streak counter, mastered count, dagelijks doel met progress bar, due cards indicator, categorie-filter pills
- **Sessie**: progress bar, richting-indicator, retry-banner, categorie/moeilijkheid badges
- **Na antwoord**: voorbeeldzin + grammaticahint (beide aan/uit te zetten in settings)
- **Resultaat**: score ring animatie, dagelijkse voortgang, nieuwe woorden notificatie, level-up banner
- **Woordenlijst**: expandable cards met gekleurde box-bars, fout-badges, mode stats, promotie-voortgang
- **Voortgang**: niveau-kaart met CEFR-code + voortgangsbalk + statistieken (geleerd/gem.box/foutrate), woordverdeling balk, per-categorie progress, all-time stats
- **Auth-scherm**: toegankelijk via Instellingen → Account & Sync; overgeslagen bij app-start
- **Instellingen**: auth-sectie (inloggen/uitloggen), leerdoelen, oefenmodus, herinneringen, data

### Text-to-Speech (Web Speech API)
- `speak(text, lang)` — spreekt tekst uit via browser-TTS; Pools op `pl-PL` (rate 0.82), Nederlands op `nl-NL`
- `speakCurrentCard()` — speelt de juiste kant van de huidige kaart af
- **Auto-uitspraak**: bij elke kaart in flashcard- en luistermodus (instelbaar)
- **🔊 knop**: op elke flashcard (replay), in de woordenlijst per woord, en op elke voorbeeldzin
- **Luistermodus**: altijd auto-play, geen tekst zichtbaar

### Instellingen
- **Leerdoelen**: dagelijks doel slider, sessiegrootte slider
- **Oefenmodus**: richting select, retry toggle, grammatica toggle, voorbeeldzinnen toggle, automatische uitspraak toggle
- **Herinneringen**: Notification API reminder met tijdkiezer (alleen als doel niet gehaald)
- **Account & Sync**: inloggen/uitloggen, sync-status
- **Data**: export naar JSON, import van JSON, reset alle voortgang
- Auto-save bij slider/select wijzigingen, back-knop slaat op

### Push-notificaties (Web Push)
- **Service Worker** (`sw.js`): ontvangt `push` events, toont notificatie, opent app bij klik
- **VAPID-sleutelpaar**: gegenereerd en opgeslagen; public key in `index.html`, private key als Supabase secret
- **Subscription flow**: `initServiceWorker()` → registreert SW, slaat Promise op als `swReady` → `subscribeToPush()` awaits `swReady` (race condition fix) → `savePushSubscription()` upsert naar Supabase
- **Edge Function** (`supabase/functions/send-reminders/index.ts`): draait elk uur via pg_cron; converteert UTC naar `Europe/Amsterdam` via `Intl.DateTimeFormat` vóór tijdsvergelijking (timezone fix); ±10min venster; volledige beslissingslog in response
- **Vereisten voor werking**: iOS 16.4+, app op beginscherm, `schema-push.sql` uitgevoerd, Edge Function gedeployed
- **Fallback**: `setTimeout` in de app voor als de app toevallig open is op het reminder-tijdstip
- **Debug**: `[SW]` en `[Push]` log-tags in de browser-console; Edge Function response bevat per-user beslissingslog

---

## Bekende beperkingen en technische schuld

### Architectuur
- Alles in één HTML-bestand (1130+ regels) — wordt onhandelbaar bij verdere groei
- Geen component-structuur, geen build system
- Geen tests

### Notificaties
- Web Push werkt alleen op iOS 16.4+ én de app moet op het beginscherm staan
- Geen realtime deduplicatie — als de Edge Function twee keer binnen ±10min wordt aangeroepen kan er dubbel gestuurd worden
- pg_cron vereist dat pg_net actief is in Supabase

### Sync
- `syncUp()` is fire-and-forget — er is geen retry bij offline (app werkt gewoon via localStorage)
- Geen realtime sync tussen meerdere apparaten tegelijk (refresh nodig)

---

## Geplande volgende stappen (prioriteit)

### 1. App moderniseren (optioneel, voor later)
- Migreren naar React + Vite + Tailwind (zelfde stack als MatchDay)
- Component-structuur
- Offline-first met Service Worker
- Echte push notifications
- Hosting via Vercel (i.p.v. GitHub Pages)

### 2. Woordendatabase uitbreiden
- Meer woorden toevoegen (handmatig of via Claude API)
- Mogelijk: Claude API integratie om dynamisch nieuwe woorden + voorbeeldzinnen te genereren

---

## Ontwikkelgeschiedenis

### Sessie 1 (11 mei 2026, in Claude.ai)
- Initieel ontwerp besproken: doelgroep, features, woordselectie
- Eerste versie gebouwd als React artifact (JSX) met window.storage API
- **Probleem ontdekt**: window.storage API werkt niet op iOS Claude app
- **Beslissing**: overstappen naar standalone HTML met localStorage
- Volledige app herbouwd als single HTML file
- Meerdere bugfix-rondes:
  - Streak-inflatie bij meerdere sessies per dag → date-string vergelijking
  - Type mode ging te snel door na antwoord → handmatige "Volgende" knop
  - Retry-rondes telden mee voor dagelijks doel → isRetryRound flag
  - Hoge-fout woorden toonden groene progress bars → promotie-gating + gekleurde bars
  - Type input autocorrect verstoorde Poolse invoer → autocomplete/autocorrect/autocapitalize/spellcheck disabled

### Sessie 2 (12 mei 2026, in Claude.ai)
- Verbeterd instellingenmenu met extra opties (grammatica aan/uit, voorbeeldzinnen aan/uit)
- Export/import functionaliteit toegevoegd
- Push notification reminders met tijdkiezer
- Auto-save bij slider/select wijzigingen
- Bestand gehost op GitHub Pages

### Sessie 3 (13 mei 2026, in Claude Code) — v3.0
- LEVEL engine gebouwd: berekent A0/A1/A2/B1 op basis van mastered/avgBox/errorRate
- 38 nieuwe woorden toegevoegd (15 A1, 13 A2, 10 B1) — database van 65 naar 103 woorden
- `checkExpansion()` vervangen door `LEVEL.getNextWords()` — dynamisch i.p.v. vaste pool
- Niveau-badge op home-scherm
- Niveau-kaart met voortgangsbalk op voortgang-scherm
- Level-up banner op resultaat-scherm
- Versie: v3.0

### Sessie 3 (13 mei 2026, in Claude Code) — v3.1
- Supabase project aangemaakt, `schema.sql` geschreven en uitgevoerd
- Supabase JS CDN ingeladen
- Auth-scherm gebouwd (email/wachtwoord, skip-optie)
- `syncDown()`: laadt data van Supabase op login, migreert localStorage bij eerste login
- `syncUp()`: pusht na elke sessie, instellingswijziging en reset
- Sync-badge op home (☁️ Gesynchroniseerd / ☁️ Niet opgeslagen)
- Auth-sectie in instellingen (inloggen/uitloggen)
- Pools vlaggetje hersteld (stond in gradient-div waardoor het oranje kleurde op Safari)
- Versie: v3.1

### Sessie 3 (13 mei 2026, in Claude Code) — v3.2
- Auth-scherm niet meer automatisch getoond bij laden: app start altijd op home (localStorage fallback)
- Auth-scherm `display:flex` zat op outer `.screen` div → overschreef CSS `display:none` → scherm was altijd zichtbaar en scrollbaar. Fix: flex naar inner wrapper verplaatst
- `overflow:hidden` toegevoegd aan auth-scherm
- Versie: v3.2

### Sessie 3 (13 mei 2026, in Claude Code) — v3.3
- **Luistermodus**: derde sessieknop 🎧; kaart toont 🔊-knop i.p.v. tekst; Pools auto-afspelen; altijd PL→NL; antwoord typen in het Nederlands
- **TTS-engine**: `speak()` + `speakCurrentCard()` via Web Speech API (`pl-PL`, rate 0.82); werkt in Safari iOS/macOS en Chrome
- **Auto-uitspraak**: bij flashcard en luistermodus instelbaar via toggle; alleen bij PL-vraag
- **🔊 replay-knop**: op elke flashcard; 🔊 op elk woord in woordenlijst; 🔊 op elke voorbeeldzin in sessie en woordenlijst
- **Type-modus altijd NL→PL**: `getDir()` retourneert `nl-pl` als `sess.mode === 'type'`
- **Type-modus filter**: alleen woorden met `modeStats.flashcard >= 1`; alert als pool leeg
- **Vergelijk-blok bij fout**: `showTypedResult()` toont "Jij / Goed" bij fout of fuzzy match; fuzzy krijgt ≈ Bijna! in geel
- Versie: v3.3

### Sessie 4 (14 mei 2026, in Claude Code) — v3.4
- **Sync conflict resolution**: `syncDown()` vergelijkt nu `lastSessionDate` lokaal vs Supabase; lokaal wint als nieuwer en triggert `syncUp()` om Supabase te repareren
- **BigInt bug**: PostgREST geeft `bigint` kolommen terug als strings; `new Date("1747123456789")` was Invalid Date → streak-vergelijking faalde → streak resette naar 1; fix: `parseInt()` op `last_review`, `added_at`, `last_session_date`
- Versie: v3.4

### Sessie 4 (14 mei 2026, in Claude Code) — v3.5
- **Audio-logica volledig herzien**: `speakCurrentCard()` spreekt altijd Pools; 🔊 bij NL→PL pas na antwoord tonen; Pools altijd prominent in antwoordgebied ongeacht richting; auto-uitspraak Pools bij antwoord reveal (NL→PL)
- **Type-modus 🔊**: naast Pools antwoord in resultaat, zowel bij correct als in vergelijk-blok; auto-uitspraak Pools na indienen
- Versie: v3.5

### Sessie 4 (14 mei 2026, in Claude Code) — v3.6
- **Eerlijke reminder-melding**: label "Push-notificatie" → "Alleen als Safari open is"; `updateReminderStatus()` toont gele waarschuwing met uitleg
- Versie: v3.6

### Sessie 4 (14 mei 2026, in Claude Code) — v3.7
- **Service Worker Web Push**: `sw.js` aangemaakt; VAPID-sleutelpaar gegenereerd; `initServiceWorker()` registreert SW en slaat Promise op als `swReady`; `subscribeToPush()` wacht op SW + vraagt `pushManager.subscribe()`; `savePushSubscription()` upsert naar Supabase
- **Edge Function**: `supabase/functions/send-reminders/index.ts` draait elk uur; stuurt push als doel niet gehaald
- **Schema**: `schema-push.sql` met `push_subscription` kolom + pg_cron job
- Versie: v3.7

### Sessie 4 (14 mei 2026, in Claude Code) — v3.8
- **Race condition fix**: `subscribeToPush()` checkte `if (!swReg) return null` — als gebruiker snel klikt is SW nog niet geregistreerd; fix: `swReady` Promise, `await swReady` voor subscribe
- **`update` → `upsert`**: `savePushSubscription()` gebruikte `.update()` dat niets doet als rij niet bestaat; fix: `.upsert()` met alle settings-velden
- **24 debug-log statements**: `[SW]` en `[Push]` tags voor elke stap, inclusief scope, endpoint, Supabase-foutcodes en ontbrekende kolom-detectie
- Versie: v3.8

### Sessie 4 (14 mei 2026, in Claude Code) — Edge Function timezone fix (geen versie-bump)
- **Hoofdoorzaak**: `now.getHours()` in Deno Edge Function = UTC uur; `reminder_time` in DB is Amsterdam-tijd (CEST = UTC+2); verschil was altijd −120 of meer → altijd overgeslagen
- **Fix**: `amsterdamNow()` via `Intl.DateTimeFormat('Europe/Amsterdam')`; `amsterdamDateStr()` voor datumvergelijking
- **Absolute diff**: `Math.min(rawDiff, 1440 - rawDiff)` vervangt gebroken `diffMin < 0 || diffMin > 5`
- **Venster**: ±5 → ±10 minuten om cron-jitter op te vangen
- **Logging**: response bevat per-user: reminder-tijd, huidige Amsterdam-tijd, verschil, voortgang, beslissing
- Gedeployed via Supabase CLI; getest: functie vindt user, logt correct, skip-reden zichtbaar

---

## Bestandsstructuur

```
polski-leraar/
├── index.html              # Hele app (~1300 regels, ~100KB)
│   ├── <style>             # ~90 regels CSS (dark theme, components)
│   ├── HTML                # ~240 regels (7 screens: auth, home, session, result, progress, words, settings)
│   └── <script>            # ~950 regels JavaScript
│       ├── WORD_DB         # 103 woorden (50 basis A0 + 53 pool A0/A1/A2/B1)
│       ├── LEVEL engine    # A0→B1 berekening + getNextWords()
│       ├── SRS engine      # Leitner-systeem met promotie-gating
│       ├── State           # cards[], stats{}, settings{}, sess{}
│       ├── Storage         # localStorage wrapper (save/load)
│       ├── SUPABASE        # initSupabase, syncDown, syncUp, auth functies
│       ├── Home            # renderHome(), renderCatPills(), getDueCards()
│       ├── Session         # startSession(), renderSessionCard(), handleAnswer()
│       ├── Result          # renderResult(), checkExpansion()
│       ├── Progress        # renderProgress()
│       ├── Words           # renderWords()
│       ├── Settings        # renderSettings(), saveSettings(), toggleSetting()
│       ├── Export          # exportData(), importData()
│       ├── Web Push        # VAPID, initServiceWorker, subscribeToPush, savePushSubscription
│       ├── Reminders       # toggleReminder(), scheduleReminder(), updateReminderStatus()
│       └── Utils           # speak(), speakCurrentCard(), levenshtein(), shuffle(), dateStr()
├── sw.js                   # Service Worker — push events + notificationclick handler
├── schema.sql              # Supabase tabel-definities (eenmalig uitgevoerd)
├── schema-push.sql         # push_subscription kolom + pg_cron job (eenmalig)
├── supabase/
│   └── functions/send-reminders/index.ts  # Edge Function — hourly push sender
├── CLAUDE-CODE-BRIEFING.md # Dit document
└── TECHNISCH-HANDBOEK.md   # Beheerdershandboek voor Johan
```

---

## Belangrijke code-patronen

### Data opslag
```javascript
// Prefix 'polski_' voor alle localStorage keys
save('cards', cards)  → localStorage.setItem('polski_cards', JSON.stringify(cards))
load('cards')         → JSON.parse(localStorage.getItem('polski_cards'))
```

### SRS promotie/demotie
```javascript
SRS.promote(card, 'flashcard')  // streak+1, box+1 als streak >= required
SRS.demote(card, 'type')        // box = max(box-2, 0), misses+1
```

### LEVEL engine
```javascript
LEVEL.compute()         // → {code:'A1', label:'Beginner', progress:45, ...}
LEVEL.getNextWords(3)   // → array van 3 WORD_DB entries passend bij niveau
```

### Supabase sync
```javascript
// Async, non-blocking — localStorage is altijd de directe bron
sbSyncUp()    // push lokale staat naar Supabase
sbSyncDown()  // pull van Supabase, overschrijft localStorage
```

### Sessie-flow
```
startSession(mode) → selecteer due cards + aanvulling → shuffle
  → renderSessionCard() → toon vraag
    → flashcard: tap → showAnswer() → Wist ik / Wist ik niet
    → type: input → submitTyped() → fuzzy match → showTypedResult()
  → handleAnswer(correct) → promote/demote → save → next card
  → na laatste kaart: retry-ronde (als enabled + fouten) OF finishSession()
finishSession() → LEVEL.compute() voor → checkExpansion() → streak → LEVEL.compute() na
  → sess.levelUp = voor !== na → sbSyncUp() → renderResult()
```

---

## Context over Johan's setup

- **Computer**: Mac, heeft Node.js en Claude Code
- **Telefoon**: iPhone met Safari
- **GitHub**: account johanvanthul, repo polski-leraar aanwezig
- **Supabase**: account aangemaakt, project actief, schema uitgevoerd
- **Andere projecten**: MatchDay (React + Vite + Tailwind + Supabase, nog in planningsfase)
- **Codingniveau**: beginner, leert snel, stelt verificatievragen
- **Taal**: communiceert in het Nederlands, app-interface is Nederlands, woordjes zijn Pools↔Nederlands
