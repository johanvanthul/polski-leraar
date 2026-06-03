// Session selection tests
// Test de buildSessionCards-logica losstaand van de app-globals

group('personalDiff — berekening');

function personalDiff(c) {
  return c.reviews > 0 ? (c.misses || 0) / c.reviews : 0;
}

test('nooit geoefend → personalDiff = 0', function() {
  assertEqual(personalDiff({ reviews: 0, misses: 0 }), 0);
});

test('altijd goed → personalDiff = 0', function() {
  assertEqual(personalDiff({ reviews: 10, misses: 0 }), 0);
});

test('altijd fout → personalDiff = 1', function() {
  assertEqual(personalDiff({ reviews: 5, misses: 5 }), 1);
});

test('50% fout → personalDiff = 0.5', function() {
  assertEqual(personalDiff({ reviews: 4, misses: 2 }), 0.5);
});

group('Session selectie — geen duplicaten');

// Vereenvoudigde versie van buildSessionCards voor tests
function buildSessionTest(allCards, sz, mix) {
  mix = mix || 'balanced';
  var now = Date.now();

  var getNextReview = function(c) {
    var base = c.lastReview + [0,86400000,3*86400000][Math.min(c.box,2)];
    var cooldown = (c.box === 0 && c.lastReview > 0) ? c.lastReview + 4*3600000 : 0;
    return Math.max(base, cooldown);
  };

  var dueWords  = allCards.filter(function(c) { return getNextReview(c) <= now; })
    .sort(function(a,b) { return personalDiff(b)-personalDiff(a) || a.box-b.box; });
  var weakWords = allCards.filter(function(c) {
    return getNextReview(c) > now && ((c.misses||0) >= 2 || (c.reviews>0 && personalDiff(c)>=0.3));
  });
  var newWords  = allCards.filter(function(c) { return c.reviews === 0; });

  var quotas = {
    balanced:     { due: 0.60, weak: 0.20, nw: 0.20 },
    'review-heavy': { due: 0.80, weak: 0.15, nw: 0.05 },
    'new-heavy':  { due: 0.40, weak: 0.20, nw: 0.40 },
    'weak-words': { due: 0.40, weak: 0.50, nw: 0.10 },
  }[mix] || { due: 0.60, weak: 0.20, nw: 0.20 };

  var nDue  = Math.round(sz * quotas.due);
  var nWeak = Math.round(sz * quotas.weak);
  var nNew  = sz - nDue - nWeak;

  var sel = [], seen = new Set();
  function take(pool, limit) {
    var added = 0;
    for (var i = 0; i < pool.length && added < limit; i++) {
      if (!seen.has(pool[i].id)) { seen.add(pool[i].id); sel.push(pool[i]); added++; }
    }
  }
  take(dueWords, nDue);
  take(weakWords, nWeak);
  take(newWords, nNew);
  if (sel.length < sz) {
    var rest = allCards.filter(function(c){ return !seen.has(c.id); });
    take(rest, sz - sel.length);
  }
  return sel;
}

function makePool(n, overrides) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result.push(Object.assign({ id: i+1, box: 0, lastReview: 0, reviews: 0, misses: 0, streak: 0 }, overrides));
  }
  return result;
}

test('geen duplicaten in sessie', function() {
  var pool = makePool(50, { box: 0, lastReview: 0, reviews: 0 });
  var sel = buildSessionTest(pool, 10, 'balanced');
  assertUnique(sel, function(c){ return c.id; });
});

test('sessionSize wordt gerespecteerd', function() {
  var pool = makePool(50, { box: 0, lastReview: 0, reviews: 0 });
  [5, 10, 15, 20].forEach(function(sz) {
    var sel = buildSessionTest(pool, sz, 'balanced');
    assertLte(sel.length, sz, 'selectie mag niet groter zijn dan sessionSize');
  });
});

test('bij te weinig kaarten: geen error, alles wat beschikbaar is', function() {
  var pool = makePool(3, { box: 0, lastReview: 0, reviews: 0 });
  var sel = buildSessionTest(pool, 10, 'balanced');
  assertEqual(sel.length, 3, 'mag maximaal 3 kaarten geven bij pool van 3');
});

