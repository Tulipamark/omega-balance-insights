import { useParams } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AnalysisSection from "@/components/AnalysisSection";
import ResultsSection from "@/components/ResultsSection";
import LeadCaptureSection from "@/components/LeadCaptureSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import ABTestingSection from "@/components/ABTestingSection";
import FooterSection from "@/components/FooterSection";
import SwedishFunnelHeroSection from "@/components/SwedishFunnelHeroSection";
import TrustSection from "@/components/TrustSection";
import InsightSection from "@/components/InsightSection";
import ClosingCtaSection from "@/components/ClosingCtaSection";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";

type IndexProps = {
  lang?: Lang;
};

const Index = ({ lang: explicitLang }: IndexProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? ((isSupportedLang(lang) ? lang : defaultLang) as Lang);

  if (currentLang === "sv") {
    return (
      <div className="min-h-screen bg-background">
        <SwedishFunnelHeroSection lang={currentLang} />
        <TrustSection />
        <HowItWorksSection lang={currentLang} />
        <InsightSection />
        <ClosingCtaSection />
        <FooterSection lang={currentLang} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection lang={currentLang} />
      <ProblemSection lang={currentLang} />
      <HowItWorksSection lang={currentLang} />
      <AnalysisSection lang={currentLang} />
      <ResultsSection lang={currentLang} />
      <LeadCaptureSection lang={currentLang} />
      <TestimonialsSection lang={currentLang} />
      <FAQSection lang={currentLang} />
      <ABTestingSection lang={currentLang} />
      <FooterSection lang={currentLang} />
    </div>
  );
};

export default Index;
