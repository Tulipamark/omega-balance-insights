import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { omegaBalanceV4Content } from "@/content/omega-balance-v4";
import { resolveContent } from "@/content/v4-types";
import type { Lang } from "@/lib/i18n";

interface TrustSectionProps {
  lang: Lang;
}

const TrustSection = ({ lang }: TrustSectionProps) => {
  const copy = resolveContent(omegaBalanceV4Content, lang);

  return (
    <section className="bg-[linear-gradient(180deg,rgba(236,243,238,0.95),rgba(247,243,235,0.94))] px-4 py-14 sm:py-16 md:px-6">
      <div className="container-wide mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-5xl">{copy.trust.title}</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {copy.trust.items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-[1.5rem] border border-border/70 bg-white/84 px-5 py-6 text-center shadow-[0_18px_40px_rgba(31,41,55,0.05)] sm:rounded-[1.75rem] sm:px-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-subtle">{item.body.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
