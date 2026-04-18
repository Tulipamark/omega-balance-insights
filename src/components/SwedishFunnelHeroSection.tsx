import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";
import { omegaBalanceV4Content } from "@/content/omega-balance-v4";
import { resolveContent } from "@/content/v4-types";
import { t, type Lang } from "@/lib/i18n";
import { logFunnelEvent } from "@/lib/funnel-events";
import { getZinzinoTestUrl } from "@/lib/zinzino";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import InsideBalanceLogo from "@/components/InsideBalanceLogo";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface SwedishFunnelHeroSectionProps {
  lang: Lang;
}

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
  it: "Il link non può essere aperto i detta moment.",
};

const fallbackPrimaryCtaByLang: Partial<Record<Lang, string>> = {
  sv: "Gå vidare till testet",
};

const fallbackSecondaryCtaByLang: Partial<Record<Lang, string>> = {
  sv: "Se hur det fungerar",
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
  const baseCopy = t(lang);
  const content = resolveContent(omegaBalanceV4Content, lang);
  const renderRatioValue = (value: string, isClaimPending: boolean) => {
    if (!isClaimPending) {
      return value;
    }

    return lang === "sv" ? "Referenspunkt" : "Reference point";
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
                className="h-12 sm:h-14 md:h-16"
                imageClassName="scale-[2] origin-left"
              />
            </Link>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-foreground/72 xl:flex">
            <Link to={platformHomePath(lang)} className="transition hover:text-foreground">{insideBalanceLabelByLang[lang] ?? "InsideBalance"}</Link>
            <Link to={gutPath(lang)} className="transition hover:text-foreground">GutBalance</Link>
            <Link to={partnerPath(lang)} className="transition hover:text-foreground">{baseCopy.partner.navLabel}</Link>
            <a href="#how-it-works" className="transition hover:text-foreground">{content.hero.secondaryCta}</a>
            <Link to={contactPath(lang)} className="transition hover:text-foreground">
              {baseCopy.footer.contact}
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
                <div className="mt-8 flex flex-col gap-6">
                  <div className="border-b border-black/5 pb-5">
                    <InsideBalanceLogo
                      alt={insideBalanceLabelByLang[lang] ?? "InsideBalance"}
                      variant="full"
                      className="h-12"
                      imageClassName="scale-[1.65] origin-left"
                    />
                  </div>
                  <div className="flex flex-col gap-3 text-base text-foreground/78">
                    <SheetClose asChild><Link to={platformHomePath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{insideBalanceLabelByLang[lang] ?? "InsideBalance"}</Link></SheetClose>
                    <SheetClose asChild><Link to={omegaHomePath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">OmegaBalance</Link></SheetClose>
                    <SheetClose asChild><Link to={gutPath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">GutBalance</Link></SheetClose>
                    <SheetClose asChild><Link to={partnerPath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{baseCopy.partner.navLabel}</Link></SheetClose>
                    <SheetClose asChild><a href="#how-it-works" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{content.hero.secondaryCta}</a></SheetClose>
                    <SheetClose asChild><Link to={contactPath(lang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{baseCopy.footer.contact}</Link></SheetClose>
                  </div>
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
          <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <div className="text-center lg:pt-6 lg:text-left">
              <span className="badge-accent inline-block rounded-full border border-black/5 px-3 py-1.5 text-xs font-medium tracking-wide shadow-card sm:px-4 sm:text-sm">
                {content.hero.eyebrow}
              </span>

              <h1 className="mx-auto mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:mx-0 lg:text-6xl">
                {content.hero.title}
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-subtle sm:text-lg sm:leading-8 md:text-xl lg:mx-0">
                {content.hero.body}
              </p>

              <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 lg:mx-0 lg:items-start sm:mt-10">
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
                    {fallbackPrimaryCtaByLang[lang] ?? content.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                </TrackedOutboundButton>
                <p className="text-center text-xs leading-6 text-subtle lg:text-left">
                  {content.hero.trustRow.map((item) => item.text).join(" • ")}
                </p>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-1 py-1 text-sm font-medium text-foreground/72 transition hover:text-foreground"
                  onClick={() => void logFunnelEvent("hero_secondary_cta_clicked", {
                    details: { placement: "hero" },
                  })}
                >
                  <>
                    {fallbackSecondaryCtaByLang[lang] ?? content.hero.secondaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white/82 p-5 shadow-[0_28px_60px_rgba(31,70,55,0.10)] backdrop-blur">
              <div className="rounded-[1.6rem] border border-[rgba(70,99,80,0.08)] bg-[linear-gradient(180deg,rgba(247,243,235,0.88),rgba(238,243,239,0.92))] p-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{content.hero.ratioLabel}</p>
                <div className="mt-6 space-y-4">
                  {content.hero.ratioBars.map((bar) => (
                    <div key={bar.label}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium text-foreground/74">{bar.label}</span>
                        <span className="font-semibold text-foreground">
                          {renderRatioValue(bar.value, Boolean(bar.claim && bar.claim.verification === "required"))}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-[#e7e1d6]">
                        <div className={`h-3 rounded-full ${bar.widthClass} ${bar.colorClass}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <TrackedOutboundButton
                  lang={lang}
                  destinationType="test"
                  fallbackHref={getZinzinoTestUrl(lang)}
                  className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-base font-medium text-white shadow-[0_18px_40px_hsl(var(--primary)/0.18)] transition hover:-translate-y-0.5 hover:opacity-95"
                  pendingLabel={pendingLabelByLang[lang]}
                  trackingEventName="hero_ratio_cta_clicked"
                  trackingDetails={{ placement: "hero-ratio-card" }}
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
                    {content.hero.ratioCta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                </TrackedOutboundButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SwedishFunnelHeroSection;
