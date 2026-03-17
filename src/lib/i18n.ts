export type Lang = "sv" | "no" | "da" | "fi" | "en";

export const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export const defaultLang: Lang = "sv";

type TranslationKeys = {
  nav: { home: string; howItWorks: string; partners: string; dashboard: string };
  hero: {
    headline: string;
    headlineAlt1: string;
    headlineAlt2: string;
    sub: string;
    cta: string;
    ctaAlt1: string;
    ctaAlt2: string;
    ctaSecondary: string;
  };
  problem: { title: string; text: string; stat1: string; stat1label: string; stat2: string; stat2label: string; stat3: string; stat3label: string };
  howItWorks: { title: string; step1: string; step1desc: string; step2: string; step2desc: string; step3: string; step3desc: string; step4: string; step4desc: string };
  results: { title: string; text: string };
  cta: { title: string; text: string; button: string };
  faq: { title: string; q1: string; a1: string; q2: string; a2: string; q3: string; a3: string; q4: string; a4: string };
  lead: { title: string; name: string; email: string; phone: string; submit: string; success: string };
  partner: {
    pageTitle: string;
    headline: string;
    sub: string;
    benefit1: string;
    benefit1desc: string;
    benefit2: string;
    benefit2desc: string;
    benefit3: string;
    benefit3desc: string;
    signupTitle: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    submit: string;
    success: string;
  };
  dashboard: {
    title: string;
    visitors: string;
    leads: string;
    bookings: string;
    customers: string;
    recent: string;
    performance: string;
  };
  footer: { rights: string; privacy: string; terms: string };
};

