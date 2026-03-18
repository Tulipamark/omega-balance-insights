import { motion } from "framer-motion";
import { Activity, PieChart, Lightbulb } from "lucide-react";
import { Lang, t } from "@/lib/i18n";

const icons = [Activity, PieChart, Lightbulb];

interface AnalysisSectionProps {
  lang: Lang;
}

const AnalysisSection = ({ lang }: AnalysisSectionProps) => {
  const copy = t(lang).analysis;

  return (
    <section className="section-padding bg-section-alt">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{copy.title}</h2>
          <p className="text-subtle text-lg max-w-2xl mx-auto">{copy.body}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {copy.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card text-center"
              >
                <div className="badge-accent w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-sans text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-subtle leading-relaxed text-sm">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
