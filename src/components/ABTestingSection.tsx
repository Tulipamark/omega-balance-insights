import { motion } from "framer-motion";
import { Lang, t } from "@/lib/i18n";

interface ABTestingSectionProps {
  lang: Lang;
}

const ABTestingSection = ({ lang }: ABTestingSectionProps) => {
  const copy = t(lang).abTesting;
  const headline = copy.headlines[0] ?? "";
  const cta = copy.ctas[0] ?? "";

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
            <p className="font-serif text-2xl font-medium leading-tight text-foreground md:text-3xl">
              {headline}
            </p>
            <div className="mt-8 flex justify-center">
              <a href="#lead-capture" className="btn-primary min-w-[240px] text-center">
                {cta}
              </a>
            </div>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-subtle">
              {copy.ctasLabel}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ABTestingSection;
