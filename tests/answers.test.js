// Antwoordcontrole tests — testen de echte gradeAnswer() uit core.js

group('Antwoordcontrole — getypte antwoorden');

test('exact antwoord is goed', function() {
  var g = gradeAnswer('begrijpen', 'begrijpen');
  assert(g.correct && g.exact);
});

test('hoofdletters en leestekens maken niet uit', function() {
  var g = gradeAnswer('Nie rozumiem, co mówisz.', 'nie rozumiem co mówisz');
  assert(g.correct && g.exact);
});

test('kleine typfout telt als bijna goed', function() {
  var g = gradeAnswer('begrijpen', 'begrjpen');
  assert(g.correct && !g.exact, 'moet goed zijn, maar niet exact');
});

test('ander woord is fout', function() {
  assert(!gradeAnswer('begrijpen', 'lopen').correct);
});

test('elk alternatief rond een schuine streep telt', function() {
  assert(gradeAnswer('ontmoeting/afspraak', 'ontmoeting').exact, 'eerste alternatief');
  assert(gradeAnswer('ontmoeting/afspraak', 'afspraak').exact, 'tweede alternatief');
  assert(gradeAnswer('Op je gezondheid! / Proost!', 'proost').exact, 'met spaties en leestekens');
});

test('toelichting tussen haakjes hoeft niet getypt', function() {
  assert(gradeAnswer('missen (iemand)', 'missen').exact);
});

test('Poolse tekens weglaten is niet exact goed', function() {
  assert(!gradeAnswer('tęsknić', 'tesknic').exact);
});
