import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { logFunnelEvent } from "@/lib/funnel-events";
import { funnelHeroCopy } from "@/lib/funnel-copy";
import { getZinzinoTestUrl } from "@/lib/zinzino";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import InsideBalanceLogo from "@/components/InsideBalanceLogo";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

const insideBalanceLabelByLang: Partial<Record<Lang, string>> = {
  sv: "InsideBalance",
  no: "InsideBalance",
  da: "InsideBalance",
  fi: "InsideBalance",
  en: "InsideBalance",
  de: "InsideBalance",
  fr: "InsideBalance",
  it: "InsideBalance",
};

const platformHomePath = (lang: Lang) => (lang === "sv" ? "/" : `/${lang}`);
const omegaHomePath = (lang: Lang) => (lang === "sv" ? "/omega-balance" : `/${lang}/omega-balance`);
const gutPath = (lang: Lang) => (lang === "sv" ? "/gut-balance" : `/${lang}/gut-balance`);
const partnerPath = (lang: Lang) => (lang === "sv" ? "/partners" : `/${lang}/partners`);
const contactPath = (lang: Lang) => (lang === "sv" ? "/kontakt" : `/${lang}/kontakt`);

const SwedishFunnelHeroSection = ({ lang }: SwedishFunnelHeroSectionProps) => {
  const copy = t(lang);
  const heroCopy = funnelHeroCopy[lang];
  const heroProofByLang: Record<Lang, string[]> = {
    sv: ["Tydlig omega-6:3-analys", "Blodbaserat test hemma", "Personligt mätresultat"],
    no: ["Blodbasert hjemmetest", "Personlig måling", "Tydelig neste retning"],
    da: ["Blodbaseret hjemmetest", "Personlig måling", "Tydelig næste retning"],
    fi: ["Kotona tehtävä veritesti", "Henkilökohtainen tulos", "Selkeä seuraava suunta"],
    en: ["Blood-based home test", "Personal measurement result", "A clearer next step"],
    de: ["Blutbasierter Heimtest", "Persönliches Messergebnis", "Klarere nächste Schritte"],
    fr: ["Test sanguin à domicile", "Résultat personnel", "Étape suivante plus claire"],
    it: ["Test del sangue a casa", "Risultato personale", "Passo successivo più chiaro"],
  };

  return (
    <section className="bg-[radial-gradient(circle_at_top,rgba(244,248,241,0.95),rgba(247,243,235,0.96)_46%,rgba(238,233,222,0.96)_100%)] px-4 pb-12 pt-6 sm:pb-14 sm:pt-8 md:px-6 md:pb-16 md:pt-10">
      <div className="container-wide mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 md:mb-10">
          <div className="min-w-0 flex-1">
            <Link
              to={platformHomePath(lang)}
              className="transition-opacity hover:opacity-85"
              aria-label={insideBalanceLabelByLang[lang] ?? "InsideBalance"}
            >
              <InsideBalanceLogo
                alt={insideBalanceLabelByLang[lang] ?? "InsideBalance"}
                variant="full"
                className="h-14 sm:h-16 md:h-20"
                imageClassName="scale-[2] origin-left"
              />
            </Link>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-foreground/72 xl:flex">
            <Link to={platformHomePath(lang)} className="transition hover:text-foreground">{insideBalanceLabelByLang[lang] ?? "InsideBalance"}</Link>
            <Link to={gutPath(lang)} className="transition hover:text-foreground">GutBalance</Link>
            <a href="#how-it-works" className="transition hover:text-foreground">{copy.hero.secondaryCta}</a>
            <Link
              to={contactPath(lang)}
              className="transition hover:text-foreground"
            >
              {copy.footer.contact}
            </Link>
          </nav>
          <div className="flex items-center justify-end gap-2 sm:gap-3">
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
                <SheetTitle className="sr-only">{insideBalanceLabelByLang[lang] ?? "InsideBalance"}</SheetTitle>
                <div className="mt-8 flex flex-col gap-3 text-base text-foreground/78">
                  <SheetClose asChild><Link to={platformHomePath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{insideBalanceLabelByLang[lang] ?? "InsideBalance"}</Link></SheetClose>
                  <SheetClose asChild><Link to={omegaHomePath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">OmegaBalance</Link></SheetClose>
                  <SheetClose asChild><Link to={gutPath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">GutBalance</Link></SheetClose>
                  <SheetClose asChild><a href="#how-it-works" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.hero.secondaryCta}</a></SheetClose>
                  <SheetClose asChild><Link to={contactPath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.footer.contact}</Link></SheetClose>
                </div>
              </SheetContent>
            </Sheet>
            <LanguageSwitcher lang={lang} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
            <div className="text-center lg:text-left">
              <span className="badge-accent inline-block rounded-full border border-black/5 px-3 py-1.5 text-xs font-medium tracking-wide shadow-card sm:px-4 sm:text-sm">
                {copy.hero.badge}
              </span>

              <h1 className="mx-auto mt-4 max-w-4xl whitespace-pre-line text-[2.4rem] font-semibold leading-[1.02] tracking-tight sm:text-5xl md:mt-5 md:text-6xl lg:mx-0">
                {heroCopy.headline}
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-subtle sm:text-lg sm:leading-8 md:text-xl lg:mx-0">
                {heroCopy.supporting}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {heroProofByLang[lang].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.35rem] border border-black/5 bg-white/80 px-4 py-4 text-sm font-medium leading-6 text-foreground/78 shadow-card"
                  >
                    {item}
                  </div>
                ))}
              </div>

              {lang === "sv" ? (
                <div className="mt-6 rounded-[1.6rem] border border-black/5 bg-white/84 px-6 py-5 text-center shadow-[0_16px_35px_rgba(31,41,55,0.05)] lg:text-left">
                  <p className="text-lg font-semibold tracking-tight text-foreground md:text-xl">Över 1,7 miljoner utförda BalanceTests hittills</p>
                  <p className="mt-2 text-sm leading-7 text-subtle">Baserat på världens största databas av fettsyror från torrblodstester.</p>
                </div>
              ) : null}

              <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 lg:mx-0 sm:mt-10">
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
                  <>
                    {fallbackPrimaryCtaByLang[lang] ?? copy.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                </TrackedOutboundButton>
                <a
                  href="#how-it-works"
                  className="btn-secondary px-6 py-3 text-sm sm:px-6 sm:py-3"
                  onClick={() => void logFunnelEvent("hero_secondary_cta_clicked", {
                    details: { placement: "hero" },
                  })}
                >
                  <>
                    {fallbackSecondaryCtaByLang[lang] ?? copy.hero.secondaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                </a>
              </div>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-subtle lg:mx-0">
                {heroCopy.trust} <span className="mx-1 hidden sm:inline">•</span> {measuredResultTriggerByLang[lang]}
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white/76 p-4 shadow-[0_28px_60px_rgba(31,70,55,0.10)] backdrop-blur">
              <VideoSection lang={lang} embedded showTranscript={false} showHeader={false} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SwedishFunnelHeroSection;
