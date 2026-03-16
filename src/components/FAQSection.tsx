import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How is the test performed?",
    a: "You collect a small blood sample at home using a simple finger-prick kit. The process takes less than 5 minutes and requires no medical expertise.",
  },
  {
    q: "How long does the analysis take?",
    a: "Once your sample reaches the laboratory, results are typically available within 10–14 business days. You'll receive a notification when your report is ready.",
  },
  {
    q: "Is the test safe?",
    a: "Yes. The finger-prick method is widely used in medical diagnostics and is minimally invasive. The kit includes clear instructions and all necessary materials.",
  },
  {
    q: "What happens after I receive my results?",
    a: "You'll get a comprehensive digital report with your fatty acid profile, your Omega-6/Omega-3 ratio, and personalized recommendations. You can also book a follow-up consultation to discuss your results.",
  },
  {
    q: "Do I need a doctor's referral?",
    a: "No referral is needed. The test is designed for direct-to-consumer use. However, we recommend sharing your results with your healthcare provider for a complete picture.",
  },
];

const FAQSection = () => {
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
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Frequently asked questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-xl px-6 border-none shadow-card"
              >
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
