// Polski Leraar — verhalen
// Korte verhalen over het leven thuis. Elk verhaal heeft:
//   lines:     [wie, Pools, Nederlands]
//   questions: begripsvragen in het Pools; `a` is de plek van het goede antwoord (vanaf 0)
//   cloze:     invulzinnen; ___ is het woord dat je typt
//   say:       één zin om hardop te zeggen en mee te nemen
// De betekenis van losse woorden staat onderaan in STORY_GLOSS.

var STORIES = [
  {
    id: 1, title: 'Co robimy wieczorem?', nl: 'Wat doen we vanavond?',
    scene: 'Het is doordeweeks, na het eten. Kasia en jij bedenken wat jullie vanavond gaan doen.',
    lines: [
      ['Kasia', 'Co robimy dziś wieczorem?', 'Wat doen we vanavond?'],
      ['Johan', 'Nie wiem. Jestem trochę zmęczony po pracy.', 'Ik weet het niet. Ik ben een beetje moe na het werk.'],
      ['Kasia', 'To może obejrzymy jakiś film?', 'Zullen we dan misschien een film kijken?'],
      ['Johan', 'Dobry pomysł. Komedię czy coś poważnego?', 'Goed idee. Een komedie of iets serieus?'],
      ['Kasia', 'Komedię. Miałam ciężki dzień.', 'Een komedie. Ik had een zware dag.'],
      ['Johan', 'Dobrze. Ja zrobię herbatę, a ty wybierz film.', 'Goed. Ik zet thee, en kies jij een film.'],
      ['Kasia', 'A chłopcy? Odrobili już lekcje?', 'En de jongens? Hebben ze hun huiswerk al gemaakt?'],
      ['Johan', 'Patryk tak. Daniel jeszcze siedzi nad matematyką.', 'Patryk wel. Daniel zit nog aan zijn wiskunde.'],
      ['Kasia', 'To zaczynamy za pół godziny.', 'Dan beginnen we over een half uur.']
    ],
    questions: [
      { q: 'Jak czuje się Johan?', nl: 'Hoe voelt Johan zich?', options: ['Jest zmęczony', 'Jest głodny', 'Jest chory'], a: 0 },
      { q: 'Co obejrzą?', nl: 'Wat gaan ze kijken?', options: ['Mecz', 'Komedię', 'Wiadomości'], a: 1 },
      { q: 'Kto jeszcze odrabia lekcje?', nl: 'Wie maakt nog huiswerk?', options: ['Patryk', 'Kasia', 'Daniel'], a: 2 }
    ],
    cloze: [
      { pl: 'Co robimy dziś ___?', a: 'wieczorem', nl: 'Wat doen we vanavond?' },
      { pl: 'Jestem trochę ___ po pracy.', a: 'zmęczony', nl: 'Ik ben een beetje moe na het werk.' }
    ],
    say: { pl: 'Co robimy dziś wieczorem?', nl: 'Wat doen we vanavond?' }
  },
  {
    id: 2, title: 'Bałagan w pokoju', nl: 'Rommel in de kamer',
    scene: 'Je loopt de kamer van Patryk binnen. Het is er een puinhoop.',
    lines: [
      ['Johan', 'Patryk, co to za bałagan? Posprzątaj swój pokój, proszę.', 'Patryk, wat is dit voor rommel? Ruim je kamer op, alsjeblieft.'],
      ['Patryk', 'Zaraz, tato. Tylko skończę grę.', 'Zo meteen, pap. Ik maak alleen mijn spel af.'],
      ['Johan', 'Nie zaraz, tylko teraz. Ubrania leżą na podłodze.', 'Niet zo meteen, maar nu. Er liggen kleren op de vloer.'],
      ['Patryk', 'A gdzie mam je położyć?', 'En waar moet ik ze neerleggen?'],
      ['Johan', 'Czyste do szafy, brudne do kosza na pranie.', 'Schone in de kast, vuile in de wasmand.'],
      ['Patryk', 'A książki?', 'En de boeken?'],
      ['Johan', 'Książki na półkę. I wynieś te szklanki do kuchni.', 'Boeken op de plank. En breng die glazen naar de keuken.'],
      ['Patryk', 'Dobrze, już sprzątam. Pomożesz mi?', 'Goed, ik ruim al op. Help je me?'],
      ['Johan', 'Pomogę. Razem będzie szybciej.', 'Ik help. Samen gaat het sneller.']
    ],
    questions: [
      { q: 'Gdzie leżą ubrania?', nl: 'Waar liggen de kleren?', options: ['W szafie', 'Na podłodze', 'Na łóżku'], a: 1 },
      { q: 'Dokąd idą brudne ubrania?', nl: 'Waar gaan de vuile kleren heen?', options: ['Do kosza na pranie', 'Do szafy', 'Do kuchni'], a: 0 },
      { q: 'Kto pomoże Patrykowi?', nl: 'Wie gaat Patryk helpen?', options: ['Mama', 'Daniel', 'Tata'], a: 2 }
    ],
    cloze: [
      { pl: 'Posprzątaj swój ___, proszę.', a: 'pokój', nl: 'Ruim je kamer op, alsjeblieft.' },
      { pl: 'Razem będzie ___.', a: 'szybciej', nl: 'Samen gaat het sneller.' }
    ],
    say: { pl: 'Posprzątaj swój pokój, proszę.', nl: 'Ruim je kamer op, alsjeblieft.' }
  },
  {
    id: 3, title: 'Sobotnie porządki', nl: 'De zaterdagse schoonmaak',
    scene: 'Zaterdagochtend. Het huis moet schoon en iedereen krijgt een taak.',
    lines: [
      ['Kasia', 'Dzisiaj sobota, czyli sprzątamy. Kto co robi?', 'Vandaag is het zaterdag, dus we maken schoon. Wie doet wat?'],
      ['Johan', 'Ja odkurzę cały dom.', 'Ik stofzuig het hele huis.'],
      ['Kasia', 'Super. Ja umyję łazienkę.', 'Super. Ik maak de badkamer schoon.'],
      ['Daniel', 'A ja? Co mam zrobić?', 'En ik? Wat moet ik doen?'],
      ['Kasia', 'Ty wytrzyj kurze w salonie.', 'Neem jij stof af in de woonkamer.'],
      ['Johan', 'Patryk, a ty wynieś śmieci i umyj podłogę w kuchni.', 'Patryk, en breng jij het afval weg en dweil de keukenvloer.'],
      ['Patryk', 'Znowu ja? Wolę odkurzać.', 'Ik weer? Ik stofzuig liever.'],
      ['Johan', 'Dobrze, zamienimy się. Ty odkurzasz, ja myję podłogę.', 'Goed, we ruilen. Jij stofzuigt, ik dweil de vloer.'],
      ['Kasia', 'A potem wszyscy idziemy na lody!', 'En daarna gaan we met z\'n allen een ijsje halen!']
    ],
    questions: [
      { q: 'Jaki jest dzień?', nl: 'Welke dag is het?', options: ['Sobota', 'Niedziela', 'Poniedziałek'], a: 0 },
      { q: 'Co umyje Kasia?', nl: 'Wat maakt Kasia schoon?', options: ['Samochód', 'Okna', 'Łazienkę'], a: 2 },
      { q: 'Dokąd pójdą potem?', nl: 'Waar gaan ze daarna heen?', options: ['Do kina', 'Na lody', 'Do szkoły'], a: 1 }
    ],
    cloze: [
      { pl: 'Ja ___ cały dom.', a: 'odkurzę', nl: 'Ik stofzuig het hele huis.' },
      { pl: 'Wynieś ___, proszę.', a: 'śmieci', nl: 'Breng het afval weg, alsjeblieft.' }
    ],
    say: { pl: 'Ja odkurzę, a ty umyj łazienkę.', nl: 'Ik stofzuig, en maak jij de badkamer schoon.' }
  },
  {
    id: 4, title: 'Co na obiad?', nl: 'Wat eten we?',
    scene: 'Eind van de middag in de keuken. Kasia begint aan het eten en jij helpt mee.',
    lines: [
      ['Johan', 'Kasiu, co dzisiaj jemy na obiad?', 'Kasia, wat eten we vandaag?'],
      ['Kasia', 'Myślałam o makaronie z kurczakiem. Pomożesz mi?', 'Ik dacht aan pasta met kip. Help je me?'],
      ['Johan', 'Jasne. Co mam zrobić?', 'Tuurlijk. Wat moet ik doen?'],
      ['Kasia', 'Pokrój cebulę i czosnek. Ja ugotuję makaron.', 'Snijd de ui en de knoflook. Ik kook de pasta.'],
      ['Johan', 'Gdzie jest duży nóż?', 'Waar is het grote mes?'],
      ['Kasia', 'W szufladzie, obok widelców.', 'In de la, naast de vorken.'],
      ['Johan', 'Gotowe. Co teraz?', 'Klaar. Wat nu?'],
      ['Kasia', 'Wrzuć wszystko na patelnię i dodaj trochę soli.', 'Gooi alles in de pan en doe er een beetje zout bij.'],
      ['Johan', 'Ale pachnie! Chłopcy, nakryjcie do stołu!', 'Wat ruikt dat lekker! Jongens, dek de tafel!'],
      ['Kasia', 'Za dziesięć minut jemy.', 'Over tien minuten eten we.']
    ],
    questions: [
      { q: 'Co jedzą na obiad?', nl: 'Wat eten ze?', options: ['Zupę', 'Makaron z kurczakiem', 'Pizzę'], a: 1 },
      { q: 'Co kroi Johan?', nl: 'Wat snijdt Johan?', options: ['Cebulę i czosnek', 'Chleb', 'Pomidory'], a: 0 },
      { q: 'Gdzie jest nóż?', nl: 'Waar is het mes?', options: ['Na stole', 'W lodówce', 'W szufladzie'], a: 2 }
    ],
    cloze: [
      { pl: 'Co dzisiaj jemy na ___?', a: 'obiad', nl: 'Wat eten we vandaag?' },
      { pl: 'Co mam ___?', a: 'zrobić', nl: 'Wat moet ik doen?' }
    ],
    say: { pl: 'Pomogę ci. Co mam zrobić?', nl: 'Ik help je. Wat moet ik doen?' }
  },
  {
    id: 5, title: 'Plany na weekend', nl: 'Plannen voor het weekend',
    scene: 'Donderdagavond. Jullie lopen samen het weekend door.',
    lines: [
      ['Johan', 'Jakie mamy plany na weekend?', 'Wat voor plannen hebben we voor het weekend?'],
      ['Kasia', 'W sobotę rano Patryk ma mecz.', 'Zaterdagochtend heeft Patryk een wedstrijd.'],
      ['Johan', 'O której?', 'Hoe laat?'],
      ['Kasia', 'O dziesiątej. Zawieziesz go?', 'Om tien uur. Breng jij hem?'],
      ['Johan', 'Zawiozę. A po południu?', 'Ik breng hem. En \'s middags?'],
      ['Kasia', 'Po południu chcę popracować w ogrodzie.', '\'s Middags wil ik wat in de tuin werken.'],
      ['Johan', 'A w niedzielę? Może pojedziemy nad morze?', 'En zondag? Zullen we misschien naar zee gaan?'],
      ['Kasia', 'Jeśli będzie ładna pogoda, to chętnie.', 'Als het mooi weer is, graag.'],
      ['Daniel', 'Ja chcę nad morze! Weźmiemy rowery?', 'Ik wil naar zee! Nemen we de fietsen mee?'],
      ['Johan', 'Weźmiemy. Sprawdzę prognozę pogody.', 'Die nemen we mee. Ik kijk naar de weersverwachting.']
    ],
    questions: [
      { q: 'Kiedy Patryk ma mecz?', nl: 'Wanneer heeft Patryk een wedstrijd?', options: ['W sobotę rano', 'W niedzielę', 'W piątek'], a: 0 },
      { q: 'Co chce robić Kasia po południu?', nl: 'Wat wil Kasia \'s middags doen?', options: ['Spać', 'Gotować', 'Pracować w ogrodzie'], a: 2 },
      { q: 'Dokąd chcą jechać w niedzielę?', nl: 'Waar willen ze zondag heen?', options: ['W góry', 'Nad morze', 'Do Polski'], a: 1 }
    ],
    cloze: [
      { pl: 'Jakie mamy ___ na weekend?', a: 'plany', nl: 'Wat voor plannen hebben we voor het weekend?' },
      { pl: 'Może pojedziemy nad ___?', a: 'morze', nl: 'Zullen we misschien naar zee gaan?' }
    ],
    say: { pl: 'Jakie mamy plany na weekend?', nl: 'Wat voor plannen hebben we voor het weekend?' }
  },
  {
    id: 6, title: 'Idę pobiegać', nl: 'Ik ga hardlopen',
    scene: 'Je staat in de gang in je sportkleren. Buiten is het grijs.',
    lines: [
      ['Johan', 'Idę pobiegać. Wrócę za godzinę.', 'Ik ga hardlopen. Ik ben over een uur terug.'],
      ['Kasia', 'Teraz? Przecież pada deszcz.', 'Nu? Het regent toch.'],
      ['Johan', 'Trochę deszczu mi nie przeszkadza.', 'Een beetje regen vind ik niet erg.'],
      ['Kasia', 'Ile kilometrów chcesz przebiec?', 'Hoeveel kilometer wil je lopen?'],
      ['Johan', 'Pięć. Może sześć, jeśli będę miał siłę.', 'Vijf. Misschien zes, als ik de kracht heb.'],
      ['Patryk', 'Tato, mogę biec z tobą?', 'Pap, mag ik met je mee lopen?'],
      ['Johan', 'Pewnie! Załóż buty sportowe i kurtkę.', 'Zeker! Doe je sportschoenen en een jas aan.'],
      ['Kasia', 'A ja idę wieczorem na jogę.', 'En ik ga vanavond naar yoga.'],
      ['Johan', 'To kto robi kolację?', 'Wie maakt dan het avondeten?'],
      ['Kasia', 'Ten, kto wróci pierwszy!', 'Wie het eerst terug is!']
    ],
    questions: [
      { q: 'Jaka jest pogoda?', nl: 'Wat voor weer is het?', options: ['Świeci słońce', 'Pada deszcz', 'Pada śnieg'], a: 1 },
      { q: 'Kto biegnie z Johanem?', nl: 'Wie loopt er met Johan mee?', options: ['Patryk', 'Daniel', 'Kasia'], a: 0 },
      { q: 'Dokąd idzie Kasia wieczorem?', nl: 'Waar gaat Kasia vanavond heen?', options: ['Na basen', 'Do kina', 'Na jogę'], a: 2 }
    ],
    cloze: [
      { pl: 'Idę ___.', a: 'pobiegać', nl: 'Ik ga hardlopen.' },
      { pl: 'Wrócę za ___.', a: 'godzinę', nl: 'Ik ben over een uur terug.' }
    ],
    say: { pl: 'Idę pobiegać. Wrócę za godzinę.', nl: 'Ik ga hardlopen. Ik ben over een uur terug.' }
  },
  {
    id: 7, title: 'Pusta lodówka', nl: 'De lege koelkast',
    scene: 'Kasia doet de koelkast open en zucht. Er moeten boodschappen komen.',
    lines: [
      ['Kasia', 'Lodówka jest prawie pusta. Trzeba zrobić zakupy.', 'De koelkast is bijna leeg. Er moeten boodschappen gedaan worden.'],
      ['Johan', 'Mogę pojechać po pracy. Co kupić?', 'Ik kan na het werk gaan. Wat moet ik kopen?'],
      ['Kasia', 'Mleko, chleb, jajka i ser.', 'Melk, brood, eieren en kaas.'],
      ['Johan', 'Zapiszę to. Coś jeszcze?', 'Ik schrijf het op. Nog iets?'],
      ['Kasia', 'Owoce dla chłopców. Jabłka i banany.', 'Fruit voor de jongens. Appels en bananen.'],
      ['Johan', 'A mamy jeszcze kawę?', 'En hebben we nog koffie?'],
      ['Kasia', 'Nie, kawa też się skończyła.', 'Nee, de koffie is ook op.'],
      ['Johan', 'To bez kawy nie wracam!', 'Dan kom ik niet terug zonder koffie!'],
      ['Kasia', 'I kup proszek do prania. Nie zapomnij!', 'En koop waspoeder. Niet vergeten!'],
      ['Johan', 'Nie zapomnę. Mam wszystko na liście.', 'Ik vergeet het niet. Ik heb alles op het lijstje.']
    ],
    questions: [
      { q: 'Jaka jest lodówka?', nl: 'Hoe is de koelkast?', options: ['Pełna', 'Zepsuta', 'Prawie pusta'], a: 2 },
      { q: 'Jakie owoce kupi Johan?', nl: 'Welk fruit koopt Johan?', options: ['Jabłka i banany', 'Truskawki', 'Pomarańcze'], a: 0 },
      { q: 'Co się skończyło?', nl: 'Wat is er op?', options: ['Herbata', 'Kawa', 'Woda'], a: 1 }
    ],
    cloze: [
      { pl: 'Trzeba zrobić ___.', a: 'zakupy', nl: 'Er moeten boodschappen gedaan worden.' },
      { pl: 'Coś ___?', a: 'jeszcze', nl: 'Nog iets?' }
    ],
    say: { pl: 'Mogę zrobić zakupy. Co kupić?', nl: 'Ik kan boodschappen doen. Wat moet ik kopen?' }
  },
  {
    id: 8, title: 'Pranie i zmywarka', nl: 'De was en de vaatwasser',
    scene: 'Zondagavond. De laatste klusjes voor de nieuwe week.',
    lines: [
      ['Kasia', 'Johan, możesz rozładować zmywarkę?', 'Johan, kun je de vaatwasser uitruimen?'],
      ['Johan', 'Już to zrobiłem. Naczynia są w szafce.', 'Dat heb ik al gedaan. De vaat staat in het kastje.'],
      ['Kasia', 'O, dziękuję! A pranie?', 'O, dank je! En de was?'],
      ['Johan', 'Pralka jeszcze pracuje. Skończy za dwadzieścia minut.', 'De wasmachine draait nog. Hij is over twintig minuten klaar.'],
      ['Kasia', 'To potem powieś pranie, dobrze?', 'Hang jij de was dan daarna op, goed?'],
      ['Johan', 'Powieszę. A kto wyprasuje moje koszule?', 'Doe ik. En wie strijkt mijn overhemden?'],
      ['Kasia', 'Ty sam, kochanie.', 'Jij zelf, schat.'],
      ['Johan', 'Tego się bałem. Gdzie jest żelazko?', 'Daar was ik al bang voor. Waar is het strijkijzer?'],
      ['Kasia', 'Tam, gdzie zawsze. W szafie na górze.', 'Waar het altijd ligt. In de kast boven.']
    ],
    questions: [
      { q: 'Gdzie są naczynia?', nl: 'Waar is de vaat?', options: ['W zmywarce', 'W szafce', 'Na stole'], a: 1 },
      { q: 'Kiedy skończy pralka?', nl: 'Wanneer is de wasmachine klaar?', options: ['Za godzinę', 'Jutro', 'Za dwadzieścia minut'], a: 2 },
      { q: 'Kto wyprasuje koszule?', nl: 'Wie strijkt de overhemden?', options: ['Johan', 'Kasia', 'Patryk'], a: 0 }
    ],
    cloze: [
      { pl: 'Już to ___.', a: 'zrobiłem', nl: 'Dat heb ik al gedaan.' },
      { pl: 'Gdzie jest ___?', a: 'żelazko', nl: 'Waar is het strijkijzer?' }
    ],
    say: { pl: 'Już to zrobiłem.', nl: 'Dat heb ik al gedaan.' }
  },
  {
    id: 9, title: 'Niedzielny telefon', nl: 'Het zondagse telefoontje',
    scene: 'Zondagmiddag. Maria en Wojtek bellen met beeld en Kasia geeft jou de telefoon.',
    lines: [
      ['Maria', 'Halo, Johan! Dobrze cię widzieć. Co u was słychać?', 'Hallo, Johan! Fijn je te zien. Hoe gaat het bij jullie?'],
      ['Johan', 'Dzień dobry! Wszystko w porządku. Właśnie zjedliśmy obiad.', 'Goedendag! Alles is in orde. We hebben net gegeten.'],
      ['Maria', 'A co robiliście w weekend?', 'En wat hebben jullie in het weekend gedaan?'],
      ['Johan', 'Wczoraj sprzątaliśmy, a dzisiaj byliśmy nad morzem.', 'Gisteren hebben we schoongemaakt, en vandaag waren we aan zee.'],
      ['Wojtek', 'A jak chłopcy? Dobrze się uczą?', 'En hoe is het met de jongens? Doen ze goed hun best op school?'],
      ['Johan', 'Tak, są bardzo zajęci. Szkoła, sport, koledzy.', 'Ja, ze hebben het erg druk. School, sport, vrienden.'],
      ['Maria', 'Kiedy do nas przyjedziecie?', 'Wanneer komen jullie naar ons toe?'],
      ['Johan', 'Latem, na dwa tygodnie. Już się cieszymy.', 'In de zomer, voor twee weken. We verheugen ons er al op.'],
      ['Wojtek', 'My też. Pozdrów Kasię i chłopców!', 'Wij ook. Doe de groeten aan Kasia en de jongens!'],
      ['Johan', 'Pozdrowię. Do usłyszenia!', 'Doe ik. Tot horens!']
    ],
    questions: [
      { q: 'Co robili wczoraj?', nl: 'Wat hebben ze gisteren gedaan?', options: ['Sprzątali', 'Byli w kinie', 'Pracowali'], a: 0 },
      { q: 'Kiedy przyjadą do Polski?', nl: 'Wanneer komen ze naar Polen?', options: ['Zimą', 'Latem', 'Jutro'], a: 1 },
      { q: 'Na jak długo?', nl: 'Voor hoe lang?', options: ['Na dwa dni', 'Na miesiąc', 'Na dwa tygodnie'], a: 2 }
    ],
    cloze: [
      { pl: 'Wszystko w ___.', a: 'porządku', nl: 'Alles is in orde.' },
      { pl: 'Co u was ___?', a: 'słychać', nl: 'Hoe gaat het bij jullie?' }
    ],
    say: { pl: 'Wszystko w porządku. A co u was słychać?', nl: 'Alles is in orde. En hoe gaat het bij jullie?' }
  },
  {
    id: 10, title: 'Goście przyjeżdżają', nl: 'Er komt bezoek',
    scene: 'Morgen komen Karol en Monika logeren. Het huis moet in orde.',
    lines: [
      ['Kasia', 'Jutro przyjeżdżają Karol i Monika. Musimy przygotować dom.', 'Morgen komen Karol en Monika. We moeten het huis klaarmaken.'],
      ['Johan', 'Gdzie będą spać?', 'Waar gaan ze slapen?'],
      ['Kasia', 'W pokoju gościnnym. Zmienisz pościel?', 'In de logeerkamer. Verschoon jij het beddengoed?'],
      ['Johan', 'Zmienię. A Arek też przyjedzie?', 'Doe ik. En komt Arek ook?'],
      ['Kasia', 'Nie, Arek musi pracować. Przyjedzie w przyszłym miesiącu.', 'Nee, Arek moet werken. Hij komt volgende maand.'],
      ['Johan', 'Co ugotujemy na kolację?', 'Wat koken we als avondeten?'],
      ['Kasia', 'Coś holenderskiego. Monika chce spróbować.', 'Iets Nederlands. Monika wil het proeven.'],
      ['Johan', 'To zrobię stamppot. I kupię dobre piwo dla Karola.', 'Dan maak ik stamppot. En ik koop goed bier voor Karol.'],
      ['Kasia', 'Świetnie. I posprzątaj w przedpokoju, proszę.', 'Prima. En ruim de gang op, alsjeblieft.'],
      ['Johan', 'Już idę. Lubię, kiedy mamy gości.', 'Ik ga al. Ik vind het leuk als we gasten hebben.']
    ],
    questions: [
      { q: 'Kto przyjeżdża jutro?', nl: 'Wie komt er morgen?', options: ['Arek', 'Karol i Monika', 'Maria i Wojtek'], a: 1 },
      { q: 'Gdzie będą spać?', nl: 'Waar gaan ze slapen?', options: ['W pokoju gościnnym', 'W salonie', 'W hotelu'], a: 0 },
      { q: 'Co kupi Johan dla Karola?', nl: 'Wat koopt Johan voor Karol?', options: ['Kwiaty', 'Kawę', 'Piwo'], a: 2 }
    ],
    cloze: [
      { pl: 'Gdzie będą ___?', a: 'spać', nl: 'Waar gaan ze slapen?' },
      { pl: 'Lubię, kiedy mamy ___.', a: 'gości', nl: 'Ik vind het leuk als we gasten hebben.' }
    ],
    say: { pl: 'Lubię, kiedy mamy gości.', nl: 'Ik vind het leuk als we gasten hebben.' }
  }
];

