import { motion } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import { insightCopyByLang } from "@/lib/funnel-copy";

interface InsightSectionProps {
  lang: Lang;
}

const InsightSection = ({ lang }: InsightSectionProps) => {
  const copy = insightCopyByLang[lang];

  return (
    <section className="px-4 py-12 md:px-6">
      <div className="container-narrow mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {copy.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-lg leading-8 text-subtle"
        >
          {copy.body}
        </motion.p>

        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mx-auto mt-8 grid max-w-xl gap-3 text-left md:grid-cols-3 md:text-center"
        >
          {copy.points.map((point) => (
            <li key={point} className="rounded-2xl border border-border/70 bg-card px-5 py-4 text-base font-medium text-foreground shadow-card">
              {point}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default InsightSection;
