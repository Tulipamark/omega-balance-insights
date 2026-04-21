import type { Lang } from "@/lib/i18n";
import type { ClaimText, LangRecord } from "@/content/v4-types";

export type InsideBalanceV4Content = {
  nav: {
    home: string;
    omega: string;
    gut: string;
    process: string;
    trust: string;
    faq: string;
    contact: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    trustRow: ClaimText[];
  };
  normalizingBand: ClaimText;
  process: {
    eyebrow: string;
    title: string;
    body: string;
    steps: { title: string; body: ClaimText }[];
  };
  trust: {
    eyebrow: string;
    title: string;
    body: string;
    items: { title: string; body: ClaimText }[];
  };
  nextStep: {
    eyebrow: string;
    title: string;
    body: string;
    cards: { title: string; body: string; cta: string; href: string; label: string }[];
  };
  transparency: ClaimText;
  closing: {
    title: string;
    body: string;
    cta: string;
    href: string;
  };
  faqTitle: string;
  faq: { question: string; answer: string }[];
};

export const insideBalanceV4Content: LangRecord<InsideBalanceV4Content> = {
  sv: {
    nav: {
      home: "InsideBalance",
      omega: "OmegaBalance",
      gut: "GutBalance",
      process: "Så fungerar det",
      trust: "Varför det här upplägget",
      faq: "Vanliga frågor",
      contact: "Kontakt",
    },
    hero: {
      eyebrow: "InsideBalance",
      title: "En lugnare väg in i testbaserad hälsa",
      body:
        "InsideBalance hjälper dig att förstå var du ska börja. Vi förklarar testspåren, visar vad nästa steg faktiskt innebär och leder dig vidare utan att göra hälsa mer komplicerat än nödvändigt.",
      primaryCta: "Börja med OmegaBalance",
      secondaryCta: "Se hur det fungerar",
      trustRow: [
        { text: "Analyserat av Vitas, Oslo", verification: "verified" },
        { text: "CE-märkt testkit", verification: "verified" },
        { text: "Anonymt hanterat", verification: "verified" },
      ],
    },
    normalizingBand: {
      text:
        "Många försöker förbättra hälsan innan de vet vad kroppen faktiskt visar. Ett test gör det lättare att börja i rätt ände och att skilja mellan allmänna råd och det som faktiskt är relevant för dig.",
      verification: "verified",
    },
    process: {
      eyebrow: "Så fungerar det",
      title: "Börja enkelt. Få ett faktiskt värde. Gå vidare därifrån.",
      body: "InsideBalance är byggt för att göra nästa steg tydligt redan från början.",
      steps: [
        {
          title: "Välj rätt testspår",
          body: { text: "Börja med det område som bäst matchar din nuvarande fråga: omega-balans först eller tarmhälsa som nästa spår.", verification: "verified" },
        },
        {
          title: "Ta provet hemma",
          body: { text: "BalanceTest bygger på dried blood spot och görs hemma utan att vägen in känns medicinskt tung.", verification: "verified" },
        },
        {
          title: "Analys hos Vitas",
          body: { text: "Blodprovet analyseras anonymt av Vitas, ett oberoende GMP-certifierat kontraktslaboratorium i Oslo, Norge.", verification: "verified" },
        },
        {
          title: "Fortsätt med tydligare underlag",
          body: { text: "Resultatet ger dig ett konkret utgångsvärde, tydligare rapport och en lugnare väg till nästa beslut.", verification: "verified" },
        },
      ],
    },
    trust: {
      eyebrow: "Varför det här upplägget",
      title: "Tydligt, seriöst och byggt för att hålla",
      body: "Här kommer förtroendet från struktur, inte från hype eller vaga löften.",
      items: [
        {
          title: "Ett faktiskt värde",
          body: { text: "Testet ger ett faktiskt värde, inte en uppskattning.", verification: "verified" },
        },
        {
          title: "Oberoende analys",
          body: { text: "Oberoende laboratorieanalys utförd av Vitas i Oslo.", verification: "verified" },
        },
        {
          title: "Jämförbart underlag",
          body: { text: "Resultatet jämförs mot en referensdatabas som beskrivs som en av de största databaserna av sitt slag.", verification: "verified" },
        },
        {
          title: "Uppföljning i siffror",
          body: { text: "Efter 120 dagar kan du göra ett uppföljningstest och se förändringen i siffror.", verification: "verified" },
        },
      ],
    },
    nextStep: {
      eyebrow: "Vad nästa steg innehåller",
      title: "Välj det spår som passar bäst just nu",
      body: "InsideBalance visar vägen vidare. Själva köpet sker hos Zinzino när du är redo att gå vidare.",
      cards: [
        {
          title: "OmegaBalance",
          body: "För dig som vill börja med omega-6:3-balansen och få ett tydligt första mätvärde.",
          cta: "Gå till OmegaBalance",
          href: "/omega-balance",
          label: "Starta här",
        },
        {
          title: "GutBalance",
          body: "För dig som senare vill komplettera med tarmhälsa, metabolism och immunrelaterade signaler.",
          cta: "Utforska GutBalance",
          href: "/gut-balance",
          label: "Kompletterande spår",
        },
      ],
    },
    transparency: {
      text: "InsideBalance vägleder. Köp sker via Zinzino. Vi kan erhålla provision för genomförda köp, men det påverkar inte hur vi beskriver upplägget.",
      verification: "verified",
    },
    closing: {
      title: "Börja med den tydligaste vägen in",
      body: "Om du vill ha ett konkret första värde är OmegaBalance den naturliga starten i InsideBalance.",
      cta: "Öppna OmegaBalance",
      href: "/omega-balance",
    },
    faqTitle: "Vanliga frågor",
    faq: [
      {
        question: "Säljer InsideBalance testet direkt?",
        answer: "Nej. InsideBalance vägleder och förklarar. När du går vidare till beställning sker köpet hos Zinzino.",
      },
      {
        question: "Var analyseras blodprovet?",
        answer: "Blodprovet analyseras anonymt av Vitas, ett oberoende GMP-certifierat kontraktslaboratorium i Oslo, Norge.",
      },
      {
        question: "Vad får jag efter testet?",
        answer: "Du får en rapport som ger ett tydligare underlag för att förstå ditt resultat och vad som kan vara ett rimligt nästa steg.",
      },
      {
        question: "Måste jag börja med GutBalance?",
        answer: "Nej. Inne i InsideBalance är OmegaBalance den tydligaste startpunkten just nu. GutBalance är ett kompletterande spår.",
      },
      {
        question: "Varför börja med att mäta?",
        answer: "För att ett konkret värde gör det lättare att förstå nuläget innan du försöker förändra något.",
      },
    ],
  },
  en: {
    nav: {
      home: "InsideBalance",
      omega: "OmegaBalance",
      gut: "GutBalance",
      process: "How it works",
      trust: "Why this setup",
      faq: "FAQ",
      contact: "Contact",
    },
    hero: {
      eyebrow: "InsideBalance",
      title: "A calmer entry point into test-based health",
      body:
        "InsideBalance helps people start in the right place. We explain the test paths, show what the next step actually includes, and guide people onward without turning health into noise.",
      primaryCta: "Start with OmegaBalance",
      secondaryCta: "See how it works",
      trustRow: [
        { text: "Analyzed by Vitas, Oslo", verification: "verified" },
        { text: "CE-marked test kit", verification: "verified" },
        { text: "Handled anonymously", verification: "verified" },
      ],
    },
    normalizingBand: {
      text:
        "Many people try to improve their health before they know what their body is actually showing. Testing makes it easier to begin in the right place and separate broad advice from what may actually matter for you.",
      verification: "verified",
    },
    process: {
      eyebrow: "How it works",
      title: "Start simply. Get a real value. Move forward from there.",
      body: "InsideBalance is built to make the next step clearer from the start.",
      steps: [
        { title: "Choose the right test path", body: { text: "Start with the area that best matches your current question: omega balance first or gut health as a complementary path.", verification: "verified" } },
        { title: "Take the sample at home", body: { text: "BalanceTest is based on dried blood spot sampling and can be done at home.", verification: "verified" } },
        { title: "Analysis by Vitas", body: { text: "The blood sample is analyzed anonymously by Vitas, an independent GMP-certified contract laboratory in Oslo, Norway.", verification: "verified" } },
        { title: "Continue with clearer direction", body: { text: "The result gives you a concrete starting point, a clearer report, and a calmer next decision.", verification: "verified" } },
      ],
    },
    trust: {
      eyebrow: "Why this setup",
      title: "Clear, serious, and built to last",
      body: "Trust comes from structure here, not from hype.",
      items: [
        { title: "A real value", body: { text: "The test gives you a real value, not an estimate.", verification: "verified" } },
        { title: "Independent analysis", body: { text: "Independent laboratory analysis performed by Vitas in Oslo.", verification: "verified" } },
        { title: "Reference-based context", body: { text: "The result is compared against a reference database described as one of the largest of its kind.", verification: "verified" } },
        { title: "Follow-up in numbers", body: { text: "After 120 days, you can retest and see the change in numbers.", verification: "verified" } },
      ],
    },
    nextStep: {
      eyebrow: "What the next step includes",
      title: "Choose the path that fits best right now",
      body: "InsideBalance provides guidance. The actual purchase takes place through Zinzino when you choose to continue.",
      cards: [
        { title: "OmegaBalance", body: "For people who want to begin with omega-6:3 balance and get a clear first measurement.", cta: "Go to OmegaBalance", href: "/en/omega-balance", label: "Start here" },
        { title: "GutBalance", body: "For people who later want to complement that with gut health, metabolism, and immune-related signals.", cta: "Explore GutBalance", href: "/en/gut-balance", label: "Complementary path" },
      ],
    },
    transparency: {
      text: "InsideBalance provides guidance. Purchases take place through Zinzino. We may receive commission for completed purchases, but that does not change how we describe the process.",
      verification: "verified",
    },
    closing: {
      title: "Start with the clearest first step",
      body: "If you want a concrete first value, OmegaBalance is the natural place to begin inside InsideBalance.",
      cta: "Open OmegaBalance",
      href: "/en/omega-balance",
    },
    faqTitle: "FAQ",
    faq: [
      { question: "Does InsideBalance sell the test directly?", answer: "No. InsideBalance guides and explains. When you move on to ordering, the purchase happens through Zinzino." },
      { question: "Where is the blood sample analyzed?", answer: "The blood sample is analyzed anonymously by Vitas, an independent GMP-certified contract laboratory in Oslo, Norway." },
      { question: "What do I receive after the test?", answer: "You receive a report that gives you a clearer basis for understanding the result and what may be a reasonable next step." },
      { question: "Do I need to start with GutBalance?", answer: "No. InsideBalance currently presents OmegaBalance as the clearest first step. GutBalance is a complementary path." },
      { question: "Why start by measuring?", answer: "Because a concrete value makes it easier to understand your starting point before you try to change anything." },
    ],
  },
};

