import type { ClaimText, LangRecord } from "@/content/v4-types";

export type OmegaBalanceV4Content = {
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    trustRow: ClaimText[];
    ratioLabel: string;
    ratioBars: { label: string; value: string; widthClass: string; colorClass: string; claim?: ClaimText }[];
    ratioCta: string;
  };
  normalizing: {
    body: ClaimText;
  };
  markers: {
    eyebrow: string;
    title: string;
    body: string;
    items: { title: string; body: ClaimText }[];
  };
  process: {
    title: string;
    steps: { label: string; title: string; body: ClaimText }[];
  };
  trust: {
    title: string;
    items: { title: string; body: ClaimText }[];
  };
  faqTitle: string;
  faq: { question: string; answer: string }[];
};

export const omegaBalanceV4Content: LangRecord<OmegaBalanceV4Content> = {
  sv: {
    hero: {
      eyebrow: "OmegaBalance",
      title: "Se var din omega-balans faktiskt ligger",
      body: "Ett hemtest baserat på dried blood spot visar din uppmätta omega-6:3-balans svart på vitt och ger ett tydligare första värde att utgå från.",
      primaryCta: "Gå vidare till testet",
      secondaryCta: "Se hur det fungerar",
      trustRow: [
        { text: "Analyserat av Vitas, Oslo", verification: "verified" },
        { text: "CE-märkt testkit", verification: "verified" },
        { text: "Anonymt hanterat", verification: "verified" },
      ],
      ratioLabel: "Referensskala",
      ratioBars: [
        {
          label: "Genomsnitt i Norden",
          value: "VERIFY_CLAIM",
          widthClass: "w-full",
          colorClass: "bg-[#c4714f]",
          claim: { text: "Nordiskt genomsnitt behöver verifieras mot godkänd källa före go-live.", verification: "required", note: "Replace placeholder value and wording once source is approved." },
        },
        {
          label: "Optimalt mål",
          value: "3:1",
          widthClass: "w-[38%]",
          colorClass: "bg-[#4e9b6f]",
        },
      ],
      ratioCta: "Ta reda på ditt värde",
    },
    normalizing: {
      body: {
        text: "Obalans märks sällan tydligt i vardagen. Därför blir det lätt att gå på känsla, kostvanor eller allmänna råd i stället för att börja med en faktisk mätning.",
        verification: "verified",
      },
    },
    markers: {
      eyebrow: "Vad testet mäter",
      title: "Sex markörer som gör resultatet mer användbart",
      body: "Testet ger ett tydligare underlag än ett enda förhållande och hjälper dig att förstå hur värdena hänger ihop.",
      items: [
        { title: "Omega-6:3-balans", body: { text: "Visar relationen mellan omega-6 och omega-3 i blodet.", verification: "verified" } },
        { title: "Omega-3-index", body: { text: "Ger ett tydligare mått på andelen omega-3 i membranen.", verification: "required", note: "Keep wording neutral until final product documentation is cross-checked." } },
        { title: "Skyddsvärde", body: { text: "Visar ett sammansatt värde som används i BalanceTest-rapporten.", verification: "required", note: "Needs approved wording from source material." } },
        { title: "Cellmembranfluiditet", body: { text: "Beskriver membranernas sammansättning i rapportens modell.", verification: "required", note: "Needs product-approved phrasing." } },
        { title: "Mental styrka", body: { text: "Används som benämning i rapporten men ska inte kopplas till kognition utan verifierat underlag.", verification: "required", note: "Do not extend this claim without approved source." } },
        { title: "AA-index", body: { text: "Visar balansen i en del av fettsyraprofilen som används i rapporten.", verification: "required", note: "Needs approved wording." } },
      ],
    },
    process: {
      title: "Så fungerar processen",
      steps: [
        { label: "01", title: "Ta provet hemma", body: { text: "Testet görs hemma med några droppar blod på testkortet.", verification: "verified" } },
        { label: "02", title: "Skicka in provet", body: { text: "När provet har torkat skickas det vidare i det medföljande kuvertet.", verification: "verified" } },
        { label: "03", title: "Analys hos Vitas", body: { text: "Blodprovet analyseras anonymt av Vitas, ett oberoende GMP-certifierat kontraktslaboratorium i Oslo, Norge.", verification: "verified" } },
        { label: "04", title: "Få resultat och följ upp", body: { text: "Du får en rapport med sex hälsomarkörer och kan följa upp med nytt test efter 120 dagar.", verification: "verified" } },
      ],
    },
    trust: {
      title: "Varför upplägget känns sakligt",
      items: [
        { title: "DBS-test hemma", body: { text: "BalanceTest är ett hemtest baserat på dried blood spot.", verification: "verified" } },
        { title: "Sex hälsomarkörer", body: { text: "Rapporten ger sex hälsomarkörer som gör resultatet mer användbart i nästa steg.", verification: "verified" } },
        { title: "Upp till tre veckor", body: { text: "Resultat kommuniceras inom upp till tre veckor.", verification: "verified" } },
        { title: "Databas som referens", body: { text: "Zinzinos databas beskrivs som en av de största databaserna av sitt slag.", verification: "verified" } },
      ],
    },
    faqTitle: "Vanliga frågor",
    faq: [
      { question: "Vad är BalanceTest?", answer: "BalanceTest är ett hemtest baserat på dried blood spot som mäter 11 fettsyror och ger sex hälsomarkörer." },
      { question: "Var analyseras provet?", answer: "Provets analys utförs anonymt av Vitas i Oslo, ett oberoende GMP-certifierat kontraktslaboratorium." },
      { question: "Hur lång tid tar det att få svar?", answer: "Resultatet kommuniceras inom upp till tre veckor." },
      { question: "Varför är 3:1 ett viktigt mål?", answer: "3:1 används här som ett optimalt mål i skalan. Exakta jämförelser mot genomsnitt behöver verifierad källa före go-live." },
      { question: "Kan jag följa upp resultatet senare?", answer: "Ja. Upplägget bygger på att du kan göra ett nytt test efter 120 dagar och jämföra värdena." },
    ],
  },
  en: {
    hero: {
      eyebrow: "OmegaBalance",
      title: "See where your omega balance actually stands",
      body: "A dried blood spot home test shows your measured omega-6 to omega-3 balance clearly and gives you a more concrete first value to work from.",
      primaryCta: "Continue to the test",
      secondaryCta: "See how it works",
      trustRow: [
        { text: "Analyzed by Vitas, Oslo", verification: "verified" },
        { text: "CE-marked test kit", verification: "verified" },
        { text: "Handled anonymously", verification: "verified" },
      ],
      ratioLabel: "Reference scale",
      ratioBars: [
        {
          label: "Nordic average",
          value: "VERIFY_CLAIM",
          widthClass: "w-full",
          colorClass: "bg-[#c4714f]",
          claim: { text: "Nordic average wording and value require approved source before go-live.", verification: "required" },
        },
        {
          label: "Optimal target",
          value: "3:1",
          widthClass: "w-[38%]",
          colorClass: "bg-[#4e9b6f]",
        },
      ],
      ratioCta: "Find your value",
    },
    normalizing: {
      body: {
        text: "Imbalance rarely feels obvious in daily life. That is why many people rely on diet habits or assumptions instead of starting with a real measurement.",
        verification: "verified",
      },
    },
    markers: {
      eyebrow: "What the test measures",
      title: "Six markers that make the result more useful",
      body: "The test gives a broader basis than a single ratio and helps you understand how the values relate to each other.",
      items: [
        { title: "Omega-6:3 balance", body: { text: "Shows the relationship between omega-6 and omega-3 in the blood.", verification: "verified" } },
        { title: "Omega-3 index", body: { text: "Provides a clearer measure of the omega-3 share in the membranes.", verification: "required" } },
        { title: "Protection value", body: { text: "Shows a composite value used in the BalanceTest report.", verification: "required" } },
        { title: "Cell membrane fluidity", body: { text: "Describes membrane composition within the report model.", verification: "required" } },
        { title: "Mental strength", body: { text: "Used as a report label and should not be extended into cognition claims without approved source material.", verification: "required" } },
        { title: "AA index", body: { text: "Shows a balance-related part of the fatty acid profile used in the report.", verification: "required" } },
      ],
    },
    process: {
      title: "How the process works",
      steps: [
        { label: "01", title: "Take the sample at home", body: { text: "The test is done at home with a few drops of blood on the card.", verification: "verified" } },
        { label: "02", title: "Send the sample in", body: { text: "Once dried, the sample is sent in using the included envelope.", verification: "verified" } },
        { label: "03", title: "Analysis by Vitas", body: { text: "The blood sample is analyzed anonymously by Vitas, an independent GMP-certified contract laboratory in Oslo, Norway.", verification: "verified" } },
        { label: "04", title: "Get the report and follow up", body: { text: "You receive a report with six health markers and can retest after 120 days.", verification: "verified" } },
      ],
    },
    trust: {
      title: "Why the setup feels credible",
      items: [
        { title: "DBS home test", body: { text: "BalanceTest is a dried blood spot home test.", verification: "verified" } },
        { title: "Six health markers", body: { text: "The report includes six health markers that give the next step more context.", verification: "verified" } },
        { title: "Up to three weeks", body: { text: "Results are communicated within up to three weeks.", verification: "verified" } },
        { title: "Database-based context", body: { text: "Zinzino's database is described as one of the largest of its kind.", verification: "verified" } },
      ],
    },
    faqTitle: "FAQ",
    faq: [
      { question: "What is BalanceTest?", answer: "BalanceTest is a dried blood spot home test that measures 11 fatty acids and provides six health markers." },
      { question: "Where is the sample analyzed?", answer: "The sample is analyzed anonymously by Vitas in Oslo, an independent GMP-certified contract laboratory." },
      { question: "How long does it take to get the result?", answer: "Results are communicated within up to three weeks." },
      { question: "Why is 3:1 shown as the target?", answer: "3:1 is presented here as the optimal target in the scale. Exact comparisons against population averages require approved sources before go-live." },
      { question: "Can I follow up later?", answer: "Yes. The model is built around retesting after 120 days and comparing the values." },
    ],
  },
};

