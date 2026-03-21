import { motion } from "framer-motion";

const trustItems = [
  "Blodbaserat test",
  "Enkelt att göra hemma",
  "Personliga resultat",
];

const TrustSection = () => {
  return (
    <section className="bg-section-alt px-4 py-10 md:px-6">
      <div className="container-narrow mx-auto">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-2xl border border-border/70 bg-card px-6 py-5 text-center shadow-card"
            >
              <span className="text-base font-medium text-foreground">✓ {item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