insideBalanceV4Content.no = {
  nav: { home: "InsideBalance", omega: "OmegaBalance", gut: "GutBalance", process: "Slik fungerer det", trust: "Hvorfor dette opplegget", faq: "Vanlige spørsmål", contact: "Kontakt" },
  hero: { eyebrow: "InsideBalance", title: "En roligere inngang til testbasert helse", body: "InsideBalance hjelper deg å forstå hvor du bør begynne. Vi forklarer testsporene, viser hva neste steg faktisk innebærer og leder deg videre uten å gjøre helse mer komplisert enn nødvendig.", primaryCta: "Start med OmegaBalance", secondaryCta: "Se hvordan det fungerer", trustRow: [{ text: "Analysert av Vitas, Oslo", verification: "verified" }, { text: "CE-merket testkit", verification: "verified" }, { text: "Anonymt håndtert", verification: "verified" }] },
  normalizingBand: { text: "Mange prøver å forbedre helsen før de vet hva kroppen faktisk viser. En test gjør det lettere å begynne i riktig ende og skille mellom generelle råd og det som faktisk er relevant for deg.", verification: "verified" },
  process: { eyebrow: "Slik fungerer det", title: "Begynn enkelt. Få en reell verdi. Gå videre derfra.", body: "InsideBalance er bygget for å gjøre neste steg tydelig allerede fra start.", steps: [{ title: "Velg riktig testspor", body: { text: "Begynn med området som best matcher spørsmålet ditt akkurat nå: omega-balanse først eller tarmhelse som et komplementært spor.", verification: "verified" } }, { title: "Ta prøven hjemme", body: { text: "BalanceTest er basert på dried blood spot og gjøres hjemme uten at veien inn føles medisinsk tung.", verification: "verified" } }, { title: "Analyse hos Vitas", body: { text: "Blodprøven analyseres anonymt av Vitas, et uavhengig GMP-sertifisert kontraktslaboratorium i Oslo, Norge.", verification: "verified" } }, { title: "Gå videre med tydeligere grunnlag", body: { text: "Resultatet gir deg et konkret utgangspunkt, en tydeligere rapport og en roligere vei til neste beslutning.", verification: "verified" } }] },
  trust: { eyebrow: "Hvorfor dette opplegget", title: "Tydelig, seriøst og bygget for å vare", body: "Tillit skapes her gjennom struktur, ikke gjennom hype eller uklare løfter.", items: [{ title: "En faktisk verdi", body: { text: "Testen gir en faktisk verdi, ikke et anslag.", verification: "verified" } }, { title: "Uavhengig analyse", body: { text: "Uavhengig laboratorieanalyse utført av Vitas i Oslo.", verification: "verified" } }, { title: "Sammenlignbart grunnlag", body: { text: "Resultatet sammenlignes med en referansedatabase som beskrives som en av de største av sitt slag.", verification: "verified" } }, { title: "Oppfølging i tall", body: { text: "Etter 120 dager kan du ta en ny test og se endringen i tall.", verification: "verified" } }] },
  nextStep: { eyebrow: "Hva neste steg inneholder", title: "Velg sporet som passer best akkurat nå", body: "InsideBalance viser veien videre. Selve kjøpet skjer hos Zinzino når du er klar til å gå videre.", cards: [{ title: "OmegaBalance", body: "For deg som vil begynne med omega-6:3-balansen og få en tydelig første måleverdi.", cta: "Gå til OmegaBalance", href: "/no/omega-balance", label: "Start her" }, { title: "GutBalance", body: "For deg som senere vil supplere med tarmhelse, metabolisme og immunrelaterte signaler.", cta: "Utforsk GutBalance", href: "/no/gut-balance", label: "Komplementært spor" }] },
  transparency: { text: "InsideBalance veileder. Kjøp skjer via Zinzino. Vi kan motta provisjon for gjennomførte kjøp, men det påvirker ikke hvordan vi beskriver opplegget.", verification: "verified" },
  closing: { title: "Begynn med den tydeligste veien inn", body: "Hvis du vil ha en konkret første verdi, er OmegaBalance den naturlige starten i InsideBalance.", cta: "Åpne OmegaBalance", href: "/no/omega-balance" },
  faqTitle: "Vanlige spørsmål",
  faq: [{ question: "Selger InsideBalance testen direkte?", answer: "Nei. InsideBalance veileder og forklarer. Når du går videre til bestilling, skjer kjøpet hos Zinzino." }, { question: "Hvor analyseres blodprøven?", answer: "Blodprøven analyseres anonymt av Vitas, et uavhengig GMP-sertifisert kontraktslaboratorium i Oslo, Norge." }, { question: "Hva får jeg etter testen?", answer: "Du får en rapport som gir et tydeligere grunnlag for å forstå resultatet og hva som kan være et rimelig neste steg." }, { question: "Må jeg begynne med GutBalance?", answer: "Nei. Inne i InsideBalance er OmegaBalance det tydeligste startpunktet akkurat nå. GutBalance er et komplementært spor." }, { question: "Hvorfor begynne med å måle?", answer: "Fordi en konkret verdi gjør det lettere å forstå utgangspunktet før du prøver å endre noe." }],
};