omegaBalanceV4Content.no = {
  hero: { eyebrow: "OmegaBalance", title: "Se hvor omega-balansen din faktisk ligger", body: "En hjemmetest basert pa dried blood spot viser ditt malte omega-6:3-forhold og gir deg en tydeligere forste verdi a starte fra.", primaryCta: "Ga videre til testen", secondaryCta: "Se hvordan det fungerer", trustRow: [{ text: "Analysert av Vitas, Oslo", verification: "verified" }, { text: "CE-merket testkit", verification: "verified" }, { text: "Anonymt handtert", verification: "verified" }], ratioLabel: "Referanseskala", ratioBars: [{ label: "Nordisk gjennomsnitt", value: "VERIFY_CLAIM", widthClass: "w-full", colorClass: "bg-[#c4714f]", claim: { text: "Nordisk gjennomsnitt ma verifiseres mot godkjent kilde for publisering.", verification: "required" } }, { label: "Optimalt mal", value: "3:1", widthClass: "w-[38%]", colorClass: "bg-[#4e9b6f]" }], ratioCta: "Finn verdien din" },
  normalizing: { body: { text: "Ubalanse merkes sjelden tydelig i hverdagen. Derfor blir det lett a stole pa kostvaner eller antakelser i stedet for a starte med en faktisk maling.", verification: "verified" } },
  markers: { eyebrow: "Hva testen maler", title: "Seks markorer som gjor resultatet mer nyttig", body: "Testen gir et bredere grunnlag enn ett enkelt forhold og hjelper deg a forsta hvordan verdiene henger sammen.", items: [{ title: "Omega-6:3-balanse", body: { text: "Viser forholdet mellom omega-6 og omega-3 i blodet.", verification: "verified" } }, { title: "Omega-3-indeks", body: { text: "Gir et tydeligere mal pa andelen omega-3 i membranene.", verification: "required" } }, { title: "Beskyttelsesverdi", body: { text: "Viser en sammensatt verdi brukt i BalanceTest-rapporten.", verification: "required" } }, { title: "Cellemembranfluiditet", body: { text: "Beskriver membransammensetning i rapportmodellen.", verification: "required" } }, { title: "Mental styrke", body: { text: "Brukes som rapportbetegnelse og skal ikke utvides til kognisjonspastander uten godkjent kilde.", verification: "required" } }, { title: "AA-indeks", body: { text: "Viser en balanserelatert del av fettsyreprofilen i rapporten.", verification: "required" } }] },
  process: { title: "Slik fungerer prosessen", steps: [{ label: "01", title: "Ta proven hjemme", body: { text: "Testen tas hjemme med noen draper blod pa kortet.", verification: "verified" } }, { label: "02", title: "Send inn proven", body: { text: "Nar proven har torket, sendes den inn i vedlagte konvolutt.", verification: "verified" } }, { label: "03", title: "Analyse hos Vitas", body: { text: "Blodproven analyseres anonymt av Vitas, et uavhengig GMP-sertifisert kontraktslaboratorium i Oslo, Norge.", verification: "verified" } }, { label: "04", title: "Fa resultat og folg opp", body: { text: "Du far en rapport med seks helsemarkorer og kan folge opp med ny test etter 120 dager.", verification: "verified" } }] },
  trust: { title: "Hvorfor opplegget kjennes saklig", items: [{ title: "DBS-test hjemme", body: { text: "BalanceTest er en hjemmetest basert pa dried blood spot.", verification: "verified" } }, { title: "Seks helsemarkorer", body: { text: "Rapporten gir seks helsemarkorer som gjor resultatet mer nyttig i neste steg.", verification: "verified" } }, { title: "Inntil tre uker", body: { text: "Resultat kommuniseres innen inntil tre uker.", verification: "verified" } }, { title: "Database som referanse", body: { text: "Zinzinos database beskrives som en av de storste databasene av sitt slag.", verification: "verified" } }] },
  faqTitle: "Vanlige sporsmal",
  faq: [{ question: "Hva er BalanceTest?", answer: "BalanceTest er en hjemmetest basert pa dried blood spot som maler 11 fettsyrer og gir seks helsemarkorer." }, { question: "Hvor analyseres proven?", answer: "Proven analyseres anonymt av Vitas i Oslo, et uavhengig GMP-sertifisert kontraktslaboratorium." }, { question: "Hvor lang tid tar det a fa svar?", answer: "Resultatet kommuniseres innen inntil tre uker." }, { question: "Hvorfor vises 3:1 som mal?", answer: "3:1 brukes her som optimalt mal i skalaen. Eksakte sammenligninger mot befolkningssnitt krever godkjente kilder for publisering." }, { question: "Kan jeg folge opp senere?", answer: "Ja. Opplegget bygger pa ny test etter 120 dager og sammenligning av verdiene." }],
};

