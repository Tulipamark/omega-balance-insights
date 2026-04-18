import type { Lang } from "@/lib/i18n";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AnalysisSection from "@/components/AnalysisSection";
import ResultsSection from "@/components/ResultsSection";
import VideoSection from "@/components/VideoSection";
import LeadCaptureSection from "@/components/LeadCaptureSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import ABTestingSection from "@/components/ABTestingSection";
import ClosingCtaSection from "@/components/ClosingCtaSection";
import StickyCtaBar from "@/components/StickyCtaBar";
import FooterSection from "@/components/FooterSection";

type LegacyOmegaPageProps = {
  lang: Lang;
};

const LegacyOmegaPage = ({ lang }: LegacyOmegaPageProps) => (
  <main className="brand-omega min-h-screen bg-background pb-24 md:pb-0">
    <HeroSection lang={lang} />
    <ProblemSection lang={lang} />
    <HowItWorksSection lang={lang} />
    <AnalysisSection lang={lang} />
    <ResultsSection lang={lang} />
    <VideoSection lang={lang} />
    <LeadCaptureSection lang={lang} />
    <TestimonialsSection lang={lang} />
    <FAQSection lang={lang} />
    <ABTestingSection lang={lang} />
    <ClosingCtaSection lang={lang} />
    <FooterSection lang={lang} />
    <StickyCtaBar lang={lang} />
  </main>
);

export default LegacyOmegaPage;
