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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <AnalysisSection />
      <ResultsSection />
      <VideoSection />
      <LeadCaptureSection />
      <TestimonialsSection />
      <FAQSection />
      <ABTestingSection />
      <FooterSection />
      <StickyCtaBar />
    </div>
  );
};

export default Index;
