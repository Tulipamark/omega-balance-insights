export type Lang = "sv" | "no" | "da" | "fi" | "en" | "de" | "fr" | "it";

export const defaultLang: Lang = "sv";

export const supportedLangs: Lang[] = ["sv", "no", "da", "fi", "en", "de", "fr", "it"];

export const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

type Copy = {
  hero: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    statLab: string;
    statTiming: string;
    imageAlt: string;
  };
  problem: {
    title: string;
    body: string;
    cards: { title: string; description: string }[];
  };
  howItWorks: {
    title: string;
    body: string;
    steps: { numberLabel: string; title: string; description: string }[];
  };
  analysis: {
    title: string;
    body: string;
    items: { title: string; description: string }[];
  };
  results: {
    title: string;
    titleAccent: string;
    body: string;
    bullets: string[];
    ratioLabel: string;
    ratioTarget: string;
    omega6: string;
    omega3: string;
    recommendationTitle: string;
    recommendationBody: string;
  };
  video: {
    title: string;
    body: string;
    placeholder: string;
  };
  lead: {
    title: string;
    body: string;
    successTitle: string;
    successBody: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    orderCta: string;
    consultationCta: string;
    successIconLabel: string;
  };
  testimonials: {
    title: string;
    items: { quote: string; name: string; role: string }[];
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  abTesting: {
    badge: string;
    title: string;
    body: string;
    headlinesLabel: string;
    ctasLabel: string;
    headlines: string[];
    ctas: string[];
  };
  sticky: {
    text: string;
    cta: string;
  };
  footer: {
    tagline: string;
    rights: string;
    privacy: string;
    terms: string;
    contact: string;
  };
};