omegaBalanceV4Content.da = {
  hero: { eyebrow: "OmegaBalance", title: "Se hvor din omega-balance faktisk ligger", body: "En hjemmetest baseret pa dried blood spot viser dit malte omega-6:3-forhold og giver dig en tydeligere forste vaerdi at ga ud fra.", primaryCta: "Ga videre til testen", secondaryCta: "Se hvordan det fungerer", trustRow: [{ text: "Analyseret af Vitas, Oslo", verification: "verified" }, { text: "CE-maerket testkit", verification: "verified" }, { text: "Anonymt handteret", verification: "verified" }], ratioLabel: "Referenceskala", ratioBars: [{ label: "Nordisk gennemsnit", value: "VERIFY_CLAIM", widthClass: "w-full", colorClass: "bg-[#c4714f]", claim: { text: "Nordisk gennemsnit skal verificeres mod godkendt kilde for go-live.", verification: "required" } }, { label: "Optimalt mal", value: "3:1", widthClass: "w-[38%]", colorClass: "bg-[#4e9b6f]" }], ratioCta: "Find din vaerdi" },
  normalizing: { body: { text: "Ubalance maerkes sjaeldent tydeligt i hverdagen. Derfor bliver det let at ga efter kostvaner eller antagelser i stedet for at begynde med en reel maling.", verification: "verified" } },
  markers: { eyebrow: "Hvad testen maler", title: "Seks markorer der gor resultatet mere brugbart", body: "Testen giver et bredere grundlag end et enkelt forhold og hjalper dig med at forsta, hvordan vaerdierne hanger sammen.", items: [{ title: "Omega-6:3-balance", body: { text: "Viser forholdet mellem omega-6 og omega-3 i blodet.", verification: "verified" } }, { title: "Omega-3-indeks", body: { text: "Giver et tydeligere mal for andelen af omega-3 i membranerne.", verification: "required" } }, { title: "Beskyttelsesvaerdi", body: { text: "Viser en samlet vaerdi brugt i BalanceTest-rapporten.", verification: "required" } }, { title: "Cellemembranfluiditet", body: { text: "Beskriver membransammensaetning i rapportmodellen.", verification: "required" } }, { title: "Mental styrke", body: { text: "Bruges som rapportbetegnelse og ma ikke udvides til kognitive pastande uden godkendt kilde.", verification: "required" } }, { title: "AA-indeks", body: { text: "Viser en balancerelateret del af fedtsyreprofilen i rapporten.", verification: "required" } }] },
  process: { title: "Sadan fungerer processen", steps: [{ label: "01", title: "Tag proven hjemme", body: { text: "Testen tages hjemme med nogle draber blod pa kortet.", verification: "verified" } }, { label: "02", title: "Send proven ind", body: { text: "Nar proven er tort, sendes den ind i den vedlagte kuvert.", verification: "verified" } }, { label: "03", title: "Analyse hos Vitas", body: { text: "Blodproven analyseres anonymt af Vitas, et uafhaengigt GMP-certificeret kontraktlaboratorium i Oslo, Norge.", verification: "verified" } }, { label: "04", title: "Fa resultat og folg op", body: { text: "Du far en rapport med seks sundhedsmarkorer og kan folge op med en ny test efter 120 dage.", verification: "verified" } }] },
  trust: { title: "Hvorfor oplagget virker sagligt", items: [{ title: "DBS-test hjemme", body: { text: "BalanceTest er en hjemmetest baseret pa dried blood spot.", verification: "verified" } }, { title: "Seks sundhedsmarkorer", body: { text: "Rapporten giver seks sundhedsmarkorer, der gor resultatet mere brugbart i naeste trin.", verification: "verified" } }, { title: "Op til tre uger", body: { text: "Resultater kommunikeres inden for op til tre uger.", verification: "verified" } }, { title: "Database som reference", body: { text: "Zinzinos database beskrives som en af de storste databaser af sin slags.", verification: "verified" } }] },
  faqTitle: "Ofte stillede sporgsmal",
  faq: [{ question: "Hvad er BalanceTest?", answer: "BalanceTest er en hjemmetest baseret pa dried blood spot, som maler 11 fedtsyrer og giver seks sundhedsmarkorer." }, { question: "Hvor analyseres proven?", answer: "Proven analyseres anonymt af Vitas i Oslo, et uafhaengigt GMP-certificeret kontraktlaboratorium." }, { question: "Hvor lang tid tager det at fa svar?", answer: "Resultater kommunikeres inden for op til tre uger." }, { question: "Hvorfor vises 3:1 som mal?", answer: "3:1 bruges her som det optimale mal i skalaen. Eksakte sammenligninger mod befolkningsgennemsnit kraever godkendte kilder for go-live." }, { question: "Kan jeg folge op senere?", answer: "Ja. Oplagget bygger pa en ny test efter 120 dage og sammenligning af vaerdierne." }],
};

