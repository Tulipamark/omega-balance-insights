import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
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
import DashboardLoginPage from "./pages/DashboardLoginPage.tsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.tsx";
import PartnerDashboardPage from "./pages/PartnerDashboardPage.tsx";
import { getPortalAccessState } from "./lib/omega-data";
import { isSupabaseConfigured } from "./integrations/supabase/client";
import { useReferralTracking } from "./hooks/use-referral-tracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ReferralTrackingBoundary />
        <Routes>
          <Route path="/" element={<Navigate to={`/${defaultLang}`} replace />} />
          <Route path="/integritet" element={<PrivacyPage />} />
          <Route path="/villkor" element={<TermsPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/dashboard" element={<DashboardIndexPage />} />
          <Route path="/dashboard/login" element={<DashboardLoginPage />} />
          <Route path="/dashboard/admin" element={<ProtectedDashboardRoute requiredRole="admin"><AdminDashboardPage /></ProtectedDashboardRoute>} />
          <Route path="/dashboard/partner" element={<ProtectedDashboardRoute requiredRole="partner"><PartnerDashboardPage /></ProtectedDashboardRoute>} />
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

function ReferralTrackingBoundary() {
  useReferralTracking();
  return null;
}

function DashboardIndexPage() {
  const location = useLocation();
  const isDemoRoute = new URLSearchParams(location.search).has("demo");
  const accessQuery = useQuery({
    queryKey: ["portal-access"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured && !isDemoRoute,
  });

  if (!isSupabaseConfigured || isDemoRoute) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (accessQuery.isLoading) {
    return <div className="min-h-screen bg-background px-6 py-10">Loading dashboard...</div>;
  }

  if (!accessQuery.data?.authUser) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (!accessQuery.data.portalUser) {
    const params = new URLSearchParams();
    params.set("reason", "profile-missing");
    if (accessQuery.data.authUser.email) {
      params.set("email", accessQuery.data.authUser.email);
    }
    return <Navigate to={`/dashboard/login?${params.toString()}`} replace />;
  }

  return <Navigate to={accessQuery.data.portalUser.role === "admin" ? "/dashboard/admin" : "/dashboard/partner"} replace />;
}

function ProtectedDashboardRoute({
  requiredRole,
  children,
}: {
  requiredRole: "admin" | "partner";
  children: JSX.Element;
}) {
  const location = useLocation();
  const isDemoRoute = new URLSearchParams(location.search).has("demo");
  const accessQuery = useQuery({
    queryKey: ["portal-access"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured && !isDemoRoute,
  });

  if (!isSupabaseConfigured || isDemoRoute) {
    return children;
  }

  if (accessQuery.isLoading) {
    return <div className="min-h-screen bg-background px-6 py-10">Loading dashboard...</div>;
  }

  if (!accessQuery.data?.authUser) {
    return <Navigate to="/dashboard/login?reason=auth-required" replace />;
  }

  if (!accessQuery.data.portalUser) {
    const params = new URLSearchParams();
    params.set("reason", "profile-missing");
    if (accessQuery.data.authUser.email) {
      params.set("email", accessQuery.data.authUser.email);
    }
    return <Navigate to={`/dashboard/login?${params.toString()}`} replace />;
  }

  if (accessQuery.data.portalUser.role !== requiredRole) {
    return <Navigate to={`/dashboard/${accessQuery.data.portalUser.role}`} replace />;
  }

  return children;
}

export default App;
