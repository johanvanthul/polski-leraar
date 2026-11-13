// Polski Leraar — kernlogica
// Dit bestand bevat de rekenregels van de app: niveaus, het herhalingssysteem,
// de samenstelling van een sessie en de controle van getypte antwoorden.
// index.html laadt het vóór de rest van de app; tests/run-tests.html laadt
// precies ditzelfde bestand, zodat de tests de echte code controleren.
//
// De functies gebruiken deze globale variabelen uit index.html (of uit de tests):
//   cards, settings, selectedCat, WORD_DB, isCardActive(), getCardType()

// ═══════════════════════════════════════
// LEVEL ENGINE
// ═══════════════════════════════════════
const LEVEL = {
  DEFS: [
    {code:'A0', label:'Absolute Beginner', desc:'Je bouwt je eerste actieve woordenschat op.', color:'var(--text-muted)'},
    {code:'A1', label:'Beginner',           desc:'Je kent de basiswoorden en kunt eenvoudige dingen zeggen.', color:'var(--blue)'},
    {code:'A2', label:'Elementair',         desc:'Je kunt je uitdrukken over vertrouwde onderwerpen.', color:'var(--green)'},
    {code:'B1', label:'Drempelwaarde',      desc:'Je kunt eenvoudige gesprekken voeren en begrijpen.', color:'var(--accent)'},
  ],
  // wat je nodig hebt OM dit niveau te bereiken
  thresholds: {
    A1: {mastered:10, avgBox:1.2, errorRate:0.55},
    A2: {mastered:25, avgBox:2.0, errorRate:0.40},
    B1: {mastered:40, avgBox:3.0, errorRate:0.25},
  },

  compute() {
    var reviewed = cards.filter(function(c){return c.reviews>0;});
    var mastered  = cards.filter(function(c){return c.box>=3;}).length;
    if (!reviewed.length) return Object.assign({}, this.DEFS[0], {progress:0, progressLabel:'10 woorden nodig voor A1', mastered:mastered, nextMastered:10});

    var avgBox     = reviewed.reduce(function(s,c){return s+c.box;},0) / reviewed.length;
    var totalRev   = reviewed.reduce(function(s,c){return s+c.reviews;},0);
    var totalMiss  = reviewed.reduce(function(s,c){return s+(c.misses||0);},0);
    var errorRate  = totalRev ? totalMiss/totalRev : 1;

    var def = this.DEFS[0];
    var order = ['A1','A2','B1'];
    var self = this;
    order.forEach(function(code){
      var t = self.thresholds[code];
      if (mastered >= t.mastered && avgBox >= t.avgBox && errorRate <= t.errorRate) {
        def = self.DEFS.find(function(d){return d.code===code;});
      }
    });

    var idx  = this.DEFS.indexOf(def);
    var next = this.DEFS[idx+1];
    var nextT = next ? this.thresholds[next.code] : null;
    var progress = nextT ? Math.min(100, Math.round(mastered/nextT.mastered*100)) : 100;
    var progressLabel = next
      ? mastered+'/'+nextT.mastered+' woorden geleerd voor '+next.code
      : 'Hoogste niveau bereikt!';

    return Object.assign({}, def, {
      progress: progress, progressLabel: progressLabel,
      mastered: mastered, nextMastered: nextT ? nextT.mastered : mastered,
      avgBox: Math.round(avgBox*10)/10,
      errorPct: Math.round(errorRate*100),
    });
  },

  getNextWords(count) {
    var lvl = this.compute();
    var activeIds = new Set(cards.map(function(c){return c.id;}));
    var order = ['A0','A1','A2','B1'];
    var idx = order.indexOf(lvl.code);
    var targets = new Set(order.slice(Math.max(0,idx-1), idx+2));

    var candidates = WORD_DB.filter(function(w){
      return w.pool && !activeIds.has(w.id) && targets.has(w.level||'A0');
    });

    // spreid over categorieën: minst bezette categorie eerst
    var catCount = {};
    cards.forEach(function(c){ catCount[c.cat]=(catCount[c.cat]||0)+1; });
    candidates.sort(function(a,b){
      var cd = (catCount[a.cat]||0)-(catCount[b.cat]||0);
      return cd!==0 ? cd : (a.diff||1)-(b.diff||1);
    });

    return candidates.slice(0, count);
  },
};

