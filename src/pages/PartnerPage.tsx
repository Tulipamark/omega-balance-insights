import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BarChart3, CheckCircle2, CircleDollarSign, FlaskConical, Users2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import FooterSection from "@/components/FooterSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Lang } from "@/lib/i18n";
import { submitLead } from "@/lib/omega-data";
import { getReferralAttribution } from "@/lib/referral";

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

const content: Record<"sv" | "en", PartnerPageContent> = {
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

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55 },
};

const PartnerPage = ({ lang }: PartnerPageProps) => {
  const page = useMemo(() => (lang === "sv" ? content.sv : content.en), [lang]);
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
      await submitLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: "partner_lead",
        sourcePage: location.pathname,
        referralCode: attribution.referralCode,
        referredByUserId: attribution.referredByUserId,
        details: {
          company: formData.company,
          interest: formData.interest,
          readiness: formData.readiness,
          background: formData.background,
          landingPage: attribution.landingPage,
        },
      });
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
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">{page.hero.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-subtle md:text-xl">{page.hero.body}</p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href="#partner-application" className="btn-primary text-center">{page.hero.primaryCta}</a>
                <a href="#partner-economics" className="btn-secondary text-center">{page.hero.secondaryCta}</a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid gap-4">
              {page.hero.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[1.5rem] border border-border/80 bg-card/95 p-6 shadow-card">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight">{card.title}</h2>
                    <p className="mt-3 text-[15px] leading-7 text-subtle">{card.text}</p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="partner-economics" className="section-padding bg-section-alt">
        <motion.div {...sectionMotion} className="container-wide grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">{page.economics.title}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-subtle">{page.economics.body}</p>
            <div className="mt-10 rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-card md:p-8">
              <div className="grid gap-4 md:grid-cols-4">
                {page.economics.steps.map((step, index) => (
                  <div key={step.label} className="relative rounded-2xl border border-border/70 bg-background px-5 py-6">
                    <p className="text-sm font-medium text-subtle">{step.label}</p>
                    <p className="mt-3 font-serif text-3xl font-semibold tracking-tight">{step.value}</p>
                    {index < page.economics.steps.length - 1 && (
                      <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground md:block" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-primary/35 bg-accent/50 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{page.economics.modelLabel}</p>
                <p className="mt-2 max-w-2xl text-base leading-7 text-foreground/85">{page.economics.modelBody}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">{page.economics.calloutTitle}</h3>
            <p className="mt-4 text-[15px] leading-7 text-subtle">{page.economics.calloutBody}</p>
            <div className="mt-8 rounded-2xl bg-secondary px-5 py-4">
              <p className="text-sm font-medium text-foreground">{page.economics.note}</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="section-padding">
        <motion.div {...sectionMotion} className="container-wide">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">{page.reasons.title}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-subtle">{page.reasons.body}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {page.reasons.cards.map((card) => (
              <div key={card.title} className="flex h-full flex-col rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-card">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-subtle">{card.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="section-padding bg-section-alt">
        <motion.div {...sectionMotion} className="container-wide">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">{page.fit.title}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-subtle">{page.fit.body}</p>
          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {page.fit.columns.map((column) => (
              <div key={column.title} className="rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-card">
                <h3 className="text-xl font-semibold tracking-tight">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] leading-7 text-subtle">
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
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">{page.steps.title}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-subtle">{page.steps.body}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {page.steps.items.map((item, index) => (
              <div key={item.title} className="rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-card">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-subtle">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="partner-application" className="section-padding bg-section-alt">
        <motion.div {...sectionMotion} className="container-narrow">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{page.form.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-subtle">{page.form.body}</p>
          </div>

          {submitted ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-[1.75rem] border border-border/80 bg-card p-10 text-center shadow-elevated">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Users2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">{page.form.successTitle}</h3>
              <p className="mt-3 text-base leading-7 text-subtle">{page.form.successBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-elevated md:p-10">
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
