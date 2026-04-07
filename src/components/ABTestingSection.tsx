import { motion } from "framer-motion";
import { Lang, t } from "@/lib/i18n";
import { getZinzinoTestUrl } from "@/lib/zinzino";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface ABTestingSectionProps {
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
  it: "Il link non può essere aperto in questo momento.",
};

const ABTestingSection = ({ lang }: ABTestingSectionProps) => {
  const copy = t(lang).abTesting;
  const headline = copy.headlines[0] ?? "";
  const cta = copy.ctas[0] ?? "";
  const pendingLabel = pendingLabelByLang[lang];
  const genericError = genericErrorByLang[lang];

  return (
    <section className="section-padding bg-section-alt">
      <div className="container-narrow max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">{copy.title}</h2>
            <p className="text-lg text-subtle">{copy.body}</p>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-border/80 bg-card p-8 text-center shadow-card md:p-10">
            <p className="font-serif text-2xl font-medium leading-tight text-foreground md:text-3xl">{headline}</p>
            <div className="mt-8 flex justify-center">
              <TrackedOutboundButton
                lang={lang}
                destinationType="test"
                fallbackHref={getZinzinoTestUrl(lang)}
                className="btn-primary min-w-[240px] text-center"
                pendingLabel={pendingLabel}
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
                {cta}
              </TrackedOutboundButton>
            </div>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-subtle">{copy.ctasLabel}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ABTestingSection;
