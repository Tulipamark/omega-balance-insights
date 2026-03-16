import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I had no idea my ratio was 12:1. This test was an eye-opener. I changed my diet and retested — down to 4:1 in six months.",
    name: "Maria K.",
    role: "Health-conscious professional, 42",
  },
  {
    quote: "As someone who tracks everything, this filled a major blind spot. The report was clear, scientific, and actually useful.",
    name: "Thomas R.",
    role: "Biohacker & endurance athlete, 38",
  },
  {
    quote: "I recommend this to all my clients. It's the simplest way to see what's happening beneath the surface.",
    name: "Dr. Anna L.",
    role: "Functional medicine practitioner",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            What people are discovering
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card"
            >
              <p className="text-sm leading-relaxed mb-6 italic text-muted-foreground">
                "{t.quote}"
              </p>
              <div>
                <p className="font-sans text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-subtle">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