group('Session selectie — mixmodi');

test('new-heavy geeft meer nieuwe woorden', function() {
  var now = Date.now();
  // Mix: 20 due woorden + 20 nieuwe woorden
  var dueCards = makePool(20, { box: 0, lastReview: now - 86400000 * 2, reviews: 3, misses: 0 });
  var newCards  = makePool(20, { box: 0, lastReview: 0, reviews: 0 }).map(function(c){ return Object.assign({}, c, {id: c.id + 100}); });
  var pool = dueCards.concat(newCards);

  var balanced = buildSessionTest(pool, 10, 'balanced');
  var newHeavy = buildSessionTest(pool, 10, 'new-heavy');

  var countNew = function(sel) { return sel.filter(function(c){ return c.reviews===0; }).length; };
  assertGte(countNew(newHeavy), countNew(balanced), 'new-heavy moet meer nieuwe woorden geven');
});

test('weak-words geeft prioriteit aan moeilijke woorden', function() {
  var now = Date.now();
  // 10 moeilijke woorden (hoge personalDiff, niet due) + 30 nieuwe woorden
  var weakCards = [];
  for (var i=0; i<10; i++) {
    weakCards.push({ id: i+1, box: 1, lastReview: now - 3600000, reviews: 10, misses: 5 }); // 50% fout
  }
  var newCards = makePool(30, { box: 0, lastReview: 0, reviews: 0 }).map(function(c){ return Object.assign({}, c, {id: c.id + 100}); });
  var pool = weakCards.concat(newCards);

  var weakMode = buildSessionTest(pool, 10, 'weak-words');
  var countWeak = weakMode.filter(function(c){ return c.reviews >= 5 && personalDiff(c) >= 0.3; }).length;
  assertGte(countWeak, 3, 'weak-words moet minstens 3 moeilijke woorden bevatten');
});

test('due woorden hebben prioriteit boven nieuwe', function() {
  var now = Date.now();
  // 5 due + 20 nieuwe
  var dueCards = makePool(5, { box: 0, lastReview: now - 86400000 * 3, reviews: 2, misses: 0 });
  var newCards  = makePool(20, { box: 0, lastReview: 0, reviews: 0 }).map(function(c){ return Object.assign({}, c, {id: c.id + 100}); });
  var pool = dueCards.concat(newCards);

  var sel = buildSessionTest(pool, 10, 'balanced');
  var dueIds = new Set(dueCards.map(function(c){ return c.id; }));
  var gotDue = sel.filter(function(c){ return dueIds.has(c.id); }).length;
  assertGte(gotDue, 3, 'minstens 3 van de 5 due woorden moeten geselecteerd zijn');
});

test('personalDiff beïnvloedt volgorde: hoogste foutrate eerst', function() {
  var now = Date.now();
  // 3 due woorden met verschillende personalDiff
  var cards = [
    { id: 1, box: 0, lastReview: now - 864e5, reviews: 10, misses: 8 }, // 80% fout
    { id: 2, box: 0, lastReview: now - 864e5, reviews: 10, misses: 1 }, // 10% fout
    { id: 3, box: 0, lastReview: now - 864e5, reviews: 10, misses: 5 }, // 50% fout
  ];
  var sel = buildSessionTest(cards, 3, 'balanced');
  // Eerste kaart moet id=1 zijn (hoogste personalDiff)
  assertEqual(sel[0].id, 1, 'hoogste personalDiff moet als eerste komen');
  assertEqual(sel[1].id, 3, 'op één na moeilijkste tweede');
});

group('Session selectie — edge cases');

test('lege pool geeft lege array', function() {
  var sel = buildSessionTest([], 10, 'balanced');
  assertEqual(sel.length, 0);
});

test('alle modi geven geen duplicaten', function() {
  var pool = makePool(30, { box: 0, lastReview: 0, reviews: 0 });
  ['balanced', 'review-heavy', 'new-heavy', 'weak-words'].forEach(function(mix) {
    var sel = buildSessionTest(pool, 10, mix);
    assertUnique(sel, function(c){ return c.id; });
  });
});
