import { motion } from "framer-motion";
import { FileText, BarChart3, ArrowUpRight } from "lucide-react";
import { Lang, t } from "@/lib/i18n";

const icons = [FileText, BarChart3, ArrowUpRight];

interface ResultsSectionProps {
  lang: Lang;
}

const ResultsSection = ({ lang }: ResultsSectionProps) => {
  const copy = t(lang).results;

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
              {copy.title}
              <br />
              {copy.titleAccent}
            </h2>
            <p className="text-subtle text-lg leading-relaxed mb-8">{copy.body}</p>

            <div className="space-y-5">
              {copy.bullets.map((text, i) => {
                const Icon = icons[i];
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="badge-accent w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-sm leading-relaxed pt-2">{text}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card rounded-2xl shadow-elevated p-8 md:p-10"
          >
            <div className="space-y-6">
              <div>
                <p className="text-sm text-subtle mb-1">{copy.ratioLabel}</p>
                <p className="text-4xl font-serif font-bold text-primary">8.2 : 1</p>
                <p className="text-xs text-subtle mt-1">{copy.ratioTarget}</p>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-subtle mb-1">{copy.omega6}</p>
                  <p className="text-2xl font-sans font-semibold">42.3%</p>
                </div>
                <div>
                  <p className="text-xs text-subtle mb-1">{copy.omega3}</p>
                  <p className="text-2xl font-sans font-semibold text-primary">5.1%</p>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="bg-accent rounded-xl p-4">
                <p className="text-sm font-medium mb-1">{copy.recommendationTitle}</p>
                <p className="text-xs text-subtle leading-relaxed">{copy.recommendationBody}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