insideBalanceV4Content.da = {
  nav: { home: "InsideBalance", omega: "OmegaBalance", gut: "GutBalance", process: "Sådan fungerer det", trust: "Hvorfor dette setup", faq: "Ofte stillede spørgsmål", contact: "Kontakt" },
  hero: { eyebrow: "InsideBalance", title: "En roligere vej ind i testbaseret sundhed", body: "InsideBalance hjælper dig med at forstå, hvor du skal begynde. Vi forklarer testsporene, viser hvad næste skridt faktisk indebærer og leder dig videre uden at gøre sundhed mere kompliceret end nødvendigt.", primaryCta: "Start med OmegaBalance", secondaryCta: "Se hvordan det fungerer", trustRow: [{ text: "Analyseret af Vitas, Oslo", verification: "verified" }, { text: "CE-mærket testkit", verification: "verified" }, { text: "Anonymt håndteret", verification: "verified" }] },
  normalizingBand: { text: "Mange forsøger at forbedre sundheden, før de ved, hvad kroppen faktisk viser. En test gør det lettere at begynde det rigtige sted og skelne mellem generelle råd og det, der faktisk er relevant for dig.", verification: "verified" },
  process: { eyebrow: "Sådan fungerer det", title: "Begynd enkelt. Få en reel værdi. Gå videre derfra.", body: "InsideBalance er bygget til at gøre næste skridt tydeligt fra begyndelsen.", steps: [{ title: "Vælg det rigtige testspor", body: { text: "Begynd med det område, der bedst matcher dit aktuelle spørgsmål: omega-balance først eller tarmsundhed som et supplerende spor.", verification: "verified" } }, { title: "Tag prøven hjemme", body: { text: "BalanceTest er baseret på dried blood spot og udføres hjemme uden at vejen ind føles medicinsk tung.", verification: "verified" } }, { title: "Analyse hos Vitas", body: { text: "Blodprøven analyseres anonymt af Vitas, et uafhængigt GMP-certificeret kontraktlaboratorium i Oslo, Norge.", verification: "verified" } }, { title: "Gå videre med et tydeligere grundlag", body: { text: "Resultatet giver dig et konkret udgangspunkt, en tydeligere rapport og en roligere vej til næste beslutning.", verification: "verified" } }] },
  trust: { eyebrow: "Hvorfor dette setup", title: "Tydeligt, seriøst og bygget til at holde", body: "Tillid skabes her gennem struktur, ikke gennem hype eller uklare løfter.", items: [{ title: "En reel værdi", body: { text: "Testen giver en reel værdi, ikke et skøn.", verification: "verified" } }, { title: "Uafhængig analyse", body: { text: "Uafhængig laboratorieanalyse udført af Vitas i Oslo.", verification: "verified" } }, { title: "Sammenligneligt grundlag", body: { text: "Resultatet sammenlignes med en referencedatabase, der beskrives som en af de største af sin slags.", verification: "verified" } }, { title: "Opfølgning i tal", body: { text: "Efter 120 dage kan du tage en ny test og se ændringen i tal.", verification: "verified" } }] },
  nextStep: { eyebrow: "Hvad næste skridt indeholder", title: "Vælg det spor, der passer bedst lige nu", body: "InsideBalance viser vejen videre. Selve købet sker hos Zinzino, når du er klar til at gå videre.", cards: [{ title: "OmegaBalance", body: "Til dig, der vil begynde med omega-6:3-balancen og få en tydelig første måleværdi.", cta: "Gå til OmegaBalance", href: "/da/omega-balance", label: "Start her" }, { title: "GutBalance", body: "Til dig, der senere vil supplere med tarmsundhed, metabolisme og immunrelaterede signaler.", cta: "Udforsk GutBalance", href: "/da/gut-balance", label: "Supplerende spor" }] },
  transparency: { text: "InsideBalance vejleder. Køb sker via Zinzino. Vi kan modtage provision for gennemførte køb, men det påvirker ikke, hvordan vi beskriver setup'et.", verification: "verified" },
  closing: { title: "Begynd med den tydeligste vej ind", body: "Hvis du vil have en konkret første værdi, er OmegaBalance det naturlige sted at begynde i InsideBalance.", cta: "Åbn OmegaBalance", href: "/da/omega-balance" },
  faqTitle: "Ofte stillede spørgsmål",
  faq: [{ question: "Sælger InsideBalance testen direkte?", answer: "Nej. InsideBalance vejleder og forklarer. Når du går videre til bestilling, sker købet hos Zinzino." }, { question: "Hvor analyseres blodprøven?", answer: "Blodprøven analyseres anonymt af Vitas, et uafhængigt GMP-certificeret kontraktlaboratorium i Oslo, Norge." }, { question: "Hvad får jeg efter testen?", answer: "Du får en rapport, som giver et tydeligere grundlag for at forstå resultatet og hvad der kan være et rimeligt næste skridt." }, { question: "Skal jeg begynde med GutBalance?", answer: "Nej. Inde i InsideBalance er OmegaBalance det tydeligste startpunkt lige nu. GutBalance er et supplerende spor." }, { question: "Hvorfor begynde med at måle?", answer: "Fordi en konkret værdi gør det lettere at forstå udgangspunktet, før du prøver at ændre noget." }],
};

