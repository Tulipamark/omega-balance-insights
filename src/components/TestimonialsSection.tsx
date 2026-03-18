import { motion } from "framer-motion";
import { Lang, t } from "@/lib/i18n";

interface TestimonialsSectionProps {
  lang: Lang;
}

const TestimonialsSection = ({ lang }: TestimonialsSectionProps) => {
  const copy = t(lang).testimonials;

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
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{copy.title}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {copy.items.map((item, i) => (
            <motion.div
              key={`${item.name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card"
            >
              <p className="text-sm leading-relaxed mb-6 italic text-muted-foreground">"{item.quote}"</p>
              <div>
                <p className="font-sans text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-subtle">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
