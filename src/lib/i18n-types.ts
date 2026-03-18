export type Lang = "sv" | "no" | "da" | "fi" | "en" | "de" | "fr" | "it";

export type TranslationKeys = {
  nav: { home: string; howItWorks: string; partners: string; dashboard: string };
  hero: {
    headline: string;
    headlineAlt1: string;
    headlineAlt2: string;
    sub: string;
    cta: string;
    ctaAlt1: string;
    ctaAlt2: string;
    ctaSecondary: string;
  };
  problem: {
    title: string;
    text: string;
    stat1: string;
    stat1label: string;
    stat2: string;
    stat2label: string;
    stat3: string;
    stat3label: string;
  };
  howItWorks: {
    title: string;
    step1: string;
    step1desc: string;
    step2: string;
    step2desc: string;
    step3: string;
    step3desc: string;
    step4: string;
    step4desc: string;
  };
  results: { title: string; text: string };
  cta: { title: string; text: string; button: string };
  faq: { title: string; q1: string; a1: string; q2: string; a2: string; q3: string; a3: string; q4: string; a4: string };
  lead: { title: string; name: string; email: string; phone: string; submit: string; success: string };
  partner: {
    pageTitle: string;
    headline: string;
    sub: string;
    benefit1: string;
    benefit1desc: string;
    benefit2: string;
    benefit2desc: string;
    benefit3: string;
    benefit3desc: string;
    signupTitle: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    submit: string;
    success: string;
  };
  dashboard: {
    title: string;
    visitors: string;
    leads: string;
    bookings: string;
    customers: string;
    recent: string;
    performance: string;
    noLeads: string;
    status: string;
  };
  footer: { rights: string; privacy: string; terms: string };
};
