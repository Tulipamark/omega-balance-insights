import { motion } from "framer-motion";
import stepTest from "@/assets/step-test.png";
import stepSend from "@/assets/step-send.png";
import stepResults from "@/assets/step-results.png";

const steps = [
  {
    number: "01",
    title: "Collect your sample",
    description: "Take a small blood sample at home using the included finger-prick kit. Quick, safe, and painless.",
    image: stepTest,
  },
  {
    number: "02",
    title: "Send to the lab",
    description: "Mail your sample to a certified laboratory using the prepaid return envelope.",
    image: stepSend,
  },
  {
    number: "03",
    title: "Get your results",
    description: "Receive a detailed digital analysis of your fatty acid balance within 10–14 days.",
    image: stepResults,
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            How the test works
          </h2>
          <p className="text-subtle text-lg max-w-xl mx-auto">
            Three simple steps to understand your Omega balance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="bg-accent rounded-2xl p-6 mb-6 flex items-center justify-center h-48">
                <img src={step.image} alt={step.title} className="w-28 h-28 object-contain" />
              </div>
              <span className="text-primary font-sans text-sm font-semibold tracking-widest">
                STEP {step.number}
              </span>
              <h3 className="font-sans text-xl font-semibold mt-2 mb-3">{step.title}</h3>
              <p className="text-subtle text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
