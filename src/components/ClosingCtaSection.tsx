import { motion } from "framer-motion";
import { t, type Lang } from "@/lib/i18n";
import { insightCopyByLang } from "@/lib/funnel-copy";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface ClosingCtaSectionProps {
  lang: Lang;
}

const DEFAULT_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000";

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

const primaryCtaByLang: Partial<Record<Lang, string>> = {
  sv: "G\u00e5 vidare till testet",
};

const ClosingCtaSection = ({ lang }: ClosingCtaSectionProps) => {
  const copy = t(lang);
  const insightCopy = insightCopyByLang[lang];

  return (
    <section className="px-4 py-12 md:px-6 md:py-14">
      <div className="container-narrow mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl rounded-[1.75rem] border border-border/70 bg-card px-5 py-7 shadow-elevated sm:px-6 md:px-10 md:py-10"
        >
          <h2 className="text-[2rem] font-semibold tracking-tight md:text-4xl">
            {insightCopy.closingTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-subtle sm:text-lg sm:leading-8">
            {insightCopy.closingBody}
          </p>
          <div className="mx-auto mt-6 max-w-sm">
            <TrackedOutboundButton
              destinationType="test"
              fallbackHref={DEFAULT_ZINZINO_TEST_URL}
              className="btn-primary w-full px-6 py-3.5 text-base text-center"
              pendingLabel={pendingLabelByLang[lang]}
              trackingEventName="closing_cta_clicked"
              trackingDetails={{ placement: "closing-section" }}
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
              {primaryCtaByLang[lang] ?? copy.hero.primaryCta}
            </TrackedOutboundButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosingCtaSection;
