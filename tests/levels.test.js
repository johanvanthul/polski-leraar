// Level Engine tests — testen de echte LEVEL uit core.js

group('Level Engine — drempelwaarden');

// LEVEL.compute() rekent met de globale variabele `cards`
function computeLevel(testCards) {
  cards = testCards;
  return LEVEL.compute().code;
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

test('hoog foutpercentage blokkeert A2 maar niet A1', function() {
  // 25 woorden, 10 reviews, 5 fouten = 50% foutrate
  // 50% > 40% → A2 geblokkeerd
  // 50% ≤ 55% → A1 wél bereikt
  var cards = makeCards(25, { box: 3, reviews: 10, misses: 5 });
  assertEqual(computeLevel(cards), 'A1');
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
