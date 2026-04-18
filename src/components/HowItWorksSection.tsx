import { motion } from "framer-motion";
import stepTest from "@/assets/step-test.png";
import stepSend from "@/assets/step-send.png";
import stepResults from "@/assets/step-results.png";
import omegaBalanceBloodSpotImage from "@/assets/omega-balance-blood-spot.jpg";
import { omegaBalanceV4Content } from "@/content/omega-balance-v4";
import { resolveContent } from "@/content/v4-types";
import { Lang } from "@/lib/i18n";

const stepImages = [stepTest, stepSend, stepResults];

interface HowItWorksSectionProps {
  lang: Lang;
}

const HowItWorksSection = ({ lang }: HowItWorksSectionProps) => {
  const copy = resolveContent(omegaBalanceV4Content, lang);
  const eyebrow = lang === "sv" ? "Så fungerar det" : "How it works";
  const body =
    lang === "sv"
      ? "Fyra tydliga steg från provtagning till rapport och uppföljning."
      : "Four clear steps from sampling at home to report and follow-up.";

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
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl md:mb-4 md:text-4xl">{copy.process.title}</h2>
          <p className="mx-auto max-w-xl text-base leading-7 text-subtle sm:text-lg">{body}</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 md:gap-8">
          {copy.process.steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-[1.75rem] border border-black/5 bg-white/76 p-5 text-center shadow-[0_20px_45px_rgba(31,41,55,0.05)]"
            >
              {i < stepImages.length ? (
                <div className="mb-5 flex h-40 items-center justify-center rounded-2xl bg-accent p-5 sm:mb-6 sm:h-48 sm:p-6">
                  <img src={stepImages[i]} alt={step.title} className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
                </div>
              ) : (
                <div className="mb-5 flex h-40 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(239,247,242,0.92),rgba(247,243,235,0.94))] p-5 sm:mb-6 sm:h-48 sm:p-6">
                  <div className="rounded-full border border-primary/15 bg-white px-5 py-4 text-sm font-semibold tracking-[0.16em] text-primary">
                    {step.label}
                  </div>
                </div>
              )}
              <span className="font-sans text-sm font-semibold tracking-widest text-primary">{step.label}</span>
              <h3 className="mb-3 mt-2 font-sans text-xl font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-subtle">{step.body.text}</p>
            </motion.div>
          ))}
        </div>

        {lang === "sv" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[1.9rem] border border-black/5 bg-white/80 shadow-[0_22px_50px_rgba(31,41,55,0.06)]"
          >
            <div className="grid items-center md:grid-cols-[0.95fr_1.05fr]">
              <div className="h-full min-h-[220px] overflow-hidden">
                <img src={omegaBalanceBloodSpotImage} alt="Blodbaserat test hemma" className="h-full w-full object-cover" />
              </div>
              <div className="p-6 text-center md:p-8 md:text-left">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Hemma test</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">Ett enkelt blodprov som du tar hemma</h3>
                <p className="mt-4 text-base leading-7 text-subtle">
                  Några droppar blod på provkortet räcker för att analysera din omega-balans och ge dig ett tydligare utgångsläge.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
};

export default HowItWorksSection;
