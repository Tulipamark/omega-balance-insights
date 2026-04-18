import { motion } from "framer-motion";
import { omegaBalanceV4Content } from "@/content/omega-balance-v4";
import { resolveContent } from "@/content/v4-types";
import type { Lang } from "@/lib/i18n";

interface InsightSectionProps {
  lang: Lang;
}

const InsightSection = ({ lang }: InsightSectionProps) => {
  const copy = resolveContent(omegaBalanceV4Content, lang);

  return (
    <section className="bg-[rgba(238,243,236,0.92)] px-4 py-10 md:px-6 md:py-12">
      <div className="container-narrow mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center text-lg leading-8 text-subtle"
        >
          {copy.normalizing.body.text}
        </motion.p>
      </div>
    </section>
  );
};

export default InsightSection;
