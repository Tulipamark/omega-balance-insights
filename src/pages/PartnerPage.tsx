import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, CircleDollarSign, FlaskConical, Users2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import FooterSection from "@/components/FooterSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { upsertLead } from "@/lib/api";
import { Lang, t } from "@/lib/i18n";
import { getOrCreateSessionId, getReferralAttribution } from "@/lib/referral";

interface PartnerPageProps {
  lang: Lang;
}

type PartnerPageContent = {
  hero: {
    badge: string;
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    cards: { title: string; text: string; icon: typeof FlaskConical }[];
  };
  economics: {
    title: string;
    body: string;
    steps: { label: string; value: string }[];
    modelLabel: string;
    modelBody: string;
    calloutTitle: string;
    calloutBody: string;
    note: string;
  };
  reasons: {
    title: string;
    body: string;
    cards: { title: string; text: string }[];
  };
  fit: {
    title: string;
    body: string;
    columns: { title: string; items: string[] }[];
  };
  steps: {
    title: string;
    body: string;
    items: { title: string; text: string }[];
  };
  form: {
    title: string;
    body: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    interest: string;
    readiness: string;
    background: string;
    interestOptions: string[];
    readinessOptions: string[];
    submit: string;
    successTitle: string;
    successBody: string;
  };
  sticky: {
    text: string;
    cta: string;
  };
};

const baseContent: Pick<Record<Lang, PartnerPageContent>, "sv" | "en"> = {
  sv: {
    hero: {
      badge: "Partnermöjlighet",
      title: "Det här är inte för alla",
      body: "Men om du vill bygga något långsiktigt inom hälsa, med riktiga produkter och återkommande kunder – då kan det vara värt att titta närmare.",
      primaryCta: "Ansök om att bli partner",
      secondaryCta: "Förstå modellen först",
      cards: [
        {
          title: "En produkt som är lätt att förstå",
          text: "Ett konkret blodtest gör det enklare att starta samtal om hälsa, eftersom kunden får något mätbart istället för vaga löften.",
          icon: FlaskConical,
        },
        {
          title: "Återkommande kundvärde",
          text: "När människor följer upp sina resultat och vill förbättra dem finns bättre förutsättningar för återköp än i engångsdrivna kategorier.",
          icon: CircleDollarSign,
        },
        {
          title: "En modell som kan skalas",
          text: "Med rätt struktur, rätt människor och en tydlig produkt går det att bygga stegvis – lokalt, digitalt och över tid.",
          icon: BarChart3,
        },
      ],
    },
    economics: {
      title: "Varför finns det utrymme för partnerintäkter i modellen?",
      body: "I traditionella kedjor passerar värdet genom flera externa led. När färre aktörer delar på samma värde kan mer stanna i modellen.",
      steps: [
        { label: "Labb / Produktion", value: "179 kr" },
        { label: "Varumärke / Import", value: "349 kr" },
        { label: "Grossist", value: "699 kr" },
        { label: "Slutkund", value: "1299 kr" },
      ],
      modelLabel: "Förenklad modell",
      modelBody: "Färre led skapar större utrymme för kundutbetalningar och partnerintäkter.",
      calloutTitle: "Poängen är inte hype. Poängen är en bättre värdekedja.",
      calloutBody: "Om mindre värde försvinner i externa mellanled skapas större utrymme för både bolaget och framtida partners. Det gör modellen mer logisk än många traditionella upplägg.",
      note: "Det här är inte magi. Det är marginalstruktur.",
    },
    reasons: {
      title: "Vad gör en partnermodell värd att bygga?",
      body: "Vi tror att starka partnermöjligheter bygger på fyra saker: verklig efterfrågan, återkommande kunder, tydlig differentiering och möjlighet att växa över tid.",
      cards: [
        {
          title: "Verklig produkt, verkligt behov",
          text: "Mätbar hälsa är lättare att kommunicera när produkten ger kunden ett konkret svar, inte bara en känsla.",
        },
        {
          title: "Kunder som kan komma tillbaka",
          text: "En modell blir starkare när den inte enbart bygger på nya engångsköp, utan även på uppföljning, förbättring och återköp.",
        },
        {
          title: "Rätt i tiden",
          text: "Intresset för biomarkörer, personlig hälsa och datadrivna beslut växer. Det gör kategorin mer relevant än många traditionella hälsoprodukter.",
        },
        {
          title: "Inte låst till en liten marknad",
          text: "När modellen kan fungera i fler länder och fler nätverk ökar den långsiktiga uppsidan för rätt typ av partner.",
        },
      ],
    },
    fit: {
      title: "Vem passar det här för?",
      body: "Det här är inte för alla. Vi söker framför allt människor som vill arbeta långsiktigt och bygga med kvalitet.",
      columns: [
        {
          title: "Passar dig som...",
          items: [
            "tycker om att prata med människor på ett naturligt sätt",
            "vill bygga något stegvis, inte jaga snabba genvägar",
            "ser värdet i hälsa, data och tydliga resultat",
            "vill arbeta med ett erbjudande som känns modernt och relevant",
          ],
        },
        {
          title: "Det här är inget för dig som letar efter en snabb lösning.",
          items: [
            "förstår värdet av att arbeta långsiktigt",
            "vill arbeta med något de faktiskt kan stå för",
            "är bekväma med att bygga relationer, inte bara transaktioner",
            "ser affärsmässighet som en förutsättning, inte ett hinder",
          ],
        },
        {
          title: "Det vi värderar",
          items: ["seriositet", "självledarskap", "långsiktighet", "affärsetik", "förmåga att skapa förtroende"],
        },
      ],
    },
    steps: {
      title: "Vad händer efter att du ansöker?",
      body: "Processen är enkel och utan press. Vi vill först förstå vem du är, sedan visa modellen tydligt och därefter låta dig avgöra om det känns rätt.",
      items: [
        {
          title: "Vi går igenom din ansökan",
          text: "Vi läser dina svar för att förstå vad du söker och om det finns en rimlig match.",
        },
        {
          title: "Du får en kort genomgång av modellen",
          text: "Vi visar hur produkten, kundresan och partnerlogiken fungerar i praktiken.",
        },
        {
          title: "Du avgör om det är rätt för dig",
          text: "Målet är inte att pressa fram ett ja, utan att du ska kunna ta ställning i lugn och ro.",
        },
      ],
    },
    form: {
      title: "Nyfiken på att bli partner?",
      body: "Lämna dina uppgifter och några korta svar, så hör vi av oss om nästa steg.",
      name: "Namn",
      email: "E-post",
      phone: "Telefonnummer",
      company: "Företag eller team (valfritt)",
      interest: "Vad är du mest ute efter?",
      readiness: "Hur redo är du?",
      background: "Varför är detta intressant för dig?",
      interestOptions: [
        "Extra inkomst",
        "Bygga verksamhet",
        "Bara nyfiken",
      ],
      readinessOptions: ["Utforskar", "Vill testa", "Redo att köra"],
      submit: "Skicka partneransökan",
      successTitle: "Tack, din ansökan är mottagen.",
      successBody: "Vi går igenom dina svar och hör av oss om nästa steg om det finns en rimlig match.",
    },
    sticky: {
      text: "Utforska en modern partnermodell inom mätbar hälsa",
      cta: "Ansök om att bli partner",
    },
  },
  en: {
    hero: {
      badge: "Partner opportunity",
      title: "This is not for everyone",
      body: "But if you want to build something long term in health, with real products and recurring customers, it may be worth a closer look.",
      primaryCta: "Apply to become a partner",
      secondaryCta: "Understand the model first",
      cards: [
        { title: "A product that is easy to explain", text: "A clear blood test makes health conversations easier because the customer gets something measurable instead of vague promises.", icon: FlaskConical },
        { title: "Recurring customer value", text: "When people follow up on their results and want to improve them, repeat purchases become more realistic than in one-off categories.", icon: CircleDollarSign },
        { title: "A model that can scale", text: "With the right structure, the right people and a clear product, it can be built step by step over time.", icon: BarChart3 },
      ],
    },
    economics: {
      title: "Why is there room for partner income in the model?",
      body: "In traditional chains, value moves through multiple outside layers. When fewer actors share the same value, more can stay in the model.",
      steps: [
        { label: "Lab / Production", value: "SEK 179" },
        { label: "Brand / Import", value: "SEK 349" },
        { label: "Wholesale", value: "SEK 699" },
        { label: "End customer", value: "SEK 1299" },
      ],
      modelLabel: "Simplified model",
      modelBody: "Fewer layers create more room for customer payouts and partner income.",
      calloutTitle: "The point is not hype. The point is a stronger value chain.",
      calloutBody: "If less value disappears into outside middle layers, more room is created for both the company and future partners. That makes the model easier to understand than many traditional setups.",
      note: "This is not magic. It is margin structure.",
    },
    reasons: {
      title: "What makes a partner model worth building?",
      body: "We believe strong partner opportunities depend on four things: real demand, recurring customers, clear differentiation and the ability to grow over time.",
      cards: [
        { title: "Real product, real need", text: "Measurable health is easier to communicate when the product gives the customer a concrete answer, not just a feeling." },
        { title: "Customers who may come back", text: "A stronger model is not only built on first-time purchases, but also on follow-up, improvement and repeat buying." },
        { title: "Right on time", text: "Interest in biomarkers, personal health and data-driven decisions is growing. That makes the category more relevant than many traditional health products." },
        { title: "Not limited to a small market", text: "When the model can work across more countries and networks, the long-term upside grows for the right kind of partner." },
      ],
    },
    fit: {
      title: "Who is this for?",
      body: "This is not for everyone. We are mainly looking for people who want to work long term and build with quality.",
      columns: [
        { title: "A good fit if you...", items: ["enjoy speaking with people naturally", "want to build step by step instead of chasing shortcuts", "see the value in health, data and clear results", "want to work with something modern and relevant"] },
        { title: "A weaker fit if you...", items: ["want fast money without effort", "prefer hard selling to anyone", "lack patience for building trust and relationships", "mainly want a title or surface status"] },
        { title: "What we value", items: ["seriousness", "self-leadership", "long-term thinking", "business ethics", "the ability to build trust"] },
      ],
    },
    steps: {
      title: "What happens after you apply?",
      body: "The process is simple and without pressure. We first review your application, then explain the model clearly, and then you decide whether it feels right.",
      items: [
        { title: "We review your application", text: "We read your answers to understand what you are looking for and whether there is a reasonable fit." },
        { title: "You get a short walkthrough of the model", text: "We explain how the product, customer journey and partner logic work in practice." },
        { title: "You decide if it is right for you", text: "The goal is not to push for a yes, but to let you decide calmly whether it is a good match." },
      ],
    },
    form: {
      title: "Curious about becoming a partner?",
      body: "Leave your details and a few short answers, and we will get back to you about the next step.",
      name: "Name",
      email: "Email",
      phone: "Phone number",
      company: "Company or team (optional)",
      interest: "What are you mainly looking for?",
      readiness: "How ready are you?",
      background: "Why is this interesting to you?",
      interestOptions: ["Extra income", "Build a business", "Just curious"],
      readinessOptions: ["Exploring", "Want to test", "Ready to start"],
      submit: "Send partner application",
      successTitle: "Thank you, your application has been received.",
      successBody: "We will review your answers and reach out if there seems to be a reasonable match.",
    },
    sticky: {
      text: "Explore a modern partner model in measurable health",
      cta: "Apply to become a partner",
    },
  },
};

