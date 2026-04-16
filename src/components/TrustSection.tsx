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
    <section className="bg-[linear-gradient(180deg,rgba(236,243,238,0.95),rgba(247,243,235,0.94))] px-4 py-10 sm:py-12 md:px-6">
      <div className="container-narrow mx-auto">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-[1.5rem] border border-border/70 bg-white/84 px-4 py-5 text-center shadow-[0_18px_40px_rgba(31,41,55,0.05)] sm:rounded-[1.75rem] sm:px-6 sm:py-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </span>
              <p className="mt-4 text-sm font-medium text-foreground sm:text-base">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
