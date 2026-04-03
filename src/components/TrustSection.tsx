import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { trustItemsByLang } from "@/lib/funnel-copy";

interface TrustSectionProps {
  lang: Lang;
}

const TrustSection = ({ lang }: TrustSectionProps) => {
  const trustItems = trustItemsByLang[lang];

  return (
    <section className="bg-section-alt px-4 py-8 sm:py-10 md:px-6">
      <div className="container-narrow mx-auto">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-xl border border-border/70 bg-card px-4 py-4 text-center shadow-card sm:rounded-2xl sm:px-6 sm:py-5"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
                <Check className="h-4 w-4 text-primary" />
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