function buildLocalizedPartnerContent(lang: Exclude<Lang, "sv" | "en">): PartnerPageContent {
  const partner = t(lang).partner;

  return {
    hero: {
      badge: partner.heroBadge,
      title: partner.heroTitle,
      body: partner.heroBody,
      primaryCta: partner.heroPrimaryCta,
      secondaryCta: partner.heroSecondaryCta,
      cards: partner.highlights.map((item, index) => ({
        title: item.title,
        text: item.description,
        icon: [FlaskConical, CircleDollarSign, BarChart3][index] || BarChart3,
      })),
    },
    economics: {
      title: partner.economicsTitle,
      body: partner.economicsBody,
      steps: partner.economicsSteps,
      modelLabel: baseContent.en.economics.modelLabel,
      modelBody: baseContent.en.economics.modelBody,
      calloutTitle: partner.economicsCalloutTitle,
      calloutBody: partner.economicsCalloutBody,
      note: baseContent.en.economics.note,
    },
    reasons: {
      title: partner.reasonsTitle,
      body: partner.reasonsBody,
      cards: partner.reasons.map((item) => ({
        title: item.title,
        text: item.description,
      })),
    },
    fit: baseContent.en.fit,
    steps: baseContent.en.steps,
    form: {
      ...baseContent.en.form,
      title: partner.formTitle,
      body: partner.formBody,
      name: partner.formName,
      email: partner.formEmail,
      phone: partner.formPhone,
      company: partner.formCompany,
      background: partner.formMessage,
      submit: partner.formSubmit,
      successTitle: partner.formSuccessTitle,
      successBody: partner.formSuccessBody,
    },
    sticky: baseContent.en.sticky,
  };
}

const content: Record<Lang, PartnerPageContent> = {
  ...baseContent,
  no: buildLocalizedPartnerContent("no"),
  da: buildLocalizedPartnerContent("da"),
  fi: buildLocalizedPartnerContent("fi"),
  de: buildLocalizedPartnerContent("de"),
  fr: buildLocalizedPartnerContent("fr"),
  it: buildLocalizedPartnerContent("it"),
};

const economicsStepsByLang: Record<Lang, { label: string; value: string }[]> = {
  sv: [
    { label: "Labb / produktion", value: "249 kr" },
    { label: "Varumärke / import", value: "499 kr" },
    { label: "Grossist", value: "999 kr" },
    { label: "Butik", value: "1995 kr" },
  ],
  no: [
    { label: "Lab / produksjon", value: "NOK 279" },
    { label: "Merkevare / import", value: "NOK 559" },
    { label: "Grossist", value: "NOK 1119" },
    { label: "Butikk", value: "NOK 2239" },
  ],
  da: [
    { label: "Lab / produktion", value: "DKK 179" },
    { label: "Brand / import", value: "DKK 359" },
    { label: "Grossist", value: "DKK 719" },
    { label: "Butik", value: "DKK 1439" },
  ],
  fi: [
    { label: "Laboratorio / tuotanto", value: "EUR 23" },
    { label: "Brändi / tuonti", value: "EUR 46" },
    { label: "Tukku", value: "EUR 92" },
    { label: "Myymälä", value: "EUR 183" },
  ],
  en: [
    { label: "Lab / production", value: "EUR 23" },
    { label: "Brand / import", value: "EUR 46" },
    { label: "Wholesale", value: "EUR 92" },
    { label: "Retail", value: "EUR 183" },
  ],
  de: [
    { label: "Labor / Produktion", value: "EUR 23" },
    { label: "Marke / Import", value: "EUR 46" },
    { label: "Großhandel", value: "EUR 92" },
    { label: "Einzelhandel", value: "EUR 183" },
  ],
  fr: [
    { label: "Laboratoire / production", value: "EUR 23" },
    { label: "Marque / import", value: "EUR 46" },
    { label: "Grossiste", value: "EUR 92" },
    { label: "Magasin", value: "EUR 183" },
  ],
  it: [
    { label: "Laboratorio / produzione", value: "EUR 23" },
    { label: "Brand / import", value: "EUR 46" },
    { label: "Grossista", value: "EUR 92" },
    { label: "Negozio", value: "EUR 183" },
  ],
};

const economicsModelLabelByLang: Record<Lang, string> = {
  sv: "Förenklat räkneexempel",
  no: "Forenklet regneeksempel",
  da: "Forenklet regneeksempel",
  fi: "Yksinkertaistettu laskentaesimerkki",
  en: "Simplified example",
  de: "Vereinfachtes Rechenbeispiel",
  fr: "Exemple simplifié",
  it: "Esempio semplificato",
};

