import { useParams } from "react-router-dom";
import HowItWorksSection from "@/components/HowItWorksSection";
import FooterSection from "@/components/FooterSection";
import SwedishFunnelHeroSection from "@/components/SwedishFunnelHeroSection";
import StickyCtaBar from "@/components/StickyCtaBar";
import TrustSection from "@/components/TrustSection";
import InsightSection from "@/components/InsightSection";
import ClosingCtaSection from "@/components/ClosingCtaSection";
import FaqDetails from "@/components/funnel/FaqDetails";
import OmegaMarkersSection from "@/components/omega/OmegaMarkersSection";
import VideoSection from "@/components/VideoSection";
import { omegaBalanceV4Content } from "@/content/omega-balance-v4";
import { resolveContent } from "@/content/v4-types";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";
import { buildAlternates, useSeo } from "@/lib/seo";

type IndexProps = {
  lang?: Lang;
};

const omegaBalancePath = (lang: Lang) => (lang === "sv" ? "/omega-balance" : `/${lang}/omega-balance`);

const Index = ({ lang: explicitLang }: IndexProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? ((isSupportedLang(lang) ? lang : defaultLang) as Lang);
  const copy = resolveContent(omegaBalanceV4Content, currentLang);
  const currentPath = omegaBalancePath(currentLang);

  useSeo({
    lang: currentLang,
    title: `${copy.hero.title} | OmegaBalance`,
    description: copy.hero.body,
    path: currentPath,
    alternates: buildAlternates((lang) => omegaBalancePath(lang), ["sv", "no", "da", "fi", "en", "de", "fr", "it"]),
    faq: copy.faq,
  });

  return (
    <main className="brand-omega min-h-screen bg-background pb-24 md:pb-0">
      <SwedishFunnelHeroSection lang={currentLang} />
      <div className="pt-8 md:pt-10">
        <VideoSection lang={currentLang} showTranscript={false} />
      </div>
      <InsightSection lang={currentLang} />
      <OmegaMarkersSection lang={currentLang} />
      <TrustSection lang={currentLang} />
      <HowItWorksSection lang={currentLang} />
      <FaqDetails title={copy.faqTitle} items={copy.faq} className="bg-[rgba(247,243,235,0.65)]" />
      <ClosingCtaSection lang={currentLang} />
      <FooterSection lang={currentLang} />
      <StickyCtaBar lang={currentLang} />
    </main>
  );
};

export default Index;
