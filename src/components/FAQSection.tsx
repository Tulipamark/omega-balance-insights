import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lang, t } from "@/lib/i18n";

interface FAQSectionProps {
  lang: Lang;
}

const FAQSection = ({ lang }: FAQSectionProps) => {
  const copy = t(lang).faq;

  return (
    <section className="section-padding bg-section-alt">
      <div className="container-narrow max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{copy.title}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {copy.items.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-xl px-6 border-none shadow-card">
                <AccordionTrigger className="text-sm font-sans font-medium py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-subtle text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