const translations: Record<Lang, Copy> = {
  sv: {
    hero: {
      badge: "Vetenskaplig fettsyreanalys",
      titleStart: "Känner du till din",
      titleAccent: "Omega-balans?",
      body: "De flesta har en obalans mellan Omega-6 och Omega-3. Ett enkelt blodprov hemma kan visa din exakta kvot.",
      primaryCta: "Testa din Omega-balans",
      secondaryCta: "Så fungerar testet",
      statLab: "Certifierad laboratorieanalys",
      statTiming: "Resultat efter cirka 3 veckor",
      imageAlt: "Översikt över omegaanalys och fettsyredata",
    },
    problem: {
      title: "Problemet de flesta inte ser",
      body: "Din kropps fettsyrebalans påverkar hur du mår, återhämtar dig och åldras. Men utan data är den osynlig.",
      cards: [
        {
          title: "För mycket Omega-6",
          description: "Modern kost innehåller mycket processad mat och vegetabiliska oljor, vilket ofta driver upp Omega-6-nivåerna långt över kroppens behov.",
        },
        {
          title: "Dold obalans",
          description: "Obalansen mellan Omega-6 och Omega-3 kan påverka inflammationsprocesser och långsiktig hälsa.",
        },
        {
          title: "Antaganden i stället för data",
          description: "Många tror att deras fettsyrenivåer är bra tills de faktiskt mäter dem med ett validerat blodtest.",
        },
      ],
    },
    howItWorks: {
      title: "Så fungerar testet",
      body: "Tre enkla steg för att förstå din Omega-balans.",
      steps: [
        {
          numberLabel: "STEG 01",
          title: "Ta provet",
          description: "Ta ett litet blodprov hemma med det medföljande stick-i-fingret-kitet. Snabbt, säkert och enkelt.",
        },
        {
          numberLabel: "STEG 02",
          title: "Skicka till labbet",
          description: "Skicka provet till ett certifierat laboratorium i det förbetalda returkuvertet.",
        },
        {
          numberLabel: "STEG 03",
          title: "Få dina resultat",
          description: "Få en detaljerad digital analys av din fettsyrebalans efter cirka 3 veckor.",
        },
      ],
    },
    analysis: {
      title: "Vad analysen visar",
      body: "Ditt blod berättar en historia. Testet översätter den till tydlig och användbar data.",
      items: [
        {
          title: "Omega-6 / Omega-3-kvot",
          description: "Din exakta balans mellan proinflammatoriska och antiinflammatoriska fettsyror. En optimal kvot ligger ofta nära 3:1.",
        },
        {
          title: "Fettsyrasammansättning",
          description: "En detaljerad bild av fettsyraprofilen i dina cellmembran, som speglar flera månaders kostmönster.",
        },
        {
          title: "Personliga insikter",
          description: "Handfasta rekommendationer baserade på dina resultat, så att du förstår vad siffrorna betyder för din hälsa.",
        },
      ],
    },
    results: {
      title: "Dina resultat,",
      titleAccent: "tydligt förklarade",
      body: "Ingen jargong. Inget gissande. Du får en omfattande digital rapport som ger dig klarhet att fatta välgrundade beslut om din hälsa.",
      bullets: [
        "En detaljerad digital rapport direkt till din inkorg",
        "Din exakta Omega-6 / Omega-3-kvot visualiserad",
        "Evidensbaserad vägledning för förbättring",
      ],
      ratioLabel: "Din Omega-kvot",
      ratioTarget: "Optimalt mål: cirka 3:1",
      omega6: "Omega-6",
      omega3: "Omega-3",
      recommendationTitle: "Rekommendation",
      recommendationBody: "Din kvot visar att det finns utrymme för förbättring. Överväg att öka intaget av marina Omega-3-källor och minska processade fröoljor.",
    },
    video: {
      title: "Se hur det fungerar på 2 minuter",
      body: "En kort genomgång av testprocessen och vad dina resultat betyder.",
      placeholder: "Videoplatshållare - lägg till din förklaringsvideo här",
    },
    lead: {
      title: "Redo att få svar?",
      body: "Fyll i dina uppgifter för att beställa testet eller boka en kostnadsfri konsultation på 10 minuter.",
      successTitle: "Tack!",
      successBody: "Vi hör av oss snart med nästa steg.",
      nameLabel: "Namn",
      namePlaceholder: "Ditt fullständiga namn",
      emailLabel: "E-post",
      emailPlaceholder: "du@exempel.se",
      phoneLabel: "Telefon",
      phonePlaceholder: "+46 70 000 00 00",
      orderCta: "Beställ testet",
      consultationCta: "Boka konsultation",
      successIconLabel: "Klart",
    },
    testimonials: {
      title: "Vad människor upptäcker",
      items: [
        {
          quote: "Jag hade ingen aning om att min kvot var 12:1. Testet blev en väckarklocka. Jag ändrade kosten och var nere på 4:1 efter sex månader.",
          name: "Maria K.",
          role: "Hälsomedveten yrkesperson, 42",
        },
        {
          quote: "Som person som mäter allt fyllde det här en stor blind fläck. Rapporten var tydlig, vetenskaplig och faktiskt användbar.",
          name: "Thomas R.",
          role: "Biohacker och uthållighetsidrottare, 38",
        },
        {
          quote: "Jag rekommenderar detta till alla mina klienter. Det är det enklaste sättet att se vad som pågår under ytan.",
          name: "Dr. Anna L.",
          role: "Funktionsmedicinsk behandlare",
        },
      ],
    },
    faq: {
      title: "Vanliga frågor",
      items: [
        {
          q: "Hur utförs testet?",
          a: "Du tar ett litet blodprov hemma med ett enkelt stick-i-fingret-kit. Processen tar mindre än 5 minuter och kräver ingen medicinsk erfarenhet.",
        },
        {
          q: "Hur lång tid tar analysen?",
          a: "När provet har nått laboratoriet är resultaten vanligtvis klara efter cirka 3 veckor. Du får en avisering när rapporten är färdig.",
        },
        {
          q: "Är testet säkert?",
          a: "Ja. Stick-i-fingret-metoden används brett inom diagnostik och är minimalt invasiv. Kitet innehåller tydliga instruktioner och allt material som behövs.",
        },
        {
          q: "Vad händer efter att jag fått resultaten?",
          a: "Du får en digital rapport med din fettsyraprofil, din Omega-6/Omega-3-kvot och personliga rekommendationer. Du kan också boka en uppföljande konsultation.",
        },
        {
          q: "Behöver jag remiss från läkare?",
          a: "Nej, ingen remiss behövs. Testet är utformat för direkt användning av konsumenter. Vi rekommenderar ändå att du delar resultaten med din vårdgivare.",
        },
      ],
    },
    abTesting: {
      badge: "Bonus: A/B-testning",
      title: "Alternativ copy för testning",
      body: "Tre variationer av rubrik och CTA för att optimera konvertering.",
      headlinesLabel: "Rubriker",
      ctasLabel: "Call to action-knappar",
      headlines: [
        "Känner du till din Omega-balans?",
        "Siffran som kan förändra hur du äter.",
        "Mät det som betyder något. Börja med din Omega-kvot.",
      ],
      ctas: ["Testa din Omega-balans", "Upptäck din kvot", "Få din personliga analys"],
    },
    sticky: {
      text: "Upptäck din Omega-6 / Omega-3-kvot idag",
      cta: "Testa din Omega-balans",
    },
    footer: {
      tagline: "Vetenskaplig fettsyreanalys.",
      rights: "Alla rättigheter förbehållna.",
      privacy: "Integritet",
      terms: "Villkor",
      contact: "Kontakt",
    },
  },
  no: {
    hero: {
      badge: "Vitenskapelig fettsyreanalysering",
      titleStart: "Kjenner du din",
      titleAccent: "Omega-balanse?",
      body: "De fleste har en ubalanse mellom Omega-6 og Omega-3. En enkel blodprøve hjemme kan vise ditt eksakte forhold.",
      primaryCta: "Test din Omega-balanse",
      secondaryCta: "Slik fungerer testen",
      statLab: "Sertifisert laboratorieanalyse",
      statTiming: "Resultater etter cirka 3 uker",
      imageAlt: "Oversikt over omegaanalyse og fettsyredata",
    },
    problem: {
      title: "Problemet de fleste ikke ser",
      body: "Kroppens fettsyrebalanse påvirker hvordan du føler deg, restituerer og eldes. Uten data er den usynlig.",
      cards: [
        {
          title: "For mye Omega-6",
          description: "Moderne kosthold inneholder mye prosessert mat og planteoljer, noe som ofte gir Omega-6-nivåer langt over kroppens behov.",
        },
        {
          title: "Skjult ubalanse",
          description: "Ubalansen mellom Omega-6 og Omega-3 kan påvirke betennelsesprosesser og langsiktig helse.",
        },
        {
          title: "Antakelser i stedet for data",
          description: "Mange tror fettsyrenivåene deres er fine helt til de faktisk måler dem med en validert blodprøve.",
        },
      ],
    },
    howItWorks: {
      title: "Slik fungerer testen",
      body: "Tre enkle steg for å forstå din Omega-balanse.",
      steps: [
        {
          numberLabel: "STEG 01",
          title: "Ta prøven",
          description: "Ta en liten blodprøve hjemme med det medfølgende fingerstikksettet. Raskt, trygt og enkelt.",
        },
        {
          numberLabel: "STEG 02",
          title: "Send til laboratoriet",
          description: "Send prøven til et sertifisert laboratorium i den forhåndsbetalte returkonvolutten.",
        },
        {
          numberLabel: "STEG 03",
          title: "Få resultatene",
          description: "Motta en detaljert digital analyse av fettsyrebalansen din etter cirka 3 uker.",
        },
      ],
    },
    analysis: {
      title: "Hva analysen viser",
      body: "Blodet ditt forteller en historie. Testen oversetter den til tydelige og nyttige data.",
      items: [
        {
          title: "Omega-6 / Omega-3-forhold",
          description: "Din eksakte balanse mellom proinflammatoriske og antiinflammatoriske fettsyrer. Et optimalt forhold ligger ofte nær 3:1.",
        },
        {
          title: "Fettsyresammensetning",
          description: "En detaljert oversikt over fettsyreprofilen i cellemembranene dine, som gjenspeiler flere måneders kostholdsmønstre.",
        },
        {
          title: "Personlige innsikter",
          description: "Konkrete råd tilpasset resultatene dine, slik at du forstår hva tallene betyr for helsen din.",
        },
      ],
    },
    results: {
      title: "Resultatene dine,",
      titleAccent: "tydelig forklart",
      body: "Ingen fagjargon. Ingen gjetting. Du får en omfattende digital rapport som gjør det lettere å ta gode valg for helsen din.",
      bullets: [
        "En detaljert digital rapport sendt rett til innboksen din",
        "Ditt eksakte Omega-6 / Omega-3-forhold visualisert",
        "Evidensbasert veiledning for forbedring",
      ],
      ratioLabel: "Ditt Omega-forhold",
      ratioTarget: "Optimalt mål: cirka 3:1",
      omega6: "Omega-6",
      omega3: "Omega-3",
      recommendationTitle: "Anbefaling",
      recommendationBody: "Forholdet ditt viser at det er rom for forbedring. Vurder å øke inntaket av marine Omega-3-kilder og redusere prosesserte frøoljer.",
    },
    video: {
      title: "Se hvordan det fungerer på 2 minutter",
      body: "En kort oversikt over testprosessen og hva resultatene dine betyr.",
      placeholder: "Videoplassholder - legg til forklaringsvideoen din her",
    },
    lead: {
      title: "Klar for å finne svaret?",
      body: "Fyll inn opplysningene dine for å bestille testen eller booke en gratis konsultasjon på 10 minutter.",
      successTitle: "Takk!",
      successBody: "Vi tar snart kontakt med neste steg.",
      nameLabel: "Navn",
      namePlaceholder: "Ditt fulle navn",
      emailLabel: "E-post",
      emailPlaceholder: "du@eksempel.no",
      phoneLabel: "Telefon",
      phonePlaceholder: "+47 400 00 000",
      orderCta: "Bestill testen",
      consultationCta: "Book konsultasjon",
      successIconLabel: "Ferdig",
    },
    testimonials: {
      title: "Hva folk oppdager",
      items: [
        {
          quote: "Jeg hadde ingen anelse om at forholdet mitt var 12:1. Denne testen ble en vekker. Jeg endret kostholdet og var nede på 4:1 etter seks måneder.",
          name: "Maria K.",
          role: "Helsebevisst fagperson, 42",
        },
        {
          quote: "Som en som måler alt, fylte dette et stort blindfelt. Rapporten var tydelig, vitenskapelig og faktisk nyttig.",
          name: "Thomas R.",
          role: "Biohacker og utholdenhetsutøver, 38",
        },
        {
          quote: "Jeg anbefaler dette til alle klientene mine. Det er den enkleste måten å se hva som skjer under overflaten.",
          name: "Dr. Anna L.",
          role: "Funksjonell medisinsk behandler",
        },
      ],
    },
    faq: {
      title: "Vanlige spørsmål",
      items: [
        {
          q: "Hvordan utføres testen?",
          a: "Du tar en liten blodprøve hjemme med et enkelt fingerstikksett. Prosessen tar mindre enn 5 minutter og krever ingen medisinsk erfaring.",
        },
        {
          q: "Hvor lang tid tar analysen?",
          a: "Når prøven har kommet til laboratoriet, er resultatene vanligvis klare etter cirka 3 uker. Du får beskjed når rapporten er klar.",
        },
        {
          q: "Er testen trygg?",
          a: "Ja. Fingerstikkmetoden brukes bredt i diagnostikk og er minimalt invasiv. Settet inneholder tydelige instruksjoner og alt nødvendig materiale.",
        },
        {
          q: "Hva skjer etter at jeg har fått resultatene?",
          a: "Du får en digital rapport med fettsyreprofilen din, Omega-6/Omega-3-forholdet og personlige anbefalinger. Du kan også booke en oppfølgingssamtale.",
        },
        {
          q: "Trenger jeg henvisning fra lege?",
          a: "Nei, ingen henvisning er nødvendig. Testen er laget for direkte bruk av forbrukere. Vi anbefaler likevel at du deler resultatene med helsepersonell.",
        },
      ],
    },
    abTesting: {
      badge: "Bonus: A/B-testing",
      title: "Alternativ tekst for testing",
      body: "Tre varianter av overskrift og CTA for å optimalisere konvertering.",
      headlinesLabel: "Overskrifter",
      ctasLabel: "Call to action-knapper",
      headlines: [
        "Kjenner du din Omega-balanse?",
        "Tallet som kan endre hvordan du spiser.",
        "Mål det som betyr noe. Start med Omega-forholdet ditt.",
      ],
      ctas: ["Test din Omega-balanse", "Oppdag forholdet ditt", "Få din personlige analyse"],
    },
    sticky: {
      text: "Oppdag ditt Omega-6 / Omega-3-forhold i dag",
      cta: "Test din Omega-balanse",
    },
    footer: {
      tagline: "Vitenskapelig fettsyreanalysering.",
      rights: "Alle rettigheter forbeholdt.",
      privacy: "Personvern",
      terms: "Vilkår",
      contact: "Kontakt",
    },
  },
  da: {
    hero: {
      badge: "Videnskabelig fedtsyreanalysering",
      titleStart: "Kender du din",
      titleAccent: "Omega-balance?",
      body: "De fleste har en ubalance mellem Omega-6 og Omega-3. En enkel blodprøve hjemme kan vise dit præcise forhold.",
      primaryCta: "Test din Omega-balance",
      secondaryCta: "Sådan fungerer testen",
      statLab: "Certificeret laboratorieanalyse",
      statTiming: "Resultater efter cirka 3 uger",
      imageAlt: "Oversigt over omegaanalyse og fedtsyredata",
    },
    problem: {
      title: "Problemet de fleste ikke ser",
      body: "Din krops fedtsyrebalance påvirker, hvordan du har det, restituerer og ældes. Men uden data er den usynlig.",
      cards: [
        { title: "For meget Omega-6", description: "Moderne kost indeholder meget forarbejdet mad og planteolier, hvilket ofte giver Omega-6-niveauer langt over kroppens behov." },
        { title: "Skjult ubalance", description: "Ubalancen mellem Omega-6 og Omega-3 kan påvirke inflammationsprocesser og langsigtet sundhed." },
        { title: "Antagelser i stedet for data", description: "Mange tror, at deres fedtsyreniveauer er fine, indtil de faktisk måler dem med en valideret blodprøve." },
      ],
    },
    howItWorks: {
      title: "Sådan fungerer testen",
      body: "Tre enkle trin til at forstå din Omega-balance.",
      steps: [
        { numberLabel: "TRIN 01", title: "Tag prøven", description: "Tag en lille blodprøve hjemme med det medfølgende fingerprik-kit. Hurtigt, sikkert og enkelt." },
        { numberLabel: "TRIN 02", title: "Send til laboratoriet", description: "Send prøven til et certificeret laboratorium i den forudbetalte returkuvert." },
        { numberLabel: "TRIN 03", title: "Få dine resultater", description: "Modtag en detaljeret digital analyse af din fedtsyrebalance efter cirka 3 uger." },
      ],
    },
    analysis: {
      title: "Hvad analysen afslører",
      body: "Dit blod fortæller en historie. Testen omsætter den til tydelige og brugbare data.",
      items: [
        { title: "Omega-6 / Omega-3-forhold", description: "Din præcise balance mellem proinflammatoriske og antiinflammatoriske fedtsyrer. Et optimalt forhold ligger ofte tæt på 3:1." },
        { title: "Fedtsyresammensætning", description: "En detaljeret oversigt over fedtsyreprofilen i dine cellemembraner, som afspejler flere måneders kostmønstre." },
        { title: "Personlige indsigter", description: "Konkrete anbefalinger baseret på dine resultater, så du forstår, hvad tallene betyder for dit helbred." },
      ],
    },
    results: {
      title: "Dine resultater,",
      titleAccent: "tydeligt forklaret",
      body: "Ingen jargon. Ingen gætterier. Du modtager en omfattende digital rapport, som giver dig klarhed til at træffe bedre beslutninger om dit helbred.",
      bullets: ["En detaljeret digital rapport sendt direkte til din indbakke", "Dit præcise Omega-6 / Omega-3-forhold visualiseret", "Evidensbaseret vejledning til forbedring"],
      ratioLabel: "Dit Omega-forhold",
      ratioTarget: "Optimalt mål: cirka 3:1",
      omega6: "Omega-6",
      omega3: "Omega-3",
      recommendationTitle: "Anbefaling",
      recommendationBody: "Dit forhold viser, at der er plads til forbedring. Overvej at øge indtaget af marine Omega-3-kilder og reducere forarbejdede frøolier.",
    },
    video: { title: "Se hvordan det fungerer på 2 minutter", body: "En kort introduktion til testforløbet og hvad dine resultater betyder.", placeholder: "Videoplads-holder - tilføj din forklaringsvideo her" },
    lead: {
      title: "Klar til at få svar?",
      body: "Indtast dine oplysninger for at bestille testen eller booke en gratis konsultation på 10 minutter.",
      successTitle: "Tak!",
      successBody: "Vi kontakter dig snart med næste skridt.",
      nameLabel: "Navn",
      namePlaceholder: "Dit fulde navn",
      emailLabel: "E-mail",
      emailPlaceholder: "dig@eksempel.dk",
      phoneLabel: "Telefon",
      phonePlaceholder: "+45 20 00 00 00",
      orderCta: "Bestil testen",
      consultationCta: "Book konsultation",
      successIconLabel: "Færdig",
    },
    testimonials: {
      title: "Hvad folk opdager",
      items: [
        { quote: "Jeg havde ingen idé om, at mit forhold var 12:1. Testen blev et wake-up call. Jeg ændrede min kost og kom ned på 4:1 efter seks måneder.", name: "Maria K.", role: "Sundhedsbevidst professionel, 42" },
        { quote: "Som en person der måler alt, udfyldte dette en stor blind vinkel. Rapporten var tydelig, videnskabelig og faktisk brugbar.", name: "Thomas R.", role: "Biohacker og udholdenhedsatlet, 38" },
        { quote: "Jeg anbefaler dette til alle mine klienter. Det er den enkleste måde at se, hvad der foregår under overfladen.", name: "Dr. Anna L.", role: "Funktionsmedicinsk behandler" },
      ],
    },
    faq: {
      title: "Ofte stillede spørgsmål",
      items: [
        { q: "Hvordan udføres testen?", a: "Du tager en lille blodprøve hjemme med et enkelt fingerprik-kit. Processen tager mindre end 5 minutter og kræver ingen medicinsk erfaring." },
        { q: "Hvor lang tid tager analysen?", a: "Når prøven er nået frem til laboratoriet, er resultaterne typisk klar efter cirka 3 uger. Du får besked, når rapporten er klar." },
        { q: "Er testen sikker?", a: "Ja. Fingerprik-metoden anvendes bredt i diagnostik og er minimalt invasiv. Kittet indeholder tydelige instruktioner og alt nødvendigt materiale." },
        { q: "Hvad sker der efter jeg har modtaget resultaterne?", a: "Du får en digital rapport med din fedtsyreprofil, dit Omega-6/Omega-3-forhold og personlige anbefalinger. Du kan også booke en opfølgende konsultation." },
        { q: "Behøver jeg en lægehenvisning?", a: "Nej, ingen henvisning er nødvendig. Testen er designet til direkte forbrug. Vi anbefaler dog, at du deler resultaterne med din sundhedsprofessionelle." },
      ],
    },
    abTesting: {
      badge: "Bonus: A/B-test",
      title: "Alternativ tekst til test",
      body: "Tre variationer af overskrift og CTA for at optimere konvertering.",
      headlinesLabel: "Overskrifter",
      ctasLabel: "Call to action-knapper",
      headlines: ["Kender du din Omega-balance?", "Tallet der kan ændre, hvordan du spiser.", "Mål det, der betyder noget. Start med dit Omega-forhold."],
      ctas: ["Test din Omega-balance", "Opdag dit forhold", "Få din personlige analyse"],
    },
    sticky: { text: "Opdag dit Omega-6 / Omega-3-forhold i dag", cta: "Test din Omega-balance" },
    footer: { tagline: "Videnskabelig fedtsyreanalysering.", rights: "Alle rettigheder forbeholdes.", privacy: "Privatliv", terms: "Vilkår", contact: "Kontakt" },
  },
  fi: {
    hero: {
      badge: "Tieteellinen rasvahappoanalyysi",
      titleStart: "Tiedätkö oman",
      titleAccent: "Omega-tasapainosi?",
      body: "Useimmilla on epätasapaino Omega-6:n ja Omega-3:n välillä. Yksinkertainen kotona tehtävä veritesti voi näyttää tarkan suhteesi.",
      primaryCta: "Testaa Omega-tasapainosi",
      secondaryCta: "Näin testi toimii",
      statLab: "Sertifioitu laboratorioanalyysi",
      statTiming: "Tulokset noin 3 viikossa",
      imageAlt: "Yleiskuva omega-analyysistä ja rasvahappodatasta",
    },
    problem: {
      title: "Ongelma, jota useimmat eivät näe",
      body: "Kehosi rasvahappotasapaino vaikuttaa oloosi, palautumiseesi ja ikääntymiseesi. Ilman dataa se jää näkymättömäksi.",
      cards: [
        { title: "Liikaa Omega-6:ta", description: "Nykyaikainen ruokavalio sisältää paljon prosessoitua ruokaa ja kasviöljyjä, mikä nostaa Omega-6-tasoja usein paljon yli kehon tarpeen." },
        { title: "Piilevä epätasapaino", description: "Omega-6:n ja Omega-3:n välinen epätasapaino voi vaikuttaa tulehdusreitteihin ja pitkän aikavälin terveyteen." },
        { title: "Oletuksia datan sijaan", description: "Moni olettaa rasvahappotasojensa olevan kunnossa, kunnes ne todella mitataan validoidulla veritestillä." },
      ],
    },
    howItWorks: {
      title: "Näin testi toimii",
      body: "Kolme helppoa vaihetta Omega-tasapainosi ymmärtämiseen.",
      steps: [
        { numberLabel: "VAIHE 01", title: "Ota näyte", description: "Ota pieni verinäyte kotona mukana tulevalla sormenpääpistopakkauksella. Nopea, turvallinen ja helppo." },
        { numberLabel: "VAIHE 02", title: "Lähetä laboratorioon", description: "Postita näyte sertifioituun laboratorioon valmiiksi maksetussa palautuskuoressa." },
        { numberLabel: "VAIHE 03", title: "Saat tulokset", description: "Saat yksityiskohtaisen digitaalisen analyysin rasvahappotasapainostasi noin 3 viikon kuluttua." },
      ],
    },
    analysis: {
      title: "Mitä analyysi paljastaa",
      body: "Veresi kertoo tarinan. Testi muuntaa sen selkeäksi ja hyödylliseksi tiedoksi.",
      items: [
        { title: "Omega-6 / Omega-3-suhde", description: "Tarkka tasapainosi tulehdusta edistävien ja hillitsevien rasvahappojen välillä. Optimaalinen suhde on usein lähellä 3:1:tä." },
        { title: "Rasvahappokoostumus", description: "Yksityiskohtainen erittely solukalvojesi rasvahappoprofiilista, joka heijastaa useiden kuukausien ruokailutottumuksia." },
        { title: "Henkilökohtaiset oivallukset", description: "Tuloksiisi perustuvat käytännölliset suositukset, joiden avulla ymmärrät mitä lukusi kertovat terveydestäsi." },
      ],
    },
    results: {
      title: "Tuloksesi,",
      titleAccent: "selkeästi selitettynä",
      body: "Ei jargonia. Ei arvailua. Saat kattavan digitaalisen raportin, joka auttaa sinua tekemään perusteltuja päätöksiä terveydestäsi.",
      bullets: ["Yksityiskohtainen digitaalinen raportti suoraan sähköpostiisi", "Tarkka Omega-6 / Omega-3-suhteesi visualisoituna", "Näyttöön perustuvaa ohjausta parantamiseen"],
      ratioLabel: "Omega-suhteesi",
      ratioTarget: "Optimaalinen tavoite: noin 3:1",
      omega6: "Omega-6",
      omega3: "Omega-3",
      recommendationTitle: "Suositus",
      recommendationBody: "Suhteesi osoittaa, että parannettavaa on. Harkitse merellisten Omega-3-lähteiden lisäämistä ja prosessoitujen siemenöljyjen vähentämistä.",
    },
    video: { title: "Katso miten se toimii 2 minuutissa", body: "Lyhyt katsaus testiprosessiin ja siihen, mitä tuloksesi tarkoittavat.", placeholder: "Videopaikanvaraaja - lisää esittelyvideosi tähän" },
    lead: {
      title: "Valmis saamaan vastaukset?",
      body: "Jätä yhteystietosi tilataksesi testin tai varataksesi maksuttoman 10 minuutin konsultaation.",
      successTitle: "Kiitos!",
      successBody: "Otamme pian yhteyttä seuraavista vaiheista.",
      nameLabel: "Nimi",
      namePlaceholder: "Koko nimesi",
      emailLabel: "Sähköposti",
      emailPlaceholder: "sinä@esimerkki.fi",
      phoneLabel: "Puhelin",
      phonePlaceholder: "+358 40 000 0000",
      orderCta: "Tilaa testi",
      consultationCta: "Varaa konsultaatio",
      successIconLabel: "Valmis",
    },
    testimonials: {
      title: "Mitä ihmiset oivaltavat",
      items: [
        { quote: "Minulla ei ollut aavistustakaan, että suhteeni oli 12:1. Tämä testi oli silmiä avaava. Muutin ruokavaliotani ja olin kuuden kuukauden jälkeen tasolla 4:1.", name: "Maria K.", role: "Terveystietoinen ammattilainen, 42" },
        { quote: "Ihmisenä, joka mittaa kaiken, tämä täytti suuren sokean pisteen. Raportti oli selkeä, tieteellinen ja oikeasti hyödyllinen.", name: "Thomas R.", role: "Biohakkeri ja kestävyysurheilija, 38" },
        { quote: "Suosittelen tätä kaikille asiakkailleni. Se on yksinkertaisin tapa nähdä, mitä pinnan alla tapahtuu.", name: "Dr. Anna L.", role: "Funktionaalisen lääketieteen ammattilainen" },
      ],
    },
    faq: {
      title: "Usein kysytyt kysymykset",
      items: [
        { q: "Miten testi tehdään?", a: "Otat pienen verinäytteen kotona yksinkertaisella sormenpääpistopakkauksella. Prosessi kestää alle 5 minuuttia eikä vaadi lääketieteellistä osaamista." },
        { q: "Kuinka kauan analyysi kestää?", a: "Kun näyte on saapunut laboratorioon, tulokset ovat yleensä valmiit noin 3 viikon kuluttua. Saat ilmoituksen, kun raportti on valmis." },
        { q: "Onko testi turvallinen?", a: "Kyllä. Sormenpääpistomenetelmä on laajalti käytössä diagnostiikassa ja on vain vähän invasiivinen. Pakkaus sisältää selkeät ohjeet ja kaikki tarvittavat materiaalit." },
        { q: "Mitä tapahtuu, kun saan tulokseni?", a: "Saat digitaalisen raportin rasvahappoprofiilistasi, Omega-6/Omega-3-suhteestasi ja henkilökohtaisista suosituksista. Voit myös varata jatkokonsultaation." },
        { q: "Tarvitsenko lääkärin lähetteen?", a: "Et tarvitse. Testi on suunniteltu suoraan kuluttajille. Silti suosittelemme jakamaan tulokset terveydenhuollon ammattilaiselle kokonaiskuvan saamiseksi." },
      ],
    },
    abTesting: {
      badge: "Bonus: A/B-testaus",
      title: "Vaihtoehtoinen teksti testaukseen",
      body: "Kolme otsikko- ja CTA-vaihtoehtoa konversion optimointiin.",
      headlinesLabel: "Otsikot",
      ctasLabel: "Call to action -painikkeet",
      headlines: ["Tiedätkö oman Omega-tasapainosi?", "Numero, joka voi muuttaa tapaasi syödä.", "Mittaa se, mikä merkitsee. Aloita Omega-suhteestasi."],
      ctas: ["Testaa Omega-tasapainosi", "Selvitä suhteesi", "Saat henkilökohtaisen analyysisi"],
    },
    sticky: { text: "Selvitä Omega-6 / Omega-3-suhteesi tänään", cta: "Testaa Omega-tasapainosi" },
    footer: { tagline: "Tieteellinen rasvahappoanalyysi.", rights: "Kaikki oikeudet pidätetään.", privacy: "Tietosuoja", terms: "Ehdot", contact: "Yhteystiedot" },
  },
  en: {
    hero: {
      badge: "Scientific Fatty Acid Analysis",
      titleStart: "Do you know your",
      titleAccent: "Omega balance?",
      body: "Most people have an imbalance between Omega-6 and Omega-3. A simple home blood test can reveal your exact ratio.",
      primaryCta: "Test your Omega balance",
      secondaryCta: "How the test works",
      statLab: "Certified lab analysis",
      statTiming: "Results after around 3 weeks",
      imageAlt: "Omega balance analysis dashboard showing fatty acid ratio data",
    },
    problem: {
      title: "The problem most people don't see",
      body: "Your body's fatty acid balance plays a critical role in how you feel, recover, and age. But without data, it's invisible.",
      cards: [
        { title: "Excessive Omega-6", description: "Modern diets are rich in processed foods and vegetable oils, often resulting in Omega-6 levels far above what the body needs." },
        { title: "Hidden imbalance", description: "This imbalance between Omega-6 and Omega-3 can influence inflammation pathways and long-term health outcomes." },
        { title: "Assumptions vs. data", description: "Many people assume their fatty acid levels are fine until they measure them with a validated blood test." },
      ],
    },
    howItWorks: {
      title: "How the test works",
      body: "Three simple steps to understand your Omega balance.",
      steps: [
        { numberLabel: "STEP 01", title: "Collect your sample", description: "Take a small blood sample at home using the included finger-prick kit. Quick, safe, and painless." },
        { numberLabel: "STEP 02", title: "Send to the lab", description: "Mail your sample to a certified laboratory using the prepaid return envelope." },
        { numberLabel: "STEP 03", title: "Get your results", description: "Receive a detailed digital analysis of your fatty acid balance after around 3 weeks." },
      ],
    },
    analysis: {
      title: "What the analysis reveals",
      body: "Your blood tells a story. The test translates it into clear, actionable data.",
      items: [
        { title: "Omega-6 / Omega-3 ratio", description: "Your exact balance between pro-inflammatory and anti-inflammatory fatty acids. An optimal ratio is often close to 3:1." },
        { title: "Fatty acid composition", description: "A detailed breakdown of your cell membrane fatty acid profile, reflecting months of dietary patterns." },
        { title: "Personalized insights", description: "Actionable guidance tailored to your results, helping you understand what your numbers mean for your health." },
      ],
    },
    results: {
      title: "Your results,",
      titleAccent: "clearly explained",
      body: "No jargon. No guesswork. You receive a comprehensive digital report that gives you the clarity to make informed decisions about your health.",
      bullets: ["A detailed digital report delivered to your inbox", "Your exact Omega-6 / Omega-3 ratio visualized", "Evidence-based guidance for improvement"],
      ratioLabel: "Your Omega ratio",
      ratioTarget: "Optimal target: around 3:1",
      omega6: "Omega-6",
      omega3: "Omega-3",
      recommendationTitle: "Recommendation",
      recommendationBody: "Your ratio suggests room for improvement. Consider increasing marine-based Omega-3 intake and reducing processed seed oils.",
    },
    video: { title: "See how it works in 2 minutes", body: "A short overview of the testing process and what your results mean.", placeholder: "Video placeholder - add your explainer video here" },
    lead: {
      title: "Ready to find out?",
      body: "Enter your details to order the test or book a free 10-minute consultation.",
      successTitle: "Thank you!",
      successBody: "We'll be in touch shortly with your next steps.",
      nameLabel: "Name",
      namePlaceholder: "Your full name",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone",
      phonePlaceholder: "+1 (555) 000-0000",
      orderCta: "Order the test",
      consultationCta: "Book a consultation",
      successIconLabel: "Done",
    },
    testimonials: {
      title: "What people are discovering",
      items: [
        { quote: "I had no idea my ratio was 12:1. This test was an eye-opener. I changed my diet and retested, down to 4:1 in six months.", name: "Maria K.", role: "Health-conscious professional, 42" },
        { quote: "As someone who tracks everything, this filled a major blind spot. The report was clear, scientific, and actually useful.", name: "Thomas R.", role: "Biohacker and endurance athlete, 38" },
        { quote: "I recommend this to all my clients. It's the simplest way to see what's happening beneath the surface.", name: "Dr. Anna L.", role: "Functional medicine practitioner" },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        { q: "How is the test performed?", a: "You collect a small blood sample at home using a simple finger-prick kit. The process takes less than 5 minutes and requires no medical expertise." },
        { q: "How long does the analysis take?", a: "Once your sample reaches the laboratory, results are typically available after around 3 weeks. You'll receive a notification when your report is ready." },
        { q: "Is the test safe?", a: "Yes. The finger-prick method is widely used in medical diagnostics and is minimally invasive. The kit includes clear instructions and all necessary materials." },
        { q: "What happens after I receive my results?", a: "You'll get a comprehensive digital report with your fatty acid profile, your Omega-6/Omega-3 ratio, and personalized recommendations. You can also book a follow-up consultation to discuss your results." },
        { q: "Do I need a doctor's referral?", a: "No referral is needed. The test is designed for direct-to-consumer use. However, we recommend sharing your results with your healthcare provider for a complete picture." },
      ],
    },
    abTesting: {
      badge: "Bonus: A/B Testing",
      title: "Alternative copy for testing",
      body: "Three headline and CTA variations to optimize conversion.",
      headlinesLabel: "Headlines",
      ctasLabel: "Call-to-action buttons",
      headlines: ["Do you know your Omega balance?", "The one number that could change how you eat.", "Measure what matters. Start with your Omega ratio."],
      ctas: ["Test your Omega balance", "Discover your ratio", "Get your personalized analysis"],
    },
    sticky: { text: "Discover your Omega-6 / Omega-3 ratio today", cta: "Test your Omega balance" },
    footer: { tagline: "Scientific fatty acid analysis.", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact" },
  },
  de: {
    hero: {
      badge: "Wissenschaftliche Fettsäureanalyse",
      titleStart: "Kennst du deine",
      titleAccent: "Omega-Balance?",
      body: "Die meisten Menschen haben ein Ungleichgewicht zwischen Omega-6 und Omega-3. Ein einfacher Bluttest für zu Hause kann dein genaues Verhältnis zeigen.",
      primaryCta: "Teste deine Omega-Balance",
      secondaryCta: "So funktioniert der Test",
      statLab: "Zertifizierte Laboranalyse",
      statTiming: "Ergebnisse nach etwa 3 Wochen",
      imageAlt: "Übersicht einer Omega-Analyse mit Fettsäuredaten",
    },
    problem: {
      title: "Das Problem, das die meisten nicht sehen",
      body: "Das Fettsäuregleichgewicht deines Körpers beeinflusst, wie du dich fühlst, wie du dich erholst und wie du alterst. Ohne Daten bleibt es unsichtbar.",
      cards: [
        { title: "Zu viel Omega-6", description: "Die moderne Ernährung enthält viele verarbeitete Lebensmittel und Pflanzenöle, was Omega-6-Werte oft weit über den Bedarf des Körpers steigen lässt." },
        { title: "Verstecktes Ungleichgewicht", description: "Das Ungleichgewicht zwischen Omega-6 und Omega-3 kann Entzündungswege und die langfristige Gesundheit beeinflussen." },
        { title: "Annahmen statt Daten", description: "Viele Menschen gehen davon aus, dass ihre Fettsäurewerte in Ordnung sind, bis sie sie mit einem validierten Bluttest messen." },
      ],
    },
    howItWorks: {
      title: "So funktioniert der Test",
      body: "Drei einfache Schritte, um deine Omega-Balance zu verstehen.",
      steps: [
        { numberLabel: "SCHRITT 01", title: "Probe entnehmen", description: "Nimm zu Hause mit dem beiliegenden Fingerpik-Set eine kleine Blutprobe. Schnell, sicher und unkompliziert." },
        { numberLabel: "SCHRITT 02", title: "Ins Labor senden", description: "Sende deine Probe mit dem frankierten Rückumschlag an ein zertifiziertes Labor." },
        { numberLabel: "SCHRITT 03", title: "Ergebnisse erhalten", description: "Erhalte nach etwa 3 Wochen eine detaillierte digitale Analyse deiner Fettsäurebalance." },
      ],
    },
    analysis: {
      title: "Was die Analyse zeigt",
      body: "Dein Blut erzählt eine Geschichte. Der Test übersetzt sie in klare und umsetzbare Daten.",
      items: [
        { title: "Omega-6 / Omega-3-Verhältnis", description: "Dein genaues Gleichgewicht zwischen proinflammatorischen und antiinflammatorischen Fettsäuren. Ein optimales Verhältnis liegt oft nahe bei 3:1." },
        { title: "Fettsäurezusammensetzung", description: "Eine detaillierte Aufschlüsselung des Fettsäureprofils deiner Zellmembranen, das mehrere Monate deiner Ernährung widerspiegelt." },
        { title: "Personalisierte Erkenntnisse", description: "Konkrete Empfehlungen auf Basis deiner Ergebnisse, damit du verstehst, was deine Werte für deine Gesundheit bedeuten." },
      ],
    },
    results: {
      title: "Deine Ergebnisse,",
      titleAccent: "klar erklärt",
      body: "Kein Fachjargon. Kein Rätselraten. Du erhältst einen umfassenden digitalen Bericht, der dir Klarheit für informierte Gesundheitsentscheidungen gibt.",
      bullets: ["Ein detaillierter digitaler Bericht direkt in dein Postfach", "Dein genaues Omega-6 / Omega-3-Verhältnis visualisiert", "Evidenzbasierte Hinweise zur Verbesserung"],
      ratioLabel: "Dein Omega-Verhältnis",
      ratioTarget: "Optimales Ziel: etwa 3:1",
      omega6: "Omega-6",
      omega3: "Omega-3",
      recommendationTitle: "Empfehlung",
      recommendationBody: "Dein Verhältnis zeigt Verbesserungspotenzial. Erwäge mehr marine Omega-3-Quellen und weniger verarbeitete Samenöle.",
    },
    video: { title: "Sieh in 2 Minuten, wie es funktioniert", body: "Ein kurzer Überblick über den Testablauf und die Bedeutung deiner Ergebnisse.", placeholder: "Video-Platzhalter - füge hier dein Erklärvideo ein" },
    lead: {
      title: "Bereit, es herauszufinden?",
      body: "Trage deine Daten ein, um den Test zu bestellen oder ein kostenloses 10-Minuten-Beratungsgespräch zu buchen.",
      successTitle: "Danke!",
      successBody: "Wir melden uns in Kürze mit den nächsten Schritten.",
      nameLabel: "Name",
      namePlaceholder: "Dein vollständiger Name",
      emailLabel: "E-Mail",
      emailPlaceholder: "du@beispiel.de",
      phoneLabel: "Telefon",
      phonePlaceholder: "+49 170 0000000",
      orderCta: "Test bestellen",
      consultationCta: "Beratung buchen",
      successIconLabel: "Erledigt",
    },
    testimonials: {
      title: "Was Menschen entdecken",
      items: [
        { quote: "Ich hatte keine Ahnung, dass mein Verhältnis 12:1 war. Dieser Test war ein echter Augenöffner. Ich habe meine Ernährung verändert und war nach sechs Monaten bei 4:1.", name: "Maria K.", role: "Gesundheitsbewusste Berufstätige, 42" },
        { quote: "Als jemand, der alles trackt, hat das hier eine große Lücke geschlossen. Der Bericht war klar, wissenschaftlich und wirklich nützlich.", name: "Thomas R.", role: "Biohacker und Ausdauersportler, 38" },
        { quote: "Ich empfehle das allen meinen Klienten. Es ist der einfachste Weg zu sehen, was unter der Oberfläche passiert.", name: "Dr. Anna L.", role: "Fachkraft für funktionelle Medizin" },
      ],
    },
    faq: {
      title: "Häufig gestellte Fragen",
      items: [
        { q: "Wie wird der Test durchgeführt?", a: "Du entnimmst zu Hause mit einem einfachen Fingerpik-Set eine kleine Blutprobe. Der Vorgang dauert weniger als 5 Minuten und erfordert keine medizinische Erfahrung." },
        { q: "Wie lange dauert die Analyse?", a: "Sobald deine Probe das Labor erreicht hat, liegen die Ergebnisse normalerweise nach etwa 3 Wochen vor. Du wirst benachrichtigt, sobald dein Bericht bereit ist." },
        { q: "Ist der Test sicher?", a: "Ja. Die Fingerpik-Methode wird in der medizinischen Diagnostik häufig eingesetzt und ist minimalinvasiv. Das Set enthält klare Anweisungen und alle notwendigen Materialien." },
        { q: "Was passiert, nachdem ich meine Ergebnisse erhalten habe?", a: "Du erhältst einen digitalen Bericht mit deinem Fettsäureprofil, deinem Omega-6/Omega-3-Verhältnis und personalisierten Empfehlungen. Außerdem kannst du ein Anschlussgespräch buchen." },
        { q: "Brauche ich eine Überweisung vom Arzt?", a: "Nein. Der Test ist für die direkte Nutzung durch Verbraucher konzipiert. Dennoch empfehlen wir, die Ergebnisse mit deiner medizinischen Fachperson zu teilen." },
      ],
    },
    abTesting: {
      badge: "Bonus: A/B-Tests",
      title: "Alternative Texte zum Testen",
      body: "Drei Varianten für Überschrift und CTA zur Optimierung der Conversion.",
      headlinesLabel: "Überschriften",
      ctasLabel: "Call-to-Action-Buttons",
      headlines: ["Kennst du deine Omega-Balance?", "Die eine Zahl, die dein Essverhalten verändern könnte.", "Miss, was zählt. Starte mit deinem Omega-Verhältnis."],
      ctas: ["Teste deine Omega-Balance", "Entdecke dein Verhältnis", "Erhalte deine persönliche Analyse"],
    },
    sticky: { text: "Entdecke noch heute dein Omega-6 / Omega-3-Verhältnis", cta: "Teste deine Omega-Balance" },
    footer: { tagline: "Wissenschaftliche Fettsäureanalyse.", rights: "Alle Rechte vorbehalten.", privacy: "Datenschutz", terms: "Bedingungen", contact: "Kontakt" },
  },
  fr: {
    hero: {
      badge: "Analyse scientifique des acides gras",
      titleStart: "Connaissez-vous votre",
      titleAccent: "équilibre Omega ?",
      body: "La plupart des gens présentent un déséquilibre entre les oméga-6 et les oméga-3. Un simple test sanguin à domicile peut révéler votre ratio exact.",
      primaryCta: "Tester mon équilibre Omega",
      secondaryCta: "Comment fonctionne le test",
      statLab: "Analyse en laboratoire certifié",
      statTiming: "Résultats après environ 3 semaines",
      imageAlt: "Vue d'ensemble d'une analyse omega avec données d'acides gras",
    },
    problem: {
      title: "Le problème que la plupart ne voient pas",
      body: "L'équilibre en acides gras de votre corps joue un rôle essentiel dans votre énergie, votre récupération et votre vieillissement. Sans données, il reste invisible.",
      cards: [
        { title: "Excès d'oméga-6", description: "L'alimentation moderne contient beaucoup d'aliments transformés et d'huiles végétales, ce qui entraîne souvent des niveaux d'oméga-6 bien supérieurs aux besoins du corps." },
        { title: "Déséquilibre caché", description: "Ce déséquilibre entre oméga-6 et oméga-3 peut influencer les voies inflammatoires et la santé à long terme." },
        { title: "Des suppositions au lieu des données", description: "Beaucoup de personnes pensent que leurs niveaux sont corrects jusqu'au jour où elles les mesurent avec un test sanguin validé." },
      ],
    },
    howItWorks: {
      title: "Comment fonctionne le test",
      body: "Trois étapes simples pour comprendre votre équilibre Omega.",
      steps: [
        { numberLabel: "ÉTAPE 01", title: "Prélevez votre échantillon", description: "Réalisez à domicile un petit prélèvement sanguin avec le kit de piqûre au doigt fourni. Rapide, sûr et simple." },
        { numberLabel: "ÉTAPE 02", title: "Envoyez-le au laboratoire", description: "Envoyez votre échantillon à un laboratoire certifié grâce à l'enveloppe retour prépayée." },
        { numberLabel: "ÉTAPE 03", title: "Recevez vos résultats", description: "Recevez une analyse numérique détaillée de votre équilibre en acides gras après environ 3 semaines." },
      ],
    },
    analysis: {
      title: "Ce que révèle l'analyse",
      body: "Votre sang raconte une histoire. Le test la traduit en données claires et exploitables.",
      items: [
        { title: "Ratio oméga-6 / oméga-3", description: "Votre équilibre exact entre les acides gras pro-inflammatoires et anti-inflammatoires. Un ratio optimal est souvent proche de 3:1." },
        { title: "Composition en acides gras", description: "Une analyse détaillée du profil en acides gras de vos membranes cellulaires, reflet de plusieurs mois d'alimentation." },
        { title: "Informations personnalisées", description: "Des recommandations concrètes adaptées à vos résultats pour comprendre ce que vos chiffres signifient pour votre santé." },
      ],
    },
    results: {
      title: "Vos résultats,",
      titleAccent: "clairement expliqués",
      body: "Sans jargon. Sans suppositions. Vous recevez un rapport numérique complet qui vous aide à prendre des décisions éclairées pour votre santé.",
      bullets: ["Un rapport numérique détaillé envoyé dans votre boîte mail", "Votre ratio exact oméga-6 / oméga-3 visualisé", "Des recommandations fondées sur des preuves"],
      ratioLabel: "Votre ratio Omega",
      ratioTarget: "Objectif optimal : environ 3:1",
      omega6: "Oméga-6",
      omega3: "Oméga-3",
      recommendationTitle: "Recommandation",
      recommendationBody: "Votre ratio montre une marge d'amélioration. Envisagez d'augmenter les sources marines d'oméga-3 et de réduire les huiles de graines transformées.",
    },
    video: { title: "Voyez comment cela fonctionne en 2 minutes", body: "Une courte présentation du processus de test et de la signification de vos résultats.", placeholder: "Espace vidéo - ajoutez ici votre vidéo explicative" },
    lead: {
      title: "Prêt à le découvrir ?",
      body: "Laissez vos coordonnées pour commander le test ou réserver une consultation gratuite de 10 minutes.",
      successTitle: "Merci !",
      successBody: "Nous vous contacterons bientôt pour la suite.",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom complet",
      emailLabel: "E-mail",
      emailPlaceholder: "vous@exemple.fr",
      phoneLabel: "Téléphone",
      phonePlaceholder: "+33 6 00 00 00 00",
      orderCta: "Commander le test",
      consultationCta: "Réserver une consultation",
      successIconLabel: "Terminé",
    },
    testimonials: {
      title: "Ce que les gens découvrent",
      items: [
        { quote: "Je n'avais aucune idée que mon ratio était de 12:1. Ce test a été une vraie prise de conscience. J'ai changé mon alimentation et je suis descendue à 4:1 en six mois.", name: "Maria K.", role: "Professionnelle soucieuse de sa santé, 42 ans" },
        { quote: "Comme quelqu'un qui mesure tout, cela a comblé un angle mort important. Le rapport était clair, scientifique et vraiment utile.", name: "Thomas R.", role: "Biohacker et athlète d'endurance, 38 ans" },
        { quote: "Je recommande ce test à tous mes clients. C'est la manière la plus simple de voir ce qui se passe sous la surface.", name: "Dr. Anna L.", role: "Praticienne en médecine fonctionnelle" },
      ],
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        { q: "Comment le test est-il réalisé ?", a: "Vous prélevez un petit échantillon sanguin à domicile avec un kit simple de piqûre au doigt. Le processus prend moins de 5 minutes et ne demande aucune compétence médicale." },
        { q: "Combien de temps dure l'analyse ?", a: "Une fois votre échantillon arrivé au laboratoire, les résultats sont généralement disponibles après environ 3 semaines. Vous recevrez une notification lorsque votre rapport sera prêt." },
        { q: "Le test est-il sûr ?", a: "Oui. La méthode par piqûre au doigt est largement utilisée en diagnostic médical et reste peu invasive. Le kit contient des instructions claires et tout le matériel nécessaire." },
        { q: "Que se passe-t-il après réception des résultats ?", a: "Vous recevez un rapport numérique complet avec votre profil en acides gras, votre ratio oméga-6/oméga-3 et des recommandations personnalisées. Vous pouvez aussi réserver une consultation de suivi." },
        { q: "Ai-je besoin d'une ordonnance médicale ?", a: "Non. Le test est conçu pour un usage direct par les consommateurs. Nous recommandons toutefois de partager les résultats avec votre professionnel de santé." },
      ],
    },
    abTesting: {
      badge: "Bonus : test A/B",
      title: "Variantes de texte à tester",
      body: "Trois variations de titre et de CTA pour optimiser la conversion.",
      headlinesLabel: "Titres",
      ctasLabel: "Boutons d'appel à l'action",
      headlines: ["Connaissez-vous votre équilibre Omega ?", "Le chiffre qui pourrait changer votre façon de manger.", "Mesurez ce qui compte. Commencez par votre ratio Omega."],
      ctas: ["Tester mon équilibre Omega", "Découvrir mon ratio", "Recevoir mon analyse personnalisée"],
    },
    sticky: { text: "Découvrez votre ratio oméga-6 / oméga-3 dès aujourd'hui", cta: "Tester mon équilibre Omega" },
    footer: { tagline: "Analyse scientifique des acides gras.", rights: "Tous droits réservés.", privacy: "Confidentialité", terms: "Conditions", contact: "Contact" },
  },
  it: {
    hero: {
      badge: "Analisi scientifica degli acidi grassi",
      titleStart: "Conosci il tuo",
      titleAccent: "equilibrio Omega?",
      body: "La maggior parte delle persone ha uno squilibrio tra Omega-6 e Omega-3. Un semplice test del sangue da casa può rivelare il tuo rapporto esatto.",
      primaryCta: "Testa il tuo equilibrio Omega",
      secondaryCta: "Come funziona il test",
      statLab: "Analisi di laboratorio certificata",
      statTiming: "Risultati dopo circa 3 settimane",
      imageAlt: "Panoramica di un'analisi omega con dati sugli acidi grassi",
    },
    problem: {
      title: "Il problema che la maggior parte delle persone non vede",
      body: "L'equilibrio degli acidi grassi del tuo corpo influisce su come ti senti, su come recuperi e su come invecchi. Senza dati, resta invisibile.",
      cards: [
        { title: "Eccesso di Omega-6", description: "Le diete moderne sono ricche di cibi processati e oli vegetali, spesso con livelli di Omega-6 ben superiori a ciò di cui il corpo ha bisogno." },
        { title: "Squilibrio nascosto", description: "Questo squilibrio tra Omega-6 e Omega-3 può influenzare i processi infiammatori e la salute nel lungo periodo." },
        { title: "Supposizioni invece di dati", description: "Molte persone pensano che i loro livelli siano buoni finché non li misurano davvero con un test del sangue validato." },
      ],
    },
    howItWorks: {
      title: "Come funziona il test",
      body: "Tre semplici passaggi per capire il tuo equilibrio Omega.",
      steps: [
        { numberLabel: "FASE 01", title: "Raccogli il campione", description: "Preleva a casa un piccolo campione di sangue con il kit pungidito incluso. Rapido, sicuro e semplice." },
        { numberLabel: "FASE 02", title: "Invialo al laboratorio", description: "Spedisci il campione a un laboratorio certificato usando la busta di ritorno prepagata." },
        { numberLabel: "FASE 03", title: "Ricevi i risultati", description: "Ricevi un'analisi digitale dettagliata del tuo equilibrio degli acidi grassi dopo circa 3 settimane." },
      ],
    },
    analysis: {
      title: "Cosa rivela l'analisi",
      body: "Il tuo sangue racconta una storia. Il test la traduce in dati chiari e utili.",
      items: [
        { title: "Rapporto Omega-6 / Omega-3", description: "Il tuo equilibrio preciso tra acidi grassi pro-infiammatori e anti-infiammatori. Un rapporto ottimale è spesso vicino a 3:1." },
        { title: "Composizione degli acidi grassi", description: "Un'analisi dettagliata del profilo degli acidi grassi delle membrane cellulari, che riflette mesi di abitudini alimentari." },
        { title: "Indicazioni personalizzate", description: "Consigli pratici basati sui tuoi risultati, per aiutarti a capire cosa significano i numeri per la tua salute." },
      ],
    },
    results: {
      title: "I tuoi risultati,",
      titleAccent: "spiegati chiaramente",
      body: "Niente gergo. Niente supposizioni. Ricevi un report digitale completo che ti aiuta a prendere decisioni consapevoli per la tua salute.",
      bullets: ["Un report digitale dettagliato consegnato nella tua casella email", "Il tuo rapporto esatto Omega-6 / Omega-3 visualizzato", "Indicazioni basate su evidenze per migliorare"],
      ratioLabel: "Il tuo rapporto Omega",
      ratioTarget: "Obiettivo ottimale: circa 3:1",
      omega6: "Omega-6",
      omega3: "Omega-3",
      recommendationTitle: "Raccomandazione",
      recommendationBody: "Il tuo rapporto suggerisce margine di miglioramento. Valuta di aumentare le fonti marine di Omega-3 e ridurre gli oli di semi processati.",
    },
    video: { title: "Guarda come funziona in 2 minuti", body: "Una breve panoramica del processo di test e del significato dei tuoi risultati.", placeholder: "Segnaposto video - aggiungi qui il tuo video esplicativo" },
    lead: {
      title: "Pronto a scoprirlo?",
      body: "Inserisci i tuoi dati per ordinare il test o prenotare una consulenza gratuita di 10 minuti.",
      successTitle: "Grazie!",
      successBody: "Ti contatteremo a breve con i prossimi passaggi.",
      nameLabel: "Nome",
      namePlaceholder: "Il tuo nome completo",
      emailLabel: "Email",
      emailPlaceholder: "tu@esempio.it",
      phoneLabel: "Telefono",
      phonePlaceholder: "+39 333 000 0000",
      orderCta: "Ordina il test",
      consultationCta: "Prenota una consulenza",
      successIconLabel: "Fatto",
    },
    testimonials: {
      title: "Cosa stanno scoprendo le persone",
      items: [
        { quote: "Non avevo idea che il mio rapporto fosse 12:1. Questo test mi ha aperto gli occhi. Ho cambiato alimentazione e in sei mesi sono scesa a 4:1.", name: "Maria K.", role: "Professionista attenta alla salute, 42 anni" },
        { quote: "Per una persona che monitora tutto, questo ha colmato un grande punto cieco. Il report era chiaro, scientifico e davvero utile.", name: "Thomas R.", role: "Biohacker e atleta di endurance, 38 anni" },
        { quote: "Lo consiglio a tutti i miei clienti. È il modo più semplice per capire cosa succede sotto la superficie.", name: "Dr. Anna L.", role: "Professionista di medicina funzionale" },
      ],
    },
    faq: {
      title: "Domande frequenti",
      items: [
        { q: "Come viene eseguito il test?", a: "Raccogli a casa un piccolo campione di sangue usando un semplice kit pungidito. Il processo richiede meno di 5 minuti e non richiede competenze mediche." },
        { q: "Quanto dura l'analisi?", a: "Una volta che il campione arriva in laboratorio, i risultati sono normalmente disponibili dopo circa 3 settimane. Riceverai una notifica quando il report sarà pronto." },
        { q: "Il test è sicuro?", a: "Sì. Il metodo pungidito è ampiamente usato nella diagnostica medica ed è minimamente invasivo. Il kit include istruzioni chiare e tutto il materiale necessario." },
        { q: "Cosa succede dopo aver ricevuto i risultati?", a: "Riceverai un report digitale completo con il tuo profilo di acidi grassi, il rapporto Omega-6/Omega-3 e raccomandazioni personalizzate. Puoi anche prenotare una consulenza di follow-up." },
        { q: "Serve la prescrizione di un medico?", a: "No. Il test è pensato per l'uso diretto da parte dei consumatori. Consigliamo comunque di condividere i risultati con il tuo professionista sanitario." },
      ],
    },
    abTesting: {
      badge: "Bonus: test A/B",
      title: "Copy alternative da testare",
      body: "Tre varianti di headline e CTA per ottimizzare la conversione.",
      headlinesLabel: "Headline",
      ctasLabel: "Pulsanti call to action",
      headlines: ["Conosci il tuo equilibrio Omega?", "L'unico numero che potrebbe cambiare il tuo modo di mangiare.", "Misura ciò che conta. Parti dal tuo rapporto Omega."],
      ctas: ["Testa il tuo equilibrio Omega", "Scopri il tuo rapporto", "Ricevi la tua analisi personalizzata"],
    },
    sticky: { text: "Scopri oggi il tuo rapporto Omega-6 / Omega-3", cta: "Testa il tuo equilibrio Omega" },
    footer: { tagline: "Analisi scientifica degli acidi grassi.", rights: "Tutti i diritti riservati.", privacy: "Privacy", terms: "Termini", contact: "Contatti" },
  },
};

export function isSupportedLang(value?: string): value is Lang {
  return supportedLangs.includes((value || "") as Lang);
}

export function t(lang: Lang) {
  return translations[lang] || translations[defaultLang];
}