insideBalanceV4Content.fi = {
  nav: { home: "InsideBalance", omega: "OmegaBalance", gut: "GutBalance", process: "Näin se toimii", trust: "Miksi tämä kokonaisuus", faq: "Usein kysytyt kysymykset", contact: "Yhteystiedot" },
  hero: { eyebrow: "InsideBalance", title: "Rauhallisempi tapa aloittaa testipohjainen terveys", body: "InsideBalance auttaa ymmärtämään, mistä kannattaa aloittaa. Selitämme testipolut, näytämme mitä seuraava vaihe oikeasti sisältää ja ohjaamme eteenpäin ilman että terveydestä tehdään tarpeettoman monimutkaista.", primaryCta: "Aloita OmegaBalancesta", secondaryCta: "Katso miten se toimii", trustRow: [{ text: "Analysoitu Vitasissa, Oslossa", verification: "verified" }, { text: "CE-merkitty testipakkaus", verification: "verified" }, { text: "Käsitellään anonyymisti", verification: "verified" }] },
  normalizingBand: { text: "Moni yrittää parantaa terveyttään ennen kuin tietää, mitä keho todella näyttää. Testi helpottaa aloittamaan oikeasta kohdasta ja erottamaan yleiset neuvot siitä, mikä on oikeasti sinulle relevanttia.", verification: "verified" },
  process: { eyebrow: "Näin se toimii", title: "Aloita yksinkertaisesti. Saat todellisen arvon. Jatka siitä eteenpäin.", body: "InsideBalance on rakennettu tekemään seuraavasta vaiheesta selkeä jo alusta alkaen.", steps: [{ title: "Valitse oikea testipolku", body: { text: "Aloita siitä alueesta, joka vastaa parhaiten tämänhetkiseen kysymykseesi: omega-tasapaino ensin tai suolistoterveys täydentävänä polkuna.", verification: "verified" } }, { title: "Ota näyte kotona", body: { text: "BalanceTest perustuu dried blood spot -menetelmään ja tehdään kotona ilman että alku tuntuu lääketieteellisen raskaalta.", verification: "verified" } }, { title: "Analyysi Vitasissa", body: { text: "Verinäyte analysoidaan anonyymisti Vitasissa, joka on riippumaton GMP-sertifioitu sopimuslaboratorio Oslossa, Norjassa.", verification: "verified" } }, { title: "Jatka selkeämmällä pohjalla", body: { text: "Tulos antaa konkreettisen lähtöarvon, selkeämmän raportin ja rauhallisemman tien seuraavaan päätökseen.", verification: "verified" } }] },
  trust: { eyebrow: "Miksi tämä kokonaisuus", title: "Selkeä, vakaa ja pitkäjänteisesti rakennettu", body: "Luottamus syntyy täällä rakenteesta, ei hypestä tai epämääräisistä lupauksista.", items: [{ title: "Todellinen arvo", body: { text: "Testi antaa todellisen arvon, ei arviota.", verification: "verified" } }, { title: "Riippumaton analyysi", body: { text: "Riippumaton laboratorioanalyysi tehdään Vitasissa Oslossa.", verification: "verified" } }, { title: "Vertailukelpoinen pohja", body: { text: "Tulosta verrataan viitetietokantaan, jota kuvataan yhtenä lajinsa suurimmista.", verification: "verified" } }, { title: "Seuranta numeroina", body: { text: "120 päivän jälkeen voit tehdä uusintatestin ja nähdä muutoksen numeroina.", verification: "verified" } }] },
  nextStep: { eyebrow: "Mitä seuraava vaihe sisältää", title: "Valitse juuri nyt parhaiten sopiva polku", body: "InsideBalance näyttää seuraavan askeleen. Varsinainen osto tapahtuu Zinzino-sivulla, kun olet valmis etenemään.", cards: [{ title: "OmegaBalance", body: "Sinulle, joka haluat aloittaa omega-6:3-tasapainosta ja saada selkeän ensimmäisen mitta-arvon.", cta: "Siirry OmegaBalanceen", href: "/fi/omega-balance", label: "Aloita tästä" }, { title: "GutBalance", body: "Sinulle, joka haluat myöhemmin täydentää tätä suolistoterveyden, aineenvaihdunnan ja immuunijärjestelmään liittyvien signaalien näkökulmasta.", cta: "Tutustu GutBalanceen", href: "/fi/gut-balance", label: "Täydentävä polku" }] },
  transparency: { text: "InsideBalance ohjaa. Ostot tapahtuvat Zinzino-sivulla. Saatamme saada komission toteutuneista ostoista, mutta se ei vaikuta siihen, miten kuvaamme kokonaisuutta.", verification: "verified" },
  closing: { title: "Aloita selkeimmästä ensiaskeleesta", body: "Jos haluat konkreettisen ensimmäisen arvon, OmegaBalance on luontevin aloitus InsideBalancessa.", cta: "Avaa OmegaBalance", href: "/fi/omega-balance" },
  faqTitle: "Usein kysytyt kysymykset",
  faq: [{ question: "Myykö InsideBalance testin suoraan?", answer: "Ei. InsideBalance ohjaa ja selittää. Kun siirryt tilaamaan, osto tapahtuu Zinzino-sivulla." }, { question: "Missä verinäyte analysoidaan?", answer: "Verinäyte analysoidaan anonyymisti Vitasissa, joka on riippumaton GMP-sertifioitu sopimuslaboratorio Oslossa, Norjassa." }, { question: "Mitä saan testin jälkeen?", answer: "Saat raportin, joka antaa selkeämmän pohjan tuloksen ymmärtämiseen ja siihen, mikä voisi olla järkevä seuraava askel." }, { question: "Täytyykö minun aloittaa GutBalancesta?", answer: "Ei. InsideBalancessa OmegaBalance on tällä hetkellä selkein aloituspiste. GutBalance on täydentävä polku." }, { question: "Miksi aloittaa mittaamisesta?", answer: "Koska konkreettinen arvo helpottaa lähtötilanteen ymmärtämistä ennen kuin yrität muuttaa mitään." }],
};

