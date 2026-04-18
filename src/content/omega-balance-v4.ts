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
