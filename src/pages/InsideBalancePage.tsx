import { ArrowRight, CheckCircle2, Menu } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import InsideBalanceLogo from "@/components/InsideBalanceLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import FAQSection from "@/components/FAQSection";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";
import insideBalancePortraitImage from "@/assets/insidebalance-portrait.webp";

type InsideBalancePageProps = {
  lang?: Lang;
};

type ProductCard = {
  title: string;
  eyebrow?: string;
  body: string;
  fit: string;
  cta: string;
  href: string;
  status?: string;
};

type InsideBalanceCopy = {
  navHome: string;
  navOmega: string;
  navGut: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  productsTitle: string;
  productsBody: string;
  products: ProductCard[];
  primaryRouteTitle?: string;
  primaryRouteBody?: string;
  secondaryRouteTitle?: string;
  secondaryRouteBody?: string;
  whyTitle: string;
  whyBody: string;
  trustTitle?: string;
  trustBody?: string;
  trustPoints?: string[];
  howTitle: string;
  howSteps: { title: string; body: string }[];
  whoTitle: string;
  whoItems: string[];
  footerTitle: string;
  footerBody: string;
  footerCta?: string;
};

type VisualFrameCopy = {
  heroTitle: string;
  heroBody: string;
  measurementLabel: string;
  measurementTitle: string;
  measurementBody: string;
  connectionLabel: string;
  connectionTitle: string;
  connectionBody: string;
};

const navExploreLabelByLang: Record<Lang, string> = {
  sv: "Utforska",
  no: "Utforsk",
  da: "Udforsk",
  fi: "Tutustu",
  en: "Explore",
  de: "Entdecken",
  fr: "Explorer",
  it: "Esplora",
};

const activeSecondaryRouteTitleByLang: Record<Lang, string> = {
  sv: "Utforska vidare",
  no: "Utforsk videre",
  da: "Udforsk videre",
  fi: "Tutki lisää",
  en: "Explore further",
  de: "Weiter erkunden",
  fr: "Explorer davantage",
  it: "Esplora oltre",
};

const activeSecondaryRouteBodyByLang: Record<Lang, string> = {
  sv: "För dig som vill förstå mage, tarm och inre balans genom samma lugna struktur.",
  no: "For deg som vil forstå mage, tarm og indre balanse gjennom samme rolige struktur.",
  da: "For dig, der vil forstå mave, tarm og indre balance gennem samme rolige struktur.",
  fi: "Sinulle, joka haluat ymmärtää vatsaa, suolistoa ja sisäistä tasapainoa saman rauhallisen rakenteen kautta.",
  en: "For people who want to understand gut health, digestion, and inner balance through the same calm structure.",
  de: "Für Menschen, die Darm, Verdauung und innere Balance in derselben ruhigen Struktur besser verstehen möchten.",
  fr: "Pour celles et ceux qui veulent mieux comprendre le ventre, l'intestin et l'équilibre intérieur dans la même structure apaisée.",
  it: "Per chi vuole capire meglio intestino, digestione ed equilibrio interno attraverso la stessa struttura calma.",
};

const navAvailableLabelByLang: Record<Lang, string> = {
  sv: "Nu",
  no: "Nå",
  da: "Nu",
  fi: "Nyt",
  en: "Now",
  de: "Jetzt",
  fr: "Maint.",
  it: "Ora",
};

const navSoonLabelByLang: Record<Lang, string> = {
  sv: "Snart",
  no: "Snart",
  da: "Snart",
  fi: "Tulossa",
  en: "Soon",
  de: "Bald",
  fr: "Bientôt",
  it: "Presto",
};

const footerExploreLabelByLang: Record<Lang, string> = {
  sv: "Områden",
  no: "Områder",
  da: "Områder",
  fi: "Alueet",
  en: "Areas",
  de: "Bereiche",
  fr: "Domaines",
  it: "Aree",
};

const footerCompanyLabelByLang: Record<Lang, string> = {
  sv: "Sidor",
  no: "Sider",
  da: "Sider",
  fi: "Sivut",
  en: "Pages",
  de: "Seiten",
  fr: "Pages",
  it: "Pagine",
};

const footerContactLabelByLang: Record<Lang, string> = {
  sv: "Kontakt",
  no: "Kontakt",
  da: "Kontakt",
  fi: "Yhteystiedot",
  en: "Contact",
  de: "Kontakt",
  fr: "Contact",
  it: "Contatti",
};

const footerPrivacyLabelByLang: Record<Lang, string> = {
  sv: "Integritet",
  no: "Personvern",
  da: "Privatliv",
  fi: "Tietosuoja",
  en: "Privacy",
  de: "Datenschutz",
  fr: "Confidentialité",
  it: "Privacy",
};

const footerTermsLabelByLang: Record<Lang, string> = {
  sv: "Villkor",
  no: "Vilkår",
  da: "Vilkår",
  fi: "Ehdot",
  en: "Terms",
  de: "Bedingungen",
  fr: "Conditions",
  it: "Termini",
};

const footerBackofficeLabelByLang: Record<Lang, string> = {
  sv: "Partnerinloggning",
  no: "Partnerinnlogging",
  da: "Partnerlogin",
  fi: "Partnerikirjautuminen",
  en: "Partner login",
  de: "Partner-Login",
  fr: "Connexion partenaire",
  it: "Accesso partner",
};

const footerAdminLabelByLang: Record<Lang, string> = {
  sv: "Admininloggning",
  no: "Admininnlogging",
  da: "Adminlogin",
  fi: "Admin-kirjautuminen",
  en: "Admin login",
  de: "Admin-Login",
  fr: "Connexion admin",
  it: "Accesso admin",
};

const independentPartnerLabelByLang: Record<Lang, string> = {
  sv: "Oberoende Zinzino-partner",
  no: "Uavhengig Zinzino-partner",
  da: "Uafhaengig Zinzino-partner",
  fi: "Itsenainen Zinzino-kumppani",
  en: "Independent Zinzino partner",
  de: "Unabhaengiger Zinzino-Partner",
  fr: "Partenaire Zinzino independant",
  it: "Partner Zinzino indipendente",
};

