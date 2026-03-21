import { motion } from "framer-motion";
import { t, type Lang } from "@/lib/i18n";
import { insightCopyByLang } from "@/lib/funnel-copy";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface ClosingCtaSectionProps {
  lang: Lang;
}

const DEFAULT_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000";

const ClosingCtaSection = ({ lang }: ClosingCtaSectionProps) => {
  const copy = t(lang);
  const insightCopy = insightCopyByLang[lang];

  return (
    <section className="px-4 py-12 md:px-6 md:py-14">
      <div className="container-narrow mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl rounded-[1.75rem] border border-border/70 bg-card px-6 py-8 shadow-elevated md:px-10 md:py-10"
        >
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {insightCopy.closingTitle}
          </h2>
          <p className="mt-4 text-lg leading-8 text-subtle">
            {insightCopy.closingBody}
          </p>
          <div className="mx-auto mt-6 max-w-sm">
            <TrackedOutboundButton
              destinationType="test"
              fallbackHref={DEFAULT_ZINZINO_TEST_URL}
              className="btn-primary w-full text-center"
              pendingLabel={lang === "sv" ? "Öppnar..." : "Opening..."}
              errorMessages={{ generic: lang === "sv" ? "Länken kunde inte öppnas just nu." : "The link could not be opened right now." }}
            >
              {lang === "sv" ? "Gör testet nu" : copy.hero.primaryCta}
            </TrackedOutboundButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosingCtaSection;
