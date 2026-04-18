import type { ClaimText, LangRecord } from "@/content/v4-types";

export type GutBalanceV4Content = {
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primaryCta: string;
    trustRow: ClaimText[];
  };
  problem: {
    title: string;
    body: ClaimText;
  };
  product: {
    eyebrow: string;
    title: string;
    body: ClaimText;
    points: ClaimText[];
  };
  science: {
    title: string;
    body: ClaimText;
    markers: { title: string; body: ClaimText }[];
  };
  omegaLink: {
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };
  faqTitle: string;
  faq: { question: string; answer: string }[];
};

export const gutBalanceV4Content: LangRecord<GutBalanceV4Content> = {
  sv: {
    hero: {
      eyebrow: "GutBalance",
      title: "Ett sakligare sätt att börja förstå tarmhälsa",
      body: "GutBalance fokuserar på mätbara signaler kopplade till tarm, immunförsvar och metabolism. Upplägget är gjort för att kännas tydligt och modernt, inte alternativt eller svepande.",
      primaryCta: "Beställ GutBalance",
      trustRow: [
        { text: "Blodbaserat hemmatest", verification: "verified" },
        { text: "Digital rapport", verification: "verified" },
        { text: "Utan avföringsprov", verification: "verified" },
      ],
    },
    problem: {
      title: "Varför tarmhälsa känns relevant just nu",
      body: {
        text: "Modern kost och låg fiberandel nämns ofta i diskussionen om tarmhälsa. På den här sidan ska problemet beskrivas sakligt och utan att överdriva vad test eller produkt kan lova.",
        verification: "required",
        note: "Keep this framed as contextual copy until final source-backed wording is approved.",
      },
    },
    product: {
      eyebrow: "Vad ZinoBiotic+ gör",
      title: "Produktdelen ska beskrivas sakligt",
      body: {
        text: "ZinoBiotic+ ska här beskrivas som ett komplement i upplägget, inte som en garanti om viss effekt.",
        verification: "placeholder",
        note: "Replace with approved product wording before go-live.",
      },
      points: [
        { text: "Produktcopy hålls som placeholder tills godkänd dokumentation är låst.", verification: "placeholder" },
        { text: "Alla effektpåståenden om tarm, immunförsvar eller metabolism kräver verifiering.", verification: "required" },
        { text: "Sidan ska kännas saklig, inte alternativhälsig.", verification: "verified" },
      ],
    },
    science: {
      title: "Tre markörer som ger riktning, inte löften",
      body: {
        text: "GutBalance presenterar markörer och rapportering som ett sätt att skapa tydligare orientering. Formuleringarna ska hållas nära underlaget och inte lova mer än datan stödjer.",
        verification: "verified",
      },
      markers: [
        { title: "IPA", body: { text: "Beskrivs som en skyddande metabolit producerad av tarmbakterier.", verification: "required", note: "Needs approved phrasing from source pack." } },
        { title: "TRP", body: { text: "Används som markör i rapporten och ska beskrivas neutralt.", verification: "verified" } },
        { title: "KYN", body: { text: "Presenteras som del av rapportens bild av belastande och skyddande signalvägar.", verification: "required" } },
      ],
    },
    omegaLink: {
      title: "GutBalance och omega-balans kompletterar varandra",
      body: "GutBalance är inte tänkt att konkurrera med OmegaBalance. För många är omega-balansen den tydligaste startpunkten, medan GutBalance fungerar som ett kompletterande nästa steg.",
      primaryCta: "Gå till OmegaBalance",
      secondaryCta: "Fortsätt till GutBalance hos Zinzino",
    },
    faqTitle: "Vanliga frågor",
    faq: [
      { question: "Är GutBalance alternativhälsa?", answer: "Nej. Sidan ska beskriva testet sakligt och modernt, utan formuleringar om att \"läka tarmen\" eller liknande." },
      { question: "Vad mäter GutBalance?", answer: "GutBalance fokuserar på tre markörer som används för att ge en tydligare bild av tarm, immunförsvar och metabolism." },
      { question: "Behöver jag börja här?", answer: "Inte nödvändigtvis. För många är OmegaBalance den naturliga första vägen in, medan GutBalance fungerar som komplement." },
      { question: "Var sker beställningen?", answer: "Beställningen sker hos Zinzino när du går vidare från InsideBalance." },
      { question: "Är alla påståenden om produkten slutligt verifierade här?", answer: "Nej. Produktcopy och vissa funktionspåståenden ska behandlas som placeholders eller VERIFY_CLAIM tills de är godkända mot dokumentationen." },
    ],
  },
  en: {
    hero: {
      eyebrow: "GutBalance",
      title: "A more grounded way to understand gut health",
      body: "GutBalance focuses on measurable signals related to the gut, immunity, and metabolism. The goal is clarity and credibility, not alternative-health language.",
      primaryCta: "Order GutBalance",
      trustRow: [
        { text: "Blood-based home test", verification: "verified" },
        { text: "Digital report", verification: "verified" },
        { text: "No stool sample", verification: "verified" },
      ],
    },
    problem: {
      title: "Why gut health feels relevant right now",
      body: {
        text: "Modern diet patterns and low fiber intake are often part of the gut-health discussion. This page should frame the problem clearly without exaggerating what the test or product can promise.",
        verification: "required",
      },
    },
    product: {
      eyebrow: "What ZinoBiotic+ does",
      title: "The product section must stay factual",
      body: {
        text: "ZinoBiotic+ should be presented here as a supporting part of the setup, not as a guaranteed outcome.",
        verification: "placeholder",
      },
      points: [
        { text: "Product copy remains placeholder until approved documentation is locked.", verification: "placeholder" },
        { text: "Any effect claims about gut health, immunity, or metabolism require verification.", verification: "required" },
        { text: "The page should feel modern and credible, not alternative-health driven.", verification: "verified" },
      ],
    },
    science: {
      title: "Three markers that provide direction rather than promises",
      body: {
        text: "GutBalance presents markers and reporting as a clearer way to orient yourself. The wording should stay close to the source material and avoid overstating outcomes.",
        verification: "verified",
      },
      markers: [
        { title: "IPA", body: { text: "Presented as a protective metabolite produced by gut bacteria.", verification: "required" } },
        { title: "TRP", body: { text: "Used as a report marker and described neutrally.", verification: "verified" } },
        { title: "KYN", body: { text: "Shown as part of the report's picture of stress-related and protective pathways.", verification: "required" } },
      ],
    },
    omegaLink: {
      title: "GutBalance and omega balance support the same funnel",
      body: "GutBalance is not meant to compete with OmegaBalance. For many people, omega balance is the clearest place to begin, while GutBalance works as a complementary next step.",
      primaryCta: "Go to OmegaBalance",
      secondaryCta: "Continue to GutBalance on Zinzino",
    },
    faqTitle: "FAQ",
    faq: [
      { question: "Is GutBalance alternative health?", answer: "No. The page should describe the test in a modern, factual way, without language about \"healing the gut\" or similar." },
      { question: "What does GutBalance measure?", answer: "GutBalance focuses on three markers used to provide a clearer picture of the gut, immunity, and metabolism." },
      { question: "Do I need to begin here?", answer: "Not necessarily. For many people, OmegaBalance is the more natural starting point, while GutBalance acts as a complement." },
      { question: "Where does ordering happen?", answer: "Ordering happens through Zinzino once you continue from InsideBalance." },
      { question: "Are all product claims fully verified here?", answer: "No. Product copy and some functional claims must be treated as placeholders or VERIFY_CLAIM until approved against documentation." },
    ],
  },
};