// ═══════════════════════════════════════
// SRS ENGINE
// ═══════════════════════════════════════
const SRS = {
  intervals: [0,1,3,7,14,30,60],
  getNextReview(c) {
    const iv = this.intervals[Math.min(c.box, 6)];
    const mf = (c.misses||0) > 3 ? .5 : (c.misses||0) > 1 ? .75 : 1;
    const base = c.lastReview + Math.floor(iv * mf) * 864e5;
    // Box-0 woorden die al eens gezien zijn: minimaal 4 uur rust
    // zodat ze niet direct in de volgende sessie terugkomen
    const cooldown = (c.box === 0 && c.lastReview > 0) ? c.lastReview + 4 * 36e5 : 0;
    return Math.max(base, cooldown);
  },
  requiredStreak(m) { return m >= 5 ? 4 : m >= 3 ? 3 : m >= 1 ? 2 : 1; },
  promote(c, mode) {
    const ns = c.streak + 1, ms = {...(c.modeStats||{flashcard:0,type:0})};
    ms[mode] = (ms[mode]||0) + 1;
    const needed = this.requiredStreak(c.misses||0);
    if (ns >= needed) return {...c, box:Math.min(c.box+1,6), lastReview:Date.now(), reviews:c.reviews+1, streak:ns, misses:Math.max((c.misses||0)-1,0), modeStats:ms};
    return {...c, lastReview:Date.now(), reviews:c.reviews+1, streak:ns, modeStats:ms};
  },
  demote(c, mode) {
    const ms = {...(c.modeStats||{flashcard:0,type:0})};
    ms[mode] = (ms[mode]||0) + 1;
    return {...c, box:Math.max(c.box-2,0), lastReview:Date.now(), reviews:c.reviews+1, streak:0, misses:(c.misses||0)+1, modeStats:ms};
  }
};

function shuffle(a) { for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} }

// Persoonlijke moeilijkheidsgraad: hoe vaak fout t.o.v. totale reviews
function personalDiff(c) {
  return c.reviews > 0 ? (c.misses||0) / c.reviews : 0;
}