const economicsModelBodyByLang: Record<Lang, string> = {
  sv: "Exemplet visar hur generella påslag ofta byggs upp mellan produktion, varumärke, grossist och butik i vanliga distributionskedjor.",
  no: "Eksemplet viser hvordan generelle påslag ofte bygges opp mellom produksjon, merkevare, grossist og butikk i vanlige distribusjonskjeder.",
  da: "Eksemplet viser, hvordan generelle tillæg ofte bygges op mellem produktion, brand, grossist og butik i almindelige distributionskæder.",
  fi: "Esimerkki näyttää, miten yleiset katteet usein rakentuvat tuotannon, brändin, tukun ja myymälän välillä tavallisissa jakeluketjuissa.",
  en: "This example shows how general markups often build between production, brand, wholesale, and retail in ordinary distribution chains.",
  de: "Das Beispiel zeigt, wie sich allgemeine Aufschläge in klassischen Vertriebsketten oft zwischen Produktion, Marke, Großhandel und Einzelhandel aufbauen.",
  fr: "Cet exemple montre comment des marges générales se construisent souvent entre la production, la marque, le grossiste et le magasin dans des chaînes de distribution classiques.",
  it: "Questo esempio mostra come i ricarichi generali si costruiscano spesso tra produzione, brand, grossista e negozio nelle catene distributive tradizionali.",
};

const economicsCalloutTitleByLang: Record<Lang, string> = {
  sv: "Det här är ett generellt branschexempel, inte en specifik prislista.",
  no: "Dette er et generelt bransjeeksempel, ikke en spesifikk prisliste.",
  da: "Dette er et generelt brancheeksempel, ikke en specifik prisliste.",
  fi: "Tämä on yleinen toimialaesimerkki, ei tietyn yrityksen hinnasto.",
  en: "This is a general industry example, not a specific price list.",
  de: "Dies ist ein allgemeines Branchenbeispiel, keine konkrete Preisliste.",
  fr: "Il s'agit d'un exemple général du secteur, pas d'une liste de prix spécifique.",
  it: "Si tratta di un esempio generale di settore, non di un listino prezzi specifico.",
};

const economicsCalloutBodyByLang: Record<Lang, string> = {
  sv: "Poängen är att visa hur värde ofta fördelas när flera externa distributionsled lägger på sina marginaler. Det här avser inte Zinzinos faktiska priser.",
  no: "Poenget er å vise hvordan verdi ofte fordeles når flere eksterne distribusjonsledd legger på sine marginer. Dette viser ikke Zinzinos faktiske priser.",
  da: "Pointen er at vise, hvordan værdi ofte fordeles, når flere eksterne distributionsled lægger deres marginer på. Dette viser ikke Zinzinos faktiske priser.",
  fi: "Tarkoitus on havainnollistaa, miten arvo usein jakautuu, kun useat ulkoiset jakeluportaat lisäävät omat katteensa. Tämä ei kuvaa Zinzinon todellisia hintoja.",
  en: "The point is to illustrate how value is often distributed when several outside distribution layers add their own margins. This does not describe Zinzino's actual prices.",
  de: "Gemeint ist zu zeigen, wie sich Wert typischerweise verteilt, wenn mehrere externe Vertriebsstufen ihre Margen hinzufügen. Das beschreibt nicht die tatsächlichen Preise von Zinzino.",
  fr: "L'objectif est d'illustrer comment la valeur se répartit souvent lorsque plusieurs niveaux de distribution externes ajoutent leurs propres marges. Cela ne décrit pas les prix réels de Zinzino.",
  it: "L'obiettivo è illustrare come il valore venga spesso distribuito quando diversi livelli di distribuzione esterni aggiungono i propri margini. Questo non descrive i prezzi reali di Zinzino.",
};

const economicsNoteByLang: Record<Lang, string> = {
  sv: "Illustrativt räkneexempel baserat på generella branschpåslag.",
  no: "Illustrativt regneeksempel basert på generelle bransjepåslag.",
  da: "Illustrativt regneeksempel baseret på generelle branchetillæg.",
  fi: "Havainnollistava esimerkki, joka perustuu yleisiin toimialan katteisiin.",
  en: "Illustrative example based on general industry markups.",
  de: "Illustratives Beispiel auf Basis allgemeiner Branchenaufschläge.",
  fr: "Exemple illustratif fondé sur des marges générales du secteur.",
  it: "Esempio illustrativo basato su ricarichi generali di settore.",
};

