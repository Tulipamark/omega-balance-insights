import { motion } from "framer-motion";
import { FileText, BarChart3, ArrowUpRight } from "lucide-react";

const ResultsSection = () => {
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
              Your results,
              <br />
              clearly explained
            </h2>
            <p className="text-subtle text-lg leading-relaxed mb-8">
              No jargon. No guesswork. You receive a comprehensive digital report that gives you the clarity to make informed decisions about your health.
            </p>

            <div className="space-y-5">
              {[
                { icon: FileText, text: "A detailed digital report delivered to your inbox" },
                { icon: BarChart3, text: "Your exact Omega-6 / Omega-3 ratio visualized" },
                { icon: ArrowUpRight, text: "Evidence-based guidance for improvement" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="badge-accent w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm leading-relaxed pt-2">{item.text}</p>
                </div>
              ))}
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
                <p className="text-sm text-subtle mb-1">Your Omega ratio</p>
                <p className="text-4xl font-serif font-bold text-primary">8.2 : 1</p>
                <p className="text-xs text-subtle mt-1">Optimal target: ~3:1</p>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-subtle mb-1">Omega-6</p>
                  <p className="text-2xl font-sans font-semibold">42.3%</p>
                </div>
                <div>
                  <p className="text-xs text-subtle mb-1">Omega-3</p>
                  <p className="text-2xl font-sans font-semibold text-primary">5.1%</p>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="bg-accent rounded-xl p-4">
                <p className="text-sm font-medium mb-1">Recommendation</p>
                <p className="text-xs text-subtle leading-relaxed">
                  Your ratio suggests room for improvement. Consider increasing marine-based Omega-3 intake and reducing processed seed oils.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
