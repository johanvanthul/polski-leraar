# CLAUDE.md

Werkinstructies voor Claude Code in dit project. Dit bestand is de actuele bron. Oudere beschrijvingen (`CLAUDE-CODE-BRIEFING.md`, `WERKDOCUMENT.md`) zijn verwijderd en staan nog in de git-geschiedenis.

## Voor wie

Johan is beginnend programmeur en gebruikt de app dagelijks op zijn iPhone. Schrijf in het Nederlands, leg uit wat je doet en hoe hij het kan testen. Leg bij een ingrijpende wijziging eerst in twee of drie zinnen uit wat je van plan bent en wacht op zijn akkoord.

## Publiceren

De app bestaat uit `index.html` (schermen, opmaak en bediening) en `core.js` (de rekenregels) op GitHub Pages. Er is geen buildstap, geen package manager en geen bundler. Een push naar `main` staat binnen ongeveer een minuut live op Johans telefoon.

```bash
git add index.html core.js   # de bestanden die je hebt gewijzigd
git commit -m "beschrijving"
git push
```

- Voeg de gewijzigde bestanden bij naam toe. De repo is publiek; zo publiceer je geen losse werkbestanden mee.
- Voeg je een bestand toe dat de app nodig heeft om te starten, zet het dan ook in `APP_FILES` in `sw.js` en verhoog daar `CACHE` (bijv. `polski-leraar-v2`), anders opent de app zonder internet niet meer goed.
- Draai de tests voordat je pusht (zie hieronder).
- Hoog bij een zichtbare wijziging het versienummer onderaan het instellingenscherm op (`Polski Leraar vX.Y`).

## Tests

Open `tests/run-tests.html` in een browser; er is geen server nodig. De pagina laadt `core.js`, dus de tests controleren de echte rekenregels: het herhalingssysteem, de niveaus, de samenstelling van een sessie en de controle van getypte antwoorden. Synchronisatie en schermen worden niet getest; controleer die met de hand.

## Supabase

Project: `elcrpgsiyiehxjoerkiu`.

```bash
supabase functions deploy send-reminders --project-ref elcrpgsiyiehxjoerkiu
```

Benodigde secrets (eenmalig ingesteld): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.

Databasebestanden, eenmalig en in deze volgorde uitgevoerd via de Supabase SQL Editor:

| Bestand | Inhoud |
|---------|--------|
| `schema.sql` | Basistabellen `user_cards`, `user_stats`, `user_settings` |
| `schema-push.sql` | Kolom `push_subscription` en de geplande taak die elk kwartier `send-reminders` aanroept |
| `schema-autospeak.sql` | Kolom `auto_speak` (staat inmiddels ook in `schema.sql`) |
| `schema-pushlog.sql` | Tabel `push_log` |
| `schema-userwords.sql` | Tabel `user_words` |

Voegt de app een nieuw veld toe aan wat hij naar Supabase stuurt, zet de kolom dan ook in het bijbehorende schemabestand. Controleer kolom- en veldnamen in de code of de database voordat je ze gebruikt.

Wijzigingen in de live database en het opnieuw uitrollen van de Edge Function raken Johans echte gegevens: stel ze voor en voer ze uit na zijn akkoord.

## Sleutels

- De **anon key** en de **publieke VAPID-sleutel** in `index.html` zijn bedoeld om openbaar te zijn. De beveiliging zit in de toegangsregels van Supabase (RLS: elke gebruiker ziet alleen rijen met zijn eigen `user_id`).
- De **service role key** en de **private VAPID-sleutel** geven volledige toegang en horen alleen in de Supabase-secrets. Kom je er een tegen in code, een document of een chat, meld dat dan aan Johan zodat hij de sleutel kan vervangen.

## Opbouw

**Twee bestanden.** `index.html` bevat alle HTML, CSS en het grootste deel van de JavaScript. `core.js` bevat de rekenregels die ook door de tests worden geladen: `LEVEL`, `SRS`, `shuffle()`, `personalDiff()`, `buildSessionCards()`, `normalizeAnswer()`, `levenshtein()` en `gradeAnswer()`. Die functies gebruiken globale variabelen uit `index.html` (`cards`, `settings`, `selectedCat`, `WORD_DB`, `isCardActive()`, `getCardType()`). Wil je verder opsplitsen, stel dat dan eerst voor. Zoek functies op naam, regelnummers verschuiven te snel om hier te noemen.

**Schermen.** Elk scherm is een `<div class="screen">`; `showScreen(id)` maakt er één zichtbaar. Schermen: `auth`, `home`, `session`, `result`, `progress`, `words`, `manage-words`, `word-form`, `settings`.