const heroOverridesByLang: Partial<Record<Lang, PartnerPageContent["hero"]>> = {
  sv: {
    badge: "Partnermöjlighet",
    title: "Bygg en partnerverksamhet kring ett testbaserat hälsokoncept",
    body: "För dig som tror på mätning, tydlighet och långsiktighet. Vi tror att testbaserad hälsa kommer att bli allt mer relevant de kommande åren, och att den som bygger seriöst redan nu står starkare längre fram.",
    primaryCta: "Ansök om att bli partner",
    secondaryCta: "Se hur det fungerar",
    cards: [
      {
        title: "Ett konkret koncept att stå för",
        text: "Ett testbaserat erbjudande är lättare att förklara än vaga hälsolöften. Kunden får något mätbart att utgå från.",
        icon: FlaskConical,
      },
      {
        title: "Bättre grund för återkommande kunder",
        text: "När människor följer upp sina resultat över tid blir kundresan mer långsiktig än i rena engångskategorier.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant i en marknad som mognar",
        text: "Intresset för biomarkörer, uppföljning och mer faktabaserade hälsobeslut växer. Det gör kategorin intressant på 3-5 års sikt.",
        icon: BarChart3,
      },
    ],
  },
  en: {
    badge: "Partner opportunity",
    title: "Build a partner business around a test-based health concept",
    body: "For people who believe in measurement, clarity, and long-term thinking. We believe test-based health will become more relevant over the next few years, and that serious builders who start early will be better positioned.",
    primaryCta: "Apply to become a partner",
    secondaryCta: "See how it works",
    cards: [
      {
        title: "A concept you can stand behind",
        text: "A test-based offer is easier to explain than vague wellness promises. The customer starts with something measurable.",
        icon: FlaskConical,
      },
      {
        title: "A stronger basis for recurring customers",
        text: "When people follow up on their results over time, the customer relationship becomes more durable than in one-off categories.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant in a maturing market",
        text: "Interest in biomarkers, follow-up, and more fact-based health decisions is growing. That makes the category more interesting over a 3-5 year horizon.",
        icon: BarChart3,
      },
    ],
  },
  no: {
    badge: "Partnermulighet",
    title: "Bygg en partnervirksomhet rundt et testbasert helsekonsept",
    body: "For deg som tror på måling, tydelighet og langsiktighet. Vi tror at testbasert helse vil bli stadig mer relevant de kommende årene, og at den som bygger seriøst allerede nå står sterkere senere.",
    primaryCta: "Søk om å bli partner",
    secondaryCta: "Se hvordan det fungerer",
    cards: [
      {
        title: "Et konkret konsept å stå for",
        text: "Et testbasert tilbud er lettere å forklare enn diffuse helseløfter. Kunden får noe målbart å ta utgangspunkt i.",
        icon: FlaskConical,
      },
      {
        title: "Bedre grunnlag for tilbakevendende kunder",
        text: "Når mennesker følger opp resultatene sine over tid, blir kundereisen mer langsiktig enn i rene engangskategorier.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant i et marked som modnes",
        text: "Interessen for biomarkører, oppfølging og mer faktabaserte helsebeslutninger vokser. Det gjør kategorien interessant i et 3-5 års perspektiv.",
        icon: BarChart3,
      },
    ],
  },
  da: {
    badge: "Partnermulighed",
    title: "Byg en partnerforretning omkring et testbaseret sundhedskoncept",
    body: "For dig, der tror på måling, tydelighed og langsigtet opbygning. Vi tror, at testbaseret sundhed vil blive mere relevant de kommende år, og at den som bygger seriøst nu, står stærkere senere.",
    primaryCta: "Ansøg om at blive partner",
    secondaryCta: "Se hvordan det fungerer",
    cards: [
      {
        title: "Et konkret koncept at stå på mål for",
        text: "Et testbaseret tilbud er lettere at forklare end diffuse sundhedsløfter. Kunden får noget målbart at tage udgangspunkt i.",
        icon: FlaskConical,
      },
      {
        title: "Bedre grundlag for tilbagevendende kunder",
        text: "Når mennesker følger deres resultater over tid, bliver kunderejsen mere langsigtet end i rene engangskategorier.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant i et marked, der modnes",
        text: "Interessen for biomarkører, opfølgning og mere faktabaserede sundhedsbeslutninger vokser. Det gør kategorien interessant i et 3-5 års perspektiv.",
        icon: BarChart3,
      },
    ],
  },
  fi: {
    badge: "Partnerimahdollisuus",
    title: "Rakenna partneriliiketoimintaa testipohjaisen terveyskonseptin ympärille",
    body: "Sinulle, joka uskot mittaamiseen, selkeyteen ja pitkäjänteisyyteen. Uskomme, että testipohjainen terveys tulee olemaan yhä relevantimpaa tulevina vuosina, ja että vakavasti nyt rakentava on myöhemmin vahvemmassa asemassa.",
    primaryCta: "Hae partneriksi",
    secondaryCta: "Katso miten se toimii",
    cards: [
      {
        title: "Konkreettinen konsepti, jonka takana voi seistä",
        text: "Testipohjainen tarjous on helpompi selittää kuin epämääräiset hyvinvointilupaukset. Asiakas saa jotain mitattavaa, josta lähteä liikkeelle.",
        icon: FlaskConical,
      },
      {
        title: "Parempi perusta toistuvalle asiakkuudelle",
        text: "Kun ihmiset seuraavat tuloksiaan ajan myötä, asiakassuhteesta tulee pitkäjänteisempi kuin kertaluonteisissa kategorioissa.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevantti kypsyvässä markkinassa",
        text: "Kiinnostus biomarkkereihin, seurantaan ja faktapohjaisempiin terveyspäätöksiin kasvaa. Siksi kategoriassa on kiinnostavaa potentiaalia 3-5 vuoden tähtäimellä.",
        icon: BarChart3,
      },
    ],
  },
  de: {
    badge: "Partnerchance",
    title: "Baue ein Partnergeschäft rund um ein testbasiertes Gesundheitskonzept auf",
    body: "Für Menschen, die an Messbarkeit, Klarheit und langfristiges Arbeiten glauben. Wir sind überzeugt, dass testbasierte Gesundheit in den kommenden Jahren relevanter wird und dass seriöse Aufbauarbeit heute später besser positioniert ist.",
    primaryCta: "Als Partner bewerben",
    secondaryCta: "So funktioniert es",
    cards: [
      {
        title: "Ein klares Konzept, hinter dem man stehen kann",
        text: "Ein testbasiertes Angebot lässt sich leichter erklären als diffuse Gesundheitsversprechen. Der Kunde startet mit etwas Messbarem.",
        icon: FlaskConical,
      },
      {
        title: "Bessere Grundlage für wiederkehrende Kunden",
        text: "Wenn Menschen ihre Ergebnisse über die Zeit verfolgen, entsteht eine belastbarere Kundenbeziehung als in reinen Einmalkategorien.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant in einem reifenden Markt",
        text: "Das Interesse an Biomarkern, Verlaufskontrolle und faktenbasierten Gesundheitsentscheidungen wächst. Das macht die Kategorie auf Sicht von 3-5 Jahren interessant.",
        icon: BarChart3,
      },
    ],
  },
  fr: {
    badge: "Opportunité partenaire",
    title: "Développez une activité partenaire autour d'un concept de santé fondé sur le test",
    body: "Pour celles et ceux qui croient à la mesure, à la clarté et à la construction dans la durée. Nous pensons que la santé fondée sur le test va gagner en importance dans les années à venir, et que ceux qui construisent sérieusement dès maintenant seront mieux placés ensuite.",
    primaryCta: "Postuler comme partenaire",
    secondaryCta: "Voir comment cela fonctionne",
    cards: [
      {
        title: "Un concept concret que l'on peut assumer",
        text: "Une offre fondée sur le test est plus facile à expliquer que des promesses santé vagues. Le client part de quelque chose de mesurable.",
        icon: FlaskConical,
      },
      {
        title: "Une base plus solide pour des clients récurrents",
        text: "Lorsque les personnes suivent leurs résultats dans le temps, la relation client devient plus durable que dans des catégories purement ponctuelles.",
        icon: CircleDollarSign,
      },
      {
        title: "Pertinent dans un marché en maturation",
        text: "L'intérêt pour les biomarqueurs, le suivi et des décisions santé plus factuelles progresse. Cela rend la catégorie intéressante sur un horizon de 3 à 5 ans.",
        icon: BarChart3,
      },
    ],
  },
  it: {
    badge: "Opportunità partner",
    title: "Costruisci un'attività partner attorno a un concetto di salute basato sul test",
    body: "Per chi crede nella misurazione, nella chiarezza e nella costruzione nel lungo periodo. Pensiamo che la salute basata sul test diventerà sempre più rilevante nei prossimi anni, e che chi costruisce seriamente già oggi sarà più forte domani.",
    primaryCta: "Candidati come partner",
    secondaryCta: "Scopri come funziona",
    cards: [
      {
        title: "Un concetto concreto dietro cui stare",
        text: "Un'offerta basata sul test è più facile da spiegare rispetto a promesse salute vaghe. Il cliente parte da qualcosa di misurabile.",
        icon: FlaskConical,
      },
      {
        title: "Una base migliore per clienti ricorrenti",
        text: "Quando le persone seguono i propri risultati nel tempo, la relazione con il cliente diventa più solida rispetto alle categorie da acquisto singolo.",
        icon: CircleDollarSign,
      },
      {
        title: "Rilevante in un mercato che matura",
        text: "L'interesse per biomarcatori, monitoraggio e decisioni salute più basate sui dati sta crescendo. Questo rende la categoria interessante su un orizzonte di 3-5 anni.",
        icon: BarChart3,
      },
    ],
  },
};