const copyByLang: Record<Lang, InsideBalanceCopy> = {
  sv: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "F\u00f6rst\u00e5 din inre balans med m\u00e4tbara tester",
    heroBody:
      "InsideBalance \u00e4r plattformen f\u00f6r dig som vill orientera dig tydligare bland h\u00e4lsotester och b\u00f6rja i r\u00e4tt \u00e4nde. H\u00e4r samlar vi v\u00e5ra testsp\u00e5r i en lugnare, mer genomt\u00e4nkt helhet.",
    heroPrimaryCta: "Utforska testsp\u00e5ren",
    heroSecondaryCta: "B\u00f6rja med OmegaBalance",
    productsTitle: "V\u00e5ra testsp\u00e5r",
    productsBody:
      "Varje testsp\u00e5r fokuserar p\u00e5 ett omr\u00e5de. V\u00e4lj det som passar ditt nul\u00e4ge b\u00e4st.",
    primaryRouteTitle: "B\u00f6rja h\u00e4r",
    primaryRouteBody: "Det tydligaste s\u00e4ttet att komma ig\u00e5ng i InsideBalance just nu.",
    secondaryRouteTitle: "Utforska vidare",
    secondaryRouteBody: "F\u00f6r dig som vill f\u00f6rst\u00e5 mage, tarm och inre balans genom samma lugna struktur.",
    products: [
      {
        title: "OmegaBalance",
        body: "F\u00f6r dig som vill f\u00f6rst\u00e5 din omega-6/omega-3-balans och b\u00f6rja med ett tydligt f\u00f6rsta test.",
        fit: "Passar dig som vill komma ig\u00e5ng med ett tydligt f\u00f6rsta test och en mer konkret bild av ditt nul\u00e4ge.",
        cta: "OmegaBalance",
        href: "/sv",
      },
      {
        title: "GutBalance",
        body: "F\u00f6r dig som vill f\u00f6rst\u00e5 tarm, immunf\u00f6rsvar och metabolism genom ett forskningsbaserat hemmatest.",
        fit: "Passar dig som vill utforska mage, tarm och inre balans med samma lugna och testbaserade logik.",
        cta: "GutBalance",
        href: "/sv/gut-balance",
      },
    ],
    whyTitle: "B\u00f6rja med att m\u00e4ta",
    whyBody:
      "M\u00e5nga f\u00f6rs\u00f6ker f\u00f6rb\u00e4ttra h\u00e4lsan innan de vet vad kroppen faktiskt visar. Ett test g\u00f6r det l\u00e4ttare att skilja mellan det som bara l\u00e5ter bra och det som faktiskt \u00e4r relevant f\u00f6r dig.",
    trustTitle: "Tydligt, seri\u00f6st och byggt f\u00f6r att h\u00e5lla",
    trustBody:
      "InsideBalance bygger p\u00e5 m\u00e4tbara tester och tydlig struktur. Det ska vara l\u00e4ttare att f\u00f6rst\u00e5 vad som \u00e4r relevant och orientera sig i sina val.",
    trustPoints: [
      "Testbaserad grund i st\u00e4llet f\u00f6r allm\u00e4n gissning.",
      "Tydliga sp\u00e5r d\u00e4r varje omr\u00e5de f\u00e5r ett eget fokus.",
      "En lugnare upplevelse d\u00e4r seriositet g\u00e5r f\u00f6re hype.",
    ],
    howTitle: "S\u00e5 fungerar det",
    howSteps: [
      { title: "V\u00e4lj testsp\u00e5r", body: "B\u00f6rja med det omr\u00e5de som \u00e4r mest relevant f\u00f6r dig just nu." },
      { title: "Genomf\u00f6r testet", body: "Testet \u00e4r gjort f\u00f6r att vara enkelt att komma ig\u00e5ng med hemma." },
      { title: "Tolkar resultatet", body: "Du f\u00e5r ett tydligare underlag f\u00f6r att f\u00f6rst\u00e5 vad du vill g\u00f6ra vidare." },
    ],
    whoTitle: "F\u00f6r dig som vill ha mer klarhet",
    whoItems: [
      "Du vill f\u00f6rst\u00e5 ditt nul\u00e4ge innan du b\u00f6rjar \u00e4ndra p\u00e5 saker.",
      "Du vill luta dig mot data snarare \u00e4n bara magk\u00e4nsla.",
      "Du vill b\u00f6rja enkelt, men med en tydlig tanke bakom.",
    ],
    footerTitle: "InsideBalance",
    footerBody:
      "InsideBalance samlar h\u00e4lsotester i en tydligare struktur. H\u00e4r ska det vara l\u00e4ttare att f\u00f6rst\u00e5 vad som finns, vad som passar och var du vill b\u00f6rja.",
    footerCta: "OmegaBalance",
  },
  no: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Testbasert helse med tydeligere neste steg",
    heroBody: "InsideBalance samler helsebanene våre på ett sted. Start med testen som passer deg best og få en tydeligere vei videre.",
    heroPrimaryCta: "Utforsk våre tester",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Våre testspor",
    productsBody: "Hvert spor fokuserer på et område der målbare resultater gjør det lettere å forstå hva som er relevant akkurat nå.",
    products: [
      { title: "OmegaBalance", body: "For deg som vil forstå omega-6/omega-3-balansen din og få et tydeligere neste steg.", cta: "OmegaBalance", href: "/no" },
      { title: "GutBalance", body: "For deg som vil forstå mage, tarm og indre balanse gjennom samme rolige struktur.", cta: "GutBalance", href: "/no/gut-balance" },
    ],
    whyTitle: "Start med å måle",
    whyBody: "Mange prøver å forbedre helsen uten først å vite hvor de står. En test gir et tydeligere utgangspunkt.",
    howTitle: "Slik fungerer det",
    howSteps: [
      { title: "Velg spor", body: "Start med området som kjennes mest relevant akkurat nå." },
      { title: "Ta testen hjemme", body: "Testene er laget for å være enkle å komme i gang med." },
      { title: "Få tydeligere neste steg", body: "Du får et bedre grunnlag å ta beslutninger ut fra." },
    ],
    whoTitle: "For deg som vil forstå mer, ikke bare gjette",
    whoItems: ["Du vil ha et tydeligere utgangspunkt.", "Du vil ta beslutninger basert på data.", "Du vil starte enkelt, men smart."],
    footerTitle: "InsideBalance",
    footerBody: "InsideBalance er plattformen bak testsporene våre. OmegaBalance og GutBalance er to tydelige veier inn i samme helhet.",
  },
  da: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Testbaseret sundhed med tydeligere næste skridt",
    heroBody: "InsideBalance samler vores sundhedsspor ét sted. Start med den test, der passer dig bedst.",
    heroPrimaryCta: "Udforsk vores tests",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Vores testspor",
    productsBody: "Hvert spor fokuserer på et område, hvor målbare resultater gør det lettere at forstå, hvad der er relevant nu.",
    products: [
      { title: "OmegaBalance", body: "For dig, der vil forstå din omega-6/omega-3-balance.", cta: "OmegaBalance", href: "/da" },
      { title: "GutBalance", body: "For dig, der vil forstå mave, tarm og indre balance gennem samme rolige struktur.", cta: "GutBalance", href: "/da/gut-balance" },
    ],
    whyTitle: "Start med at måle",
    whyBody: "Mange forsøger at forbedre sundheden uden først at kende udgangspunktet. En test giver en tydeligere start.",
    howTitle: "Sådan fungerer det",
    howSteps: [
      { title: "Vælg spor", body: "Start med det område, der føles mest relevant lige nu." },
      { title: "Tag testen hjemme", body: "Testene er lavet til at være nemme at komme i gang med." },
      { title: "Få tydeligere næste skridt", body: "Du får et bedre grundlag at træffe beslutninger ud fra." },
    ],
    whoTitle: "For dig, der vil forstå mere, ikke bare gætte",
    whoItems: ["Du vil have et tydeligere udgangspunkt.", "Du vil træffe beslutninger ud fra data.", "Du vil starte enkelt, men smart."],
    footerTitle: "InsideBalance",
    footerBody: "InsideBalance er platformen bag vores testspor. OmegaBalance og GutBalance er to tydelige veje ind i samme helhed.",
  },
  fi: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Testipohjaista hyvinvointia selke\u00e4mmill\u00e4 seuraavilla askelilla",
    heroBody: "InsideBalance kokoaa hyvinvointipolkumme yhteen paikkaan. Aloita sinulle sopivimmasta testist\u00e4.",
    heroPrimaryCta: "Tutustu testeihin",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Testipolkumme",
    productsBody: "Jokainen polku keskittyy alueeseen, jossa mitattavat tulokset auttavat ymm\u00e4rt\u00e4m\u00e4\u00e4n, mik\u00e4 on ajankohtaista juuri nyt.",
    products: [
      { title: "OmegaBalance", body: "Sinulle, joka haluat ymm\u00e4rt\u00e4\u00e4 omega-6/omega-3-tasapainoasi paremmin.", cta: "OmegaBalance", href: "/fi" },
      { title: "GutBalance", body: "Sinulle, joka haluat ymmärtää vatsaa, suolistoa ja sisäistä tasapainoa saman rauhallisen rakenteen kautta.", cta: "GutBalance", href: "/fi/gut-balance" },
    ],
    whyTitle: "Aloita mittaamalla",
    whyBody: "Moni yritt\u00e4\u00e4 parantaa hyvinvointiaan tiet\u00e4m\u00e4tt\u00e4 ensin nykytilannetta. Testi antaa selke\u00e4mm\u00e4n l\u00e4ht\u00f6pisteen.",
    howTitle: "N\u00e4in se toimii",
    howSteps: [
      { title: "Valitse polku", body: "Aloita siit\u00e4 alueesta, joka tuntuu nyt ajankohtaisimmalta." },
      { title: "Tee testi kotona", body: "Testit on tehty helpoiksi aloittaa." },
      { title: "Saa selke\u00e4mm\u00e4t seuraavat askeleet", body: "Saat paremman pohjan p\u00e4\u00e4t\u00f6ksille." },
    ],
    whoTitle: "Sinulle, joka haluat ymm\u00e4rt\u00e4\u00e4 enemm\u00e4n kuin arvata",
    whoItems: ["Haluat selke\u00e4mm\u00e4n l\u00e4ht\u00f6tilanteen.", "Haluat tehd\u00e4 p\u00e4\u00e4t\u00f6ksi\u00e4 datan pohjalta.", "Haluat aloittaa helposti mutta fiksusti."],
    footerTitle: "InsideBalance",
    footerBody: "InsideBalance on testipolkujemme alusta. OmegaBalance ja GutBalance ovat kaksi selke\u00e4\u00e4 reitti\u00e4 samaan kokonaisuuteen.",
  },
  en: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Health tests that make it easier to understand what you actually need",
    heroBody:
      "InsideBalance is a calmer way to navigate health testing. We bring together clearly defined test areas so it feels easier to start in the right place.",
    heroPrimaryCta: "Explore the test areas",
    heroSecondaryCta: "Start with OmegaBalance",
    productsTitle: "Our focus areas",
    productsBody: "Each area is built around one clear focus. Choose the one that fits your current situation best.",
    primaryRouteTitle: "Start here",
    primaryRouteBody: "The clearest way to get started in InsideBalance right now.",
    secondaryRouteTitle: "Coming soon",
    secondaryRouteBody: "For people who may later want to explore gut health, digestion, and inner balance.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Available now",
        body: "For people who want to understand their omega-6/omega-3 balance and begin with an established test area.",
        fit: "A good fit if you want a clear first test and a more concrete picture of your current position.",
        cta: "OmegaBalance",
        href: "/en",
      },
      {
        title: "GutBalance",
        eyebrow: "Coming soon",
        body: "For people who want to understand gut health, digestion, and inner balance through the same calm structure.",
        fit: "A good fit if you want to explore the gut, immunity, and metabolism with the same measured approach.",
        cta: "GutBalance",
        href: "/en/gut-balance",
      },
    ],
    whyTitle: "Start by measuring",
    whyBody:
      "Many people try to improve their health before they know what their body is actually showing. Testing makes it easier to separate what only sounds good from what may be relevant for you.",
    trustTitle: "Clear, serious, and built to hold up over time",
    trustBody:
      "InsideBalance is built on measurable tests and clear structure. It should feel easier to understand what is relevant and to orient yourself in your choices.",
    trustPoints: [
      "A test-based foundation instead of general guesswork.",
      "Clear areas where each topic gets its own focus.",
      "A calmer experience where credibility comes before hype.",
    ],
    howTitle: "How it works",
    howSteps: [
      { title: "Choose your test area", body: "Start with the area that feels most relevant to you right now." },
      { title: "Complete the test", body: "The test is designed to be straightforward to start with at home." },
      { title: "Understand the result", body: "You get a clearer basis for understanding what you want to do next." },
    ],
    whoTitle: "For people who want more clarity",
    whoItems: [
      "You want to understand your current position before changing things.",
      "You want to lean on data rather than instinct alone.",
      "You want to start simply, but with a clear rationale behind it.",
    ],
    footerTitle: "InsideBalance",
    footerBody:
      "InsideBalance is the platform that brings these test areas into a clearer structure. OmegaBalance and GutBalance follow the same overall thinking, but with different focus areas.",
    footerCta: "OmegaBalance",
  },
  de: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Testbasierte Gesundheit mit klareren n\u00e4chsten Schritten",
    heroBody: "InsideBalance verbindet unsere Gesundheitswege an einem Ort. Starte mit dem Test, der am besten zu dir passt.",
    heroPrimaryCta: "Unsere Tests entdecken",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Unsere Testwege",
    productsBody: "Jeder Weg konzentriert sich auf einen Bereich, in dem messbare Ergebnisse helfen, das Relevante jetzt besser zu verstehen.",
    products: [
      { title: "OmegaBalance", body: "F\u00fcr Menschen, die ihre Omega-6/Omega-3-Balance besser verstehen wollen.", cta: "OmegaBalance", href: "/de" },
      { title: "GutBalance", body: "Für Menschen, die Darm, Verdauung und innere Balance in derselben ruhigen Struktur besser verstehen möchten.", cta: "GutBalance", href: "/de/gut-balance" },
    ],
    whyTitle: "Mit Messen beginnen",
    whyBody: "Viele versuchen ihre Gesundheit zu verbessern, bevor sie ihren Ausgangspunkt wirklich kennen. Ein Test schafft mehr Klarheit.",
    howTitle: "So funktioniert es",
    howSteps: [
      { title: "Weg w\u00e4hlen", body: "Starte mit dem Bereich, der jetzt am relevantesten wirkt." },
      { title: "Test zu Hause machen", body: "Die Tests sind daf\u00fcr gemacht, leicht zu starten." },
      { title: "Klarere n\u00e4chste Schritte erhalten", body: "Du bekommst eine bessere Grundlage f\u00fcr weitere Entscheidungen." },
    ],
    whoTitle: "F\u00fcr Menschen, die mehr verstehen wollen statt nur zu raten",
    whoItems: ["Du willst einen klareren Ausgangspunkt.", "Du willst Entscheidungen auf Daten st\u00fctzen.", "Du willst einfach, aber klug starten."],
    footerTitle: "InsideBalance",
    footerBody: "InsideBalance ist die Plattform hinter unseren Testwegen. OmegaBalance und GutBalance sind zwei klare Einstiege in dasselbe Gesamtbild.",
  },
  fr: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Une sant\u00e9 guid\u00e9e par les tests, avec des prochaines \u00e9tapes plus claires",
    heroBody: "InsideBalance rassemble nos parcours sant\u00e9 en un seul endroit. Commencez par le test le plus pertinent pour vous.",
    heroPrimaryCta: "Explorer nos tests",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Nos parcours de test",
    productsBody: "Chaque parcours se concentre sur un domaine o\u00f9 des r\u00e9sultats mesurables rendent la suite plus claire.",
    products: [
      { title: "OmegaBalance", body: "Pour celles et ceux qui veulent mieux comprendre leur \u00e9quilibre om\u00e9ga-6/om\u00e9ga-3.", cta: "OmegaBalance", href: "/fr" },
      { title: "GutBalance", body: "Pour celles et ceux qui veulent mieux comprendre le ventre, l'intestin et l'équilibre intérieur dans la même structure apaisée.", cta: "GutBalance", href: "/fr/gut-balance" },
    ],
    whyTitle: "Commencer par mesurer",
    whyBody: "Beaucoup essaient d'am\u00e9liorer leur sant\u00e9 sans conna\u00eetre clairement leur point de d\u00e9part. Un test apporte cette clart\u00e9.",
    howTitle: "Comment \u00e7a fonctionne",
    howSteps: [
      { title: "Choisir un parcours", body: "Commencez par le domaine le plus pertinent pour vous en ce moment." },
      { title: "Faire le test chez vous", body: "Les tests sont con\u00e7us pour \u00eatre simples \u00e0 d\u00e9marrer." },
      { title: "Recevoir des prochaines \u00e9tapes plus claires", body: "Vous obtenez une meilleure base pour agir." },
    ],
    whoTitle: "Pour celles et ceux qui veulent comprendre davantage, pas seulement deviner",
    whoItems: ["Vous voulez un point de d\u00e9part plus clair.", "Vous voulez prendre des d\u00e9cisions bas\u00e9es sur des donn\u00e9es.", "Vous voulez commencer simplement, mais intelligemment."],
    footerTitle: "InsideBalance",
    footerBody: "InsideBalance est la plateforme derri\u00e8re nos parcours de test. OmegaBalance et GutBalance sont deux entr\u00e9es claires dans le m\u00eame ensemble.",
  },
  it: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Salute basata sui test con passi successivi pi\u00f9 chiari",
    heroBody: "InsideBalance riunisce i nostri percorsi salute in un unico posto. Inizia dal test pi\u00f9 adatto a te.",
    heroPrimaryCta: "Scopri i nostri test",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "I nostri percorsi di test",
    productsBody: "Ogni percorso si concentra su un'area in cui risultati misurabili rendono pi\u00f9 semplice capire cosa conta adesso.",
    products: [
      { title: "OmegaBalance", body: "Per chi vuole capire meglio il proprio equilibrio omega-6/omega-3.", cta: "OmegaBalance", href: "/it" },
      { title: "GutBalance", body: "Per chi vuole capire meglio intestino, digestione ed equilibrio interno attraverso la stessa struttura calma.", cta: "GutBalance", href: "/it/gut-balance" },
    ],
    whyTitle: "Inizia misurando",
    whyBody: "Molte persone cercano di migliorare la propria salute senza conoscere davvero il punto di partenza. Un test crea pi\u00f9 chiarezza.",
    howTitle: "Come funziona",
    howSteps: [
      { title: "Scegli un percorso", body: "Inizia dall'area che senti pi\u00f9 rilevante in questo momento." },
      { title: "Fai il test a casa", body: "I test sono pensati per essere facili da iniziare." },
      { title: "Ottieni passi successivi pi\u00f9 chiari", body: "Hai una base migliore su cui prendere decisioni." },
    ],
    whoTitle: "Per chi vuole capire di pi\u00f9, non solo intuire",
    whoItems: ["Vuoi un punto di partenza pi\u00f9 chiaro.", "Vuoi prendere decisioni basate sui dati.", "Vuoi iniziare in modo semplice ma intelligente."],
    footerTitle: "InsideBalance",
    footerBody: "InsideBalance \u00e8 la piattaforma dietro i nostri percorsi di test. OmegaBalance e GutBalance sono due accessi chiari allo stesso insieme.",
  },
};

