import { motion } from "framer-motion";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

const DEFAULT_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000";

const ClosingCtaSection = () => {
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
            Redo att ta nästa steg?
          </h2>
          <p className="mt-4 text-lg leading-8 text-subtle">
            Börja med testet och få en tydligare bild av din balans.
          </p>
          <div className="mx-auto mt-6 max-w-sm">
            <TrackedOutboundButton
              destinationType="test"
              fallbackHref={DEFAULT_ZINZINO_TEST_URL}
              className="btn-primary w-full text-center"
              pendingLabel="Öppnar..."
              errorMessages={{ generic: "Länken kunde inte öppnas just nu." }}
            >
              Gör testet nu
            </TrackedOutboundButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosingCtaSection;