const reasonsOverridesByLang: Partial<Record<Lang, PartnerPageContent["reasons"]>> = {
  sv: {
    title: "Varför kan det här vara värt att bygga?",
    body: "Vi tror att en stark partnermodell behöver vila på verklig produktrelevans, återkommande kundvärde, en seriös affärslogik och en kategori som blir mer intressant över tid.",
    cards: [
      {
        title: "Mätning före antaganden",
        text: "Det är lättare att skapa förtroende när erbjudandet utgår från test och uppföljning, inte bara allmänna hälsopåståenden.",
      },
      {
        title: "Ett mer vuxet hälsosamtal",
        text: "Testbaserad hälsa gör det lättare att föra relevanta samtal med människor som söker tydlighet, inte hype.",
      },
      {
        title: "Mer långsiktig kundlogik",
        text: "När kunden kan mäta, följa upp och förbättra över tid blir relationen starkare än vid ett enstaka köp.",
      },
      {
        title: "Rätt i tiden",
        text: "Vi tror att intresset för mer mätbar och individanpassad hälsa kommer att fortsätta växa de kommande åren.",
      },
    ],
  },
  en: {
    title: "Why could this be worth building?",
    body: "We believe a strong partner model should rest on real product relevance, recurring customer value, sound business logic, and a category that becomes more interesting over time.",
    cards: [
      {
        title: "Measurement before assumptions",
        text: "It is easier to build trust when the offer starts with testing and follow-up rather than broad wellness claims.",
      },
      {
        title: "A more mature health conversation",
        text: "Test-based health makes it easier to have relevant conversations with people who want clarity, not hype.",
      },
      {
        title: "More durable customer logic",
        text: "When customers can test, follow up, and improve over time, the relationship becomes stronger than a single transaction.",
      },
      {
        title: "Well timed",
        text: "We believe interest in more measurable and individual health will continue to grow over the coming years.",
      },
    ],
  },
  no: {
    title: "Hvorfor kan dette være verdt å bygge?",
    body: "Vi tror at en sterk partnermodell må hvile på reell produktrelevans, tilbakevendende kundeverdi, en seriøs forretningslogikk og en kategori som blir mer interessant over tid.",
    cards: [
      {
        title: "Måling før antakelser",
        text: "Det er lettere å bygge tillit når tilbudet tar utgangspunkt i test og oppfølging, ikke bare generelle helsepåstander.",
      },
      {
        title: "Et mer voksent helsesamtale",
        text: "Testbasert helse gjør det lettere å ha relevante samtaler med mennesker som søker tydelighet, ikke hype.",
      },
      {
        title: "Mer langsiktig kundelogikk",
        text: "Når kunden kan måle, følge opp og forbedre over tid, blir relasjonen sterkere enn ved et enkelt kjøp.",
      },
      {
        title: "Riktig i tiden",
        text: "Vi tror interessen for mer målbar og individtilpasset helse vil fortsette å vokse i årene som kommer.",
      },
    ],
  },
  da: {
    title: "Hvorfor kan dette være værd at bygge?",
    body: "Vi mener, at en stærk partnermodel skal hvile på reel produktrelevans, tilbagevendende kundeværdi, en seriøs forretningslogik og en kategori, der bliver mere interessant over tid.",
    cards: [
      {
        title: "Måling før antagelser",
        text: "Det er lettere at skabe tillid, når tilbuddet tager udgangspunkt i test og opfølgning, ikke kun i generelle sundhedspåstande.",
      },
      {
        title: "En mere voksen sundhedssamtale",
        text: "Testbaseret sundhed gør det lettere at have relevante samtaler med mennesker, der søger tydelighed, ikke hype.",
      },
      {
        title: "Mere langsigtet kundelogik",
        text: "Når kunden kan måle, følge op og forbedre over tid, bliver relationen stærkere end ved et enkelt køb.",
      },
      {
        title: "God timing",
        text: "Vi tror, at interessen for mere målbar og individtilpasset sundhed vil fortsætte med at vokse i de kommende år.",
      },
    ],
  },
  fi: {
    title: "Miksi tämä voisi olla rakentamisen arvoinen?",
    body: "Uskomme, että vahvan partnermallin pitää perustua todelliseen tuoteosuvuuteen, toistuvaan asiakasarvoon, järkevään liiketoimintalogiikkaan ja kategoriaan, joka muuttuu ajan myötä kiinnostavammaksi.",
    cards: [
      {
        title: "Mittaaminen ennen oletuksia",
        text: "Luottamusta on helpompi rakentaa, kun tarjous perustuu testiin ja seurantaan eikä vain yleisiin hyvinvointiväitteisiin.",
      },
      {
        title: "Kypsempi keskustelu terveydestä",
        text: "Testipohjainen terveys helpottaa merkityksellisiä keskusteluja ihmisten kanssa, jotka etsivät selkeyttä eivätkä hypeä.",
      },
      {
        title: "Pitkäjänteisempi asiakaslogiikka",
        text: "Kun asiakas voi mitata, seurata ja parantaa ajan myötä, suhteesta tulee vahvempi kuin yksittäisessä ostossa.",
      },
      {
        title: "Hyvä ajoitus",
        text: "Uskomme, että kiinnostus mitattavampaan ja yksilöllisempään terveyteen kasvaa edelleen tulevina vuosina.",
      },
    ],
  },
  de: {
    title: "Warum könnte sich der Aufbau lohnen?",
    body: "Wir glauben, dass ein starkes Partnermodell auf echter Produktrelevanz, wiederkehrendem Kundennutzen, solider Geschäftslogik und einer Kategorie beruhen muss, die mit der Zeit an Bedeutung gewinnt.",
    cards: [
      {
        title: "Messung statt Vermutung",
        text: "Vertrauen lässt sich leichter aufbauen, wenn das Angebot mit Test und Verlaufskontrolle beginnt und nicht mit allgemeinen Gesundheitsversprechen.",
      },
      {
        title: "Ein reiferes Gesundheitsgespräch",
        text: "Testbasierte Gesundheit erleichtert relevante Gespräche mit Menschen, die Klarheit suchen und keine Übertreibung.",
      },
      {
        title: "Tragfähigere Kundenlogik",
        text: "Wenn Kunden über die Zeit messen, verfolgen und verbessern können, wird die Beziehung belastbarer als bei einem Einzelkauf.",
      },
      {
        title: "Gutes Timing",
        text: "Wir erwarten, dass das Interesse an messbarer und individueller Gesundheit in den kommenden Jahren weiter wächst.",
      },
    ],
  },
  fr: {
    title: "Pourquoi cela peut-il valoir la peine d'être construit ?",
    body: "Nous pensons qu'un modèle partenaire solide doit reposer sur une vraie pertinence produit, une valeur client récurrente, une logique économique sérieuse et une catégorie qui gagne en intérêt avec le temps.",
    cards: [
      {
        title: "La mesure avant les suppositions",
        text: "Il est plus facile de créer de la confiance lorsque l'offre commence par le test et le suivi, plutôt que par des promesses santé trop générales.",
      },
      {
        title: "Une conversation santé plus mature",
        text: "La santé fondée sur le test facilite des échanges pertinents avec des personnes qui recherchent de la clarté, pas du battage.",
      },
      {
        title: "Une logique client plus durable",
        text: "Quand le client peut mesurer, suivre et améliorer dans le temps, la relation devient plus solide qu'avec un achat ponctuel.",
      },
      {
        title: "Le bon moment",
        text: "Nous pensons que l'intérêt pour une santé plus mesurable et plus individualisée continuera à progresser dans les années à venir.",
      },
    ],
  },
  it: {
    title: "Perché potrebbe valere la pena costruirlo?",
    body: "Pensiamo che un modello partner solido debba poggiare su una reale rilevanza del prodotto, su un valore cliente ricorrente, su una logica di business seria e su una categoria destinata a diventare più interessante nel tempo.",
    cards: [
      {
        title: "Misurazione prima delle supposizioni",
        text: "È più facile costruire fiducia quando l'offerta parte da test e monitoraggio, e non da promesse salute troppo generiche.",
      },
      {
        title: "Una conversazione sulla salute più matura",
        text: "La salute basata sul test rende più semplici conversazioni rilevanti con persone che cercano chiarezza, non enfasi.",
      },
      {
        title: "Una logica cliente più duratura",
        text: "Quando il cliente può misurare, seguire e migliorare nel tempo, la relazione diventa più forte rispetto a un acquisto singolo.",
      },
      {
        title: "Il momento è favorevole",
        text: "Pensiamo che l'interesse per una salute più misurabile e più personalizzata continuerà a crescere nei prossimi anni.",
      },
    ],
  },
};

