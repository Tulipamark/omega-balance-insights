import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { t, type Lang } from "@/lib/i18n";
import { funnelHeroCopy } from "@/lib/funnel-copy";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";
import VideoSection from "@/components/VideoSection";

interface SwedishFunnelHeroSectionProps {
  lang: Lang;
}

const DEFAULT_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000";

const measuredResultTriggerByLang: Record<Lang, string> = {
  sv: "Många blir förvånade över sitt resultat.",
  no: "Mange blir overrasket over resultatet sitt.",
  da: "Mange bliver overraskede over deres resultat.",
  fi: "Monet yllättyvät tuloksestaan.",
  en: "Many people are surprised by the result.",
  de: "Viele sind von ihrem Ergebnis überrascht.",
  fr: "Beaucoup sont surpris par leur résultat.",
  it: "Molti restano sorpresi dal proprio risultato.",
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

const fallbackPrimaryCtaByLang: Partial<Record<Lang, string>> = {
  sv: "Gör testet nu",
};

const fallbackSecondaryCtaByLang: Partial<Record<Lang, string>> = {
  sv: "Se hur testet fungerar",
};

const signInLabelByLang: Partial<Record<Lang, string>> = {
  sv: "Logga in",
  no: "Logg inn",
  da: "Log ind",
  fi: "Kirjaudu sisään",
  de: "Anmelden",
  fr: "Se connecter",
  it: "Accedi",
};

const SwedishFunnelHeroSection = ({ lang }: SwedishFunnelHeroSectionProps) => {
  const copy = t(lang);
  const heroCopy = funnelHeroCopy[lang];

  return (
    <section className="bg-hero px-4 pb-12 pt-8 md:px-6 md:pb-14 md:pt-10">
      <div className="container-wide mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 md:mb-10">
          <a href={`/${lang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
            OmegaBalance
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard/login"
              className="inline-flex whitespace-nowrap text-xs font-medium text-subtle transition-colors hover:text-foreground sm:text-sm"
            >
              {signInLabelByLang[lang] ?? "Sign in"}
            </Link>
            <Link
              to={`/${lang}/partners`}
              className="inline-flex whitespace-nowrap rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-card transition-colors hover:bg-card sm:px-4 sm:text-sm"
            >
              {copy.hero.partnerCta}
            </Link>
            <LanguageSwitcher lang={lang} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-5xl text-center"
        >
          <span className="badge-accent inline-block rounded-full px-4 py-1.5 text-sm font-medium tracking-wide">
            {copy.hero.badge}
          </span>

          <h1 className="mx-auto mt-5 max-w-4xl whitespace-pre-line text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            {heroCopy.headline}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-subtle md:text-xl">
            {heroCopy.supporting}
          </p>

          <div className="mt-7">
            <VideoSection lang={lang} embedded showTranscript={false} showHeader={false} />
          </div>

          <div className="mx-auto mt-10 flex max-w-md flex-col gap-3">
            <TrackedOutboundButton
              destinationType="test"
              fallbackHref={DEFAULT_ZINZINO_TEST_URL}
              className="btn-primary w-full text-center"
              pendingLabel={pendingLabelByLang[lang]}
              errorMessages={{ generic: genericErrorByLang[lang] }}
            >
              {fallbackPrimaryCtaByLang[lang] ?? copy.hero.primaryCta}
            </TrackedOutboundButton>
            <a href="#how-it-works" className="btn-secondary text-center">
              {fallbackSecondaryCtaByLang[lang] ?? copy.hero.secondaryCta}
            </a>
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-subtle">
            {heroCopy.trust}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-subtle">
            {measuredResultTriggerByLang[lang]}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SwedishFunnelHeroSection;
