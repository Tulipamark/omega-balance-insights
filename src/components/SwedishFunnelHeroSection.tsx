import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Lang } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";
import VideoSection from "@/components/VideoSection";

interface SwedishFunnelHeroSectionProps {
  lang: Lang;
}

const DEFAULT_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000";

const SwedishFunnelHeroSection = ({ lang }: SwedishFunnelHeroSectionProps) => {
  return (
    <section className="bg-hero px-4 pb-12 pt-8 md:px-6 md:pb-14 md:pt-10">
      <div className="container-wide mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 md:mb-10">
          <a href={`/${lang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
            OmegaBalance
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard/login"
              className="inline-flex whitespace-nowrap text-xs font-medium text-subtle transition-colors hover:text-foreground sm:text-sm"
            >
              Logga in
            </Link>
            <Link
              to={`/${lang}/partners`}
              className="inline-flex whitespace-nowrap rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-card transition-colors hover:bg-card sm:px-4 sm:text-sm"
            >
              För partners
            </Link>
            <LanguageSwitcher lang={lang} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-5xl text-center"
        >
          <span className="badge-accent inline-block rounded-full px-4 py-1.5 text-sm font-medium tracking-wide">
            Vetenskaplig fettsyreanalys
          </span>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Testa din Omega-balans på 2 minuter
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-subtle md:text-xl">
            De flesta vet inte hur deras omega-6/omega-3-balans faktiskt ser ut. Det här enkla hemmatestet ger dig svart på vitt.
          </p>

          <div className="mt-7">
            <VideoSection lang={lang} embedded showTranscript={false} showHeader={false} />
          </div>

          <div className="mx-auto mt-6 flex max-w-md flex-col gap-3">
            <TrackedOutboundButton
              destinationType="test"
              fallbackHref={DEFAULT_ZINZINO_TEST_URL}
              className="btn-primary w-full text-center"
              pendingLabel="Öppnar..."
              errorMessages={{ generic: "Länken kunde inte öppnas just nu." }}
            >
              Gör testet nu
            </TrackedOutboundButton>
            <a href="#how-it-works" className="btn-secondary text-center">
              Se hur testet fungerar
            </a>
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium tracking-wide text-subtle">
            Enkelt hemmatest • Tydligt resultat • Tar bara några minuter
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SwedishFunnelHeroSection;
