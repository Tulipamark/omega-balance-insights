import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import PartnerPage from "./pages/PartnerPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { useParams } from "react-router-dom";
import { Lang, defaultLang } from "./lib/i18n";

const queryClient = new QueryClient();

function LangPartnerPage() {
  const { lang } = useParams<{ lang: string }>();
  const l = (["sv", "no", "da", "fi", "en"].includes(lang || "") ? lang : defaultLang) as Lang;
  return <PartnerPage lang={l} />;
}

function LangDashboardPage() {
  const { lang } = useParams<{ lang: string }>();
  const l = (["sv", "no", "da", "fi", "en"].includes(lang || "") ? lang : defaultLang) as Lang;
  return <DashboardPage lang={l} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/sv" replace />} />
          <Route path="/:lang" element={<LandingPage />} />
          <Route path="/:lang/partners" element={<LangPartnerPage />} />
          <Route path="/:lang/dashboard" element={<LangDashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
