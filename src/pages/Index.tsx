import { useParams } from "react-router-dom";
import HowItWorksSection from "@/components/HowItWorksSection";
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

  return (
    <div className="min-h-screen bg-background">
      <SwedishFunnelHeroSection lang={currentLang} />
      <TrustSection lang={currentLang} />
      <HowItWorksSection lang={currentLang} />
      <InsightSection lang={currentLang} />
      <ClosingCtaSection lang={currentLang} />
      <FooterSection lang={currentLang} />
    </div>
  );
};

export default Index;