const fitOverridesByLang: Partial<Record<Lang, PartnerPageContent["fit"]>> = {
  sv: {
    title: "Vem passar det här för?",
    body: "Det här är inte för alla. Vi söker framför allt personer som vill arbeta seriöst, långsiktigt och med något de faktiskt kan stå för.",
    columns: [
      {
        title: "Passar dig som...",
        items: [
          "tror på testbaserad och mer faktadriven hälsa",
          "vill bygga stegvis, inte jaga snabba genvägar",
          "är bekväm med att skapa relationer och förtroende",
          "vill arbeta med något som känns relevant även framåt",
        ],
      },
      {
        title: "Passar sämre om du...",
        items: [
          "letar efter en snabb lösning eller en titel",
          "hellre säljer hårt än bygger tillit",
          "vill ha något som känns enkelt men ytligt",
          "saknar tålamod för att bygga över tid",
        ],
      },
      {
        title: "Det vi värderar",
        items: ["seriositet", "självledarskap", "långsiktighet", "affärsetik", "förmåga att skapa förtroende"],
      },
    ],
  },
  no: {
    title: "Hvem passer dette for?",
    body: "Dette er ikke for alle. Vi ser først og fremst etter personer som vil arbeide seriøst, langsiktig og med noe de faktisk kan stå inne for.",
    columns: [
      {
        title: "Passer deg som...",
        items: [
          "tror på testbasert og mer faktadrevet helse",
          "vil bygge steg for steg, ikke jage raske snarveier",
          "er komfortabel med å skape relasjoner og tillit",
          "vil arbeide med noe som føles relevant også fremover",
        ],
      },
      {
        title: "Passer dårligere hvis du...",
        items: [
          "leter etter en rask løsning eller en tittel",
          "heller vil selge hardt enn bygge tillit",
          "vil ha noe som virker enkelt men overfladisk",
          "mangler tålmodighet til å bygge over tid",
        ],
      },
      {
        title: "Det vi verdsetter",
        items: ["seriøsitet", "selvledelse", "langsiktighet", "forretningsetikk", "evne til å skape tillit"],
      },
    ],
  },
  da: {
    title: "Hvem passer dette til?",
    body: "Det her er ikke for alle. Vi leder først og fremmest efter personer, der vil arbejde seriøst, langsigtet og med noget, de reelt kan stå på mål for.",
    columns: [
      {
        title: "Passer dig som...",
        items: [
          "tror på testbaseret og mere faktadrevet sundhed",
          "vil bygge trin for trin i stedet for at jagte hurtige genveje",
          "er tryg ved at skabe relationer og tillid",
          "vil arbejde med noget, der også føles relevant fremadrettet",
        ],
      },
      {
        title: "Passer dårligere hvis du...",
        items: [
          "leder efter en hurtig løsning eller en titel",
          "hellere vil presse salg igennem end bygge troværdighed",
          "vil have noget, der virker let men overfladisk",
          "mangler tålmodighed til at bygge over tid",
        ],
      },
      {
        title: "Det vi vægter",
        items: ["seriøsitet", "selvledelse", "langsigtethed", "forretningsetik", "evnen til at skabe tillid"],
      },
    ],
  },
  fi: {
    title: "Kenelle tämä sopii?",
    body: "Tämä ei ole kaikille. Etsimme ennen kaikkea ihmisiä, jotka haluavat työskennellä vakavasti, pitkäjänteisesti ja sellaisen asian parissa, jonka takana he voivat aidosti seistä.",
    columns: [
      {
        title: "Sopii sinulle jos...",
        items: [
          "uskot testipohjaiseen ja aiempaa faktapohjaisempaan terveyteen",
          "haluat rakentaa askel askeleelta etkä etsi pikaratkaisuja",
          "koet luontevaksi luoda suhteita ja luottamusta",
          "haluat työskennellä jonkin kanssa, joka tuntuu relevantilta myös jatkossa",
        ],
      },
      {
        title: "Sopii heikommin jos...",
        items: [
          "etsit nopeaa ratkaisua tai pelkkää titteliä",
          "myisit mieluummin kovaa kuin rakentaisit luottamusta",
          "haluat jotain, joka tuntuu helpolta mutta pinnalliselta",
          "sinulta puuttuu kärsivällisyys rakentaa ajan kanssa",
        ],
      },
      {
        title: "Mitä arvostamme",
        items: ["vakavuus", "itsensä johtaminen", "pitkäjänteisyys", "liiketoimintaetiikka", "kyky rakentaa luottamusta"],
      },
    ],
  },
  de: {
    title: "Für wen ist das geeignet?",
    body: "Das ist nicht für alle. Wir suchen vor allem Menschen, die seriös, langfristig und mit etwas arbeiten wollen, hinter dem sie wirklich stehen können.",
    columns: [
      {
        title: "Passt zu dir, wenn du...",
        items: [
          "an testbasierte und stärker faktenorientierte Gesundheit glaubst",
          "Schritt für Schritt aufbauen willst statt nach schnellen Abkürzungen zu suchen",
          "Beziehungen und Vertrauen bewusst aufbauen kannst",
          "mit etwas arbeiten möchtest, das auch in Zukunft relevant wirkt",
        ],
      },
      {
        title: "Passt weniger, wenn du...",
        items: [
          "eine schnelle Lösung oder nur einen Titel suchst",
          "lieber Druck im Verkauf machst als Vertrauen aufzubauen",
          "etwas willst, das leicht wirkt, aber oberflächlich bleibt",
          "nicht die Geduld hast, über Zeit aufzubauen",
        ],
      },
      {
        title: "Was wir schätzen",
        items: ["Seriosität", "Selbstführung", "Langfristigkeit", "Geschäftsethik", "Fähigkeit, Vertrauen aufzubauen"],
      },
    ],
  },
  fr: {
    title: "À qui cela convient-il ?",
    body: "Ce n'est pas pour tout le monde. Nous recherchons surtout des personnes qui veulent travailler avec sérieux, dans la durée, et autour de quelque chose qu'elles peuvent réellement assumer.",
    columns: [
      {
        title: "Cela vous correspond si...",
        items: [
          "vous croyez à une santé fondée sur le test et davantage sur les faits",
          "vous voulez construire étape par étape plutôt que chercher des raccourcis",
          "vous êtes à l'aise pour créer de la relation et de la confiance",
          "vous voulez travailler avec quelque chose qui restera pertinent",
        ],
      },
      {
        title: "Cela convient moins si...",
        items: [
          "vous cherchez une solution rapide ou un simple statut",
          "vous préférez pousser la vente plutôt que construire la confiance",
          "vous voulez quelque chose de facile mais superficiel",
          "vous manquez de patience pour construire dans le temps",
        ],
      },
      {
        title: "Ce que nous valorisons",
        items: ["sérieux", "autonomie", "vision à long terme", "éthique commerciale", "capacité à créer de la confiance"],
      },
    ],
  },
  it: {
    title: "Per chi è adatto?",
    body: "Non è per tutti. Cerchiamo soprattutto persone che vogliono lavorare con serietà, nel lungo periodo e con qualcosa dietro cui possano davvero stare.",
    columns: [
      {
        title: "Fa per te se...",
        items: [
          "credi in una salute basata sul test e più orientata ai fatti",
          "vuoi costruire passo dopo passo invece di cercare scorciatoie",
          "ti senti a tuo agio nel creare relazioni e fiducia",
          "vuoi lavorare con qualcosa che resterà rilevante nel tempo",
        ],
      },
      {
        title: "Fa meno per te se...",
        items: [
          "cerchi una soluzione rapida o solo un titolo",
          "preferisci spingere la vendita invece di costruire credibilità",
          "vuoi qualcosa che sembri facile ma sia superficiale",
          "non hai pazienza per costruire nel tempo",
        ],
      },
      {
        title: "Ciò che valorizziamo",
        items: ["serietà", "autonomia", "visione di lungo periodo", "etica commerciale", "capacità di creare fiducia"],
      },
    ],
  },
};