omegaBalanceV4Content.fi = {
  hero: { eyebrow: "OmegaBalance", title: "Näe, missä omega-tasapainosi todella on", body: "Kotona tehtävä dried blood spot -testi näyttää mitatun omega-6:3-suhteesi selkeästi ja antaa konkreettisemman ensimmäisen arvon, josta voit lähteä liikkeelle.", primaryCta: "Jatka testiin", secondaryCta: "Katso miten se toimii", trustRow: [{ text: "Analysoitu Vitasissa, Oslossa", verification: "verified" }, { text: "CE-merkitty testipakkaus", verification: "verified" }, { text: "Käsitellään anonyymisti", verification: "verified" }], ratioLabel: "Viiteasteikko", ratioBars: [{ label: "Pohjoismainen keskiarvo", value: "VERIFY_CLAIM", widthClass: "w-full", colorClass: "bg-[#c4714f]", claim: { text: "Pohjoismainen keskiarvo vaatii hyväksytyn lähteen ennen julkaisua.", verification: "required" } }, { label: "Optimaalinen tavoite", value: "3:1", widthClass: "w-[38%]", colorClass: "bg-[#4e9b6f]" }], ratioCta: "Selvitä oma arvosi" },
  normalizing: { body: { text: "Epätasapaino näkyy arjessa harvoin selvästi. Siksi moni nojaa ruokailutapoihin tai oletuksiin sen sijaan, että aloittaisi todellisesta mittauksesta.", verification: "verified" } },
  markers: { eyebrow: "Mitä testi mittaa", title: "Kuusi markkeria, jotka tekevät tuloksesta hyödyllisemmän", body: "Testi antaa laajemman perustan kuin yksi suhdeluku ja auttaa ymmärtämään, miten arvot liittyvät toisiinsa.", items: [{ title: "Omega-6:3-tasapaino", body: { text: "Näyttää omega-6:n ja omega-3:n suhteen veressä.", verification: "verified" } }, { title: "Omega-3-indeksi", body: { text: "Antaa selkeämmän mitan omega-3:n osuudesta kalvoissa.", verification: "required" } }, { title: "Suoja-arvo", body: { text: "Näyttää yhdistetyn arvon, jota käytetään BalanceTest-raportissa.", verification: "required" } }, { title: "Solukalvon juoksevuus", body: { text: "Kuvaa kalvojen koostumusta raportin mallissa.", verification: "required" } }, { title: "Mentaalinen vahvuus", body: { text: "Käytetään raportin nimikkeenä eikä sitä tule laajentaa kognitioväitteisiin ilman hyväksyttyä lähdettä.", verification: "required" } }, { title: "AA-indeksi", body: { text: "Näyttää rasvahappoprofiilin tasapainoon liittyvän osan raportissa.", verification: "required" } }] },
  process: { title: "Näin prosessi toimii", steps: [{ label: "01", title: "Ota näyte kotona", body: { text: "Testi tehdään kotona muutamalla veripisaralla kortille.", verification: "verified" } }, { label: "02", title: "Lähetä näyte", body: { text: "Kun näyte on kuivunut, se lähetetään mukana tulevassa kirjekuoressa.", verification: "verified" } }, { label: "03", title: "Analyysi Vitasissa", body: { text: "Verinäyte analysoidaan anonyymisti Vitasissa, riippumattomassa GMP-sertifioidussa sopimuslaboratoriossa Oslossa, Norjassa.", verification: "verified" } }, { label: "04", title: "Saat raportin ja seuraat", body: { text: "Saat raportin kuudella terveysmarkkerilla ja voit testata uudelleen 120 päivän jälkeen.", verification: "verified" } }] },
  trust: { title: "Miksi kokonaisuus tuntuu uskottavalta", items: [{ title: "DBS-kotitesti", body: { text: "BalanceTest on dried blood spot -kotitesti.", verification: "verified" } }, { title: "Kuusi terveysmarkkeria", body: { text: "Raportti sisältää kuusi terveysmarkkeria, jotka antavat enemmän kontekstia seuraavaan vaiheeseen.", verification: "verified" } }, { title: "Enintään kolme viikkoa", body: { text: "Tulokset toimitetaan enintään kolmessa viikossa.", verification: "verified" } }, { title: "Tietokantaan perustuva viitekehys", body: { text: "Zinzino kuvaa tietokantaansa yhtenä lajinsa suurimmista.", verification: "verified" } }] },
  faqTitle: "Usein kysytyt kysymykset",
  faq: [{ question: "Mikä on BalanceTest?", answer: "BalanceTest on dried blood spot -kotitesti, joka mittaa 11 rasvahappoa ja antaa kuusi terveysmarkkeria." }, { question: "Missä näyte analysoidaan?", answer: "Näyte analysoidaan anonyymisti Vitasissa Oslossa, riippumattomassa GMP-sertifioidussa sopimuslaboratoriossa." }, { question: "Kuinka kauan tuloksen saaminen kestää?", answer: "Tulokset toimitetaan enintään kolmessa viikossa." }, { question: "Miksi tavoitteena näytetään 3:1?", answer: "3:1 esitetään tässä optimaalisena tavoitteena asteikolla. Tarkat vertailut väestön keskiarvoihin vaativat hyväksytyt lähteet ennen julkaisua." }, { question: "Voinko seurata tulosta myöhemmin?", answer: "Kyllä. Malli perustuu uusintatestiin 120 päivän jälkeen ja arvojen vertailuun." }],
};