// Bouw de kaartenset voor een sessie op basis van sessiemix-instelling
function buildSessionCards(mode) {
  var now = Date.now();
  var mix = settings.sessionMix || 'balanced';
  var sz  = settings.sessionSize || 10;

  var isSentMode  = mode === 'sentence';
  var isSmartMode = mode === 'smart';

  var allActive = cards.filter(function(c){
    if (!isCardActive(c)) return false;
    if (selectedCat !== 'all' && c.cat !== selectedCat) return false;
    var t = getCardType(c);
    // Strikte scheiding: zinnen-modus = alleen sentence/pattern/phrase
    //                   smart-modus   = alles (woorden + zinnen)
    //                   overige modi  = alleen word
    if (isSmartMode) return true;
    if (isSentMode) return t === 'sentence' || t === 'pattern' || t === 'phrase';
    return t === 'word';
  });

  // Zinnenmodus: sorteer op personalDiff, geen fallback naar gewone woorden
  if (isSentMode) {
    var sel2 = allActive.slice().sort(function(a,b){
      return personalDiff(b)-personalDiff(a) || (b.misses||0)-(a.misses||0) || a.box-b.box;
    }).slice(0, sz);
    shuffle(sel2);
    return sel2;
  }

  // Herhaling = al eens geoefend en weer aan de beurt. Nooit geoefende woorden
  // tellen als nieuw, anders verdringen ze de echte herhalingen.
  var dueWords = allActive.filter(function(c){ return c.reviews > 0 && SRS.getNextReview(c) <= now; })
    .sort(function(a,b){
      return personalDiff(b) - personalDiff(a) ||
             (b.misses||0) - (a.misses||0) ||
             a.box - b.box ||
             a.lastReview - b.lastReview;
    });

  var weakWords = allActive.filter(function(c){
    var pd = personalDiff(c);
    return SRS.getNextReview(c) > now &&
           ((c.misses||0) >= 2 || (c.box <= 1 && c.reviews >= 2) || (c.reviews > 0 && pd >= 0.3));
  }).sort(function(a,b){ return personalDiff(b)-personalDiff(a) || (b.misses||0)-(a.misses||0) || a.box-b.box; });

  var newWords = allActive.filter(function(c){ return c.reviews === 0; })
    .sort(function(a,b){ return (a.diff||1)-(b.diff||1); });

  var q = ({
    'balanced':     {due:.60, weak:.20, nw:.20},
    'review-heavy': {due:.80, weak:.15, nw:.05},
    'new-heavy':    {due:.40, weak:.20, nw:.40},
    'weak-words':   {due:.40, weak:.50, nw:.10},
  })[mix] || {due:.60, weak:.20, nw:.20};

  var nDue  = Math.round(sz * q.due);
  var nWeak = Math.round(sz * q.weak);
  var nNew  = sz - nDue - nWeak;

  var sel = [], seen = new Set();
  function take(pool, limit) {
    var added = 0;
    for (var i = 0; i < pool.length && added < limit; i++) {
      if (!seen.has(pool[i].id)) { seen.add(pool[i].id); sel.push(pool[i]); added++; }
    }
  }
  take(dueWords,  nDue);
  take(weakWords, nWeak);
  take(newWords,  nNew);
  // Vul tekort aan met beste resterende kaarten
  if (sel.length < sz) {
    var rest = allActive.filter(function(c){ return !seen.has(c.id); })
      .sort(function(a,b){ return personalDiff(b)-personalDiff(a) || a.box-b.box; });
    take(rest, sz - sel.length);
  }
  shuffle(sel);
  return sel;
}

function normalizeAnswer(s) {
  return (s||'').toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[.,!?;:"""„]/g, '').replace(/\s+/g, ' ').trim();
}

function stripPolishDiacritics(s) {
  return s.replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l')
          .replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z');
}

function levenshtein(a, b) {
  var m = a.length, n = b.length, dp = [];
  for (var i = 0; i <= m; i++) { dp[i] = [i]; for (var j = 1; j <= n; j++) dp[i][j] = 0; }
  for (var j = 1; j <= n; j++) dp[0][j] = j;
  for (var i = 1; i <= m; i++) for (var j = 1; j <= n; j++) dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

// Controleer een getypt antwoord.
// - Elk alternatief rond een "/" telt als goed ("ontmoeting/afspraak").
// - Toelichting tussen haakjes hoeft niet meegetypt te worden ("missen (iemand)").
// - Een kleine typfout (tot 20% van de lengte) telt als "bijna goed".
function gradeAnswer(answer, typed) {
  var normInput = normalizeAnswer(typed);
  var targets = (answer||'').split('/').map(normalizeAnswer).filter(Boolean);
  if (!targets.length) targets = [normalizeAnswer(answer)];
  var normTarget = targets[0], bestDist = Infinity;
  targets.forEach(function(t){
    var d = levenshtein(t, normInput);
    if (d < bestDist) { bestDist = d; normTarget = t; }
  });
  var exact = bestDist === 0;
  var fuzzy = !exact && bestDist <= Math.max(1, Math.floor(normTarget.length * .2));
  return {correct: exact || fuzzy, exact: exact, normTarget: normTarget, normInput: normInput};
}
