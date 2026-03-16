import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, HelpCircle } from "lucide-react";

const problems = [
  {
    icon: TrendingUp,
    title: "Excessive Omega-6",
    description: "Modern diets are rich in processed foods and vegetable oils, often resulting in Omega-6 levels far above what the body needs.",
  },
  {
    icon: AlertTriangle,
    title: "Hidden imbalance",
    description: "This imbalance between Omega-6 and Omega-3 can influence inflammation pathways and long-term health outcomes.",
  },
  {
    icon: HelpCircle,
    title: "Assumptions vs. data",
    description: "Many people assume their fatty acid levels are fine — until they measure them with a validated blood test.",
  },
];

const ProblemSection = () => {
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
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            The problem most people don't see
          </h2>
          <p className="text-subtle text-lg max-w-2xl mx-auto">
            Your body's fatty acid balance plays a critical role in how you feel, recover, and age. But without data, it's invisible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card"
            >
              <div className="badge-accent w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-sans text-lg font-semibold mb-3">{item.title}</h3>
              <p className="text-subtle leading-relaxed text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
