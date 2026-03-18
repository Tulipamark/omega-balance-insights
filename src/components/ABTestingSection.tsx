import { motion } from "framer-motion";
import { Lang, t } from "@/lib/i18n";

interface ABTestingSectionProps {
  lang: Lang;
}

const ABTestingSection = ({ lang }: ABTestingSectionProps) => {
  const copy = t(lang).abTesting;

  return (
    <section className="section-padding bg-section-alt">
      <div className="container-narrow max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <span className="badge-accent inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              {copy.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{copy.title}</h2>
            <p className="text-subtle text-lg">{copy.body}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="font-sans text-sm font-semibold text-subtle mb-4 uppercase tracking-widest">
                {copy.headlinesLabel}
              </h3>
              <ol className="space-y-4">
                {copy.headlines.map((headline, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-primary font-sans font-semibold text-sm mt-0.5">{i + 1}.</span>
                    <p className="font-serif text-lg font-medium leading-snug">{headline}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="font-sans text-sm font-semibold text-subtle mb-4 uppercase tracking-widest">
                {copy.ctasLabel}
              </h3>
              <div className="space-y-3">
                {copy.ctas.map((cta, i) => (
                  <div key={i} className="btn-primary text-center text-sm py-3">
                    {cta}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ABTestingSection;