insideBalanceV4Content.de = {
  nav: { home: "InsideBalance", omega: "OmegaBalance", gut: "GutBalance", process: "So funktioniert es", trust: "Warum dieses Setup", faq: "FAQ", contact: "Kontakt" },
  hero: { eyebrow: "InsideBalance", title: "Ein ruhigerer Einstieg in testbasierte Gesundheit", body: "InsideBalance hilft dir zu verstehen, wo du anfangen solltest. Wir erklären die Testpfade, zeigen, was der nächste Schritt tatsächlich umfasst, und führen dich weiter, ohne Gesundheit unnötig kompliziert zu machen.", primaryCta: "Mit OmegaBalance starten", secondaryCta: "So funktioniert es", trustRow: [{ text: "Analysiert von Vitas, Oslo", verification: "verified" }, { text: "CE-gekennzeichnetes Testkit", verification: "verified" }, { text: "Anonym bearbeitet", verification: "verified" }] },
  normalizingBand: { text: "Viele versuchen, ihre Gesundheit zu verbessern, bevor sie wissen, was ihr Körper tatsächlich zeigt. Ein Test macht es leichter, am richtigen Punkt zu beginnen und allgemeine Ratschläge von dem zu trennen, was für dich wirklich relevant ist.", verification: "verified" },
  process: { eyebrow: "So funktioniert es", title: "Einfach starten. Einen echten Wert erhalten. Von dort aus weitergehen.", body: "InsideBalance ist dafür gebaut, den nächsten Schritt schon am Anfang klarer zu machen.", steps: [{ title: "Den richtigen Testpfad wählen", body: { text: "Beginne mit dem Bereich, der am besten zu deiner aktuellen Frage passt: zuerst Omega-Balance oder Darmgesundheit als ergänzender Pfad.", verification: "verified" } }, { title: "Probe zu Hause nehmen", body: { text: "BalanceTest basiert auf dried blood spot und wird zu Hause durchgeführt, ohne dass sich der Einstieg medizinisch schwer anfühlt.", verification: "verified" } }, { title: "Analyse bei Vitas", body: { text: "Die Blutprobe wird anonym von Vitas analysiert, einem unabhängigen GMP-zertifizierten Vertragslabor in Oslo, Norwegen.", verification: "verified" } }, { title: "Mit klarerer Grundlage weitergehen", body: { text: "Das Ergebnis gibt dir einen konkreten Ausgangswert, einen klareren Bericht und einen ruhigeren Weg zur nächsten Entscheidung.", verification: "verified" } }] },
  trust: { eyebrow: "Warum dieses Setup", title: "Klar, seriös und auf Dauer angelegt", body: "Vertrauen entsteht hier durch Struktur, nicht durch Hype oder vage Versprechen.", items: [{ title: "Ein echter Wert", body: { text: "Der Test liefert einen echten Wert, keine Schätzung.", verification: "verified" } }, { title: "Unabhängige Analyse", body: { text: "Unabhängige Laboranalyse durch Vitas in Oslo.", verification: "verified" } }, { title: "Vergleichbare Einordnung", body: { text: "Das Ergebnis wird mit einer Referenzdatenbank verglichen, die als eine der größten ihrer Art beschrieben wird.", verification: "verified" } }, { title: "Follow-up in Zahlen", body: { text: "Nach 120 Tagen kannst du erneut testen und die Veränderung in Zahlen sehen.", verification: "verified" } }] },
  nextStep: { eyebrow: "Was der nächste Schritt umfasst", title: "Wähle den Pfad, der jetzt am besten passt", body: "InsideBalance zeigt den Weg weiter. Der eigentliche Kauf erfolgt über Zinzino, wenn du bereit bist weiterzugehen.", cards: [{ title: "OmegaBalance", body: "Für dich, wenn du mit dem Omega-6:3-Verhältnis beginnen und einen klaren ersten Messwert erhalten möchtest.", cta: "Zu OmegaBalance", href: "/de/omega-balance", label: "Hier starten" }, { title: "GutBalance", body: "Für dich, wenn du später mit Darmgesundheit, Stoffwechsel und immunbezogenen Signalen ergänzen möchtest.", cta: "GutBalance ansehen", href: "/de/gut-balance", label: "Ergänzender Pfad" }] },
  transparency: { text: "InsideBalance bietet Orientierung. Käufe erfolgen über Zinzino. Wir können für abgeschlossene Käufe eine Provision erhalten, aber das beeinflusst nicht, wie wir das Vorgehen beschreiben.", verification: "verified" },
  closing: { title: "Mit dem klarsten ersten Schritt beginnen", body: "Wenn du einen konkreten ersten Wert möchtest, ist OmegaBalance der natürliche Start innerhalb von InsideBalance.", cta: "OmegaBalance öffnen", href: "/de/omega-balance" },
  faqTitle: "FAQ",
  faq: [{ question: "Verkauft InsideBalance den Test direkt?", answer: "Nein. InsideBalance erklärt und begleitet. Wenn du zur Bestellung weitergehst, erfolgt der Kauf über Zinzino." }, { question: "Wo wird die Blutprobe analysiert?", answer: "Die Blutprobe wird anonym von Vitas analysiert, einem unabhängigen GMP-zertifizierten Vertragslabor in Oslo, Norwegen." }, { question: "Was erhalte ich nach dem Test?", answer: "Du erhältst einen Bericht, der dir eine klarere Grundlage gibt, um das Ergebnis und einen sinnvollen nächsten Schritt zu verstehen." }, { question: "Muss ich mit GutBalance beginnen?", answer: "Nein. Innerhalb von InsideBalance ist OmegaBalance derzeit der klarste Startpunkt. GutBalance ist ein ergänzender Pfad." }, { question: "Warum mit dem Messen beginnen?", answer: "Weil ein konkreter Wert den Ausgangspunkt leichter verständlich macht, bevor du versuchst, etwas zu verändern." }],
};