const copyOverridesByLang: Partial<Record<Lang, Partial<InsideBalanceCopy>>> = {
  no: {
    heroTitle: "Helsetester som gjør det lettere å forstå hva du faktisk trenger",
    heroBody:
      "InsideBalance er plattformen for deg som vil orientere deg tydeligere blant helsetester og begynne i riktig ende. Her samler vi testområdene i en roligere og mer gjennomtenkt helhet.",
    heroPrimaryCta: "Utforsk testområdene",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Våre testområder",
    productsBody: "Hvert testområde har ett tydelig fokus. Velg det som passer situasjonen din best.",
    primaryRouteTitle: "Start her",
    primaryRouteBody: "Den tydeligste måten å komme i gang i InsideBalance akkurat nå.",
    secondaryRouteTitle: "Kommer snart",
    secondaryRouteBody: "For deg som senere vil utforske mage, tarm og indre balanse.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Tilgjengelig nå",
        body: "For deg som vil forstå omega-6/omega-3-balansen din og begynne med et etablert testområde.",
        fit: "Passer deg som vil komme i gang med en tydelig første test og et mer konkret bilde av utgangspunktet ditt.",
        cta: "OmegaBalance",
        href: "/no",
      },
      {
        title: "GutBalance",
        eyebrow: "Kommer snart",
        body: "Vår kommende satsing på mage, tarm og indre balanse.",
        fit: "Passer deg som er nysgjerrig på noe nytt bygget på den samme rolige og testbaserte logikken.",
        cta: "GutBalance",
        href: "/no/gut-balance",
        status: "Kommer snart",
      },
    ],
    whyTitle: "Begynn med å måle",
    whyBody:
      "Mange prøver å forbedre helsen før de vet hva kroppen faktisk viser. En test gjør det lettere å skille mellom det som bare høres bra ut og det som faktisk kan være relevant for deg.",
    trustTitle: "Tydelig, seriøst og bygget for å vare",
    trustBody:
      "InsideBalance bygger på målbare tester og tydelig struktur. Det skal være lettere å forstå hva som er relevant og orientere seg i egne valg.",
    trustPoints: [
      "Et testbasert utgangspunkt i stedet for generell gjetting.",
      "Tydelige områder der hvert tema får sitt eget fokus.",
      "En roligere opplevelse der troverdighet går foran hype.",
    ],
    howTitle: "Slik fungerer det",
    howSteps: [
      { title: "Velg testområde", body: "Begynn med området som virker mest relevant for deg akkurat nå." },
      { title: "Gjennomfør testen", body: "Testen er laget for å være enkel å komme i gang med hjemme." },
      { title: "Forstå resultatet", body: "Du får et tydeligere grunnlag for å forstå hva du vil gjøre videre." },
    ],
    whoTitle: "For deg som vil ha mer klarhet",
    whoItems: [
      "Du vil forstå utgangspunktet ditt før du begynner å endre på ting.",
      "Du vil støtte deg på data heller enn bare magefølelse.",
      "Du vil starte enkelt, men med en tydelig tanke bak.",
    ],
    footerBody:
      "InsideBalance er plattformen som samler disse testområdene i en tydeligere struktur. OmegaBalance og GutBalance bygger på samme helhetstanke, men med ulikt fokus.",
    footerCta: "OmegaBalance",
  },
  da: {
    heroTitle: "Sundhedstests, der gør det lettere at forstå, hvad du faktisk har brug for",
    heroBody:
      "InsideBalance er platformen for dig, der vil orientere dig tydeligere blandt sundhedstests og begynde det rigtige sted. Her samler vi testområderne i en roligere og mere gennemtænkt helhed.",
    heroPrimaryCta: "Udforsk testområderne",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Vores testområder",
    productsBody: "Hvert testområde har ét tydeligt fokus. Vælg det, der passer bedst til din situation lige nu.",
    primaryRouteTitle: "Start her",
    primaryRouteBody: "Den tydeligste måde at komme i gang i InsideBalance lige nu.",
    secondaryRouteTitle: "Kommer snart",
    secondaryRouteBody: "For dig, der senere vil udforske mave, tarm og indre balance.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Tilgængelig nu",
        body: "For dig, der vil forstå din omega-6/omega-3-balance og begynde med et etableret testområde.",
        fit: "Passer dig, der vil i gang med en tydelig første test og et mere konkret billede af dit udgangspunkt.",
        cta: "OmegaBalance",
        href: "/da",
      },
      {
        title: "GutBalance",
        eyebrow: "Kommer snart",
        body: "Vores kommende fokus på mave, tarm og indre balance.",
        fit: "Passer dig, der er nysgerrig på noget nyt bygget på den samme rolige og testbaserede tilgang.",
        cta: "GutBalance",
        href: "/da/gut-balance",
        status: "Kommer snart",
      },
    ],
    whyTitle: "Start med at måle",
    whyBody:
      "Mange forsøger at forbedre sundheden, før de ved, hvad kroppen faktisk viser. En test gør det lettere at skelne mellem det, der bare lyder godt, og det, der faktisk kan være relevant for dig.",
    trustTitle: "Tydeligt, seriøst og bygget til at holde",
    trustBody:
      "InsideBalance bygger på målbare tests og tydelig struktur. Det skal være lettere at forstå, hvad der er relevant, og orientere sig i sine valg.",
    trustPoints: [
      "En testbaseret start i stedet for generelle gætterier.",
      "Tydelige områder, hvor hvert emne får sit eget fokus.",
      "En roligere oplevelse, hvor troværdighed går foran hype.",
    ],
    howTitle: "Sådan fungerer det",
    howSteps: [
      { title: "Vælg testområde", body: "Begynd med det område, der virker mest relevant for dig lige nu." },
      { title: "Gennemfør testen", body: "Testen er lavet til at være enkel at gå i gang med hjemme." },
      { title: "Forstå resultatet", body: "Du får et tydeligere grundlag for at forstå, hvad du vil gøre videre." },
    ],
    whoTitle: "For dig, der vil have mere klarhed",
    whoItems: [
      "Du vil forstå dit udgangspunkt, før du ændrer på noget.",
      "Du vil støtte dig mere på data end på mavefornemmelser alene.",
      "Du vil begynde enkelt, men med en tydelig tanke bag.",
    ],
    footerBody:
      "InsideBalance er platformen, der samler disse testområder i en tydeligere struktur. OmegaBalance og GutBalance bygger på samme helhedstanke, men med forskelligt fokus.",
    footerCta: "OmegaBalance",
  },
  fi: {
    heroTitle: "Terveystestit, joiden avulla on helpompi ymmärtää mitä todella tarvitset",
    heroBody:
      "InsideBalance on alusta sinulle, joka haluat hahmottaa terveystestejä selkeämmin ja aloittaa oikeasta kohdasta. Täällä kokoamme testialueet rauhallisemmaksi ja harkitummaksi kokonaisuudeksi.",
    heroPrimaryCta: "Tutustu testialueisiin",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Testialueemme",
    productsBody: "Jokaisella testialueella on yksi selkeä painopiste. Valitse se, joka sopii tämänhetkiseen tilanteeseesi parhaiten.",
    primaryRouteTitle: "Aloita tästä",
    primaryRouteBody: "Selkein tapa päästä alkuun InsideBalancessa juuri nyt.",
    secondaryRouteTitle: "Tulossa pian",
    secondaryRouteBody: "Sinulle, joka haluat myöhemmin tutkia vatsan, suoliston ja sisäisen tasapainon teemoja.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Saatavilla nyt",
        body: "Sinulle, joka haluat ymmärtää omega-6/omega-3-tasapainoasi ja aloittaa vakiintuneesta testialueesta.",
        fit: "Sopii sinulle, jos haluat selkeän ensimmäisen testin ja konkreettisemman kuvan nykytilanteestasi.",
        cta: "OmegaBalance",
        href: "/fi",
      },
      {
        title: "GutBalance",
        eyebrow: "Tulossa pian",
        body: "Tuleva painopisteemme vatsan, suoliston ja sisäisen tasapainon tueksi.",
        fit: "Sopii sinulle, jos olet kiinnostunut tulevasta kokonaisuudesta, joka rakentuu saman rauhallisen ja testipohjaisen ajattelun varaan.",
        cta: "GutBalance",
        href: "/fi/gut-balance",
        status: "Tulossa pian",
      },
    ],
    whyTitle: "Aloita mittaamalla",
    whyBody:
      "Moni yrittää parantaa hyvinvointiaan ennen kuin tietää, mitä keho todella näyttää. Testi auttaa erottamaan sen, mikä vain kuulostaa hyvältä, siitä mikä voi oikeasti olla sinulle olennaista.",
    trustTitle: "Selkeä, vakavasti otettava ja pitkäjänteisesti rakennettu",
    trustBody:
      "InsideBalance rakentuu mitattavien testien ja selkeän rakenteen varaan. Tavoitteena on, että olennaisen ymmärtäminen ja omissa valinnoissa suunnistaminen tuntuu helpommalta.",
    trustPoints: [
      "Testipohjainen lähtökohta yleisen arvailun sijaan.",
      "Selkeät alueet, joissa jokaisella teemalla on oma painopisteensä.",
      "Rauhallisempi kokemus, jossa uskottavuus menee hypen edelle.",
    ],
    howTitle: "Näin se toimii",
    howSteps: [
      { title: "Valitse testialue", body: "Aloita alueesta, joka tuntuu juuri nyt merkityksellisimmältä." },
      { title: "Tee testi", body: "Testi on suunniteltu niin, että sen aloittaminen kotona on helppoa." },
      { title: "Ymmärrä tulos", body: "Saat selkeämmän pohjan sille, miten haluat edetä." },
    ],
    whoTitle: "Sinulle, joka haluat enemmän selkeyttä",
    whoItems: [
      "Haluat ymmärtää lähtötilanteesi ennen kuin alat muuttaa asioita.",
      "Haluat nojata dataan enemmän kuin pelkkään tuntumaan.",
      "Haluat aloittaa yksinkertaisesti, mutta ajatuksella.",
    ],
    footerBody:
      "InsideBalance on alusta, joka kokoaa nämä testialueet selkeämpään rakenteeseen. OmegaBalance ja GutBalance perustuvat samaan kokonaisajatteluun, mutta eri painotuksin.",
    footerCta: "OmegaBalance",
  },
  de: {
    heroTitle: "Gesundheitstests, die helfen klarer zu verstehen, was du tatsächlich brauchst",
    heroBody:
      "InsideBalance ist die Plattform für Menschen, die sich im Bereich Gesundheitstests besser orientieren und am richtigen Punkt beginnen möchten. Hier fassen wir die Testbereiche in einer ruhigeren und klareren Struktur zusammen.",
    heroPrimaryCta: "Testbereiche entdecken",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Unsere Testbereiche",
    productsBody: "Jeder Testbereich hat einen klaren Fokus. Wähle den Bereich, der am besten zu deiner aktuellen Situation passt.",
    primaryRouteTitle: "Hier beginnen",
    primaryRouteBody: "Der klarste Weg, um jetzt mit InsideBalance zu beginnen.",
    secondaryRouteTitle: "Demnächst",
    secondaryRouteBody: "Für Menschen, die sich später mit Darm, Verdauung und innerer Balance beschäftigen möchten.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Jetzt verfügbar",
        body: "Für Menschen, die ihre Omega-6/Omega-3-Balance besser verstehen und mit einem etablierten Testbereich beginnen möchten.",
        fit: "Passend, wenn du mit einem klaren ersten Test und einem konkreteren Bild deiner Ausgangslage starten möchtest.",
        cta: "OmegaBalance",
        href: "/de",
      },
      {
        title: "GutBalance",
        eyebrow: "Demnächst",
        body: "Unser kommender Fokus rund um Darm, Verdauung und innere Balance.",
        fit: "Passend, wenn du neugierig auf ein zukünftiges Angebot bist, das auf derselben ruhigen und testbasierten Logik aufbaut.",
        cta: "GutBalance",
        href: "/de/gut-balance",
        status: "Demnächst",
      },
    ],
    whyTitle: "Mit Messen beginnen",
    whyBody:
      "Viele versuchen ihre Gesundheit zu verbessern, bevor sie wissen, was der eigene Körper tatsächlich zeigt. Ein Test hilft dabei, zwischen gut klingenden Ideen und wirklich relevanten Hinweisen zu unterscheiden.",
    trustTitle: "Klar, seriös und langfristig gedacht",
    trustBody:
      "InsideBalance basiert auf messbaren Tests und klarer Struktur. Es soll leichter werden zu verstehen, was relevant ist und wie man sich in den eigenen Entscheidungen orientiert.",
    trustPoints: [
      "Eine testbasierte Grundlage statt allgemeiner Vermutung.",
      "Klare Bereiche, in denen jedes Thema seinen eigenen Fokus hat.",
      "Ein ruhigeres Erlebnis, bei dem Glaubwürdigkeit vor Hype steht.",
    ],
    howTitle: "So funktioniert es",
    howSteps: [
      { title: "Testbereich wählen", body: "Beginne mit dem Bereich, der für dich im Moment am relevantesten erscheint." },
      { title: "Test durchführen", body: "Der Test ist so aufgebaut, dass du ihn leicht zu Hause beginnen kannst." },
      { title: "Ergebnis einordnen", body: "Du bekommst eine klarere Grundlage, um zu verstehen, wie du weitergehen möchtest." },
    ],
    whoTitle: "Für Menschen, die mehr Klarheit möchten",
    whoItems: [
      "Du willst deine Ausgangslage verstehen, bevor du etwas veränderst.",
      "Du willst dich stärker auf Daten stützen als nur auf Gefühl.",
      "Du willst einfach anfangen, aber mit einem klaren Gedanken dahinter.",
    ],
    footerBody:
      "InsideBalance ist die Plattform, die diese Testbereiche in einer klareren Struktur zusammenführt. OmegaBalance und GutBalance folgen demselben ganzheitlichen Ansatz, aber mit unterschiedlichem Fokus.",
    footerCta: "OmegaBalance",
  },
  fr: {
    heroTitle: "Des tests de santé qui aident à mieux comprendre ce dont vous avez réellement besoin",
    heroBody:
      "InsideBalance est une plateforme pensée pour celles et ceux qui veulent s’orienter plus clairement parmi les tests de santé et commencer au bon endroit. Nous y réunissons différents domaines de test dans un cadre plus calme et plus cohérent.",
    heroPrimaryCta: "Explorer les domaines de test",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Nos domaines de test",
    productsBody: "Chaque domaine a un focus clair. Choisissez celui qui correspond le mieux à votre situation actuelle.",
    primaryRouteTitle: "Commencer ici",
    primaryRouteBody: "La manière la plus claire de commencer avec InsideBalance aujourd’hui.",
    secondaryRouteTitle: "Bientôt disponible",
    secondaryRouteBody: "Pour celles et ceux qui voudront plus tard explorer le ventre, l’intestin et l’équilibre intérieur.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Disponible maintenant",
        body: "Pour celles et ceux qui veulent mieux comprendre leur équilibre oméga-6/oméga-3 et commencer par un domaine de test déjà établi.",
        fit: "Adapté si vous voulez un premier test clair et une vision plus concrète de votre situation actuelle.",
        cta: "OmegaBalance",
        href: "/fr",
      },
      {
        title: "GutBalance",
        eyebrow: "Bientôt",
        body: "Notre prochain focus autour du ventre, de l’intestin et de l’équilibre intérieur.",
        fit: "Adapté si vous êtes curieux d’une future proposition construite sur la même logique calme et fondée sur les tests.",
        cta: "GutBalance",
        href: "/fr/gut-balance",
        status: "Bientôt",
      },
    ],
    whyTitle: "Commencer par mesurer",
    whyBody:
      "Beaucoup essaient d’améliorer leur santé avant de savoir ce que leur corps montre réellement. Un test aide à distinguer ce qui sonne bien de ce qui peut vraiment être pertinent pour vous.",
    trustTitle: "Clair, sérieux et pensé pour durer",
    trustBody:
      "InsideBalance repose sur des tests mesurables et une structure claire. L’objectif est de rendre plus simple la compréhension de ce qui est pertinent et de mieux se repérer dans ses choix.",
    trustPoints: [
      "Une base fondée sur les tests plutôt que sur des suppositions générales.",
      "Des domaines clairs où chaque sujet garde son propre focus.",
      "Une expérience plus posée, où la crédibilité passe avant l’effet de mode.",
    ],
    howTitle: "Comment ça fonctionne",
    howSteps: [
      { title: "Choisir le domaine de test", body: "Commencez par le domaine qui vous paraît le plus pertinent aujourd’hui." },
      { title: "Réaliser le test", body: "Le test est conçu pour être simple à démarrer chez vous." },
      { title: "Comprendre le résultat", body: "Vous obtenez une base plus claire pour comprendre comment vous souhaitez avancer." },
    ],
    whoTitle: "Pour celles et ceux qui veulent plus de clarté",
    whoItems: [
      "Vous voulez comprendre votre situation de départ avant de changer quoi que ce soit.",
      "Vous voulez vous appuyer davantage sur des données que sur la seule intuition.",
      "Vous voulez commencer simplement, mais avec une vraie intention derrière.",
    ],
    footerBody:
      "InsideBalance est la plateforme qui rassemble ces domaines de test dans une structure plus claire. OmegaBalance et GutBalance reposent sur la même vision d’ensemble, avec des focus différents.",
    footerCta: "OmegaBalance",
  },
  it: {
    heroTitle: "Test di salute che aiutano a capire meglio ciò di cui hai davvero bisogno",
    heroBody:
      "InsideBalance è la piattaforma per chi vuole orientarsi con più chiarezza tra i test di salute e cominciare dal punto giusto. Qui raccogliamo le diverse aree di test in una struttura più calma e più coerente.",
    heroPrimaryCta: "Esplora le aree di test",
    heroSecondaryCta: "OmegaBalance",
    productsTitle: "Le nostre aree di test",
    productsBody: "Ogni area ha un focus chiaro. Scegli quella che si adatta meglio alla tua situazione attuale.",
    primaryRouteTitle: "Inizia qui",
    primaryRouteBody: "Il modo più chiaro per iniziare con InsideBalance in questo momento.",
    secondaryRouteTitle: "In arrivo",
    secondaryRouteBody: "Per chi vorrà in seguito approfondire intestino, digestione ed equilibrio interno.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Disponibile ora",
        body: "Per chi vuole capire meglio il proprio equilibrio omega-6/omega-3 e iniziare da un’area di test già consolidata.",
        fit: "Adatta se vuoi partire con un primo test chiaro e con un quadro più concreto della tua situazione attuale.",
        cta: "OmegaBalance",
        href: "/it",
      },
      {
        title: "GutBalance",
        eyebrow: "In arrivo",
        body: "Il nostro prossimo focus dedicato a intestino, digestione ed equilibrio interno.",
        fit: "Adatta se sei curioso di una proposta futura costruita sulla stessa logica calma e basata sui test.",
        cta: "GutBalance",
        href: "/it/gut-balance",
        status: "In arrivo",
      },
    ],
    whyTitle: "Inizia misurando",
    whyBody:
      "Molte persone cercano di migliorare la propria salute prima di sapere cosa il corpo sta davvero mostrando. Un test aiuta a distinguere ciò che suona bene da ciò che può essere davvero rilevante per te.",
    trustTitle: "Chiaro, serio e costruito per durare",
    trustBody:
      "InsideBalance si basa su test misurabili e su una struttura chiara. L’obiettivo è rendere più facile capire cosa è rilevante e orientarsi meglio nelle proprie scelte.",
    trustPoints: [
      "Una base fondata sui test invece che su supposizioni generiche.",
      "Aree chiare in cui ogni tema mantiene il proprio focus.",
      "Un’esperienza più calma, in cui la credibilità viene prima dell’hype.",
    ],
    howTitle: "Come funziona",
    howSteps: [
      { title: "Scegli l’area di test", body: "Inizia dall’area che senti più rilevante per te in questo momento." },
      { title: "Completa il test", body: "Il test è pensato per essere semplice da iniziare a casa." },
      { title: "Comprendi il risultato", body: "Hai una base più chiara per capire come vuoi procedere." },
    ],
    whoTitle: "Per chi vuole più chiarezza",
    whoItems: [
      "Vuoi capire la tua situazione di partenza prima di cambiare qualcosa.",
      "Vuoi affidarti più ai dati che al solo intuito.",
      "Vuoi iniziare in modo semplice, ma con un’idea chiara dietro.",
    ],
    footerBody:
      "InsideBalance è la piattaforma che riunisce queste aree di test in una struttura più chiara. OmegaBalance e GutBalance seguono la stessa visione d’insieme, ma con focus diversi.",
    footerCta: "OmegaBalance",
  },
};

