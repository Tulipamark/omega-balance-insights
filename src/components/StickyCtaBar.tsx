import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lang, t } from "@/lib/i18n";
import { getZinzinoTestUrl } from "@/lib/zinzino";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface StickyCtaBarProps {
  lang: Lang;
}

const pendingLabelByLang: Record<Lang, string> = {
  sv: "\u00d6ppnar...",
  no: "Åpner...",
  da: "Åbner...",
  fi: "Avataan...",
  en: "Opening...",
  de: "Wird geöffnet...",
  fr: "Ouverture...",
  it: "Apertura...",
};

const genericErrorByLang: Record<Lang, string> = {
  sv: "L\u00e4nken kunde inte \u00f6ppnas just nu.",
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

const StickyCtaBar = ({ lang }: StickyCtaBarProps) => {
  const copy = t(lang);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-lg md:hidden"
        >
          <div className="container-wide flex items-center justify-between gap-2">
            <p className="hidden text-sm font-medium text-foreground/85 sm:block">{copy.sticky.text}</p>
            <TrackedOutboundButton
              lang={lang}
              destinationType="test"
              fallbackHref={getZinzinoTestUrl(lang)}
              className="btn-primary w-full whitespace-nowrap px-5 py-3 text-base sm:w-auto"
              pendingLabel={pendingLabelByLang[lang]}
              trackingEventName="sticky_cta_clicked"
              trackingDetails={{ placement: "sticky-bar" }}
              errorMessages={{ generic: genericErrorByLang[lang] }}
              {...(lang === "sv"
                ? {
                    confirmTitle: "Du g\u00e5r nu vidare till Zinzino",
                    confirmDescription: "N\u00e4sta steg sker hos Zinzino, d\u00e4r best\u00e4llning och leverans hanteras.",
                    confirmConfirmLabel: "OK, g\u00e5 vidare",
                    confirmCancelLabel: "Stanna kvar",
                  }
                : {})}
            >
              {fallbackPrimaryCtaByLang[lang] ?? copy.hero.primaryCta}
            </TrackedOutboundButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default StickyCtaBar;
