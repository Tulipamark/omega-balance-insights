import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lang, t } from "@/lib/i18n";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";

interface StickyCtaBarProps {
  lang: Lang;
}

const StickyCtaBar = ({ lang }: StickyCtaBarProps) => {
  const copy = t(lang).sticky;
  const [visible, setVisible] = useState(false);
  const pendingLabel = lang === "sv" ? "Öppnar..." : "Opening...";
  const genericError = lang === "sv" ? "Länken kunde inte öppnas just nu." : "The link could not be opened right now.";

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border py-3 px-6"
        >
          <div className="container-wide flex items-center justify-between gap-4">
            <p className="text-sm font-medium hidden sm:block">{copy.text}</p>
            <TrackedOutboundButton
              destinationType="test"
              fallbackHref="#lead-capture"
              className="btn-primary text-sm py-3 px-6 whitespace-nowrap"
              pendingLabel={pendingLabel}
              errorMessages={{ generic: genericError }}
            >
              {copy.cta}
            </TrackedOutboundButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCtaBar;