insideBalanceV4Content.fr = {
  nav: { home: "InsideBalance", omega: "OmegaBalance", gut: "GutBalance", process: "Comment cela fonctionne", trust: "Pourquoi cette approche", faq: "FAQ", contact: "Contact" },
  hero: { eyebrow: "InsideBalance", title: "Une entrée plus calme dans une santé fondée sur les tests", body: "InsideBalance vous aide à comprendre par où commencer. Nous expliquons les parcours de test, montrons ce que comprend réellement l'étape suivante et vous guidons sans rendre la santé plus compliquée que nécessaire.", primaryCta: "Commencer par OmegaBalance", secondaryCta: "Voir comment cela fonctionne", trustRow: [{ text: "Analysé par Vitas, Oslo", verification: "verified" }, { text: "Kit de test marqué CE", verification: "verified" }, { text: "Traitement anonyme", verification: "verified" }] },
  normalizingBand: { text: "Beaucoup essaient d'améliorer leur santé avant de savoir ce que leur corps montre réellement. Un test permet de commencer plus facilement au bon endroit et de distinguer les conseils généraux de ce qui vous concerne vraiment.", verification: "verified" },
  process: { eyebrow: "Comment cela fonctionne", title: "Commencez simplement. Obtenez une vraie valeur. Avancez à partir de là.", body: "InsideBalance est conçu pour rendre l'étape suivante plus claire dès le départ.", steps: [{ title: "Choisir le bon parcours de test", body: { text: "Commencez par le domaine qui correspond le mieux à votre question du moment : l'équilibre oméga d'abord ou la santé intestinale comme parcours complémentaire.", verification: "verified" } }, { title: "Faire l'échantillon à domicile", body: { text: "BalanceTest repose sur le dried blood spot et se réalise à domicile sans que l'entrée dans le processus ne paraisse trop médicale.", verification: "verified" } }, { title: "Analyse chez Vitas", body: { text: "L'échantillon sanguin est analysé anonymement par Vitas, un laboratoire sous contrat indépendant certifié GMP à Oslo, en Norvège.", verification: "verified" } }, { title: "Poursuivre avec une base plus claire", body: { text: "Le résultat vous donne un point de départ concret, un rapport plus clair et une voie plus sereine vers la décision suivante.", verification: "verified" } }] },
  trust: { eyebrow: "Pourquoi cette approche", title: "Clair, sérieux et conçu pour durer", body: "La confiance vient ici de la structure, pas du battage ni de promesses vagues.", items: [{ title: "Une vraie valeur", body: { text: "Le test donne une vraie valeur, pas une estimation.", verification: "verified" } }, { title: "Analyse indépendante", body: { text: "Analyse de laboratoire indépendante réalisée par Vitas à Oslo.", verification: "verified" } }, { title: "Contexte comparable", body: { text: "Le résultat est comparé à une base de référence décrite comme l'une des plus grandes de son genre.", verification: "verified" } }, { title: "Suivi en chiffres", body: { text: "Après 120 jours, vous pouvez refaire un test et voir l'évolution en chiffres.", verification: "verified" } }] },
  nextStep: { eyebrow: "Ce que comprend l'étape suivante", title: "Choisissez le parcours qui convient le mieux maintenant", body: "InsideBalance montre la suite. L'achat lui-même se fait via Zinzino lorsque vous choisissez d'aller plus loin.", cards: [{ title: "OmegaBalance", body: "Pour vous si vous voulez commencer par l'équilibre oméga-6:3 et obtenir une première mesure claire.", cta: "Aller vers OmegaBalance", href: "/fr/omega-balance", label: "Commencer ici" }, { title: "GutBalance", body: "Pour vous si vous souhaitez ensuite compléter avec la santé intestinale, le métabolisme et des signaux liés à l'immunité.", cta: "Découvrir GutBalance", href: "/fr/gut-balance", label: "Parcours complémentaire" }] },
  transparency: { text: "InsideBalance guide. Les achats se font via Zinzino. Nous pouvons recevoir une commission sur les achats réalisés, mais cela ne change pas notre manière de décrire l'approche.", verification: "verified" },
  closing: { title: "Commencez par l'étape la plus claire", body: "Si vous voulez une première valeur concrète, OmegaBalance est le point de départ naturel dans InsideBalance.", cta: "Ouvrir OmegaBalance", href: "/fr/omega-balance" },
  faqTitle: "FAQ",
  faq: [{ question: "InsideBalance vend-il le test directement ?", answer: "Non. InsideBalance guide et explique. Lorsque vous passez à la commande, l'achat se fait via Zinzino." }, { question: "Où l'échantillon sanguin est-il analysé ?", answer: "L'échantillon sanguin est analysé anonymement par Vitas, un laboratoire sous contrat indépendant certifié GMP à Oslo, en Norvège." }, { question: "Que reçois-je après le test ?", answer: "Vous recevez un rapport qui vous donne une base plus claire pour comprendre le résultat et ce qui peut constituer une étape suivante raisonnable." }, { question: "Dois-je commencer par GutBalance ?", answer: "Non. Dans InsideBalance, OmegaBalance est actuellement le point de départ le plus clair. GutBalance est un parcours complémentaire." }, { question: "Pourquoi commencer par mesurer ?", answer: "Parce qu'une valeur concrète permet de mieux comprendre votre point de départ avant d'essayer de changer quoi que ce soit." }],
};