**Opslag.** localStorage is de eerste bron, Supabase is de synchronisatie tussen apparaten.
- `save(k, v)` / `load(k)` gebruiken localStorage met het voorvoegsel `polski_`.
- `sbSyncUp()` stuurt kaarten, statistieken, instellingen en eigen woorden naar Supabase na elke sessie en elke instellingswijziging.
- `sbSyncDown()` haalt gegevens op bij het openen van de app en bij inloggen. Per kaart wint de versie die het laatst is geoefend; statistieken volgen de laatste sessiedatum; instellingen komen uit de cloud.
- Hulpgegevens in localStorage: `owner` (van welk account de lokale gegevens zijn; logt een ander account in, dan begint het apparaat schoon), `synced_custom_ids` en `deleted_custom_ids` (zodat een verwijderd eigen woord ook op andere apparaten verdwijnt), `replace_cloud` (na het terugzetten van een backup vervangt de lokale stand de cloud).
- De kolommen `last_review`, `added_at` en `last_session_date` komen als tekst binnen. Zet ze om met `parseInt()` voordat je ermee rekent of vergelijkt.

**Gegevens.**
- `WORD_DB`: alle ingebouwde woorden. Velden: `id`, `pl`, `nl`, `cat`, `diff` (1–3), `ex_pl`, `ex_nl`, `gram`, en optioneel `pool` (wordt later ontgrendeld), `level` (A0–B1) en `type` (`word`, `phrase`, `sentence`, `pattern`; zonder `type` is het een woord). Id's: 1–50 basis, 101–238 uitbreiding, 3001+ zinnen, 4001+ patronen, 5001+ frasen.
- `customWords`: eigen woorden van de gebruiker, id vanaf 10000, in localStorage en in de tabel `user_words`. `mergeCustomWordsIntoCards()` voegt ze toe aan `cards`.
- `cards`: voortgang per woord: `box` (0–6), `lastReview`, `reviews`, `streak`, `misses`, `modeStats`.
- `CATEGORIES`: de vijf categorieën met naam en kleur.

**Herhalingssysteem** (`SRS`): zeven boxen met tussenpozen van 0, 1, 3, 7, 14, 30 en 60 dagen. `promote()` en `demote()` passen box, reeks en fouten aan; een woord met fouten heeft meerdere goede antwoorden op rij nodig om te stijgen. `getNextReview()` verkort de tussenpoos bij veel fouten en geeft box 0 vier uur rust.

**Niveau** (`LEVEL.compute()`, zonder argumenten): geeft `code`, `label`, `mastered`, `avgBox`, `errorPct` en voortgang terug. Drempels: A1 bij 10 geleerde woorden, gemiddelde box 1,2 en hoogstens 55% fout; A2 bij 25 / 2,0 / 40%; B1 bij 40 / 3,0 / 25%. Geleerd betekent box 3 of hoger.

**Sessie.** `startSession(mode)` → `buildSessionCards(mode)` → `renderSessionCard()` → `handleAnswer(correct)` → `finishSession()` → `checkExpansion()`.
- Modi: `smart` (de grote knop: woorden als flashcard, zinnen als typvraag), `flashcard`, `type`, `listen`, `sentence`.
- Richting (`getDir(mode)`): Luisteren is Pools → Nederlands; Typen en Zinnen zijn Nederlands → Pools; Flashcards en de slimme mix volgen de instelling.
- De uitspraakknoppen laten Pools horen, ook als de vraag in het Nederlands staat: daar is de knop voor.
- `checkExpansion()` voegt drie nieuwe woorden toe zodra 35% van de kaarten in box 3 of hoger zit.

**Service Worker (`sw.js`).** Bewaart een kopie van de app zodat hij zonder internet opent: eerst het netwerk, bij geen verbinding de kopie. Verkeer met Supabase gaat er niet langs.

**Meldingen.** `sw.js` ontvangt pushberichten van de Edge Function `send-reminders`. Die draait elk kwartier en stuurt een melding als het ingestelde tijdstip in het afgelopen kwartier viel; het interval van de geplande taak en `WINDOW_MIN` in de functie horen gelijk te zijn. `swReady` is een Promise die wacht tot de Service Worker is geregistreerd; wacht daarop voordat je een abonnement aanvraagt.

**Uitspraak.** `speak(text, lang)` gebruikt de spraakfunctie van de browser; `initPolishVoice()` zoekt bij het opstarten de beste Poolse stem.