omegaBalanceV4Content.de = {
  hero: { eyebrow: "OmegaBalance", title: "Sieh, wo deine Omega-Balance tatsächlich liegt", body: "Ein dried blood spot Heimtest zeigt dein gemessenes Omega-6:3-Verhältnis klar und gibt dir einen konkreteren ersten Wert, von dem du ausgehen kannst.", primaryCta: "Zum Test weitergehen", secondaryCta: "So funktioniert es", trustRow: [{ text: "Analysiert von Vitas, Oslo", verification: "verified" }, { text: "CE-gekennzeichnetes Testkit", verification: "verified" }, { text: "Anonym bearbeitet", verification: "verified" }], ratioLabel: "Referenzskala", ratioBars: [{ label: "Nordischer Durchschnitt", value: "VERIFY_CLAIM", widthClass: "w-full", colorClass: "bg-[#c4714f]", claim: { text: "Nordischer Durchschnitt benötigt vor dem Go-live eine freigegebene Quelle.", verification: "required" } }, { label: "Optimales Ziel", value: "3:1", widthClass: "w-[38%]", colorClass: "bg-[#4e9b6f]" }], ratioCta: "Finde deinen Wert" },
  normalizing: { body: { text: "Ein Ungleichgewicht ist im Alltag selten deutlich spürbar. Deshalb verlassen sich viele eher auf Ernährungsgewohnheiten oder Annahmen, statt mit einer echten Messung zu beginnen.", verification: "verified" } },
  markers: { eyebrow: "Was der Test misst", title: "Sechs Marker, die das Ergebnis nützlicher machen", body: "Der Test liefert eine breitere Grundlage als nur ein einzelnes Verhältnis und hilft dir zu verstehen, wie die Werte zusammenhängen.", items: [{ title: "Omega-6:3-Balance", body: { text: "Zeigt das Verhältnis von Omega-6 zu Omega-3 im Blut.", verification: "verified" } }, { title: "Omega-3-Index", body: { text: "Gibt ein klareres Maß für den Omega-3-Anteil in den Membranen.", verification: "required" } }, { title: "Schutzwert", body: { text: "Zeigt einen zusammengesetzten Wert, der im BalanceTest-Bericht verwendet wird.", verification: "required" } }, { title: "Zellmembranfluidität", body: { text: "Beschreibt die Membranzusammensetzung innerhalb des Berichtmodells.", verification: "required" } }, { title: "Mentale Stärke", body: { text: "Wird als Berichtbezeichnung verwendet und darf ohne freigegebene Quelle nicht zu Kognitionsclaims erweitert werden.", verification: "required" } }, { title: "AA-Index", body: { text: "Zeigt einen balancebezogenen Teil des Fettsäureprofils im Bericht.", verification: "required" } }] },
  process: { title: "So funktioniert der Prozess", steps: [{ label: "01", title: "Probe zu Hause nehmen", body: { text: "Der Test wird zu Hause mit ein paar Tropfen Blut auf der Karte durchgeführt.", verification: "verified" } }, { label: "02", title: "Probe einsenden", body: { text: "Sobald die Probe getrocknet ist, wird sie im beiliegenden Umschlag eingesendet.", verification: "verified" } }, { label: "03", title: "Analyse bei Vitas", body: { text: "Die Blutprobe wird anonym von Vitas analysiert, einem unabhängigen GMP-zertifizierten Vertragslabor in Oslo, Norwegen.", verification: "verified" } }, { label: "04", title: "Bericht erhalten und nachverfolgen", body: { text: "Du erhältst einen Bericht mit sechs Gesundheitsmarkern und kannst nach 120 Tagen erneut testen.", verification: "verified" } }] },
  trust: { title: "Warum das Setup glaubwürdig wirkt", items: [{ title: "DBS-Heimtest", body: { text: "BalanceTest ist ein dried blood spot Heimtest.", verification: "verified" } }, { title: "Sechs Gesundheitsmarker", body: { text: "Der Bericht enthält sechs Gesundheitsmarker, die dem nächsten Schritt mehr Kontext geben.", verification: "verified" } }, { title: "Bis zu drei Wochen", body: { text: "Ergebnisse werden innerhalb von bis zu drei Wochen kommuniziert.", verification: "verified" } }, { title: "Datenbankgestützter Kontext", body: { text: "Zinzinos Datenbank wird als eine der größten ihrer Art beschrieben.", verification: "verified" } }] },
  faqTitle: "FAQ",
  faq: [{ question: "Was ist BalanceTest?", answer: "BalanceTest ist ein dried blood spot Heimtest, der 11 Fettsäuren misst und sechs Gesundheitsmarker liefert." }, { question: "Wo wird die Probe analysiert?", answer: "Die Probe wird anonym von Vitas in Oslo analysiert, einem unabhängigen GMP-zertifizierten Vertragslabor." }, { question: "Wie lange dauert es bis zum Ergebnis?", answer: "Ergebnisse werden innerhalb von bis zu drei Wochen kommuniziert." }, { question: "Warum wird 3:1 als Ziel gezeigt?", answer: "3:1 wird hier als optimales Ziel in der Skala dargestellt. Exakte Vergleiche mit Bevölkerungsdurchschnitten benötigen vor dem Go-live freigegebene Quellen." }, { question: "Kann ich später nachverfolgen?", answer: "Ja. Das Modell ist auf einen erneuten Test nach 120 Tagen und den Vergleich der Werte ausgelegt." }],
};

