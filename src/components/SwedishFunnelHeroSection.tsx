import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { t, type Lang } from "@/lib/i18n";
import { logFunnelEvent } from "@/lib/funnel-events";
import { funnelHeroCopy } from "@/lib/funnel-copy";
import { getZinzinoTestUrl } from "@/lib/zinzino";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";
import VideoSection from "@/components/VideoSection";

interface SwedishFunnelHeroSectionProps {
  lang: Lang;
}

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
  sv: "G\u00e5 vidare till testet",
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
    <section className="bg-hero px-4 pb-10 pt-6 sm:pb-12 sm:pt-8 md:px-6 md:pb-14 md:pt-10">
      <div className="container-wide mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-10">
          <a href={`/${lang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
            OmegaBalance
          </a>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
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
          <span className="badge-accent inline-block rounded-full px-3 py-1.5 text-xs font-medium tracking-wide sm:px-4 sm:text-sm">
            {copy.hero.badge}
          </span>

          <h1 className="mx-auto mt-4 max-w-4xl whitespace-pre-line text-[2.1rem] font-semibold leading-[1.05] tracking-tight sm:text-4xl md:mt-5 md:text-6xl">
            {heroCopy.headline}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-subtle sm:text-lg sm:leading-8 md:text-xl">
            {heroCopy.supporting}
          </p>

          <div className="mt-7">
            <VideoSection lang={lang} embedded showTranscript={false} showHeader={false} />
          </div>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:mt-10">
            <TrackedOutboundButton
              lang={lang}
              destinationType="test"
              fallbackHref={getZinzinoTestUrl(lang)}
              className="btn-primary w-full text-center"
              pendingLabel={pendingLabelByLang[lang]}
              trackingEventName="hero_primary_cta_clicked"
              trackingDetails={{ placement: "hero" }}
              errorMessages={{ generic: genericErrorByLang[lang] }}
              {...(lang === "sv"
                ? {
                    confirmTitle: "Du går nu vidare till Zinzino",
                    confirmDescription: "Nästa steg sker hos Zinzino, där beställning och leverans hanteras.",
                    confirmConfirmLabel: "OK, gå vidare",
                    confirmCancelLabel: "Stanna kvar",
                  }
                : {})}
            >
              {fallbackPrimaryCtaByLang[lang] ?? copy.hero.primaryCta}
            </TrackedOutboundButton>
            <a
              href="#how-it-works"
              className="btn-secondary text-center"
              onClick={() => void logFunnelEvent("hero_secondary_cta_clicked", {
                details: { placement: "hero" },
              })}
            >
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
