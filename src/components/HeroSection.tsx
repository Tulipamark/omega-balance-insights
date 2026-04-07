import { motion } from "framer-motion";
import heroVisual from "@/assets/hero-visual.jpg";
import { Link } from "react-router-dom";
import { Lang, t } from "@/lib/i18n";
import { logFunnelEvent } from "@/lib/funnel-events";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface HeroSectionProps {
  lang: Lang;
}

const DEFAULT_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000";

const signInLabelByLang: Partial<Record<Lang, string>> = {
  sv: "Logga in",
  no: "Logg inn",
  da: "Log ind",
  fi: "Kirjaudu sisään",
  de: "Anmelden",
  fr: "Se connecter",
  it: "Accedi",
};

const pendingLabelByLang: Record<Lang, string> = {
  sv: "Öppnar...",
  no: "Åpner...",
  da: "Åbner...",
  fi: "Avataan...",
  en: "Opening...",
  de: "Wird geöffnet...",
  fr: "Ouverture...",
  it: "Apertura...",
};

const genericErrorByLang: Record<Lang, string> = {
  sv: "Länken kunde inte öppnas just nu.",
  no: "Lenken kunne ikke åpnes akkurat nå.",
  da: "Linket kunne ikke åbnes lige nu.",
  fi: "Linkkiä ei voitu avata juuri nyt.",
  en: "The link could not be opened right now.",
  de: "Der Link konnte gerade nicht geöffnet werden.",
  fr: "Le lien n'a pas pu être ouvert pour le moment.",
  it: "Il link non può essere aperto in questo momento.",
};

const HeroSection = ({ lang }: HeroSectionProps) => {
  const copy = t(lang).hero;
  const loginLabel = signInLabelByLang[lang] ?? "Sign in";
  const pendingLabel = pendingLabelByLang[lang];
  const genericError = genericErrorByLang[lang];

  return (
    <section className="bg-hero section-padding min-h-[90vh] flex items-center">
      <div className="container-wide w-full">
        <div className="mb-10 flex items-center justify-between gap-4">
          <a href={`/${lang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
            OmegaBalance
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard/login"
              className="inline-flex whitespace-nowrap text-xs font-medium text-subtle transition-colors hover:text-foreground sm:text-sm"
            >
              {loginLabel}
            </Link>
            <Link
              to={`/${lang}/partners`}
              className="inline-flex whitespace-nowrap rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-card transition-colors hover:bg-card sm:px-4 sm:text-sm"
            >
              {copy.partnerCta}
            </Link>
            <LanguageSwitcher lang={lang} />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="badge-accent inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 tracking-wide">
              {copy.badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight mb-6">
              {copy.titleStart}
              <br />
              <span className="text-primary">{copy.titleAccent}</span>
            </h1>
            <p className="text-lg md:text-xl text-subtle leading-relaxed max-w-lg mb-10">{copy.body}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedOutboundButton
                lang={lang}
                destinationType="test"
                fallbackHref={DEFAULT_ZINZINO_TEST_URL}
                className="btn-primary text-center"
                pendingLabel={pendingLabel}
                trackingEventName="hero_primary_cta_clicked"
                trackingDetails={{ placement: "hero" }}
                errorMessages={{ generic: genericError }}
                {...(lang === "sv"
                  ? {
                      confirmTitle: "Du går nu vidare till Zinzino",
                      confirmDescription: "Nästa steg sker hos Zinzino, där beställning och leverans hanteras.",
                      confirmConfirmLabel: "OK, gå vidare",
                      confirmCancelLabel: "Stanna kvar",
                    }
                  : {})}
              >
                {copy.primaryCta}
              </TrackedOutboundButton>
              <a
                href="#how-it-works"
                className="btn-secondary text-center"
                onClick={() => void logFunnelEvent("hero_secondary_cta_clicked", {
                  details: { placement: "hero" },
                })}
              >
                {copy.secondaryCta}
              </a>
            </div>
            <div className="mt-4">
              <Link to={`/${lang}/partners`} className="text-sm font-medium text-primary transition-colors hover:text-foreground">
                {copy.partnerCta}
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-subtle text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {copy.statLab}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {copy.statTiming}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-elevated">
              <img src={heroVisual} alt={copy.imageAlt} className="w-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
