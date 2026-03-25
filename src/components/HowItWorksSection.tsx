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
          body: "Tre enkla steg för att få ditt personliga mätresultat.",
          steps: [
            { numberLabel: "STEG 01", title: "Ta provet", description: "Ta ett blodprov hemma." },
            { numberLabel: "STEG 02", title: "Skicka in", description: "Skicka provet till laboratoriet." },
            { numberLabel: "STEG 03", title: "Få resultat", description: "Få ditt personliga mätresultat." },
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
    <section id="how-it-works" className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">{copy.title}</h2>
          <p className="mx-auto max-w-xl text-lg text-subtle">{copy.body}</p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-3">
          {copy.steps.map((step, i) => (
            <motion.div
              key={step.numberLabel}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="mb-6 flex h-48 items-center justify-center rounded-2xl bg-accent p-6">
                <img src={stepImages[i]} alt={step.title} className="h-28 w-28 object-contain" />
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
