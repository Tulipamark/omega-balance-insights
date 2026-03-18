import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import PartnerPage from "./pages/PartnerPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { defaultLang, isSupportedLang, Lang } from "./lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`/${defaultLang}`} replace />} />
          <Route path="/integritet" element={<PrivacyPage />} />
          <Route path="/villkor" element={<TermsPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/:lang" element={<Index />} />
          <Route path="/:lang/partners" element={<PartnerPageWrapper />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function PartnerPageWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  return <PartnerPage lang={currentLang} />;
}

export default App;
