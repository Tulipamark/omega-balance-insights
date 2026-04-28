import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { t, type Lang } from "@/lib/i18n";
import { logFunnelEvent } from "@/lib/funnel-events";
import { getZinzinoTestUrl } from "@/lib/zinzino";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface ClosingCtaSectionProps {
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
  ar: "جار الفتح...",
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
  ar: "تعذر فتح الرابط حاليا.",
};

const primaryCtaByLang: Partial<Record<Lang, string>> = {
  sv: "Gå vidare till testet",
};

const contactPath = (lang: Lang) => (lang === "sv" ? "/kontakt" : `/${lang}/kontakt`);
const withCurrentSearch = (path: string, search: string) => `${path}${search}`;

const ClosingCtaSection = ({ lang }: ClosingCtaSectionProps) => {
  const copy = t(lang);
  const location = useLocation();
  const contactPathWithAttribution = withCurrentSearch(contactPath(lang), location.search);

  return (
    <section className="px-4 py-12 md:px-6 md:py-14">
      <div className="container-narrow mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-elevated sm:px-8 md:px-12 md:py-14"
        >
          <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-white/5" />
          <div className="relative">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight text-white md:text-4xl">{copy.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-primary-foreground/86 sm:text-lg sm:leading-8">{copy.cta.subtitle}</p>
          </div>
          <div className="relative mx-auto mt-8 max-w-sm">
            {lang === "ar" ? (
              <Link
                to={contactPathWithAttribution}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-medium text-primary shadow-[0_16px_35px_rgba(0,0,0,0.10)] transition hover:opacity-95"
                onClick={() => {
                  void logFunnelEvent("closing_cta_clicked", {
                    details: { placement: "closing-section", destination: "contact" },
                  });
                }}
              >
                {copy.cta.button}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <TrackedOutboundButton
                lang={lang}
                destinationType="test"
                fallbackHref={getZinzinoTestUrl(lang)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-medium text-primary shadow-[0_16px_35px_rgba(0,0,0,0.10)] transition hover:opacity-95"
                pendingLabel={pendingLabelByLang[lang]}
                trackingEventName="closing_cta_clicked"
                trackingDetails={{ placement: "closing-section" }}
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
                  {copy.cta.button}
                  <ArrowRight className="h-4 w-4" />
                </>
              </TrackedOutboundButton>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosingCtaSection;
