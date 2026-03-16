import { motion } from "framer-motion";

const alternatives = {
  headlines: [
    "Do you know your Omega balance?",
    "The one number that could change how you eat.",
    "Measure what matters. Start with your Omega ratio.",
  ],
  ctas: [
    "Test your Omega balance",
    "Discover your ratio",
    "Get your personalized analysis",
  ],
};

const ABTestingSection = () => {
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
              Bonus: A/B Testing
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Alternative copy for testing
            </h2>
            <p className="text-subtle text-lg">
              Three headline and CTA variations to optimize conversion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="font-sans text-sm font-semibold text-subtle mb-4 uppercase tracking-widest">
                Headlines
              </h3>
              <ol className="space-y-4">
                {alternatives.headlines.map((h, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-primary font-sans font-semibold text-sm mt-0.5">{i + 1}.</span>
                    <p className="font-serif text-lg font-medium leading-snug">{h}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="font-sans text-sm font-semibold text-subtle mb-4 uppercase tracking-widest">
                Call-to-action buttons
              </h3>
              <div className="space-y-3">
                {alternatives.ctas.map((cta, i) => (
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
