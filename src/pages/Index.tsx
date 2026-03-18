import { useParams } from "react-router-dom";
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
import StickyCtaBar from "@/components/StickyCtaBar";
import FooterSection from "@/components/FooterSection";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";

const Index = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection lang={currentLang} />
      <ProblemSection lang={currentLang} />
      <HowItWorksSection lang={currentLang} />
      <AnalysisSection lang={currentLang} />
      <ResultsSection lang={currentLang} />
      <VideoSection lang={currentLang} />
      <LeadCaptureSection lang={currentLang} />
      <TestimonialsSection lang={currentLang} />
      <FAQSection lang={currentLang} />
      <ABTestingSection lang={currentLang} />
      <FooterSection lang={currentLang} />
      <StickyCtaBar lang={currentLang} />
    </div>
  );
};

export default Index;