const visualFramesByLang: Record<Lang, VisualFrameCopy> = {
  sv: {
    heroTitle: "M\u00e4tning med en lugnare riktning",
    heroBody: "InsideBalance g\u00f6r det l\u00e4ttare att f\u00f6rst\u00e5 sina testresultat och veta vad n\u00e4sta steg kan vara.",
    measurementLabel: "Efter testet",
    measurementTitle: "Insikt som blir till handling",
    measurementBody: "När du ser dina resultat tydligare blir nästa steg lättare att ta. Det är där våra testspår ska hjälpa, inte bara informera.",
    connectionLabel: "Tillsammans",
    connectionTitle: "Samtal som känns naturliga",
    connectionBody: "Bra hälsobeslut blir ofta lättare att bära när de går att prata om i en varm, vardaglig miljö.",
  },
  no: {
    heroTitle: "Tydelighet som kjennes menneskelig",
    heroBody: "En varm første kontakt gjør det lettere å forstå at InsideBalance ikke bare handler om testdata, men om retning og neste steg.",
    measurementLabel: "Etter testen",
    measurementTitle: "Innsikt som blir til handling",
    measurementBody: "Når du ser resultatene tydeligere, blir neste steg lettere å ta.",
    connectionLabel: "Sammen",
    connectionTitle: "Samtaler som kjennes naturlige",
    connectionBody: "Gode helsevalg blir ofte lettere å bære når de kan deles i en varm hverdagssituasjon.",
  },
  da: {
    heroTitle: "Tydelighed der føles menneskelig",
    heroBody: "En varm første kontakt gør det lettere at forstå, at InsideBalance ikke kun handler om testdata, men om retning og næste skridt.",
    measurementLabel: "Efter testen",
    measurementTitle: "Indsigt der bliver til handling",
    measurementBody: "Når du ser dine resultater tydeligere, bliver næste skridt lettere at tage.",
    connectionLabel: "Sammen",
    connectionTitle: "Samtaler der føles naturlige",
    connectionBody: "Gode sundhedsvalg bliver ofte lettere at bære i en varm og hverdagsnær ramme.",
  },
  fi: {
    heroTitle: "Selkeyttä inhimillisellä tavalla",
    heroBody: "Lämmin ensikohtaaminen auttaa ymmärtämään, ettei InsideBalance ole vain testidataa vaan myös suuntaa ja seuraavia askelia.",
    measurementLabel: "Testin jälkeen",
    measurementTitle: "Oivallus muuttuu toiminnaksi",
    measurementBody: "Kun näet tuloksesi selvemmin, seuraava askel on helpompi ottaa.",
    connectionLabel: "Yhdessä",
    connectionTitle: "Luontevia keskusteluja",
    connectionBody: "Hyvät hyvinvointivalinnat tuntuvat usein helpommilta, kun niistä voi puhua luonnollisessa ympäristössä.",
  },
  en: {
    heroTitle: "Clarity that feels human",
    heroBody: "InsideBalance is meant to make test results easier to take in and easier to use in real life.",
    measurementLabel: "After the test",
    measurementTitle: "Insight that becomes action",
    measurementBody: "When your results are easier to understand, it also becomes easier to see what actually feels relevant.",
    connectionLabel: "Together",
    connectionTitle: "Conversations that feel natural",
    connectionBody: "Health choices often feel easier to carry when they can be discussed in a warm, everyday setting.",
  },
  de: {
    heroTitle: "Klarheit, die menschlich wirkt",
    heroBody: "Ein warmer erster Eindruck macht verständlich, dass InsideBalance nicht nur aus Testdaten besteht, sondern aus Richtung und nächsten Schritten.",
    measurementLabel: "Nach dem Test",
    measurementTitle: "Erkenntnis wird Handlung",
    measurementBody: "Wenn Ergebnisse klarer werden, wird auch der nächste Schritt leichter.",
    connectionLabel: "Gemeinsam",
    connectionTitle: "Gespräche, die natürlich wirken",
    connectionBody: "Gute Gesundheitsentscheidungen tragen sich oft leichter in einer warmen Alltagssituation.",
  },
  fr: {
    heroTitle: "Une clarté qui reste humaine",
    heroBody: "Un premier contact chaleureux aide à comprendre que InsideBalance ne parle pas seulement de données, mais aussi de direction et de prochaines étapes.",
    measurementLabel: "Après le test",
    measurementTitle: "Une compréhension qui devient action",
    measurementBody: "Quand les résultats deviennent plus clairs, l'étape suivante devient plus simple.",
    connectionLabel: "Ensemble",
    connectionTitle: "Des échanges naturels",
    connectionBody: "Les bonnes décisions santé sont souvent plus faciles à porter dans un cadre chaleureux du quotidien.",
  },
  it: {
    heroTitle: "Chiarezza con un tono umano",
    heroBody: "Un primo contatto caldo aiuta a capire che InsideBalance non riguarda solo i dati, ma anche direzione e passi successivi.",
    measurementLabel: "Dopo il test",
    measurementTitle: "Un insight che diventa azione",
    measurementBody: "Quando i risultati diventano più chiari, il passo successivo è più facile da compiere.",
    connectionLabel: "Insieme",
    connectionTitle: "Conversazioni naturali",
    connectionBody: "Le buone scelte per la salute spesso sono più facili da portare avanti in un contesto quotidiano e umano.",
  },
};