// Betekenis van elk woord dat in de verhalen voorkomt, in de vorm waarin het daar staat.
var STORY_GLOSS = {
  'a':'en / maar','ale':'maar; ook: wat (een)!','arek':'Arek','bałagan':'rommel','bałem':'ik was bang (bać się)','banany':'bananen',
  'bardzo':'erg, heel','bez':'zonder','będą':'ze zullen (zijn)','będę':'ik zal (zijn)','będzie':'het zal zijn','biec':'rennen, hardlopen',
  'brudne':'vuile','buty':'schoenen','byliśmy':'we waren','cały':'hele','cebulę':'ui','chce':'hij/zij wil','chcesz':'je wilt','chcę':'ik wil',
  'chętnie':'graag','chleb':'brood','chłopców':'de jongens (na dla / pozdrów)','chłopcy':'jongens','cieszymy':'we verheugen ons (cieszyć się)',
  'cię':'je, jou','ciężki':'zwaar','co':'wat','coś':'iets','czosnek':'knoflook','czy':'of','czyli':'dus, oftewel','czyste':'schone',
  'daniel':'Daniel','deszcz':'regen','deszczu':'regen (trochę deszczu = een beetje regen)','dla':'voor','do':'naar, in, tot','dobre':'goed(e)',
  'dobry':'goed(e)','dobrze':'goed, oké','dodaj':'voeg toe','dom':'huis','duży':'groot','dwa':'twee','dwadzieścia':'twintig','dzień':'dag',
  'dziesiątej':'tien uur (o dziesiątej = om tien uur)','dziesięć':'tien','dziękuję':'dank je','dzisiaj':'vandaag','dziś':'vandaag',
  'film':'film','gdzie':'waar','go':'hem','godzinę':'uur (za godzinę = over een uur)','godziny':'uur (pół godziny = een half uur)',
  'gości':'gasten','gościnnym':'logeer- (pokój gościnny = logeerkamer)','gotowe':'klaar','górze':'boven (na górze)','grę':'spel, game',
  'halo':'hallo (aan de telefoon)','herbatę':'thee','holenderskiego':'Nederlands (coś holenderskiego = iets Nederlands)','i':'en',
  'idę':'ik ga','idziemy':'we gaan','ile':'hoeveel','ja':'ik','jabłka':'appels','jajka':'eieren','jak':'hoe','jakie':'welke, wat voor',
  'jakiś':'een of andere','jasne':'tuurlijk, duidelijk','je':'ze (die dingen)','jemy':'we eten','jest':'is','jestem':'ik ben',
  'jeszcze':'nog','jeśli':'als','jogę':'yoga','johan':'Johan','jutro':'morgen','już':'al','karol':'Karol','karola':'Karol (dla Karola = voor Karol)',
  'kasię':'Kasia (pozdrów Kasię = groet Kasia)','kasiu':'Kasia (als je haar aanspreekt)','kawa':'koffie','kawę':'koffie','kawy':'koffie (bez kawy = zonder koffie)',
  'kiedy':'wanneer; ook: als','kilometrów':'kilometer','kochanie':'schat, lieverd','kolację':'avondeten','koledzy':'vrienden, klasgenoten',
  'komedię':'komedie','kosza':'mand (kosz na pranie = wasmand)','koszule':'overhemden','książki':'boeken','kto':'wie',
  'której':'welke (o której? = hoe laat?)','kuchni':'keuken','kup':'koop','kupić':'kopen','kupię':'ik koop','kurczakiem':'kip (z kurczakiem = met kip)',
  'kurtkę':'jas','kurze':'stof (wytrzeć kurze = stof afnemen)','latem':'in de zomer','lekcje':'huiswerk, lessen','leżą':'ze liggen',
  'liście':'lijst (na liście = op de lijst)','lodówka':'koelkast','lody':'ijs, ijsjes','lubię':'ik vind leuk, ik hou van','ładna':'mooi',
  'łazienkę':'badkamer','ma':'hij/zij heeft','makaron':'pasta','makaronie':'pasta (o makaronie = aan pasta)','mam':'ik heb; ook: ik moet',
  'mamy':'we hebben','matematyką':'wiskunde (nad matematyką = aan de wiskunde)','mecz':'wedstrijd','mi':'mij, me','miał':'had (będę miał = ik zal hebben)',
  'miałam':'ik had (vrouw)','miesiącu':'maand (w przyszłym miesiącu = volgende maand)','minut':'minuten','mleko':'melk','mogę':'ik kan, ik mag',
  'moje':'mijn','monika':'Monika','morze':'zee (nad morze = naar zee)','morzem':'zee (nad morzem = aan zee)','może':'misschien',
  'możesz':'je kunt','musi':'hij/zij moet','musimy':'we moeten','my':'wij','myję':'ik was, ik dweil','myślałam':'ik dacht (vrouw)',
  'na':'op, voor, naar','naczynia':'vaat, servies','nad':'aan, boven, naar (zee)','nakryjcie':'dek (nakryć do stołu = de tafel dekken)',
  'nas':'ons (do nas = naar ons)','nie':'niet, nee','niedzielę':'zondag (w niedzielę = op zondag)','nóż':'mes','o':'om (tijd), over; ook: o!',
  'obejrzymy':'we gaan kijken','obiad':'warme maaltijd, middageten','obok':'naast','odkurzać':'stofzuigen','odkurzasz':'je stofzuigt',
  'odkurzę':'ik ga stofzuigen','odrobili':'ze hebben gemaakt (huiswerk)','ogrodzie':'tuin (w ogrodzie = in de tuin)','owoce':'fruit',
  'pachnie':'het ruikt (lekker)','pada':'het valt (pada deszcz = het regent)','patelnię':'koekenpan','patryk':'Patryk','pewnie':'zeker, tuurlijk',
  'pierwszy':'eerste, als eerste','pięć':'vijf','piwo':'bier','plany':'plannen','po':'na','pobiegać':'(een stuk) hardlopen',
  'podłodze':'vloer (na podłodze = op de vloer)','podłogę':'vloer','pogoda':'weer','pogody':'weer (prognoza pogody = weersverwachting)',
  'pojechać':'(ergens heen) rijden, gaan','pojedziemy':'we gaan (met vervoer)','pokoju':'kamer (w pokoju = in de kamer)','pokój':'kamer',
  'pokrój':'snijd','położyć':'neerleggen','południu':'middag (po południu = \'s middags)','pomogę':'ik help','pomożesz':'help je',
  'pomysł':'idee','popracować':'(even) werken','porządku':'orde (w porządku = in orde)','posprzątaj':'ruim op','pościel':'beddengoed',
  'potem':'daarna','poważnego':'serieus (coś poważnego = iets serieus)','powieszę':'ik hang op','powieś':'hang op','pozdrowię':'ik doe de groeten',
  'pozdrów':'doe de groeten aan','pół':'half','półkę':'plank (na półkę = op de plank)','pracować':'werken','pracuje':'hij/zij werkt, draait',
  'pracy':'werk (po pracy = na het werk)','pralka':'wasmachine','prania':'was (proszek do prania = waspoeder)','pranie':'de was',
  'prawie':'bijna','prognozę':'voorspelling','proszek':'poeder','proszę':'alsjeblieft','przebiec':'(een afstand) lopen, rennen',
  'przecież':'toch, immers','przedpokoju':'gang, hal','przeszkadza':'stoort (nie przeszkadza mi = ik vind het niet erg)',
  'przygotować':'klaarmaken, voorbereiden','przyjedzie':'hij/zij komt','przyjedziecie':'jullie komen','przyjeżdżają':'ze komen',
  'przyszłym':'volgende, komende','pusta':'leeg','rano':'\'s ochtends','razem':'samen','robi':'hij/zij doet, maakt',
  'robiliście':'jullie deden','robimy':'we doen','rowery':'fietsen','rozładować':'uitruimen','salonie':'woonkamer (w salonie = in de woonkamer)',
  'sam':'zelf, alleen','są':'ze zijn','ser':'kaas','siedzi':'hij/zij zit','się':'zich (hoort bij het werkwoord)','siłę':'kracht, energie',
  'skończę':'ik maak af','skończy':'hij/zij is klaar','skończyła':'is opgeraakt (skończyć się)','słychać':'te horen (co słychać? = hoe gaat het?)',
  'sobota':'zaterdag','sobotę':'zaterdag (w sobotę = op zaterdag)','soli':'zout (trochę soli = een beetje zout)','spać':'slapen','sport':'sport',
  'sportowe':'sport- (buty sportowe = sportschoenen)','sprawdzę':'ik kijk na, ik check','spróbować':'proeven, proberen',
  'sprzątaliśmy':'we hebben schoongemaakt','sprzątam':'ik ruim op','sprzątamy':'we maken schoon','stamppot':'stamppot','stołu':'tafel (do stołu)',
  'super':'super','swój':'je eigen','szafce':'kastje (w szafce = in het kastje)','szafie':'kast (w szafie = in de kast)','szafy':'kast (do szafy = in de kast)',
  'sześć':'zes','szklanki':'glazen','szkoła':'school','szufladzie':'la (w szufladzie = in de la)','szybciej':'sneller','śmieci':'afval',
  'świetnie':'prima, geweldig','tak':'ja','tam':'daar','tato':'pap','te':'die, deze','tego':'dat, daarvoor','ten':'die, degene','teraz':'nu',
  'też':'ook','to':'dat, dit; ook: dan','tobą':'jou (z tobą = met jou)','trochę':'een beetje','trzeba':'het moet, je moet','ty':'jij',
  'tygodnie':'weken','tylko':'alleen, maar','u':'bij','ubrania':'kleren','uczą':'ze leren (uczyć się)','ugotujemy':'we koken','ugotuję':'ik kook',
  'umyj':'was, dweil','umyję':'ik maak schoon, ik was','usłyszenia':'horens (do usłyszenia = tot horens)','w':'in, op','was':'jullie (u was = bij jullie)',
  'wczoraj':'gisteren','weekend':'weekend','weźmiemy':'we nemen (mee)','widelców':'vorken','widzieć':'zien','wieczorem':'\'s avonds, vanavond',
  'wiem':'ik weet','właśnie':'net, zojuist','wolę':'ik doe/heb liever','wracam':'ik kom terug','wrócę':'ik kom terug (straks)','wróci':'hij/zij komt terug',
  'wrzuć':'gooi (erin)','wszyscy':'iedereen, allemaal','wszystko':'alles','wybierz':'kies','wynieś':'breng weg','wyprasuje':'hij/zij strijkt',
  'wytrzyj':'veeg af','z':'met','za':'over (za godzinę = over een uur); co to za…? = wat is dit voor…?','zaczynamy':'we beginnen','zajęci':'druk, bezet','zakupy':'boodschappen',
  'załóż':'doe aan, trek aan','zamienimy':'we ruilen (zamienić się)','zapiszę':'ik schrijf op','zapomnę':'ik vergeet','zapomnij':'vergeet (nie zapomnij = niet vergeten)',
  'zaraz':'zo meteen','zawieziesz':'je brengt (met de auto)','zawiozę':'ik breng (met de auto)','zawsze':'altijd','zjedliśmy':'we hebben gegeten',
  'zmęczony':'moe','zmienię':'ik verschoon, ik verander','zmienisz':'je verschoont, je verandert','zmywarkę':'vaatwasser','znowu':'weer, opnieuw',
  'zrobić':'doen, maken','zrobię':'ik maak, ik doe','zrobiłem':'ik heb gedaan (man)','żelazko':'strijkijzer'
};
