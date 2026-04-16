import { motion } from "framer-motion";
import stepTest from "@/assets/step-test.png";
import stepSend from "@/assets/step-send.png";
import stepResults from "@/assets/step-results.png";
import { Lang, t } from "@/lib/i18n";

const stepImages = [stepTest, stepSend, stepResults];

interface HowItWorksSectionProps {
  lang: Lang;
}

const HowItWorksSection = ({ lang }: HowItWorksSectionProps) => {
  const baseCopy = t(lang).howItWorks;
  const copy =
    lang === "sv"
      ? {
          ...baseCopy,
          body: "Tre tydliga steg för att se din nivå, få svar och börja följa din utveckling.",
          steps: [
            { numberLabel: "STEG 01", title: "Ta provet", description: "Ta ett enkelt blodprov hemma." },
            { numberLabel: "STEG 02", title: "Få svar", description: "Se din uppmätta omega-balans svart på vitt." },
            { numberLabel: "STEG 03", title: "Följ din utveckling", description: "Justera det du gör och testa igen för att se skillnaden." },
          ],
        }
      : lang === "en"
        ? {
            ...baseCopy,
            body: "Three simple steps to get your personal measurement result.",
            steps: [
              { numberLabel: "STEP 01", title: "Collect your sample", description: "Take a blood sample at home." },
              { numberLabel: "STEP 02", title: "Send it in", description: "Send the sample to the laboratory." },
              { numberLabel: "STEP 03", title: "Get your result", description: "Receive your personal measurement result." },
            ],
          }
        : lang === "no"
          ? {
              ...baseCopy,
              body: "Tre enkle steg for å få ditt personlige måleresultat.",
              steps: [
                { numberLabel: "STEG 01", title: "Ta prøven", description: "Ta en blodprøve hjemme." },
                { numberLabel: "STEG 02", title: "Send inn", description: "Send prøven til laboratoriet." },
                { numberLabel: "STEG 03", title: "Få resultat", description: "Få ditt personlige måleresultat." },
              ],
            }
          : lang === "da"
            ? {
                ...baseCopy,
                body: "Tre enkle trin til at få dit personlige måleresultat.",
                steps: [
                  { numberLabel: "TRIN 01", title: "Tag prøven", description: "Tag en blodprøve derhjemme." },
                  { numberLabel: "TRIN 02", title: "Send ind", description: "Send prøven til laboratoriet." },
                  { numberLabel: "TRIN 03", title: "Få resultat", description: "Få dit personlige måleresultat." },
                ],
              }
            : lang === "fi"
              ? {
                  ...baseCopy,
                  body: "Kolme helppoa vaihetta henkilökohtaiseen mittaustulokseesi.",
                  steps: [
                    { numberLabel: "VAIHE 01", title: "Ota näyte", description: "Ota verinäyte kotona." },
                    { numberLabel: "VAIHE 02", title: "Lähetä se", description: "Lähetä näyte laboratorioon." },
                    { numberLabel: "VAIHE 03", title: "Saat tuloksen", description: "Saat henkilökohtaisen mittaustuloksesi." },
                  ],
                }
              : lang === "de"
                ? {
                    ...baseCopy,
                    body: "Drei einfache Schritte zu deinem persönlichen Messergebnis.",
                    steps: [
                      { numberLabel: "SCHRITT 01", title: "Probe entnehmen", description: "Nimm zu Hause eine Blutprobe." },
                      { numberLabel: "SCHRITT 02", title: "Einsenden", description: "Sende die Probe an das Labor." },
                      { numberLabel: "SCHRITT 03", title: "Ergebnis erhalten", description: "Erhalte dein persönliches Messergebnis." },
                    ],
                  }
                : lang === "fr"
                  ? {
                      ...baseCopy,
                      body: "Trois étapes simples pour obtenir votre résultat de mesure personnel.",
                      steps: [
                        { numberLabel: "ÉTAPE 01", title: "Faites le prélèvement", description: "Faites un prélèvement sanguin chez vous." },
                        { numberLabel: "ÉTAPE 02", title: "Envoyez-le", description: "Envoyez l'échantillon au laboratoire." },
                        { numberLabel: "ÉTAPE 03", title: "Recevez votre résultat", description: "Recevez votre résultat de mesure personnel." },
                      ],
                    }
                  : lang === "it"
                    ? {
                        ...baseCopy,
                        body: "Tre semplici passaggi per ottenere il tuo risultato di misurazione personale.",
                        steps: [
                          { numberLabel: "FASE 01", title: "Preleva il campione", description: "Preleva un campione di sangue a casa." },
                          { numberLabel: "FASE 02", title: "Invialo", description: "Invia il campione al laboratorio." },
                          { numberLabel: "FASE 03", title: "Ricevi il risultato", description: "Ricevi il tuo risultato di misurazione personale." },
                        ],
                      }
                    : baseCopy;

  return (
    <section id="how-it-works" className="section-padding bg-[linear-gradient(180deg,rgba(247,243,235,0.96),rgba(238,243,239,0.9))]">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-12 md:mb-16"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl md:mb-4 md:text-4xl">{copy.title}</h2>
          <p className="mx-auto max-w-xl text-base leading-7 text-subtle sm:text-lg">{copy.body}</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {copy.steps.map((step, i) => (
            <motion.div
              key={step.numberLabel}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-[1.75rem] border border-black/5 bg-white/76 p-5 text-center shadow-[0_20px_45px_rgba(31,41,55,0.05)]"
            >
              <div className="mb-5 flex h-40 items-center justify-center rounded-2xl bg-accent p-5 sm:mb-6 sm:h-48 sm:p-6">
                <img src={stepImages[i]} alt={step.title} className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
              </div>
              <span className="font-sans text-sm font-semibold tracking-widest text-primary">{step.numberLabel}</span>
              <h3 className="mb-3 mt-2 font-sans text-xl font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-subtle">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