const visualFrameOverridesByLang: Partial<Record<Lang, VisualFrameCopy>> = {
  sv: {
    heroTitle: "Mätning med en lugnare riktning",
    heroBody: "InsideBalance gör det lättare att förstå sina testresultat och veta vad nästa steg kan vara.",
    measurementLabel: "Efter testet",
    measurementTitle: "Insikt som blir till handling",
    measurementBody: "När dina resultat blir tydligare blir det också lättare att se vad som faktiskt känns relevant.",
    connectionLabel: "Tillsammans",
    connectionTitle: "Samtal som känns naturliga",
    connectionBody: "Hälsoval känns ofta lättare att bära när de går att prata om i en varm och vardaglig miljö.",
  },
  no: {
    heroTitle: "Tydelighet som føles menneskelig",
    heroBody: "InsideBalance skal gjøre testresultater lettere å ta inn og lettere å bruke i virkeligheten.",
    measurementLabel: "Etter testen",
    measurementTitle: "Innsikt som blir til handling",
    measurementBody: "Når resultatene blir lettere å forstå, blir det også enklere å se hva som faktisk kjennes relevant.",
    connectionLabel: "Sammen",
    connectionTitle: "Samtaler som kjennes naturlige",
    connectionBody: "Helsevalg føles ofte lettere å bære når de kan deles i en varm og hverdagslig situasjon.",
  },
  da: {
    heroTitle: "Tydelighed der føles menneskelig",
    heroBody: "InsideBalance skal gøre testresultater lettere at tage ind og lettere at bruge i virkeligheden.",
    measurementLabel: "Efter testen",
    measurementTitle: "Indsigt der bliver til handling",
    measurementBody: "Når resultaterne er lettere at forstå, bliver det også nemmere at se, hvad der faktisk er relevant.",
    connectionLabel: "Sammen",
    connectionTitle: "Samtaler der føles naturlige",
    connectionBody: "Sundhedsvalg føles ofte lettere at bære, når de kan deles i en varm og hverdagsnær ramme.",
  },
  fi: {
    heroTitle: "Selkeyttä inhimillisellä tavalla",
    heroBody: "InsideBalance tekee testituloksista helpompia ottaa vastaan ja helpompia käyttää arjessa.",
    measurementLabel: "Testin jälkeen",
    measurementTitle: "Oivallus muuttuu toiminnaksi",
    measurementBody: "Kun tuloksia on helpompi ymmärtää, on myös helpompi nähdä mikä tuntuu oikeasti olennaiselta.",
    connectionLabel: "Yhdessä",
    connectionTitle: "Luontevia keskusteluja",
    connectionBody: "Terveyteen liittyvät valinnat tuntuvat usein helpommilta, kun niistä voi puhua lämpimässä ja arkisessa ympäristössä.",
  },
  en: {
    heroTitle: "Clarity that feels human",
    heroBody: "InsideBalance is meant to make test results easier to take in and easier to use in real life.",
    measurementLabel: "After the test",
    measurementTitle: "Insight that becomes action",
    measurementBody: "When your results are easier to understand, it also becomes easier to see what actually feels relevant.",
    connectionLabel: "Together",
    connectionTitle: "Conversations that feel natural",
    connectionBody: "Health choices often feel easier to carry when they can be discussed in a warm, everyday setting.",
  },
  de: {
    heroTitle: "Klarheit, die menschlich wirkt",
    heroBody: "InsideBalance soll Testergebnisse leichter zugänglich und im Alltag leichter nutzbar machen.",
    measurementLabel: "Nach dem Test",
    measurementTitle: "Erkenntnis wird Handlung",
    measurementBody: "Wenn Ergebnisse leichter zu verstehen sind, wird auch klarer, was wirklich relevant erscheint.",
    connectionLabel: "Gemeinsam",
    connectionTitle: "Gespräche, die natürlich wirken",
    connectionBody: "Gesundheitsbezogene Entscheidungen lassen sich oft leichter tragen, wenn man sie in einer warmen Alltagssituation besprechen kann.",
  },
  fr: {
    heroTitle: "Une clarté qui reste humaine",
    heroBody: "InsideBalance est conçu pour rendre les résultats plus faciles à comprendre et plus simples à utiliser dans la vraie vie.",
    measurementLabel: "Après le test",
    measurementTitle: "Une compréhension qui devient action",
    measurementBody: "Quand les résultats sont plus faciles à comprendre, il devient aussi plus simple de voir ce qui paraît vraiment pertinent.",
    connectionLabel: "Ensemble",
    connectionTitle: "Des échanges naturels",
    connectionBody: "Les choix liés à la santé sont souvent plus faciles à porter lorsqu’ils peuvent être partagés dans un cadre chaleureux du quotidien.",
  },
  it: {
    heroTitle: "Chiarezza con un tono umano",
    heroBody: "InsideBalance è pensato per rendere i risultati più facili da comprendere e più semplici da usare nella vita reale.",
    measurementLabel: "Dopo il test",
    measurementTitle: "Un insight che diventa azione",
    measurementBody: "Quando i risultati sono più facili da capire, diventa anche più semplice vedere ciò che appare davvero rilevante.",
    connectionLabel: "Insieme",
    connectionTitle: "Conversazioni naturali",
    connectionBody: "Le scelte legate alla salute risultano spesso più facili da sostenere quando possono essere condivise in un contesto quotidiano e accogliente.",
  },
};

