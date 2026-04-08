import { Link, useParams } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";
import insideBalanceResultsImage from "@/assets/insidebalance-results.png";
import insideBalanceConversationImage from "@/assets/insidebalance-conversation.png";
import insideBalancePortraitImage from "@/assets/insidebalance-portrait.png";

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

const copyByLang: Record<Lang, InsideBalanceCopy> = {
  sv: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "H\u00e4lsotester som g\u00f6r det l\u00e4ttare att f\u00f6rst\u00e5 vad du faktiskt beh\u00f6ver",
    heroBody:
      "InsideBalance samlar v\u00e5ra testsp\u00e5r p\u00e5 ett st\u00e4lle f\u00f6r dig som vill fatta mer genomt\u00e4nkta h\u00e4lsobeslut. B\u00f6rja med r\u00e4tt test, f\u00e5 ett tydligare nul\u00e4ge och ta n\u00e4sta steg med mer trygghet.",
    heroPrimaryCta: "Se v\u00e5ra testsp\u00e5r",
    heroSecondaryCta: "B\u00f6rja med OmegaBalance",
    productsTitle: "V\u00e5ra testsp\u00e5r",
    productsBody:
      "Varje sp\u00e5r fokuserar p\u00e5 ett omr\u00e5de d\u00e4r m\u00e4tbara resultat g\u00f6r det l\u00e4ttare att f\u00f6rst\u00e5 vad som \u00e4r relevant just nu.",
    products: [
      {
        title: "OmegaBalance",
        eyebrow: "Tillg\u00e4nglig nu",
        body: "Ett tydligt f\u00f6rsta testsp\u00e5r f\u00f6r dig som vill f\u00f6rst\u00e5 din omega-6/omega-3-balans och f\u00e5 en mer konkret riktning fram\u00e5t.",
        fit: "Passar dig som vill b\u00f6rja med ett etablerat test, ett tydligare nul\u00e4ge och n\u00e4sta steg som g\u00e5r att agera p\u00e5.",
        cta: "Utforska OmegaBalance",
        href: "/sv",
      },
      {
        title: "GutBalance",
        eyebrow: "N\u00e4sta sp\u00e5r",
        body: "V\u00e5rt kommande testsp\u00e5r f\u00f6r mage, tarm och inre balans. Det byggs f\u00f6r att bli n\u00e4sta naturliga del i InsideBalance.",
        fit: "Passar dig som \u00e4r nyfiken p\u00e5 ett framtida sp\u00e5r d\u00e4r testresultat ska kunna ge mer riktning \u00e4ven f\u00f6r magen.",
        cta: "Se GutBalance",
        href: "/sv/gut-balance",
        status: "Kommer snart",
      },
    ],
    whyTitle: "B\u00f6rja med att m\u00e4ta",
    whyBody:
      "M\u00e5nga f\u00f6rs\u00f6ker f\u00f6rb\u00e4ttra h\u00e4lsan utan att f\u00f6rst veta nul\u00e4get. Ett test ger en tydligare startpunkt och g\u00f6r n\u00e4sta steg enklare att v\u00e4lja.",
    trustTitle: "Seri\u00f6st, tydligt och byggt f\u00f6r att h\u00e5lla",
    trustBody:
      "InsideBalance ska k\u00e4nnas lugnt och trov\u00e4rdigt. Vi bygger kring m\u00e4tbara tester, tydlig kommunikation och n\u00e4sta steg som g\u00e5r att f\u00f6rst\u00e5 utan att bli \u00f6verv\u00e4ldigande.",
    trustPoints: [
      "Testbaserad utg\u00e5ngspunkt i st\u00e4llet f\u00f6r gissningar.",
      "Tydliga produktsp\u00e5r med ett fokus i taget.",
      "En lugnare upplevelse d\u00e4r f\u00f6rtroende \u00e4r viktigare \u00e4n hype.",
    ],
    howTitle: "S\u00e5 fungerar det",
    howSteps: [
      { title: "V\u00e4lj sp\u00e5r", body: "B\u00f6rja med det omr\u00e5de som k\u00e4nns mest relevant just nu." },
      { title: "G\u00f6r testet hemma", body: "Testen \u00e4r gjorda f\u00f6r att vara enkla att starta med utan on\u00f6dig friktion." },
      { title: "F\u00e5 tydligare n\u00e4sta steg", body: "Du f\u00e5r ett b\u00e4ttre nul\u00e4ge att fatta beslut utifr\u00e5n." },
    ],
    whoTitle: "F\u00f6r dig som vill f\u00f6rst\u00e5 mer, inte bara gissa",
    whoItems: [
      "Du vill ha ett tydligare nul\u00e4ge innan du g\u00f6r f\u00f6r\u00e4ndringar.",
      "Du vill fatta beslut utifr\u00e5n data i st\u00e4llet f\u00f6r magk\u00e4nsla.",
      "Du vill b\u00f6rja enkelt, men smart.",
    ],
    footerTitle: "InsideBalance",
    footerBody:
      "InsideBalance \u00e4r plattformen bakom v\u00e5ra testsp\u00e5r. OmegaBalance och GutBalance \u00e4r tv\u00e5 tydliga v\u00e4gar in i samma helhet.",
    footerCta: "G\u00e5 vidare till OmegaBalance",
  },
  no: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Testbasert helse med tydeligere neste steg",
    heroBody: "InsideBalance samler helsebanene våre på ett sted. Start med testen som passer deg best og få en tydeligere vei videre.",
    heroPrimaryCta: "Utforsk våre tester",
    heroSecondaryCta: "Gå til OmegaBalance",
    productsTitle: "Våre testspor",
    productsBody: "Hvert spor fokuserer på et område der målbare resultater gjør det lettere å forstå hva som er relevant akkurat nå.",
    products: [
      { title: "OmegaBalance", body: "For deg som vil forstå omega-6/omega-3-balansen din og få et tydeligere neste steg.", cta: "Gå til OmegaBalance", href: "/no" },
      { title: "GutBalance", body: "Vårt neste testspor for mage, tarm og indre balanse.", cta: "Les om GutBalance", href: "/no/gut-balance", status: "Kommer snart" },
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
    heroSecondaryCta: "Gå til OmegaBalance",
    productsTitle: "Vores testspor",
    productsBody: "Hvert spor fokuserer på et område, hvor målbare resultater gør det lettere at forstå, hvad der er relevant nu.",
    products: [
      { title: "OmegaBalance", body: "For dig, der vil forstå din omega-6/omega-3-balance.", cta: "Gå til OmegaBalance", href: "/da" },
      { title: "GutBalance", body: "Vores næste testspor for mave, tarm og indre balance.", cta: "Læs om GutBalance", href: "/da/gut-balance", status: "Kommer snart" },
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
    heroSecondaryCta: "Siirry OmegaBalanceen",
    productsTitle: "Testipolkumme",
    productsBody: "Jokainen polku keskittyy alueeseen, jossa mitattavat tulokset auttavat ymm\u00e4rt\u00e4m\u00e4\u00e4n, mik\u00e4 on ajankohtaista juuri nyt.",
    products: [
      { title: "OmegaBalance", body: "Sinulle, joka haluat ymm\u00e4rt\u00e4\u00e4 omega-6/omega-3-tasapainoasi paremmin.", cta: "Siirry OmegaBalanceen", href: "/fi" },
      { title: "GutBalance", body: "Seuraava testipolkumme vatsan, suoliston ja sis\u00e4isen tasapainon tueksi.", cta: "Lue GutBalancesta", href: "/fi/gut-balance", status: "Tulossa pian" },
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
    heroTitle: "Test-based health with clearer next steps",
    heroBody: "InsideBalance brings our health journeys together in one place. Start with the test that fits you best and move forward with more clarity.",
    heroPrimaryCta: "Explore our tests",
    heroSecondaryCta: "Go to OmegaBalance",
    productsTitle: "Our test journeys",
    productsBody: "Each journey focuses on one area where measurable results make it easier to understand what matters right now.",
    products: [
      { title: "OmegaBalance", body: "For people who want to understand their omega-6/omega-3 balance and get a clearer next step.", cta: "Go to OmegaBalance", href: "/en" },
      { title: "GutBalance", body: "Our next test journey for gut health, digestion, and inner balance.", cta: "Read about GutBalance", href: "/en/gut-balance", status: "Coming soon" },
    ],
    whyTitle: "Start by measuring",
    whyBody: "Many people try to improve their health before they truly understand their starting point. A test creates a clearer basis for action.",
    howTitle: "How it works",
    howSteps: [
      { title: "Choose a journey", body: "Start with the area that feels most relevant right now." },
      { title: "Take the test at home", body: "The tests are designed to be easy to begin without unnecessary friction." },
      { title: "Get clearer next steps", body: "You get a better foundation for decisions that follow." },
    ],
    whoTitle: "For people who want to understand more, not just guess",
    whoItems: ["You want a clearer starting point.", "You want to make decisions based on data.", "You want to start simply, but smartly."],
    footerTitle: "InsideBalance",
    footerBody: "InsideBalance is the platform behind our test journeys. OmegaBalance and GutBalance are two clear ways into the same bigger picture.",
  },
  de: {
    navHome: "InsideBalance",
    navOmega: "OmegaBalance",
    navGut: "GutBalance",
    heroEyebrow: "InsideBalance",
    heroTitle: "Testbasierte Gesundheit mit klareren n\u00e4chsten Schritten",
    heroBody: "InsideBalance verbindet unsere Gesundheitswege an einem Ort. Starte mit dem Test, der am besten zu dir passt.",
    heroPrimaryCta: "Unsere Tests entdecken",
    heroSecondaryCta: "Zu OmegaBalance",
    productsTitle: "Unsere Testwege",
    productsBody: "Jeder Weg konzentriert sich auf einen Bereich, in dem messbare Ergebnisse helfen, das Relevante jetzt besser zu verstehen.",
    products: [
      { title: "OmegaBalance", body: "F\u00fcr Menschen, die ihre Omega-6/Omega-3-Balance besser verstehen wollen.", cta: "Zu OmegaBalance", href: "/de" },
      { title: "GutBalance", body: "Unser n\u00e4chster Testweg rund um Darm, Verdauung und innere Balance.", cta: "Mehr zu GutBalance", href: "/de/gut-balance", status: "Demn\u00e4chst" },
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
    heroSecondaryCta: "Aller vers OmegaBalance",
    productsTitle: "Nos parcours de test",
    productsBody: "Chaque parcours se concentre sur un domaine o\u00f9 des r\u00e9sultats mesurables rendent la suite plus claire.",
    products: [
      { title: "OmegaBalance", body: "Pour celles et ceux qui veulent mieux comprendre leur \u00e9quilibre om\u00e9ga-6/om\u00e9ga-3.", cta: "Aller vers OmegaBalance", href: "/fr" },
      { title: "GutBalance", body: "Notre prochain parcours autour du ventre, de l'intestin et de l'\u00e9quilibre int\u00e9rieur.", cta: "Lire sur GutBalance", href: "/fr/gut-balance", status: "Bient\u00f4t" },
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
    heroSecondaryCta: "Vai a OmegaBalance",
    productsTitle: "I nostri percorsi di test",
    productsBody: "Ogni percorso si concentra su un'area in cui risultati misurabili rendono pi\u00f9 semplice capire cosa conta adesso.",
    products: [
      { title: "OmegaBalance", body: "Per chi vuole capire meglio il proprio equilibrio omega-6/omega-3.", cta: "Vai a OmegaBalance", href: "/it" },
      { title: "GutBalance", body: "Il nostro prossimo percorso dedicato a intestino, digestione ed equilibrio interno.", cta: "Scopri GutBalance", href: "/it/gut-balance", status: "In arrivo" },
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

const visualFramesByLang: Record<Lang, VisualFrameCopy> = {
  sv: {
    heroTitle: "M\u00e4tning med en lugnare riktning",
    heroBody: "InsideBalance \u00e4r byggt f\u00f6r att g\u00f6ra h\u00e4lsotester mer begripliga, mer anv\u00e4ndbara och mindre \u00f6verv\u00e4ldigande. H\u00e4r ska tydlighet k\u00e4nnas lika viktig som information.",
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
    heroBody: "A warm first contact makes it easier to understand that InsideBalance is not just about test data, but about direction and realistic next steps.",
    measurementLabel: "After the test",
    measurementTitle: "Insight that becomes action",
    measurementBody: "When your results become clearer, the next step becomes easier to take.",
    connectionLabel: "Together",
    connectionTitle: "Conversations that feel natural",
    connectionBody: "Good health decisions often feel easier to carry when they can be talked about in a warm everyday setting.",
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

function resolveLang(param?: string): Lang {
  return (isSupportedLang(param) ? param : defaultLang) as Lang;
}

const localizedPath = (lang: Lang, base: string) => (lang === "sv" ? base : `/${lang}${base}`);

const InsideBalancePage = ({ lang: explicitLang }: InsideBalancePageProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? resolveLang(lang);
  const copy = copyByLang[currentLang];
  const visuals = visualFramesByLang[currentLang];
  const trustTitle = copy.trustTitle ?? "Serious, clear, and built to last";
  const trustBody =
    copy.trustBody ??
    "InsideBalance is designed to feel calm and credible, built around measurable tests, clear communication, and next steps that are easy to understand.";
  const trustPoints =
    copy.trustPoints ?? [
      "A test-based starting point instead of guesswork.",
      "Clear product journeys with one focus at a time.",
      "A calmer experience where trust matters more than hype.",
    ];
  const footerCta = copy.footerCta ?? copy.products[0]?.cta;

  return (
    <main className="min-h-screen bg-[#f6f2ea] text-foreground">
      <section className="relative overflow-hidden px-4 pb-14 pt-6 md:px-6 md:pb-24 md:pt-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(127,153,130,0.14),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(48,77,63,0.10),_transparent_38%)]" />
        <div className="container-wide relative mx-auto">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <Link to={localizedPath(currentLang, "/inside-balance")} className="font-serif text-xl font-semibold tracking-tight text-foreground">
              {copy.navHome}
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <Link to={currentLang === "sv" ? "/sv" : `/${currentLang}`} className="rounded-full border border-black/5 bg-white/80 px-4 py-2 text-sm font-medium text-foreground shadow-[0_12px_30px_rgba(31,41,55,0.05)] transition hover:bg-white">
                {copy.navOmega}
              </Link>
              <Link to={localizedPath(currentLang, "/gut-balance")} className="rounded-full border border-black/5 bg-white/70 px-4 py-2 text-sm font-medium text-foreground/80 shadow-[0_12px_30px_rgba(31,41,55,0.05)] transition hover:bg-white">
                {copy.navGut}
              </Link>
              <LanguageSwitcher lang={currentLang} />
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-black/5 bg-white/75 px-4 py-1.5 text-sm font-medium tracking-wide text-foreground/75">
                {copy.heroEyebrow}
              </span>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/68">{copy.heroBody}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#products" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[0_22px_50px_rgba(31,70,55,0.18)] transition hover:opacity-95">
                  {copy.heroPrimaryCta}
                </a>
                <Link
                  to={currentLang === "sv" ? "/sv" : `/${currentLang}`}
                  className="inline-flex items-center justify-center rounded-full border border-black/5 bg-white/82 px-6 py-3.5 text-base font-medium text-foreground shadow-[0_12px_30px_rgba(31,41,55,0.05)] transition hover:bg-white"
                >
                  {copy.heroSecondaryCta}
                </Link>
              </div>
              <div className="mt-12 overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 shadow-[0_24px_60px_rgba(31,41,55,0.08)]">
                <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
                  <div className="aspect-[4/5] md:aspect-auto">
                    <img src={insideBalancePortraitImage} alt={visuals.heroTitle} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center p-6 md:p-9">
                    <div>
                      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">{visuals.heroTitle}</h2>
                      <p className="mt-4 text-base leading-7 text-foreground/68">{visuals.heroBody}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-black/5 bg-white/82 p-7 shadow-[0_18px_40px_rgba(31,41,55,0.06)]">
                <p className="text-2xl font-semibold tracking-tight text-foreground">InsideBalance</p>
                <p className="mt-3 text-sm leading-7 text-foreground/68">
                  {copy.footerBody}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-[#d8d2c7] bg-[#ece6da] p-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
                <p className="text-2xl font-semibold tracking-tight text-foreground">OmegaBalance</p>
                <p className="mt-3 text-sm leading-7 text-foreground/68">
                  {copy.products[0].body}
                </p>
                <Link to={copy.products[0].href} className="mt-5 inline-flex items-center rounded-full border border-black/5 bg-white/80 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white">
                  {copy.products[0].cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="px-4 py-14 md:px-6 md:py-20">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{copy.productsTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-foreground/70">{copy.productsBody}</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {copy.products.map((product) => (
              <article key={product.title} className="rounded-[2rem] border border-black/5 bg-white/88 p-8 shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  {product.eyebrow ? (
                    <span className="inline-flex rounded-full border border-black/5 bg-[#f4efe6] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-foreground/72">
                      {product.eyebrow}
                    </span>
                  ) : null}
                  {product.status ? (
                    <span className="inline-flex rounded-full border border-black/5 bg-[#ece5d8] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-foreground/72">
                      {product.status}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">{product.title}</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-foreground/68">{product.body}</p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-foreground/60">{product.fit}</p>
                <Link to={product.href} className="mt-7 inline-flex items-center rounded-full border border-black/5 bg-[#faf7f1] px-5 py-3 text-sm font-medium text-foreground transition hover:bg-white">
                  {product.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="container-wide mx-auto grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-[#ddd5c7] bg-[#eee7da] p-9 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{copy.whyTitle}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/68">{copy.whyBody}</p>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
            <div className="aspect-[16/11]">
              <img src={insideBalanceResultsImage} alt={visuals.measurementTitle} className="h-full w-full object-cover" />
            </div>
            <div className="p-8 md:p-9">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{visuals.measurementLabel}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{visuals.measurementTitle}</h2>
              <p className="mt-4 text-lg leading-8 text-foreground/68">{visuals.measurementBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="container-wide mx-auto rounded-[2rem] border border-black/5 bg-[#ece6da] p-8 md:p-10 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{trustTitle}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/68">{trustBody}</p>
            </div>
            <div className="space-y-4">
              {trustPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-black/5 bg-white/78 px-5 py-4 text-base leading-7 text-foreground/78">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{copy.howTitle}</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {copy.howSteps.map((step, index) => (
              <article key={step.title} className="rounded-[1.75rem] border border-black/5 bg-white/88 p-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{index + 1}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-foreground/68">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="container-wide mx-auto grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
            <div className="aspect-[16/11]">
              <img src={insideBalanceConversationImage} alt={visuals.connectionTitle} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="rounded-[2rem] border border-black/5 bg-white/88 p-8 md:p-9 shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{visuals.connectionLabel}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{visuals.connectionTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-foreground/68">{visuals.connectionBody}</p>
            <div className="mt-6 space-y-4">
              {copy.whoItems.map((item) => (
                <div key={item} className="rounded-2xl border border-black/5 bg-[#faf7f1] px-4 py-3 text-base leading-7 text-foreground/78">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 px-4 py-12 md:px-6">
        <div className="container-wide mx-auto flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-serif text-2xl font-semibold tracking-tight text-foreground">{copy.footerTitle}</p>
            <p className="mt-3 text-base leading-7 text-foreground/66">{copy.footerBody}</p>
            {footerCta ? (
              <Link
                to={copy.products[0].href}
                className="mt-6 inline-flex items-center rounded-full border border-black/5 bg-[#faf7f1] px-5 py-3 text-sm font-medium text-foreground transition hover:bg-white"
              >
                {footerCta}
              </Link>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-foreground/68">
            <Link to={localizedPath(currentLang, "/kontakt")} className="transition hover:text-foreground">Kontakt</Link>
            <Link to={localizedPath(currentLang, "/integritet")} className="transition hover:text-foreground">Privacy</Link>
            <Link to={localizedPath(currentLang, "/villkor")} className="transition hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default InsideBalancePage;