const translations: Record<Lang, TranslationKeys> = {
  sv: {
    nav: { home: "Hem", howItWorks: "Så fungerar det", partners: "Bli partner", dashboard: "Dashboard" },
    hero: {
      headline: "Vad är din Omega-balans?",
      headlineAlt1: "Upptäck din Omega 6:3-kvot",
      headlineAlt2: "Är din kropp i balans?",
      sub: "Ett enkelt vetenskapligt test som avslöjar din kropps inflammationsbalans. Inget kosttillskott – bara kunskap.",
      cta: "Testa din Omega-balans",
      ctaAlt1: "Beställ ditt test idag",
      ctaAlt2: "Få svar på 10 minuter",
      ctaSecondary: "Boka en konsultation",
    },
    problem: {
      title: "Varför spelar Omega-balansen roll?",
      text: "De flesta i Norden har en Omega 6:3-kvot som ligger långt över det rekommenderade. Det kan bidra till kronisk inflammation, som är kopplad till en rad hälsoproblem.",
      stat1: "15:1", stat1label: "Genomsnittlig kvot i väst",
      stat2: "3:1", stat2label: "Rekommenderad kvot",
      stat3: "97%", stat3label: "Är obalanserade utan att veta",
    },
    howItWorks: {
      title: "Så fungerar det",
      step1: "Beställ", step1desc: "Beställ ditt hemtest online – diskret och enkelt.",
      step2: "Testa", step2desc: "Ta ett enkelt blodprov hemma med ett stick i fingret.",
      step3: "Resultat", step3desc: "Få dina resultat digitalt inom några dagar.",
      step4: "Åtgärda", step4desc: "Få personliga rekommendationer baserat på dina värden.",
    },
    results: { title: "Vad visar dina resultat?", text: "Ditt test mäter 11 fettsyror och ger dig en tydlig bild av din Omega 6:3-kvot, cellmembranets skyddsfaktor och din inflammationsprofil." },
    cta: { title: "Redo att ta reda på din balans?", text: "Det tar bara 10 minuter. Inga nålar, inget labb.", button: "Beställ ditt test nu" },
    faq: {
      title: "Vanliga frågor",
      q1: "Hur fungerar testet?", a1: "Du tar ett enkelt blodprov hemma genom ett stick i fingret. Provet skickas till vårt labb i ett förfrankerat kuvert.",
      q2: "Är detta ett kosttillskott?", a2: "Nej. Detta är ett vetenskapligt test som mäter dina fettsyranivåer. Vi säljer inte kosttillskott.",
      q3: "Hur lång tid tar det att få resultat?", a3: "Du får dina resultat digitalt inom 10–20 arbetsdagar.",
      q4: "Kan jag bli partner?", a4: "Ja! Vi söker alltid nya partners. Klicka på 'Bli partner' för mer information.",
    },
    lead: { title: "Testa din Omega-balans", name: "Namn", email: "E-post", phone: "Telefon", submit: "Skicka", success: "Tack! Vi hör av oss snart." },
    partner: {
      pageTitle: "Bli partner",
      headline: "Bygg ett nätverk kring hälsotestning",
      sub: "Bli en del av vår växande nordiska gemenskap. Hjälp människor att förstå sin hälsa – och bygg en verksamhet samtidigt.",
      benefit1: "Egen referenslänk", benefit1desc: "Få en unik länk att dela. Spåra alla besökare, leads och kunder automatiskt.",
      benefit2: "Dashboard i realtid", benefit2desc: "Se dina resultat direkt – besökare, leads, bokningar och provisioner.",
      benefit3: "Utbildning & support", benefit3desc: "Få tillgång till material, utbildning och personlig support.",
      signupTitle: "Registrera dig som partner",
      name: "Namn", email: "E-post", phone: "Telefon", company: "Företag (valfritt)", submit: "Bli partner", success: "Tack! Vi kontaktar dig inom kort.",
    },
    dashboard: { title: "Partner Dashboard", visitors: "Besökare", leads: "Leads", bookings: "Bokningar", customers: "Kunder", recent: "Senaste leads", performance: "Prestanda" },
    footer: { rights: "Alla rättigheter förbehållna.", privacy: "Integritetspolicy", terms: "Villkor" },
  },
  no: {
    nav: { home: "Hjem", howItWorks: "Slik fungerer det", partners: "Bli partner", dashboard: "Dashboard" },
    hero: {
      headline: "Hva er din Omega-balanse?",
      headlineAlt1: "Oppdag ditt Omega 6:3-forhold",
      headlineAlt2: "Er kroppen din i balanse?",
      sub: "En enkel vitenskapelig test som avslører kroppens inflammasjonsbalanse. Ingen kosttilskudd – bare kunnskap.",
      cta: "Test din Omega-balanse",
      ctaAlt1: "Bestill testen din i dag",
      ctaAlt2: "Få svar på 10 minutter",
      ctaSecondary: "Book en konsultasjon",
    },
    problem: {
      title: "Hvorfor er Omega-balansen viktig?",
      text: "De fleste i Norden har et Omega 6:3-forhold som ligger langt over det anbefalte. Det kan bidra til kronisk betennelse, som er knyttet til en rekke helseproblemer.",
      stat1: "15:1", stat1label: "Gjennomsnittlig forhold i vest",
      stat2: "3:1", stat2label: "Anbefalt forhold",
      stat3: "97%", stat3label: "Er ubalanserte uten å vite det",
    },
    howItWorks: {
      title: "Slik fungerer det",
      step1: "Bestill", step1desc: "Bestill hjemmetesten din online – diskret og enkelt.",
      step2: "Test", step2desc: "Ta en enkel blodprøve hjemme med et stikk i fingeren.",
      step3: "Resultat", step3desc: "Motta resultatene dine digitalt innen få dager.",
      step4: "Tiltak", step4desc: "Få personlige anbefalinger basert på verdiene dine.",
    },
    results: { title: "Hva viser resultatene dine?", text: "Testen måler 11 fettsyrer og gir deg et tydelig bilde av Omega 6:3-forholdet ditt, cellemembranbeskyttelsesfaktoren og inflammasjonsprofilen din." },
    cta: { title: "Klar til å finne ut balansen din?", text: "Det tar bare 10 minutter. Ingen nåler, intet laboratorium.", button: "Bestill testen din nå" },
    faq: {
      title: "Vanlige spørsmål",
      q1: "Hvordan fungerer testen?", a1: "Du tar en enkel blodprøve hjemme med et stikk i fingeren. Prøven sendes til vårt laboratorium i en ferdigfrankert konvolutt.",
      q2: "Er dette et kosttilskudd?", a2: "Nei. Dette er en vitenskapelig test som måler fettsyrenivåene dine. Vi selger ikke kosttilskudd.",
      q3: "Hvor lang tid tar det å få resultater?", a3: "Du mottar resultatene digitalt innen 10–20 virkedager.",
      q4: "Kan jeg bli partner?", a4: "Ja! Vi søker alltid nye partnere. Klikk på 'Bli partner' for mer informasjon.",
    },
    lead: { title: "Test din Omega-balanse", name: "Navn", email: "E-post", phone: "Telefon", submit: "Send", success: "Takk! Vi tar kontakt snart." },
    partner: {
      pageTitle: "Bli partner",
      headline: "Bygg et nettverk rundt helsetesting",
      sub: "Bli en del av vårt voksende nordiske fellesskap. Hjelp folk med å forstå helsen sin – og bygg en virksomhet samtidig.",
      benefit1: "Egen referanselenke", benefit1desc: "Få en unik lenke å dele. Spor alle besøkende, leads og kunder automatisk.",
      benefit2: "Dashboard i sanntid", benefit2desc: "Se resultatene dine direkte – besøkende, leads, bestillinger og provisjoner.",
      benefit3: "Opplæring & support", benefit3desc: "Få tilgang til materialer, opplæring og personlig support.",
      signupTitle: "Registrer deg som partner",
      name: "Navn", email: "E-post", phone: "Telefon", company: "Selskap (valgfritt)", submit: "Bli partner", success: "Takk! Vi kontakter deg snart.",
    },
    dashboard: { title: "Partner Dashboard", visitors: "Besøkende", leads: "Leads", bookings: "Bestillinger", customers: "Kunder", recent: "Siste leads", performance: "Ytelse" },
    footer: { rights: "Alle rettigheter forbeholdt.", privacy: "Personvern", terms: "Vilkår" },
  },
  da: {
    nav: { home: "Hjem", howItWorks: "Sådan virker det", partners: "Bliv partner", dashboard: "Dashboard" },
    hero: {
      headline: "Hvad er din Omega-balance?",
      headlineAlt1: "Opdag dit Omega 6:3-forhold",
      headlineAlt2: "Er din krop i balance?",
      sub: "En enkel videnskabelig test, der afslører din krops inflammationsbalance. Ingen kosttilskud – kun viden.",
      cta: "Test din Omega-balance",
      ctaAlt1: "Bestil din test i dag",
      ctaAlt2: "Få svar på 10 minutter",
      ctaSecondary: "Book en konsultation",
    },
    problem: {
      title: "Hvorfor er Omega-balancen vigtig?",
      text: "De fleste i Norden har et Omega 6:3-forhold, der ligger langt over det anbefalede. Det kan bidrage til kronisk inflammation, som er forbundet med en række sundhedsproblemer.",
      stat1: "15:1", stat1label: "Gennemsnitligt forhold i vest",
      stat2: "3:1", stat2label: "Anbefalet forhold",
      stat3: "97%", stat3label: "Er ubalancerede uden at vide det",
    },
    howItWorks: {
      title: "Sådan virker det",
      step1: "Bestil", step1desc: "Bestil din hjemmetest online – diskret og nemt.",
      step2: "Test", step2desc: "Tag en enkel blodprøve derhjemme med et stik i fingeren.",
      step3: "Resultat", step3desc: "Modtag dine resultater digitalt inden for få dage.",
      step4: "Handling", step4desc: "Få personlige anbefalinger baseret på dine værdier.",
    },
    results: { title: "Hvad viser dine resultater?", text: "Din test måler 11 fedtsyrer og giver dig et tydeligt billede af dit Omega 6:3-forhold, cellemembranens beskyttelsesfaktor og din inflammationsprofil." },
    cta: { title: "Klar til at finde ud af din balance?", text: "Det tager kun 10 minutter. Ingen nåle, intet laboratorium.", button: "Bestil din test nu" },
    faq: {
      title: "Ofte stillede spørgsmål",
      q1: "Hvordan fungerer testen?", a1: "Du tager en enkel blodprøve derhjemme med et stik i fingeren. Prøven sendes til vores laboratorium i en frankeret kuvert.",
      q2: "Er dette et kosttilskud?", a2: "Nej. Dette er en videnskabelig test, der måler dine fedtsyreniveauer. Vi sælger ikke kosttilskud.",
      q3: "Hvor lang tid tager det at få resultater?", a3: "Du modtager dine resultater digitalt inden for 10–20 hverdage.",
      q4: "Kan jeg blive partner?", a4: "Ja! Vi søger altid nye partnere. Klik på 'Bliv partner' for mere information.",
    },
    lead: { title: "Test din Omega-balance", name: "Navn", email: "E-mail", phone: "Telefon", submit: "Send", success: "Tak! Vi kontakter dig snart." },
    partner: {
      pageTitle: "Bliv partner",
      headline: "Byg et netværk omkring sundhedstest",
      sub: "Bliv en del af vores voksende nordiske fællesskab. Hjælp folk med at forstå deres sundhed – og byg en virksomhed samtidig.",
      benefit1: "Egen henvisningslink", benefit1desc: "Få et unikt link at dele. Spor alle besøgende, leads og kunder automatisk.",
      benefit2: "Dashboard i realtid", benefit2desc: "Se dine resultater direkte – besøgende, leads, bestillinger og provisioner.",
      benefit3: "Uddannelse & support", benefit3desc: "Få adgang til materialer, uddannelse og personlig support.",
      signupTitle: "Tilmeld dig som partner",
      name: "Navn", email: "E-mail", phone: "Telefon", company: "Virksomhed (valgfrit)", submit: "Bliv partner", success: "Tak! Vi kontakter dig snart.",
    },
    dashboard: { title: "Partner Dashboard", visitors: "Besøgende", leads: "Leads", bookings: "Bestillinger", customers: "Kunder", recent: "Seneste leads", performance: "Ydeevne" },
    footer: { rights: "Alle rettigheder forbeholdes.", privacy: "Privatlivspolitik", terms: "Vilkår" },
  },
  fi: {
    nav: { home: "Etusivu", howItWorks: "Näin se toimii", partners: "Ryhdy kumppaniksi", dashboard: "Hallintapaneeli" },
    hero: {
      headline: "Mikä on Omega-tasapainosi?",
      headlineAlt1: "Selvitä Omega 6:3-suhteesi",
      headlineAlt2: "Onko kehosi tasapainossa?",
      sub: "Yksinkertainen tieteellinen testi, joka paljastaa kehosi tulehdustasapainon. Ei ravintolisää – vain tietoa.",
      cta: "Testaa Omega-tasapainosi",
      ctaAlt1: "Tilaa testisi tänään",
      ctaAlt2: "Saat vastauksen 10 minuutissa",
      ctaSecondary: "Varaa konsultaatio",
    },
    problem: {
      title: "Miksi Omega-tasapaino on tärkeä?",
      text: "Useimmilla Pohjoismaissa asuvilla Omega 6:3-suhde on huomattavasti suositeltua korkeampi. Tämä voi edistää kroonista tulehdusta, joka on yhteydessä moniin terveysongelmiin.",
      stat1: "15:1", stat1label: "Keskimääräinen suhde lännessä",
      stat2: "3:1", stat2label: "Suositeltu suhde",
      stat3: "97%", stat3label: "On epätasapainossa tietämättään",
    },
    howItWorks: {
      title: "Näin se toimii",
      step1: "Tilaa", step1desc: "Tilaa kotiitestisi verkosta – huomaamattomasti ja helposti.",
      step2: "Testaa", step2desc: "Ota yksinkertainen verinäyte kotona sormenpäästä.",
      step3: "Tulokset", step3desc: "Saat tuloksesi digitaalisesti muutamassa päivässä.",
      step4: "Toimi", step4desc: "Saat henkilökohtaisia suosituksia arvojesi perusteella.",
    },
    results: { title: "Mitä tuloksesi kertovat?", text: "Testisi mittaa 11 rasvahappoa ja antaa selkeän kuvan Omega 6:3-suhteestasi, solukalvon suojatekijästä ja tulehdusprofiilistasi." },
    cta: { title: "Valmis selvittämään tasapainosi?", text: "Se vie vain 10 minuuttia. Ei neuloja, ei laboratoriota.", button: "Tilaa testisi nyt" },
    faq: {
      title: "Usein kysytyt kysymykset",
      q1: "Miten testi toimii?", a1: "Otat yksinkertaisen verinäytteen kotona sormenpäästä. Näyte lähetetään laboratoriumiimme valmiiksi maksetussa kirjekuoressa.",
      q2: "Onko tämä ravintolisä?", a2: "Ei. Tämä on tieteellinen testi, joka mittaa rasvahappotasojasi. Emme myy ravintolisiä.",
      q3: "Kuinka kauan tulosten saaminen kestää?", a3: "Saat tuloksesi digitaalisesti 10–20 arkipäivässä.",
      q4: "Voinko ryhtyä kumppaniksi?", a4: "Kyllä! Etsimme aina uusia kumppaneita. Napsauta 'Ryhdy kumppaniksi' saadaksesi lisätietoja.",
    },
    lead: { title: "Testaa Omega-tasapainosi", name: "Nimi", email: "Sähköposti", phone: "Puhelin", submit: "Lähetä", success: "Kiitos! Otamme yhteyttä pian." },
    partner: {
      pageTitle: "Ryhdy kumppaniksi",
      headline: "Rakenna verkosto terveystestauksen ympärille",
      sub: "Liity kasvavaan pohjoismaiseen yhteisöömme. Auta ihmisiä ymmärtämään terveyttään – ja rakenna samalla liiketoimintaa.",
      benefit1: "Oma viittauslinkki", benefit1desc: "Saat uniikin linkin jaettavaksi. Seuraa kaikkia kävijöitä, liidejä ja asiakkaita automaattisesti.",
      benefit2: "Reaaliaikainen hallintapaneeli", benefit2desc: "Näe tuloksesi suoraan – kävijät, liidit, varaukset ja provisiot.",
      benefit3: "Koulutus & tuki", benefit3desc: "Pääsy materiaaleihin, koulutukseen ja henkilökohtaiseen tukeen.",
      signupTitle: "Rekisteröidy kumppaniksi",
      name: "Nimi", email: "Sähköposti", phone: "Puhelin", company: "Yritys (valinnainen)", submit: "Ryhdy kumppaniksi", success: "Kiitos! Otamme yhteyttä pian.",
    },
    dashboard: { title: "Kumppanin hallintapaneeli", visitors: "Kävijät", leads: "Liidit", bookings: "Varaukset", customers: "Asiakkaat", recent: "Viimeisimmät liidit", performance: "Suorituskyky" },
    footer: { rights: "Kaikki oikeudet pidätetään.", privacy: "Tietosuojakäytäntö", terms: "Ehdot" },
  },
  en: {
    nav: { home: "Home", howItWorks: "How it works", partners: "Become a partner", dashboard: "Dashboard" },
    hero: {
      headline: "What is your Omega balance?",
      headlineAlt1: "Discover your Omega 6:3 ratio",
      headlineAlt2: "Is your body in balance?",
      sub: "A simple scientific test that reveals your body's inflammation balance. No supplement – just knowledge.",
      cta: "Test your Omega balance",
      ctaAlt1: "Order your test today",
      ctaAlt2: "Get answers in 10 minutes",
      ctaSecondary: "Book a consultation",
    },
    problem: {
      title: "Why does Omega balance matter?",
      text: "Most people in the Nordics have an Omega 6:3 ratio far above the recommended level. This can contribute to chronic inflammation, linked to a range of health issues.",
      stat1: "15:1", stat1label: "Average ratio in the West",
      stat2: "3:1", stat2label: "Recommended ratio",
      stat3: "97%", stat3label: "Are imbalanced without knowing",
    },
    howItWorks: {
      title: "How it works",
      step1: "Order", step1desc: "Order your home test online – discreet and simple.",
      step2: "Test", step2desc: "Take a simple blood sample at home with a finger prick.",
      step3: "Results", step3desc: "Receive your results digitally within a few days.",
      step4: "Act", step4desc: "Get personalized recommendations based on your values.",
    },
    results: { title: "What do your results show?", text: "Your test measures 11 fatty acids and gives you a clear picture of your Omega 6:3 ratio, cell membrane protection factor, and your inflammation profile." },
    cta: { title: "Ready to find out your balance?", text: "It only takes 10 minutes. No needles, no lab.", button: "Order your test now" },
    faq: {
      title: "Frequently asked questions",
      q1: "How does the test work?", a1: "You take a simple blood sample at home with a finger prick. The sample is sent to our lab in a prepaid envelope.",
      q2: "Is this a supplement?", a2: "No. This is a scientific test that measures your fatty acid levels. We do not sell supplements.",
      q3: "How long does it take to get results?", a3: "You receive your results digitally within 10–20 business days.",
      q4: "Can I become a partner?", a4: "Yes! We're always looking for new partners. Click 'Become a partner' for more information.",
    },
    lead: { title: "Test your Omega balance", name: "Name", email: "Email", phone: "Phone", submit: "Submit", success: "Thank you! We'll be in touch soon." },
    partner: {
      pageTitle: "Become a partner",
      headline: "Build a network around health testing",
      sub: "Join our growing Nordic community. Help people understand their health – and build a business at the same time.",
      benefit1: "Your own referral link", benefit1desc: "Get a unique link to share. Track all visitors, leads, and customers automatically.",
      benefit2: "Real-time dashboard", benefit2desc: "See your results live – visitors, leads, bookings, and commissions.",
      benefit3: "Training & support", benefit3desc: "Access materials, training, and personal support.",
      signupTitle: "Sign up as a partner",
      name: "Name", email: "Email", phone: "Phone", company: "Company (optional)", submit: "Become a partner", success: "Thank you! We'll contact you shortly.",
    },
    dashboard: { title: "Partner Dashboard", visitors: "Visitors", leads: "Leads", bookings: "Bookings", customers: "Customers", recent: "Recent leads", performance: "Performance" },
    footer: { rights: "All rights reserved.", privacy: "Privacy Policy", terms: "Terms" },
  },
};

export function t(lang: Lang) {
  return translations[lang] || translations[defaultLang];
}
