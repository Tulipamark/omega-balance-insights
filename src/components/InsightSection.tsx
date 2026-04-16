import { motion } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import { insightCopyByLang } from "@/lib/funnel-copy";

interface InsightSectionProps {
  lang: Lang;
}

const InsightSection = ({ lang }: InsightSectionProps) => {
  const copy = insightCopyByLang[lang];

  return (
    <section className="px-4 py-14 md:px-6 md:py-16">
      <div className="container-narrow mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {copy.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-center text-lg leading-8 text-subtle"
        >
          {copy.body}
        </motion.p>

        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mx-auto mt-10 grid max-w-4xl gap-4 text-left md:grid-cols-3"
        >
          {copy.points.map((point) => (
            <li
              key={point}
              className="rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,248,246,0.9))] px-5 py-5 text-base font-medium text-foreground shadow-[0_18px_40px_rgba(31,41,55,0.05)]"
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">Why it matters</span>
              <span className="mt-3 block text-lg leading-7">{point}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default InsightSection;