const stepsOverridesByLang: Partial<Record<Lang, PartnerPageContent["steps"]>> = {
  sv: {
    title: "Vad händer efter att du anmäler intresse?",
    body: "Processen är enkel och utan press. Vi vill först förstå vem du är, sedan visa modellen tydligt och därefter låta dig avgöra om det känns rätt.",
    items: [
      {
        title: "Vi går igenom din ansökan",
        text: "Vi läser dina svar för att förstå din bakgrund, din ambition och om det finns en rimlig match.",
      },
      {
        title: "Du får en tydlig genomgång",
        text: "Vi visar hur konceptet, kundresan och partnermodellen fungerar i praktiken.",
      },
      {
        title: "Du tar ställning i lugn och ro",
        text: "Målet är inte att pressa fram ett ja, utan att du ska kunna fatta ett genomtänkt beslut.",
      },
    ],
  },
  no: {
    title: "Hva skjer etter at du sender inn interessen din?",
    body: "Prosessen er enkel og uten press. Vi ønsker først å forstå hvem du er, deretter vise modellen tydelig, og så la deg avgjøre om dette føles riktig.",
    items: [
      {
        title: "Vi går gjennom søknaden din",
        text: "Vi leser svarene dine for å forstå bakgrunnen din, ambisjonen din og om det finnes en rimelig match.",
      },
      {
        title: "Du får en tydelig gjennomgang",
        text: "Vi viser hvordan konseptet, kundereisen og partnermodellen fungerer i praksis.",
      },
      {
        title: "Du tar stilling i ro og mak",
        text: "Målet er ikke å presse frem et ja, men å la deg ta en gjennomtenkt beslutning.",
      },
    ],
  },
  da: {
    title: "Hvad sker der, efter du har sendt din interesse?",
    body: "Processen er enkel og uden pres. Vi vil først forstå, hvem du er, derefter vise modellen tydeligt og til sidst lade dig afgøre, om det føles rigtigt.",
    items: [
      {
        title: "Vi gennemgår din ansøgning",
        text: "Vi læser dine svar for at forstå din baggrund, din ambition og om der er et rimeligt match.",
      },
      {
        title: "Du får en tydelig gennemgang",
        text: "Vi viser, hvordan konceptet, kunderejsen og partnermodellen fungerer i praksis.",
      },
      {
        title: "Du tager stilling i ro og mag",
        text: "Målet er ikke at presse et ja frem, men at lade dig træffe en velovervejet beslutning.",
      },
    ],
  },
  fi: {
    title: "Mitä tapahtuu kiinnostuksen jättämisen jälkeen?",
    body: "Prosessi on yksinkertainen eikä siihen liity painetta. Haluamme ensin ymmärtää, kuka olet, sitten näyttää mallin selkeästi ja sen jälkeen antaa sinun päättää, tuntuuko tämä oikealta.",
    items: [
      {
        title: "Käymme hakemuksesi läpi",
        text: "Luemme vastauksesi ymmärtääksemme taustasi, tavoitteesi ja sen, onko yhteensopivuudelle realistinen peruste.",
      },
      {
        title: "Saat selkeän läpikäynnin",
        text: "Näytämme, miten konsepti, asiakaspolku ja partnermalli toimivat käytännössä.",
      },
      {
        title: "Päätät rauhassa",
        text: "Tavoite ei ole painostaa sinua sanomaan kyllä, vaan antaa sinun tehdä harkittu päätös.",
      },
    ],
  },
  de: {
    title: "Was passiert nach deiner Bewerbung?",
    body: "Der Prozess ist einfach und ohne Druck. Wir möchten zunächst verstehen, wer du bist, dann das Modell klar darstellen und dir anschließend die Entscheidung in Ruhe überlassen.",
    items: [
      {
        title: "Wir prüfen deine Bewerbung",
        text: "Wir lesen deine Antworten, um deinen Hintergrund, deine Ambition und die Frage einer realistischen Passung zu verstehen.",
      },
      {
        title: "Du erhältst eine klare Einordnung",
        text: "Wir zeigen, wie Konzept, Kundenweg und Partnermodell in der Praxis funktionieren.",
      },
      {
        title: "Du entscheidest in Ruhe",
        text: "Das Ziel ist nicht, ein Ja zu erzwingen, sondern dir eine fundierte Entscheidung zu ermöglichen.",
      },
    ],
  },
  fr: {
    title: "Que se passe-t-il après votre candidature ?",
    body: "Le processus est simple et sans pression. Nous voulons d'abord comprendre qui vous êtes, puis présenter clairement le modèle, avant de vous laisser décider si cela vous correspond.",
    items: [
      {
        title: "Nous examinons votre candidature",
        text: "Nous lisons vos réponses pour comprendre votre parcours, votre ambition et s'il existe une adéquation raisonnable.",
      },
      {
        title: "Vous obtenez une présentation claire",
        text: "Nous expliquons comment le concept, le parcours client et le modèle partenaire fonctionnent dans la pratique.",
      },
      {
        title: "Vous décidez sereinement",
        text: "L'objectif n'est pas de forcer un oui, mais de vous permettre de prendre une décision réfléchie.",
      },
    ],
  },
  it: {
    title: "Cosa succede dopo la candidatura?",
    body: "Il processo è semplice e senza pressione. Prima vogliamo capire chi sei, poi mostrarti il modello in modo chiaro e infine lasciarti decidere con calma se è la strada giusta.",
    items: [
      {
        title: "Esaminiamo la tua candidatura",
        text: "Leggiamo le tue risposte per capire il tuo background, la tua ambizione e se esista una corrispondenza ragionevole.",
      },
      {
        title: "Ricevi una spiegazione chiara",
        text: "Ti mostriamo come funzionano nella pratica il concetto, il percorso cliente e il modello partner.",
      },
      {
        title: "Decidi con calma",
        text: "L'obiettivo non è spingerti a dire sì, ma permetterti di prendere una decisione ponderata.",
      },
    ],
  },
};

const formOverridesByLang: Partial<Record<Lang, PartnerPageContent["form"]>> = {
  sv: {
    title: "Nyfiken på att bli partner?",
    body: "Lämna dina uppgifter och några korta svar, så hör vi av oss om nästa steg om det finns en rimlig match.",
    name: "Namn",
    email: "E-post",
    phone: "Telefonnummer",
    company: "Företag eller team (valfritt)",
    interest: "Vad är du främst ute efter?",
    readiness: "Hur redo är du?",
    background: "Varför är detta intressant för dig?",
    interestOptions: ["Utforska möjligheten", "Bygga verksamhet", "Förstå modellen bättre"],
    readinessOptions: ["Utforskar", "Vill ta ett första samtal", "Redo att gå vidare"],
    submit: "Skicka partnerförfrågan",
    successTitle: "Tack, ditt intresse är mottaget.",
    successBody: "Vi går igenom dina svar och hör av oss om nästa steg om det finns en rimlig match.",
  },
  no: {
    title: "Nysgjerrig på å bli partner?",
    body: "Legg igjen opplysningene dine og noen korte svar, så tar vi kontakt om neste steg dersom det finnes en rimelig match.",
    submit: "Send partnerforespørsel",
    successTitle: "Takk, interessen din er mottatt.",
    successBody: "Vi går gjennom svarene dine og tar kontakt dersom det finnes en rimelig match.",
  },
  da: {
    title: "Nysgerrig på at blive partner?",
    body: "Efterlad dine oplysninger og nogle korte svar, så vender vi tilbage om næste skridt, hvis der er et rimeligt match.",
    submit: "Send partnerhenvendelse",
    successTitle: "Tak, din interesse er modtaget.",
    successBody: "Vi gennemgår dine svar og vender tilbage, hvis der ser ud til at være et rimeligt match.",
  },
  fi: {
    title: "Kiinnostaako partneriksi lähteminen?",
    body: "Jätä yhteystietosi ja muutama lyhyt vastaus, niin palaamme asiaan seuraavista vaiheista, jos yhteensopivuudelle on realistinen peruste.",
    submit: "Lähetä partnerihakemus",
    successTitle: "Kiitos, kiinnostuksesi on vastaanotettu.",
    successBody: "Käymme vastauksesi läpi ja palaamme asiaan, jos yhteensopivuudelle on realistinen peruste.",
  },
  de: {
    title: "Interesse an einer Partnerschaft?",
    body: "Hinterlasse deine Daten und ein paar kurze Antworten. Wenn es eine realistische Passung gibt, melden wir uns mit dem nächsten Schritt.",
    submit: "Partneranfrage senden",
    successTitle: "Danke, dein Interesse ist eingegangen.",
    successBody: "Wir prüfen deine Antworten und melden uns, wenn eine realistische Passung besteht.",
  },
  fr: {
    title: "Envie de devenir partenaire ?",
    body: "Laissez vos coordonnées et quelques réponses courtes. S'il existe une adéquation raisonnable, nous reviendrons vers vous pour la suite.",
    submit: "Envoyer la demande partenaire",
    successTitle: "Merci, votre intérêt a bien été reçu.",
    successBody: "Nous examinons vos réponses et reviendrons vers vous s'il existe une adéquation raisonnable.",
  },
  it: {
    title: "Ti interessa diventare partner?",
    body: "Lascia i tuoi dati e qualche risposta breve. Se esiste una corrispondenza ragionevole, ti ricontatteremo per il passo successivo.",
    submit: "Invia richiesta partner",
    successTitle: "Grazie, il tuo interesse è stato ricevuto.",
    successBody: "Esamineremo le tue risposte e ti ricontatteremo se emergerà una corrispondenza ragionevole.",
  },
};

