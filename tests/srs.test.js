// SRS Engine tests
// Kopie van de kernlogica uit index.html — puur voor testdoeleinden

group('SRS — Promotie en demotie');

var SRS = {
  intervals: [0, 1, 3, 7, 14, 30, 60],
  getNextReview: function(c) {
    var iv  = this.intervals[Math.min(c.box, 6)];
    var mf  = (c.misses||0) > 3 ? .5 : (c.misses||0) > 1 ? .75 : 1;
    var base = c.lastReview + Math.floor(iv * mf) * 864e5;
    var cooldown = (c.box === 0 && c.lastReview > 0) ? c.lastReview + 4 * 36e5 : 0;
    return Math.max(base, cooldown);
  },
  requiredStreak: function(m) {
    return m >= 5 ? 4 : m >= 3 ? 3 : m >= 1 ? 2 : 1;
  },
  promote: function(c) {
    var ns = c.streak + 1;
    var needed = this.requiredStreak(c.misses || 0);
    if (ns >= needed) {
      return Object.assign({}, c, {
        box: Math.min(c.box + 1, 6), lastReview: Date.now(),
        reviews: c.reviews + 1, streak: ns,
        misses: Math.max((c.misses||0) - 1, 0)
      });
    }
    return Object.assign({}, c, { lastReview: Date.now(), reviews: c.reviews + 1, streak: ns });
  },
  demote: function(c) {
    return Object.assign({}, c, {
      box: Math.max(c.box - 2, 0), lastReview: Date.now(),
      reviews: c.reviews + 1, streak: 0, misses: (c.misses||0) + 1
    });
  }
};

function makeCard(overrides) {
  return Object.assign({ id: 1, box: 0, lastReview: 0, reviews: 0, streak: 0, misses: 0 }, overrides);
}

test('correct antwoord zonder fouten → box omhoog', function() {
  var c = makeCard({ box: 0, streak: 0, misses: 0 });
  var r = SRS.promote(c);
  assertEqual(r.box, 1, 'box moet van 0 naar 1');
});

test('correct antwoord met 1 miss → streak omhoog maar box pas na 2× goed', function() {
  var c = makeCard({ box: 1, streak: 0, misses: 1 });
  var r = SRS.promote(c);
  assertEqual(r.box, 1, 'box mag nog niet omhoog (streak = 1, nodig = 2)');
  var r2 = SRS.promote(r);
  assertEqual(r2.box, 2, 'box moet omhoog na 2× goed');
});

test('fout antwoord → box daalt met 2', function() {
  var c = makeCard({ box: 3 });
  var r = SRS.demote(c);
  assertEqual(r.box, 1, 'box moet van 3 naar 1');
});

test('box gaat nooit onder 0', function() {
  var c = makeCard({ box: 0 });
  var r = SRS.demote(c);
  assertEqual(r.box, 0, 'box moet minimaal 0 zijn');
});

test('box gaat nooit boven 6', function() {
  var c = makeCard({ box: 6, streak: 0, misses: 0 });
  var r = SRS.promote(c);
  assertEqual(r.box, 6, 'box moet maximaal 6 zijn');
});

test('misses verhogen required streak', function() {
  assertEqual(SRS.requiredStreak(0), 1, '0 fouten → 1 streak nodig');
  assertEqual(SRS.requiredStreak(1), 2, '1 fout → 2 streaks nodig');
  assertEqual(SRS.requiredStreak(3), 3, '3 fouten → 3 streaks nodig');
  assertEqual(SRS.requiredStreak(5), 4, '5 fouten → 4 streaks nodig');
});

test('fout antwoord verhoogt misses', function() {
  var c = makeCard({ misses: 0 });
  var r = SRS.demote(c);
  assertEqual(r.misses, 1, 'misses moet 1 zijn na fout antwoord');
});

test('correct antwoord bij misses>0 verlaagt misses met 1 bij promotie', function() {
  var c = makeCard({ box: 0, streak: 1, misses: 2 });
  var r = SRS.promote(c); // streak wordt 2, needed=2 → promoveer
  assertEqual(r.box, 1);
  assertEqual(r.misses, 1, 'misses moet met 1 afnemen bij promotie');
});

test('demote reset streak naar 0', function() {
  var c = makeCard({ streak: 3 });
  var r = SRS.demote(c);
  assertEqual(r.streak, 0, 'streak moet gereset worden na fout');
});

group('SRS — getNextReview en cooldown');

test('box-0 met lastReview=0 is direct due (nooit bezien)', function() {
  var c = makeCard({ box: 0, lastReview: 0 });
  var next = SRS.getNextReview(c);
  assertEqual(next, 0, 'nextReview moet 0 zijn voor nieuw woord');
});

test('box-0 met lastReview>0 heeft minimaal 4u cooldown', function() {
  var now = Date.now();
  var c = makeCard({ box: 0, lastReview: now });
  var next = SRS.getNextReview(c);
  var fourHours = 4 * 60 * 60 * 1000;
  assertGte(next, now + fourHours - 1000, 'cooldown moet minimaal 4u zijn');
});

test('box-1 heeft interval van 1 dag', function() {
  var now = Date.now();
  var c = makeCard({ box: 1, lastReview: now, misses: 0 });
  var next = SRS.getNextReview(c);
  var oneDay = 86400000;
  assertGte(next, now + oneDay - 1000);
  assertLte(next, now + oneDay + 1000);
});

test('foutfactor halveert interval bij veel fouten', function() {
  var now = Date.now();
  var c1 = makeCard({ box: 2, lastReview: now, misses: 0 }); // interval 3 dagen
  var c2 = makeCard({ box: 2, lastReview: now, misses: 4 }); // interval 1.5 dagen
  var n1 = SRS.getNextReview(c1);
  var n2 = SRS.getNextReview(c2);
  assert(n2 < n1, 'veel fouten moeten kortere interval geven');
});
