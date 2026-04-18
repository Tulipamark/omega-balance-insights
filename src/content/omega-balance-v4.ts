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