function resolveLang(param?: string): Lang {
  return (isSupportedLang(param) ? param : defaultLang) as Lang;
}

const localizedPath = (lang: Lang, base: string) => (lang === "sv" ? base : `/${lang}${base}`);
const platformHomePath = (lang: Lang) => (lang === "sv" ? "/" : `/${lang}`);
const omegaBalancePath = (lang: Lang) => (lang === "sv" ? "/omega-balance" : `/${lang}/omega-balance`);
const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[0_18px_40px_rgba(31,70,55,0.18)] ring-1 ring-[rgba(70,99,80,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95";
const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(70,99,80,0.12)] bg-white/88 px-6 py-3.5 text-base font-medium text-foreground shadow-[0_12px_30px_rgba(31,41,55,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white";
const productLinkLabelByLang: Record<Lang, string> = {
  sv: "Läs mer",
  no: "Les mer",
  da: "Læs mere",
  fi: "Lue lisää",
  en: "Learn more",
  de: "Mehr erfahren",
  fr: "En savoir plus",
  it: "Scopri di più",
};
const footerCopyrightByLang: Record<Lang, string> = {
  sv: "© 2026 InsideBalance. Alla rättigheter förbehållna.",
  no: "© 2026 InsideBalance. Alle rettigheter forbeholdt.",
  da: "© 2026 InsideBalance. Alle rettigheder forbeholdes.",
  fi: "© 2026 InsideBalance. Kaikki oikeudet pidätetään.",
  en: "© 2026 InsideBalance. All rights reserved.",
  de: "© 2026 InsideBalance. Alle Rechte vorbehalten.",
  fr: "© 2026 InsideBalance. Tous droits réservés.",
  it: "© 2026 InsideBalance. Tutti i diritti riservati.",
};
const closingCtaTitleByLang: Record<Lang, string> = {
  sv: "Redo att börja?",
  no: "Klar til å starte?",
  da: "Klar til at starte?",
  fi: "Valmis aloittamaan?",
  en: "Ready to begin?",
  de: "Bereit zu starten?",
  fr: "Prêt à commencer ?",
  it: "Pronto per iniziare?",
};
const closingCtaBodyByLang: Record<Lang, string> = {
  sv: "Börja med OmegaBalance – det tydligaste sättet att komma igång i InsideBalance just nu.",
  no: "Start med OmegaBalance – den tydeligste måten å komme i gang i InsideBalance akkurat nå.",
  da: "Start med OmegaBalance – den tydeligste måde at komme i gang i InsideBalance lige nu.",
  fi: "Aloita OmegaBalancella – selkein tapa päästä alkuun InsideBalancessa juuri nyt.",
  en: "Start with OmegaBalance - the clearest way to get going in InsideBalance right now.",
  de: "Starte mit OmegaBalance - der klarste Weg, jetzt mit InsideBalance zu beginnen.",
  fr: "Commencez par OmegaBalance - la manière la plus claire de démarrer avec InsideBalance aujourd'hui.",
  it: "Inizia con OmegaBalance - il modo più chiaro per iniziare con InsideBalance in questo momento.",
};
const footerTaglineByLang: Record<Lang, string> = {
  sv: "Hälsotester med tydlig struktur. Mät först, förstå sedan, agera därefter.",
  no: "Helsetester med tydelig struktur. Mål først, forstå deretter, handle etterpå.",
  da: "Sundhedstests med tydelig struktur. Mål først, forstå derefter, handl bagefter.",
  fi: "Hyvinvointitestit selkeällä rakenteella. Mittaa ensin, ymmärrä sitten, toimi sen jälkeen.",
  en: "Health tests with clear structure. Measure first, understand next, act after that.",
  de: "Gesundheitstests mit klarer Struktur. Erst messen, dann verstehen, danach handeln.",
  fr: "Des tests de santé avec une structure claire. Mesurez d'abord, comprenez ensuite, agissez après.",
  it: "Test di salute con una struttura chiara. Misura prima, comprendi poi, agisci dopo.",
};
const footerWebsiteLabelByLang: Record<Lang, string> = {
  sv: "insidebalance.eu",
  no: "insidebalance.eu",
  da: "insidebalance.eu",
  fi: "insidebalance.eu",
  en: "insidebalance.eu",
  de: "insidebalance.eu",
  fr: "insidebalance.eu",
  it: "insidebalance.eu",
};

const topNavByLang: Record<Lang, { benefits: string; how: string; faq: string; contact: string; start: string }> = {
  sv: { benefits: "Fördelar", how: "Så fungerar det", faq: "Vanliga frågor", contact: "Kontakt", start: "Kom igång" },
  no: { benefits: "Fordeler", how: "Slik fungerer det", faq: "Vanlige spørsmål", contact: "Kontakt", start: "Kom i gang" },
  da: { benefits: "Fordele", how: "Sådan fungerer det", faq: "Ofte stillede spørgsmål", contact: "Kontakt", start: "Kom i gang" },
  fi: { benefits: "Edut", how: "Näin se toimii", faq: "Usein kysyttyä", contact: "Yhteys", start: "Aloita" },
  en: { benefits: "Benefits", how: "How it works", faq: "FAQ", contact: "Contact", start: "Get started" },
  de: { benefits: "Vorteile", how: "So funktioniert es", faq: "Häufige Fragen", contact: "Kontakt", start: "Loslegen" },
  fr: { benefits: "Avantages", how: "Comment ça marche", faq: "FAQ", contact: "Contact", start: "Commencer" },
  it: { benefits: "Vantaggi", how: "Come funziona", faq: "FAQ", contact: "Contatto", start: "Inizia" },
};

const heroBadgeByLang: Record<Lang, string> = {
  sv: "Testbaserade hälsoinsikter",
  no: "Testbaserte helseinnsikter",
  da: "Testbaserede sundhedsindsigter",
  fi: "Testipohjaiset hyvinvointi-insightit",
  en: "Test-based health insights",
  de: "Testbasierte Gesundheitsanalysen",
  fr: "Des insights santé basés sur des tests",
  it: "Insight sulla salute basati su test",
};

const heroTrustByLang: Record<Lang, string[]> = {
  sv: ["Kliniskt testat", "100% naturligt", "Premium kvalitet"],
  no: ["Klinisk testet", "100% naturlig", "Premium kvalitet"],
  da: ["Klinisk testet", "100% naturligt", "Premium kvalitet"],
  fi: ["Kliinisesti testattu", "100% luonnollinen", "Premium-laatu"],
  en: ["Clinically tested", "100% natural", "Premium quality"],
  de: ["Klinisch getestet", "100% natürlich", "Premium-Qualität"],
  fr: ["Testé cliniquement", "100% naturel", "Qualité premium"],
  it: ["Testato clinicamente", "100% naturale", "Qualità premium"],
};

const heroProofByLang: Partial<Record<Lang, { stat: string; body: string }>> = {
  sv: {
    stat: "Över 1,7 miljoner utförda BalanceTests hittills",
    body: "Baserat på världens största databas av fettsyror från torrblodstester.",
  },
  en: {
    stat: "1,741,426 BalanceTests completed to date",
    body: "Based on the world's largest database of fatty acids from dried blood spot tests.",
  },
};

const benefitsTitleByLang: Record<Lang, string> = {
  sv: "Tydligt, seriöst och byggt för att hålla",
  no: "Tydelig, seriøs og bygget for å vare",
  da: "Tydeligt, seriøst og bygget til at holde",
  fi: "Selkeä, vakaa ja rakennettu kestämään",
  en: "Clear, serious, and built to last",
  de: "Klar, seriös und für die Dauer gebaut",
  fr: "Clair, sérieux et conçu pour durer",
  it: "Chiaro, serio e costruito per durare",
};

const benefitsIntroByLang: Record<Lang, string> = {
  sv: "InsideBalance bygger på mätbara tester och tydlig struktur. Det ska vara lättare att förstå vad som är relevant och orientera sig i sina val.",
  no: "InsideBalance bygger på målbare tester og tydelig struktur. Det skal være lettere å forstå hva som er relevant og finne riktig vei videre.",
  da: "InsideBalance bygger på målbare tests og tydelig struktur. Det skal være lettere at forstå, hvad der er relevant, og finde den rigtige vej videre.",
  fi: "InsideBalance perustuu mitattaviin testeihin ja selkeään rakenteeseen. Tavoitteena on helpottaa olennaisen ymmärtämistä ja oikean suunnan löytämistä.",
  en: "InsideBalance is built on measurable tests and a clear structure, so it feels easier to understand what matters and where to begin.",
  de: "InsideBalance basiert auf messbaren Tests und klarer Struktur, damit leichter verständlich wird, was relevant ist und wo du beginnen kannst.",
  fr: "InsideBalance repose sur des tests mesurables et une structure claire, pour mieux comprendre ce qui compte et où commencer.",
  it: "InsideBalance si basa su test misurabili e una struttura chiara, così è più facile capire cosa conta e da dove iniziare.",
};

const benefitsGridByLang: Record<Lang, { title: string; body: string }[]> = {
  sv: [
    { title: "Omega-balans", body: "Förstå din omega-6/omega-3-balans och börja med ett tydligt första test." },
    { title: "Tarmhälsa", body: "Utforska mage, tarm och inre balans med samma lugna och testbaserade logik." },
    { title: "Personlig dosering", body: "Baserat på dina individuella resultat beräknas en daglig dos anpassad just för dig." },
    { title: "Immunförsvar", body: "Omega-3-fettsyror kan bidra till immunsystemets normala funktion." },
    { title: "Energi & välmående", body: "Omega-3-fettsyror kan bidra till allmänt välbefinnande – effekterna varierar." },
    { title: "Mätbara resultat", body: "Testa igen efter 120 dagar för att mäta möjliga förändringar." },
  ],
  en: [
    { title: "Omega balance", body: "Understand your omega-6/omega-3 balance and begin with a clear first test." },
    { title: "Gut health", body: "Explore gut health and inner balance through the same calm, test-based logic." },
    { title: "Personal dosing", body: "Based on your individual results, a daily dose can be tailored to your profile." },
    { title: "Immune support", body: "Omega-3 fatty acids can contribute to normal immune function." },
    { title: "Energy & wellbeing", body: "Omega-3 fatty acids may support general wellbeing, though effects vary." },
    { title: "Measurable results", body: "Test again after 120 days to measure possible changes." },
  ],
  no: [],
  da: [],
  fi: [],
  de: [],
  fr: [],
  it: [],
};
const InsideBalancePage = ({ lang: explicitLang }: InsideBalancePageProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? resolveLang(lang);
  const baseCopy = copyByLang[currentLang];
  const copyOverride = copyOverridesByLang[currentLang];
  const copy: InsideBalanceCopy = copyOverride
    ? {
        ...baseCopy,
        ...copyOverride,
        products: copyOverride.products ?? baseCopy.products,
        howSteps: copyOverride.howSteps ?? baseCopy.howSteps,
        whoItems: copyOverride.whoItems ?? baseCopy.whoItems,
        trustPoints: copyOverride.trustPoints ?? baseCopy.trustPoints,
      }
    : baseCopy;
  const topNav = topNavByLang[currentLang];
  const heroTrust = heroTrustByLang[currentLang];
  const heroProof = heroProofByLang[currentLang];
  const benefits = benefitsGridByLang[currentLang].length ? benefitsGridByLang[currentLang] : benefitsGridByLang.en;
  const omegaPath = omegaBalancePath(currentLang);
  const gutPath = localizedPath(currentLang, "/gut-balance");
  const followUpStepByLang: Record<Lang, { title: string; body: string }> = {
    sv: { title: "Följ upp", body: "Testa igen efter 120 dagar för att mäta möjliga förändringar." },
    no: { title: "Folg opp", body: "Test pa nytt etter 120 dager for a male mulige endringer." },
    da: { title: "Folg op", body: "Test igen efter 120 dage for at male mulige aendringer." },
    fi: { title: "Seuraa", body: "Tee testi uudelleen 120 paivan kuluttua mahdollisten muutosten mittaamiseksi." },
    en: { title: "Follow up", body: "Test again after 120 days to measure possible changes." },
    de: { title: "Erneut testen", body: "Teste nach 120 Tagen erneut, um mogliche Veranderungen zu messen." },
    fr: { title: "Faire le suivi", body: "Refaites le test apres 120 jours pour mesurer d'eventuels changements." },
    it: { title: "Follow-up", body: "Ripeti il test dopo 120 giorni per misurare possibili cambiamenti." },
  };
  const faqTitleByLang: Record<Lang, string> = {
    sv: "Har du frågor?",
    no: "Har du sporsmal?",
    da: "Har du sporgsmal?",
    fi: "Onko sinulla kysymyksia?",
    en: "Have questions?",
    de: "Hast du Fragen?",
    fr: "Vous avez des questions ?",
    it: "Hai domande?",
  };
  const heroHighlightWordByLang: Partial<Record<Lang, string>> = {
    sv: "inre balans",
    en: "what you actually need",
  };
  const numberedSteps = [...copy.howSteps, followUpStepByLang[currentLang]];
  const heroHighlightWord = heroHighlightWordByLang[currentLang];
  const highlightedHeroTitle =
    heroHighlightWord && copy.heroTitle.includes(heroHighlightWord)
      ? copy.heroTitle.split(heroHighlightWord)
      : null;

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-foreground">
      <header className="border-b border-black/5 bg-[#f7f3eb] px-4 py-5 md:px-6">
        <div className="container-wide mx-auto flex items-center justify-between gap-6">
          <Link to={platformHomePath(currentLang)} className="min-w-0 flex-1" aria-label={copy.navHome}>
            <InsideBalanceLogo alt={copy.navHome} variant="full" className="h-12 sm:h-14 md:h-16" imageClassName="scale-[2] origin-left" />
          </Link>
          <nav className="hidden items-center gap-6 text-[0.95rem] text-foreground/70 xl:flex">
            <Link to={omegaPath} className="transition hover:text-foreground">{copy.navOmega}</Link>
            <Link to={gutPath} className="transition hover:text-foreground">{copy.navGut}</Link>
            <a href="#benefits" className="transition hover:text-foreground">{topNav.benefits}</a>
            <a href="#how-it-works" className="transition hover:text-foreground">{topNav.how}</a>
            <a href="#faq" className="transition hover:text-foreground">{topNav.faq}</a>
            <Link to={localizedPath(currentLang, "/kontakt")} className="transition hover:text-foreground">{topNav.contact}</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white text-foreground shadow-[0_10px_24px_rgba(31,41,55,0.06)] transition hover:bg-white/90 xl:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-black/5 bg-[#f7f3eb] px-6 py-8">
                <SheetTitle className="sr-only">{copy.navHome}</SheetTitle>
                <div className="mt-8 flex flex-col gap-6">
                  <div className="border-b border-black/5 pb-5">
                    <InsideBalanceLogo alt={copy.navHome} variant="full" className="h-12" imageClassName="scale-[1.65] origin-left" />
                  </div>
                  <div className="flex flex-col gap-3 text-base text-foreground/78">
                    <SheetClose asChild><Link to={platformHomePath(currentLang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.navHome}</Link></SheetClose>
                    <SheetClose asChild><Link to={omegaPath} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.navOmega}</Link></SheetClose>
                    <SheetClose asChild><Link to={gutPath} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.navGut}</Link></SheetClose>
                    <SheetClose asChild><a href="#benefits" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{topNav.benefits}</a></SheetClose>
                    <SheetClose asChild><a href="#how-it-works" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{topNav.how}</a></SheetClose>
                    <SheetClose asChild><a href="#faq" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{topNav.faq}</a></SheetClose>
                    <SheetClose asChild><Link to={localizedPath(currentLang, "/kontakt")} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{topNav.contact}</Link></SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <LanguageSwitcher lang={currentLang} />
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(230,243,235,0.95),rgba(247,243,235,0.98)_42%,rgba(242,235,223,1)_100%)] px-4 pb-20 pt-10 md:px-6 md:pb-24 md:pt-16">
        <div className="container-wide mx-auto grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="text-center lg:text-center">
            <span className="inline-flex rounded-full border border-[rgba(70,99,80,0.12)] bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-[0_12px_30px_rgba(31,41,55,0.05)]">
              {heroBadgeByLang[currentLang]}
            </span>
            <h1 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              {highlightedHeroTitle ? (
                <>
                  {highlightedHeroTitle[0]}
                  <span className="text-primary italic">{heroHighlightWord}</span>
                  {highlightedHeroTitle[1]}
                </>
              ) : (
                copy.heroTitle
              )}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/70">
              {copy.heroBody}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to={omegaPath} className={primaryCtaClass}>
                {copy.heroSecondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#benefits" className={secondaryCtaClass}>
                {copy.heroPrimaryCta}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-foreground/70">
              {heroTrust.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 shadow-[0_10px_24px_rgba(31,41,55,0.04)]">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </span>
              ))}
            </div>
            {heroProof ? (
              <div className="mx-auto mt-8 max-w-3xl rounded-[1.8rem] border border-[rgba(70,99,80,0.1)] bg-white/86 px-7 py-6 text-center shadow-[0_18px_40px_rgba(31,41,55,0.06)]">
                <p className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{heroProof.stat}</p>
                <p className="mt-3 text-base leading-8 text-foreground/66">{heroProof.body}</p>
              </div>
            ) : null}
          </div>

          <div className="mx-auto w-full max-w-[34rem]">
            <div className="rounded-[2rem] border border-[rgba(70,99,80,0.08)] bg-white/78 p-4 shadow-[0_28px_70px_rgba(31,70,55,0.10)]">
              <div className="aspect-[4/4.6] overflow-hidden rounded-[1.6rem]">
                <img src={insideBalancePortraitImage} alt={copy.heroTitle} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="px-4 py-18 md:px-6 md:py-24">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{copy.heroEyebrow} - health testing</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight md:text-5xl">{benefitsTitleByLang[currentLang]}</h2>
            <p className="mt-5 text-lg leading-8 text-foreground/68">{benefitsIntroByLang[currentLang]}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-[1.8rem] border border-[rgba(70,99,80,0.1)] bg-white px-6 py-7 shadow-[0_18px_40px_rgba(31,41,55,0.04)]">
                <h3 className="text-xl font-semibold tracking-tight">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-foreground/68">{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#efe7d8] px-4 py-18 md:px-6 md:py-24">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{copy.whyTitle}</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight md:text-5xl">{copy.howTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-foreground/68">{copy.whyBody}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {numberedSteps.map((step, index) => (
              <article key={`${step.title}-${index}`} className="rounded-[1.75rem] bg-white px-6 py-7 shadow-[0_18px_38px_rgba(31,41,55,0.05)]">
                <p className="text-sm font-semibold tracking-[0.16em] text-primary">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-foreground/68">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-18 md:px-6 md:py-24">
        <div className="container-wide mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight md:text-5xl">{faqTitleByLang[currentLang]}</h2>
          </div>
        </div>
        <FAQSection lang={currentLang} />
      </section>

      <section className="px-4 pb-18 md:px-6 md:pb-24">
        <div className="container-wide mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-10 text-center text-primary-foreground shadow-[0_28px_70px_hsl(var(--primary)/0.22)] md:px-12 md:py-14">
            <div className="absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative mx-auto max-w-3xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-5xl">{closingCtaTitleByLang[currentLang]}</h2>
              <p className="mt-5 text-lg leading-8 text-primary-foreground/86">{closingCtaBodyByLang[currentLang]}</p>
            </div>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link to={omegaPath} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-base font-medium text-primary transition hover:opacity-95">
                {copy.heroSecondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-black/5 bg-[#f3ecdf] px-4 py-14 md:px-6 md:py-16">
        <div className="container-wide mx-auto grid gap-10 md:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div>
            <InsideBalanceLogo alt={copy.footerTitle} variant="full" className="h-12 sm:h-14 md:h-16" imageClassName="scale-[2] origin-left" />
            <p className="mt-4 max-w-lg text-sm leading-7 text-foreground/64">{copy.footerBody}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/40">{footerExploreLabelByLang[currentLang]}</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-foreground/70">
              <a href="#benefits" className="transition hover:text-foreground">{topNav.benefits}</a>
              <a href="#how-it-works" className="transition hover:text-foreground">{topNav.how}</a>
              <a href="#faq" className="transition hover:text-foreground">{topNav.faq}</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/40">{footerContactLabelByLang[currentLang]}</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-foreground/70">
              <Link to={localizedPath(currentLang, "/kontakt")} className="transition hover:text-foreground">{topNav.contact}</Link>
              <Link to={localizedPath(currentLang, "/integritet")} className="transition hover:text-foreground">{footerPrivacyLabelByLang[currentLang]}</Link>
              <Link to={localizedPath(currentLang, "/villkor")} className="transition hover:text-foreground">{footerTermsLabelByLang[currentLang]}</Link>
            </div>
          </div>
        </div>
        <div className="container-wide mx-auto mt-10 border-t border-black/5 pt-6">
          <p className="text-center text-xs text-foreground/50">
            {footerCopyrightByLang[currentLang]} • {independentPartnerLabelByLang[currentLang]}
          </p>
        </div>
      </footer>
    </main>
  );
};

export default InsideBalancePage;
