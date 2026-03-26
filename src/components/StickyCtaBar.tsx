import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lang, t } from "@/lib/i18n";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface StickyCtaBarProps {
  lang: Lang;
}

const DEFAULT_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000";

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
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-lg md:hidden"
        >
          <div className="container-wide flex items-center justify-between gap-3">
            <p className="hidden text-sm font-medium text-foreground/85 sm:block">{copy.sticky.text}</p>
            <TrackedOutboundButton
              destinationType="test"
              fallbackHref={DEFAULT_ZINZINO_TEST_URL}
              className="btn-primary w-full whitespace-nowrap px-6 py-3 text-sm sm:w-auto"
              pendingLabel={pendingLabelByLang[lang]}
              trackingEventName="sticky_cta_clicked"
              trackingDetails={{ placement: "sticky-bar" }}
              errorMessages={{ generic: genericErrorByLang[lang] }}
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