omegaBalanceV4Content.fr = {
  hero: { eyebrow: "OmegaBalance", title: "Voyez où se situe réellement votre équilibre oméga", body: "Un test à domicile dried blood spot montre clairement votre ratio oméga-6:3 mesuré et vous donne une première valeur plus concrète sur laquelle vous appuyer.", primaryCta: "Continuer vers le test", secondaryCta: "Voir comment cela fonctionne", trustRow: [{ text: "Analysé par Vitas, Oslo", verification: "verified" }, { text: "Kit de test marqué CE", verification: "verified" }, { text: "Traitement anonyme", verification: "verified" }], ratioLabel: "Échelle de référence", ratioBars: [{ label: "Moyenne nordique", value: "VERIFY_CLAIM", widthClass: "w-full", colorClass: "bg-[#c4714f]", claim: { text: "La moyenne nordique nécessite une source approuvée avant la mise en ligne.", verification: "required" } }, { label: "Objectif optimal", value: "3:1", widthClass: "w-[38%]", colorClass: "bg-[#4e9b6f]" }], ratioCta: "Trouver votre valeur" },
  normalizing: { body: { text: "Un déséquilibre se ressent rarement clairement au quotidien. C'est pourquoi beaucoup s'appuient sur leurs habitudes alimentaires ou des suppositions au lieu de commencer par une vraie mesure.", verification: "verified" } },
  markers: { eyebrow: "Ce que mesure le test", title: "Six marqueurs qui rendent le résultat plus utile", body: "Le test offre une base plus large qu'un simple ratio et aide à comprendre comment les valeurs se relient entre elles.", items: [{ title: "Équilibre oméga-6:3", body: { text: "Montre la relation entre les oméga-6 et les oméga-3 dans le sang.", verification: "verified" } }, { title: "Indice oméga-3", body: { text: "Donne une mesure plus claire de la part d'oméga-3 dans les membranes.", verification: "required" } }, { title: "Valeur de protection", body: { text: "Montre une valeur composite utilisée dans le rapport BalanceTest.", verification: "required" } }, { title: "Fluidité membranaire", body: { text: "Décrit la composition des membranes dans le modèle du rapport.", verification: "required" } }, { title: "Force mentale", body: { text: "Utilisé comme intitulé de rapport et ne doit pas être étendu à des allégations cognitives sans source approuvée.", verification: "required" } }, { title: "Indice AA", body: { text: "Montre une partie du profil des acides gras liée à l'équilibre dans le rapport.", verification: "required" } }] },
  process: { title: "Comment fonctionne le processus", steps: [{ label: "01", title: "Prélever l'échantillon à domicile", body: { text: "Le test se fait à domicile avec quelques gouttes de sang sur la carte.", verification: "verified" } }, { label: "02", title: "Envoyer l'échantillon", body: { text: "Une fois sec, l'échantillon est envoyé dans l'enveloppe fournie.", verification: "verified" } }, { label: "03", title: "Analyse chez Vitas", body: { text: "L'échantillon sanguin est analysé anonymement par Vitas, un laboratoire sous contrat indépendant certifié GMP à Oslo, en Norvège.", verification: "verified" } }, { label: "04", title: "Recevoir le rapport et suivre", body: { text: "Vous recevez un rapport avec six marqueurs de santé et pouvez refaire un test après 120 jours.", verification: "verified" } }] },
  trust: { title: "Pourquoi l'ensemble paraît crédible", items: [{ title: "Test DBS à domicile", body: { text: "BalanceTest est un test à domicile dried blood spot.", verification: "verified" } }, { title: "Six marqueurs de santé", body: { text: "Le rapport comprend six marqueurs de santé qui donnent plus de contexte à l'étape suivante.", verification: "verified" } }, { title: "Jusqu'à trois semaines", body: { text: "Les résultats sont communiqués sous trois semaines maximum.", verification: "verified" } }, { title: "Contexte basé sur une base de données", body: { text: "La base de données de Zinzino est décrite comme l'une des plus grandes de son genre.", verification: "verified" } }] },
  faqTitle: "FAQ",
  faq: [{ question: "Qu'est-ce que BalanceTest ?", answer: "BalanceTest est un test à domicile dried blood spot qui mesure 11 acides gras et fournit six marqueurs de santé." }, { question: "Où l'échantillon est-il analysé ?", answer: "L'échantillon est analysé anonymement par Vitas à Oslo, laboratoire sous contrat indépendant certifié GMP." }, { question: "Combien de temps faut-il pour obtenir le résultat ?", answer: "Les résultats sont communiqués sous trois semaines maximum." }, { question: "Pourquoi 3:1 est-il présenté comme objectif ?", answer: "3:1 est présenté ici comme l'objectif optimal de l'échelle. Les comparaisons exactes avec les moyennes de population nécessitent des sources approuvées avant la mise en ligne." }, { question: "Puis-je faire un suivi plus tard ?", answer: "Oui. Le modèle repose sur un nouveau test après 120 jours et sur la comparaison des valeurs." }],
};

