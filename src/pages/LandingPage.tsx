import { useParams } from "react-router-dom";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingContent from "@/components/LandingContent";

export default function LandingPage() {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={currentLang} />
      <LandingContent lang={currentLang} />
      <Footer lang={currentLang} />
    </div>
  );
}
