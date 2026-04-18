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