omegaBalanceV4Content.it = {
  hero: { eyebrow: "OmegaBalance", title: "Scopri dove si trova davvero il tuo equilibrio omega", body: "Un test domiciliare dried blood spot mostra chiaramente il tuo rapporto omega-6:3 misurato e ti offre un primo valore più concreto da cui partire.", primaryCta: "Continua al test", secondaryCta: "Vedi come funziona", trustRow: [{ text: "Analizzato da Vitas, Oslo", verification: "verified" }, { text: "Kit di test marcato CE", verification: "verified" }, { text: "Gestito in modo anonimo", verification: "verified" }], ratioLabel: "Scala di riferimento", ratioBars: [{ label: "Media nordica", value: "VERIFY_CLAIM", widthClass: "w-full", colorClass: "bg-[#c4714f]", claim: { text: "La media nordica richiede una fonte approvata prima del go-live.", verification: "required" } }, { label: "Obiettivo ottimale", value: "3:1", widthClass: "w-[38%]", colorClass: "bg-[#4e9b6f]" }], ratioCta: "Trova il tuo valore" },
  normalizing: { body: { text: "Lo squilibrio raramente è evidente nella vita quotidiana. Per questo molti si affidano ad abitudini alimentari o supposizioni invece di iniziare da una misurazione reale.", verification: "verified" } },
  markers: { eyebrow: "Cosa misura il test", title: "Sei marcatori che rendono il risultato più utile", body: "Il test fornisce una base più ampia di un singolo rapporto e aiuta a capire come i valori si collegano tra loro.", items: [{ title: "Equilibrio omega-6:3", body: { text: "Mostra la relazione tra omega-6 e omega-3 nel sangue.", verification: "verified" } }, { title: "Indice omega-3", body: { text: "Fornisce una misura più chiara della quota di omega-3 nelle membrane.", verification: "required" } }, { title: "Valore di protezione", body: { text: "Mostra un valore composito usato nel report BalanceTest.", verification: "required" } }, { title: "Fluidità della membrana cellulare", body: { text: "Descrive la composizione delle membrane nel modello del report.", verification: "required" } }, { title: "Forza mentale", body: { text: "Usato come etichetta nel report e da non estendere a claim cognitivi senza una fonte approvata.", verification: "required" } }, { title: "Indice AA", body: { text: "Mostra una parte del profilo degli acidi grassi legata all'equilibrio nel report.", verification: "required" } }] },
  process: { title: "Come funziona il processo", steps: [{ label: "01", title: "Preleva il campione a casa", body: { text: "Il test si esegue a casa con alcune gocce di sangue sulla card.", verification: "verified" } }, { label: "02", title: "Invia il campione", body: { text: "Una volta asciutto, il campione viene inviato con la busta inclusa.", verification: "verified" } }, { label: "03", title: "Analisi presso Vitas", body: { text: "Il campione di sangue viene analizzato in modo anonimo da Vitas, laboratorio indipendente certificato GMP a Oslo, in Norvegia.", verification: "verified" } }, { label: "04", title: "Ricevi il report e segui", body: { text: "Ricevi un report con sei marcatori di salute e puoi ripetere il test dopo 120 giorni.", verification: "verified" } }] },
  trust: { title: "Perché il modello appare credibile", items: [{ title: "Test DBS a domicilio", body: { text: "BalanceTest è un test domiciliare dried blood spot.", verification: "verified" } }, { title: "Sei marcatori di salute", body: { text: "Il report include sei marcatori di salute che danno più contesto al passo successivo.", verification: "verified" } }, { title: "Fino a tre settimane", body: { text: "I risultati vengono comunicati entro un massimo di tre settimane.", verification: "verified" } }, { title: "Contesto basato su database", body: { text: "Il database di Zinzino è descritto come uno dei più grandi del suo genere.", verification: "verified" } }] },
  faqTitle: "FAQ",
  faq: [{ question: "Che cos'è BalanceTest?", answer: "BalanceTest è un test domiciliare dried blood spot che misura 11 acidi grassi e fornisce sei marcatori di salute." }, { question: "Dove viene analizzato il campione?", answer: "Il campione viene analizzato in modo anonimo da Vitas a Oslo, laboratorio indipendente certificato GMP." }, { question: "Quanto tempo ci vuole per ricevere il risultato?", answer: "I risultati vengono comunicati entro un massimo di tre settimane." }, { question: "Perché 3:1 è mostrato come obiettivo?", answer: "3:1 è presentato qui come obiettivo ottimale nella scala. I confronti esatti con le medie di popolazione richiedono fonti approvate prima del go-live." }, { question: "Posso fare un follow-up più avanti?", answer: "Sì. Il modello si basa su un nuovo test dopo 120 giorni e sul confronto dei valori." }],
};

