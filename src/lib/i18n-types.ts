export type Lang = "sv" | "no" | "da" | "fi" | "en" | "de" | "fr" | "it";

export type Copy = {
  hero: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    statLab: string;
    statTiming: string;
    imageAlt: string;
  };
  problem: {
    title: string;
    body: string;
    cards: { title: string; description: string }[];
  };
  howItWorks: {
    title: string;
    body: string;
    steps: { numberLabel: string; title: string; description: string }[];
  };
  analysis: {
    title: string;
    body: string;
    items: { title: string; description: string }[];
  };
  results: {
    title: string;
    titleAccent: string;
    body: string;
    bullets: string[];
    ratioLabel: string;
    ratioTarget: string;
    omega6: string;
    omega3: string;
    recommendationTitle: string;
    recommendationBody: string;
  };
  video: {
    title: string;
    body: string;
    placeholder: string;
  };
  lead: {
    title: string;
    body: string;
    successTitle: string;
    successBody: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    orderCta: string;
    consultationCta: string;
    successIconLabel: string;
  };
  testimonials: {
    title: string;
    items: { quote: string; name: string; role: string }[];
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  abTesting: {
    badge: string;
    title: string;
    body: string;
    headlinesLabel: string;
    ctasLabel: string;
    headlines: string[];
    ctas: string[];
  };
  sticky: {
    text: string;
    cta: string;
  };
  footer: {
    tagline: string;
    rights: string;
    privacy: string;
    terms: string;
    contact: string;
  };
};