const stickyOverridesByLang: Partial<Record<Lang, PartnerPageContent["sticky"]>> = {
  sv: {
    text: "Utforska en seriös partnermodell inom testbaserad hälsa",
    cta: "Ansök om att bli partner",
  },
  no: {
    text: "Utforsk en seriøs partnermodell innen testbasert helse",
    cta: "Søk om å bli partner",
  },
  da: {
    text: "Udforsk en seriøs partnermodel inden for testbaseret sundhed",
    cta: "Ansøg om at blive partner",
  },
  fi: {
    text: "Tutustu vakavaan partnermalliin testipohjaisessa terveydessä",
    cta: "Hae partneriksi",
  },
  en: {
    text: "Explore a serious partner model in test-based health",
    cta: "Apply to become a partner",
  },
  de: {
    text: "Entdecke ein seriöses Partnermodell im Bereich testbasierter Gesundheit",
    cta: "Als Partner bewerben",
  },
  fr: {
    text: "Découvrez un modèle partenaire sérieux dans la santé fondée sur le test",
    cta: "Postuler comme partenaire",
  },
  it: {
    text: "Scopri un modello partner serio nella salute basata sul test",
    cta: "Candidati come partner",
  },
};

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55 },
};

const PartnerPage = ({ lang }: PartnerPageProps) => {
  const page = useMemo(() => {
    const basePage = content[lang] ?? content.en;

    return {
      ...basePage,
      hero: heroOverridesByLang[lang] ? { ...basePage.hero, ...heroOverridesByLang[lang] } : basePage.hero,
      economics: {
        ...basePage.economics,
        steps: economicsStepsByLang[lang] ?? economicsStepsByLang.en,
        modelLabel: economicsModelLabelByLang[lang] ?? economicsModelLabelByLang.en,
        modelBody: economicsModelBodyByLang[lang] ?? economicsModelBodyByLang.en,
        calloutTitle: economicsCalloutTitleByLang[lang] ?? economicsCalloutTitleByLang.en,
        calloutBody: economicsCalloutBodyByLang[lang] ?? economicsCalloutBodyByLang.en,
        note: economicsNoteByLang[lang] ?? economicsNoteByLang.en,
      },
      reasons: reasonsOverridesByLang[lang] ? { ...basePage.reasons, ...reasonsOverridesByLang[lang] } : basePage.reasons,
      fit: fitOverridesByLang[lang] ? { ...basePage.fit, ...fitOverridesByLang[lang] } : basePage.fit,
      steps: stepsOverridesByLang[lang] ? { ...basePage.steps, ...stepsOverridesByLang[lang] } : basePage.steps,
      form: formOverridesByLang[lang] ? { ...basePage.form, ...formOverridesByLang[lang] } : basePage.form,
      sticky: stickyOverridesByLang[lang] ? { ...basePage.sticky, ...stickyOverridesByLang[lang] } : basePage.sticky,
    };
  }, [lang]);
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    interest: "",
    readiness: "",
    background: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const attribution = await getReferralAttribution(location.pathname);
      const response = await upsertLead({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ref: attribution.referralCode,
        session_id: getOrCreateSessionId(),
        lead_type: "partner",
        lead_source: "partner_form",
        source_page: location.pathname,
        details: {
          company: formData.company,
          interest: formData.interest,
          readiness: formData.readiness,
          background: formData.background,
          landingPage: attribution.landingPage,
        },
      });

      if (!response.ok) {
        throw new Error("Could not submit the partner application.");
      }

      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not submit the partner application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-hero section-padding pb-16 md:pb-24">
        <div className="container-wide">
          <div className="mb-12 flex items-center justify-between gap-4">
            <Link to={`/${lang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
              OmegaBalance
            </Link>
            <LanguageSwitcher lang={lang} />
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="badge-accent inline-flex rounded-full px-4 py-1.5 text-sm font-medium">{page.hero.badge}</span>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">{page.hero.title}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-subtle md:text-xl">{page.hero.body}</p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href="#partner-application" className="btn-primary text-center">{page.hero.primaryCta}</a>
                <a href="#partner-economics" className="btn-secondary text-center">{page.hero.secondaryCta}</a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid gap-4">
              {page.hero.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-sm">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/70 text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">{card.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">{card.text}</p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="partner-economics" className="section-padding bg-section-alt">
        <motion.div {...sectionMotion} className="container-wide">
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.economics.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-subtle md:text-lg">{page.economics.body}</p>
          <div className="mt-10 rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <div className="grid gap-4 md:grid-cols-4">
              {page.economics.steps.map((step, index) => (
                <div key={step.label} className="relative rounded-2xl border border-border/70 bg-background px-5 py-6">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{step.label}</p>
                  <p className="mt-3 font-serif text-2xl font-semibold tracking-tight md:text-3xl">{step.value}</p>
                  {index < page.economics.steps.length - 1 ? null : null}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-border/70 bg-secondary/35 px-5 py-5">
              <p className="text-sm font-semibold tracking-tight text-foreground">{page.economics.modelLabel}</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground/85 md:text-base">{page.economics.modelBody}</p>
            </div>
            <div className="mt-5 border-t border-border/70 pt-4">
              <p className="text-xs leading-6 text-muted-foreground md:text-sm">
                <span className="font-medium text-foreground/85">{page.economics.calloutTitle}</span>{" "}
                {page.economics.calloutBody} {page.economics.note}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="section-padding">
        <motion.div {...sectionMotion} className="container-wide">
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.reasons.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{page.reasons.body}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {page.reasons.cards.map((card) => (
              <div key={card.title} className="flex h-full flex-col rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">{card.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="section-padding bg-section-alt">
        <motion.div {...sectionMotion} className="container-wide">
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.fit.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{page.fit.body}</p>
          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {page.fit.columns.map((column) => (
              <div key={column.title} className="rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-subtle md:text-[15px]">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="section-padding">
        <motion.div {...sectionMotion} className="container-wide">
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.steps.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{page.steps.body}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {page.steps.items.map((item, index) => (
              <div key={item.title} className="rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="partner-application" className="section-padding bg-section-alt">
        <motion.div {...sectionMotion} className="container-narrow">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.form.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-subtle md:text-lg">{page.form.body}</p>
          </div>

          {submitted ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-[1.75rem] border border-border/80 bg-card p-10 text-center shadow-sm">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Users2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight md:text-2xl">{page.form.successTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-subtle md:text-base">{page.form.successBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-sm md:p-10">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={page.form.name}><Input required value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="h-12 rounded-xl" /></Field>
                <Field label={page.form.email}><Input required type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="h-12 rounded-xl" /></Field>
                <Field label={page.form.phone}><Input required value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-12 rounded-xl" /></Field>
                <Field label={page.form.company}><Input value={formData.company} onChange={(e) => updateField("company", e.target.value)} className="h-12 rounded-xl" /></Field>
                <Field label={page.form.interest}>
                  <Select value={formData.interest} onValueChange={(value) => updateField("interest", value)}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={page.form.interest} /></SelectTrigger>
                    <SelectContent>{page.form.interestOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label={page.form.readiness}>
                  <Select value={formData.readiness} onValueChange={(value) => updateField("readiness", value)}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={page.form.readiness} /></SelectTrigger>
                    <SelectContent>{page.form.readinessOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label={page.form.background}>
                  <Textarea required value={formData.background} onChange={(e) => updateField("background", e.target.value)} className="min-h-[144px] rounded-xl" />
                </Field>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" disabled={submitting} className="btn-primary min-w-[220px] text-center disabled:opacity-70">
                  {submitting ? "Submitting..." : page.form.submit}
                </button>
              </div>
              {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}
            </form>
          )}
        </motion.div>
      </section>

      <FooterSection lang={lang} />
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export default PartnerPage;