omegaBalanceV4Content.ar = {
  hero: {
    eyebrow: "OmegaBalance",
    title: "اعرف توازن الأوميغا لديك وأنت مقيم في السويد",
    body: "اختبار منزلي يعتمد على بقعة دم مجففة يوضح توازن أوميغا-6 إلى أوميغا-3 لديك بناء على قياس فعلي. مناسب لمن يريد فهما هادئا وواضحا، بلغة قريبة من الجالية العربية والخليجية في السويد.",
    primaryCta: "المتابعة إلى الاختبار في السويد",
    secondaryCta: "كيف يعمل الاختبار",
    trustRow: [
      { text: "تحليل لدى Vitas في أوسلو", verification: "verified" },
      { text: "عدة اختبار بعلامة CE", verification: "verified" },
      { text: "مناسب للمقيمين في السويد", verification: "verified" },
    ],
    ratioLabel: "مقياس مرجعي",
    ratioBars: [
      {
        label: "متوسط الشمال الأوروبي",
        value: "VERIFY_CLAIM",
        widthClass: "w-full",
        colorClass: "bg-[#c4714f]",
        claim: { text: "يحتاج متوسط الشمال الأوروبي إلى مصدر معتمد قبل النشر.", verification: "required" },
      },
      {
        label: "الهدف المثالي",
        value: "3:1",
        widthClass: "w-[38%]",
        colorClass: "bg-[#4e9b6f]",
      },
    ],
    ratioCta: "اكتشف قيمتك",
  },
  normalizing: {
    body: {
      text: "مع تغيّر نمط الحياة بعد الانتقال إلى السويد، من السهل الاعتماد على الإحساس أو العادات الغذائية القديمة أو النصائح العامة. القياس يعطيك نقطة بداية أوضح، من دون مبالغة أو تخويف.",
      verification: "verified",
    },
  },
  markers: {
    eyebrow: "ما الذي يقيسه الاختبار",
    title: "ستة مؤشرات تجعل النتيجة أكثر فائدة",
    body: "لا يكتفي الاختبار بنسبة واحدة، بل يقدم أساسا أوسع يساعدك على فهم العلاقة بين القيم المختلفة.",
    items: [
      { title: "توازن أوميغا-6:3", body: { text: "يوضح العلاقة بين أوميغا-6 وأوميغا-3 في الدم.", verification: "verified" } },
      { title: "مؤشر أوميغا-3", body: { text: "يعطي قياسا أوضح لحصة أوميغا-3 في الأغشية.", verification: "required" } },
      { title: "قيمة الحماية", body: { text: "يعرض قيمة مركبة مستخدمة في تقرير BalanceTest.", verification: "required" } },
      { title: "مرونة غشاء الخلية", body: { text: "يصف تركيب الأغشية ضمن نموذج التقرير.", verification: "required" } },
      { title: "القوة الذهنية", body: { text: "يستخدم كتسمية في التقرير، ولا ينبغي ربطه بادعاءات إدراكية من دون مصدر معتمد.", verification: "required" } },
      { title: "مؤشر AA", body: { text: "يعرض جزءا من ملف الأحماض الدهنية المرتبط بالتوازن في التقرير.", verification: "required" } },
    ],
  },
  process: {
    title: "كيف تسير العملية",
    steps: [
      { label: "01", title: "خذ العينة في المنزل", body: { text: "يتم الاختبار في منزلك في السويد عبر وضع بضع قطرات من الدم على بطاقة الاختبار.", verification: "verified" } },
      { label: "02", title: "أرسل العينة", body: { text: "بعد أن تجف العينة، ترسلها باستخدام الظرف المرفق حسب التعليمات.", verification: "verified" } },
      { label: "03", title: "تحليل لدى Vitas", body: { text: "تحلل عينة الدم دون إظهار الهوية لدى Vitas، وهو مختبر تعاقدي مستقل حاصل على اعتماد GMP في أوسلو، النرويج.", verification: "verified" } },
      { label: "04", title: "استلم التقرير وتابع", body: { text: "تحصل على تقرير يتضمن ستة مؤشرات صحية، ويمكنك طلب شرح هادئ للنتيجة أو إعادة الاختبار بعد 120 يوما للمقارنة.", verification: "verified" } },
    ],
  },
  trust: {
    title: "لماذا يبدو هذا النهج موثوقا",
    items: [
      { title: "اختبار DBS منزلي", body: { text: "BalanceTest هو اختبار منزلي يعتمد على بقعة دم مجففة.", verification: "verified" } },
      { title: "ستة مؤشرات صحية", body: { text: "يقدم التقرير ستة مؤشرات صحية تمنح الخطوة التالية سياقا أوضح.", verification: "verified" } },
      { title: "حتى ثلاثة أسابيع", body: { text: "يتم إبلاغ النتائج خلال مدة تصل إلى ثلاثة أسابيع.", verification: "verified" } },
      { title: "سياق مبني على قاعدة بيانات", body: { text: "تصف Zinzino قاعدة بياناتها بأنها من أكبر قواعد البيانات من نوعها.", verification: "verified" } },
    ],
  },
  faqTitle: "أسئلة شائعة",
  faq: [
    { question: "ما هو BalanceTest؟", answer: "BalanceTest هو اختبار منزلي يعتمد على بقعة دم مجففة، ويقيس 11 حمضا دهنيا ويقدم ستة مؤشرات صحية. هذه الصفحة موجهة للعرب المقيمين في السويد، مع لغة واضحة وسياق محلي." },
    { question: "أين يتم تحليل العينة؟", answer: "تحلل العينة دون إظهار الهوية لدى Vitas في أوسلو، وهو مختبر تعاقدي مستقل حاصل على اعتماد GMP." },
    { question: "كم يستغرق الحصول على النتيجة؟", answer: "يتم إبلاغ النتائج خلال مدة تصل إلى ثلاثة أسابيع." },
    { question: "لماذا يظهر 3:1 كهدف؟", answer: "يستخدم 3:1 هنا كهدف مثالي على المقياس. أي مقارنة دقيقة مع متوسطات السكان تحتاج إلى مصادر معتمدة قبل النشر." },
    { question: "هل يمكنني فهم التقرير إذا كانت لغته غير مألوفة؟", answer: "نعم. يمكن شرح النتيجة بهدوء وبأسلوب عربي واضح، مع احترام أن بعض المصطلحات الطبية أو السويدية قد تحتاج إلى تبسيط." },
    { question: "هل يمكنني المتابعة لاحقا؟", answer: "نعم. يعتمد النموذج على إمكانية إعادة الاختبار بعد 120 يوما ومقارنة القيم." },
  ],
};
