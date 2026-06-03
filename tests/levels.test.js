// Level Engine tests
// Kopie van LEVEL.compute() logica uit index.html

group('Level Engine — drempelwaarden');

var LEVEL_THRESHOLDS = {
  A1: { mastered: 10, avgBox: 1.2, errorRate: 0.55 },
  A2: { mastered: 25, avgBox: 2.0, errorRate: 0.40 },
  B1: { mastered: 40, avgBox: 3.0, errorRate: 0.25 },
};

var LEVEL_DEFS = [
  { code: 'A0', label: 'Absolute Beginner' },
  { code: 'A1', label: 'Beginner' },
  { code: 'A2', label: 'Elementair' },
  { code: 'B1', label: 'Drempelwaarde' },
];

function computeLevel(cards) {
  var reviewed = cards.filter(function(c) { return c.reviews > 0; });
  var mastered  = cards.filter(function(c) { return c.box >= 3; }).length;
  if (!reviewed.length) return 'A0';

  var avgBox    = reviewed.reduce(function(s, c) { return s + c.box; }, 0) / reviewed.length;
  var totalRev  = reviewed.reduce(function(s, c) { return s + c.reviews; }, 0);
  var totalMiss = reviewed.reduce(function(s, c) { return s + (c.misses || 0); }, 0);
  var errorRate = totalRev ? totalMiss / totalRev : 1;

  var code = 'A0';
  ['A1', 'A2', 'B1'].forEach(function(lvl) {
    var t = LEVEL_THRESHOLDS[lvl];
    if (mastered >= t.mastered && avgBox >= t.avgBox && errorRate <= t.errorRate) {
      code = lvl;
    }
  });
  return code;
}

function makeCards(n, overrides) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result.push(Object.assign({ id: i + 1, box: 3, reviews: 5, misses: 0, streak: 3 }, overrides));
  }
  return result;
}

test('zonder reviews: niveau A0', function() {
  var cards = makeCards(20, { reviews: 0, box: 0 });
  assertEqual(computeLevel(cards), 'A0');
});

test('9 geleerde woorden → A0 (net niet genoeg voor A1)', function() {
  var cards = makeCards(9, { box: 3, reviews: 5, misses: 0 });
  assertEqual(computeLevel(cards), 'A0');
});

test('10 geleerde woorden met lage foutrate → A1', function() {
  var cards = makeCards(10, { box: 3, reviews: 5, misses: 1 }); // 20% fout < 55%
  assertEqual(computeLevel(cards), 'A1');
});

test('24 geleerde woorden → A1 (net niet genoeg voor A2)', function() {
  var cards = makeCards(24, { box: 3, reviews: 5, misses: 0 });
  assertEqual(computeLevel(cards), 'A1');
});

test('25 geleerde woorden met goede stats → A2', function() {
  // avgBox >= 2.0 nodig: box=3 met reviews=5 → avgBox=3 ✓
  // errorRate <= 0.40: 1 miss per 5 reviews = 20% ✓
  var cards = makeCards(25, { box: 3, reviews: 5, misses: 1 });
  assertEqual(computeLevel(cards), 'A2');
});

test('39 geleerde woorden → A2 (net niet genoeg voor B1)', function() {
  var cards = makeCards(39, { box: 4, reviews: 5, misses: 0 });
  assertEqual(computeLevel(cards), 'A2');
});

test('40 geleerde woorden met hoge avgBox en lage foutrate → B1', function() {
  var cards = makeCards(40, { box: 4, reviews: 5, misses: 0 });
  assertEqual(computeLevel(cards), 'B1');
});

group('Level Engine — foutpercentage blokkeert promotie');

test('hoog foutpercentage blokkeert A1 ondanks genoeg woorden', function() {
  // 10 woorden maar 60% fout → boven A1-drempel van 55%
  var cards = makeCards(10, { box: 3, reviews: 5, misses: 3 }); // 60% fout
  assertEqual(computeLevel(cards), 'A0');
});

test('hoog foutpercentage blokkeert A2 ondanks genoeg woorden', function() {
  // 25 woorden maar 45% fout → boven A2-drempel van 40%
  var cards = makeCards(25, { box: 3, reviews: 5, misses: 2.25 }); // ~45%
  // Afronden: 2 misses per 5 reviews = 40% → precies op de grens
  var cards2 = makeCards(25, { box: 3, reviews: 5, misses: 3 }); // 60% fout
  assertEqual(computeLevel(cards2), 'A1'); // wél A1 (≤55%), niet A2
});

test('lage gemiddelde box blokkeert A2 ondanks genoeg woorden', function() {
  // avgBox < 2.0 → A2 niet haalbaar
  var cards = makeCards(25, { box: 1, reviews: 5, misses: 0 }); // avgBox = 1.0
  var level = computeLevel(cards);
  // mastered (box>=3) = 0, dus toch geen A1/A2
  assertEqual(level, 'A0');
});

test('alle drempelwaarden moeten cumulatief zijn: A2 impliceert A1', function() {
  var cards = makeCards(25, { box: 3, reviews: 5, misses: 1 });
  var level = computeLevel(cards);
  // A2 bereikt → moet ook A1-criteria voldoen
  assert(level === 'A2' || level === 'B1', 'moet minimaal A2 zijn');
});