insideBalanceV4Content.it = {
  nav: { home: "InsideBalance", omega: "OmegaBalance", gut: "GutBalance", process: "Come funziona", trust: "Perché questo approccio", faq: "FAQ", contact: "Contatti" },
  hero: { eyebrow: "InsideBalance", title: "Un ingresso più calmo nella salute basata sui test", body: "InsideBalance ti aiuta a capire da dove iniziare. Spieghiamo i percorsi di test, mostriamo cosa comprende davvero il passo successivo e ti guidiamo avanti senza rendere la salute più complicata del necessario.", primaryCta: "Inizia con OmegaBalance", secondaryCta: "Vedi come funziona", trustRow: [{ text: "Analizzato da Vitas, Oslo", verification: "verified" }, { text: "Kit di test marcato CE", verification: "verified" }, { text: "Gestito in modo anonimo", verification: "verified" }] },
  normalizingBand: { text: "Molte persone cercano di migliorare la propria salute prima di sapere cosa il corpo stia realmente mostrando. Un test rende più facile iniziare dal punto giusto e distinguere tra consigli generici e ciò che è davvero rilevante per te.", verification: "verified" },
  process: { eyebrow: "Come funziona", title: "Inizia in modo semplice. Ottieni un valore reale. Prosegui da lì.", body: "InsideBalance è costruito per rendere più chiaro il passo successivo fin dall'inizio.", steps: [{ title: "Scegli il percorso di test giusto", body: { text: "Inizia dall'area che meglio corrisponde alla tua domanda del momento: prima l'equilibrio omega o la salute intestinale come percorso complementare.", verification: "verified" } }, { title: "Fai il campione a casa", body: { text: "BalanceTest si basa sul dried blood spot e si esegue a casa senza che l'ingresso nel percorso risulti troppo medicalizzato.", verification: "verified" } }, { title: "Analisi presso Vitas", body: { text: "Il campione di sangue viene analizzato in modo anonimo da Vitas, laboratorio indipendente certificato GMP a Oslo, in Norvegia.", verification: "verified" } }, { title: "Prosegui con una base più chiara", body: { text: "Il risultato ti offre un punto di partenza concreto, un report più chiaro e un percorso più tranquillo verso la decisione successiva.", verification: "verified" } }] },
  trust: { eyebrow: "Perché questo approccio", title: "Chiaro, serio e costruito per durare", body: "Qui la fiducia nasce dalla struttura, non dall'hype o da promesse vaghe.", items: [{ title: "Un valore reale", body: { text: "Il test fornisce un valore reale, non una stima.", verification: "verified" } }, { title: "Analisi indipendente", body: { text: "Analisi di laboratorio indipendente eseguita da Vitas a Oslo.", verification: "verified" } }, { title: "Contesto confrontabile", body: { text: "Il risultato viene confrontato con un database di riferimento descritto come uno dei più grandi del suo genere.", verification: "verified" } }, { title: "Follow-up in numeri", body: { text: "Dopo 120 giorni puoi ripetere il test e vedere il cambiamento in numeri.", verification: "verified" } }] },
  nextStep: { eyebrow: "Cosa comprende il passo successivo", title: "Scegli il percorso più adatto in questo momento", body: "InsideBalance mostra il passo successivo. L'acquisto vero e proprio avviene tramite Zinzino quando decidi di proseguire.", cards: [{ title: "OmegaBalance", body: "Per te se vuoi iniziare dall'equilibrio omega-6:3 e ottenere una prima misurazione chiara.", cta: "Vai a OmegaBalance", href: "/it/omega-balance", label: "Inizia qui" }, { title: "GutBalance", body: "Per te se in seguito vuoi completare il percorso con salute intestinale, metabolismo e segnali legati al sistema immunitario.", cta: "Esplora GutBalance", href: "/it/gut-balance", label: "Percorso complementare" }] },
  transparency: { text: "InsideBalance orienta. Gli acquisti avvengono tramite Zinzino. Possiamo ricevere una commissione sugli acquisti completati, ma questo non cambia il modo in cui descriviamo il percorso.", verification: "verified" },
  closing: { title: "Inizia dal primo passo più chiaro", body: "Se vuoi un primo valore concreto, OmegaBalance è il punto di partenza naturale all'interno di InsideBalance.", cta: "Apri OmegaBalance", href: "/it/omega-balance" },
  faqTitle: "FAQ",
  faq: [{ question: "InsideBalance vende il test direttamente?", answer: "No. InsideBalance guida e spiega. Quando passi all'ordine, l'acquisto avviene tramite Zinzino." }, { question: "Dove viene analizzato il campione di sangue?", answer: "Il campione di sangue viene analizzato in modo anonimo da Vitas, laboratorio indipendente certificato GMP a Oslo, in Norvegia." }, { question: "Cosa ricevo dopo il test?", answer: "Ricevi un report che ti offre una base più chiara per comprendere il risultato e quale potrebbe essere un passo successivo ragionevole." }, { question: "Devo iniziare con GutBalance?", answer: "Non necessariamente. All'interno di InsideBalance, OmegaBalance è al momento il punto di partenza più chiaro. GutBalance è un percorso complementare." }, { question: "Perché iniziare misurando?", answer: "Perché un valore concreto rende più facile capire il punto di partenza prima di provare a cambiare qualcosa." }],
};
