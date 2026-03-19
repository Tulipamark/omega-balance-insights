import { motion } from "framer-motion";
import heroVisual from "@/assets/hero-visual.jpg";
import { Link } from "react-router-dom";
import { Lang, t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HeroSectionProps {
  lang: Lang;
}

const HeroSection = ({ lang }: HeroSectionProps) => {
  const copy = t(lang).hero;
  const loginLabel = lang === "sv" ? "Logga in" : "Sign in";

  return (
    <section className="bg-hero section-padding min-h-[90vh] flex items-center">
      <div className="container-wide w-full">
        <div className="mb-10 flex items-center justify-between gap-4">
          <a href={`/${lang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
            OmegaBalance
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard/login"
              className="inline-flex whitespace-nowrap text-xs font-medium text-subtle transition-colors hover:text-foreground sm:text-sm"
            >
              {loginLabel}
            </Link>
            <Link
              to={`/${lang}/partners`}
              className="inline-flex whitespace-nowrap rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-card transition-colors hover:bg-card sm:px-4 sm:text-sm"
            >
              {copy.partnerCta}
            </Link>
            <LanguageSwitcher lang={lang} />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="badge-accent inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 tracking-wide">
              {copy.badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight mb-6">
              {copy.titleStart}
              <br />
              <span className="text-primary">{copy.titleAccent}</span>
            </h1>
            <p className="text-lg md:text-xl text-subtle leading-relaxed max-w-lg mb-10">{copy.body}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#lead-capture" className="btn-primary text-center">
                {copy.primaryCta}
              </a>
              <a href="#how-it-works" className="btn-secondary text-center">
                {copy.secondaryCta}
              </a>
            </div>
            <div className="mt-4">
              <Link to={`/${lang}/partners`} className="text-sm font-medium text-primary transition-colors hover:text-foreground">
                {copy.partnerCta}
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-subtle text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {copy.statLab}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {copy.statTiming}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-elevated">
              <img src={heroVisual} alt={copy.imageAlt} className="w-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
