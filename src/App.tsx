import * as React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import PartnerPage from "./pages/PartnerPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import { defaultLang, isSupportedLang, Lang } from "./lib/i18n";
import DashboardLoginPage from "./pages/DashboardLoginPage.tsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.tsx";
import PartnerDashboardPage from "./pages/PartnerDashboardPage.tsx";
import PartnerLegalAcceptancePage from "./pages/PartnerLegalAcceptancePage.tsx";
import { getPortalAccessState } from "./lib/omega-data";
import { hasAcceptedPortalLegal } from "./lib/portal-legal";
import { isSupabaseConfigured } from "./integrations/supabase/client";
import { useReferralTracking } from "./hooks/use-referral-tracking";

const queryClient = new QueryClient();

// Trigger rebuild for GitHub-linked preview environments.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RecoveryRedirectBoundary />
        <ReferralTrackingBoundary />
        <Routes>
          <Route path="/" element={<HomePageWrapper />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/integritet" element={<PrivacyPage />} />
          <Route path="/villkor" element={<TermsPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/dashboard" element={<DashboardIndexPage />} />
          <Route path="/dashboard/login" element={<DashboardLoginPage />} />
          <Route path="/dashboard/admin-login" element={<DashboardLoginPage variant="admin" />} />
          <Route path="/dashboard/admin" element={<ProtectedDashboardRoute requiredRole="admin"><AdminDashboardPage /></ProtectedDashboardRoute>} />
          <Route path="/dashboard/admin/legal-preview" element={<ProtectedDashboardRoute requiredRole="admin"><PartnerLegalAcceptancePage previewMode /></ProtectedDashboardRoute>} />
          <Route path="/dashboard/admin/:section" element={<ProtectedDashboardRoute requiredRole="admin"><AdminDashboardPage /></ProtectedDashboardRoute>} />
          <Route path="/dashboard/partner/legal" element={<ProtectedDashboardRoute requiredRole="partner"><PartnerLegalAcceptancePage /></ProtectedDashboardRoute>} />
          <Route path="/dashboard/partner" element={<ProtectedDashboardRoute requiredRole="partner"><PartnerDashboardPage /></ProtectedDashboardRoute>} />
          <Route path="/dashboard/partner/:section" element={<ProtectedDashboardRoute requiredRole="partner"><PartnerDashboardPage /></ProtectedDashboardRoute>} />
          <Route path="/:lang" element={<Index />} />
          <Route path="/partners" element={<PartnerPage lang={defaultLang} />} />
          <Route path="/:lang/partners" element={<PartnerPageWrapper />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function HomePageWrapper() {
  const location = useLocation();

  return <Navigate to={`/${defaultLang}${location.search}${location.hash}`} replace />;
}

function PartnerPageWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  return <PartnerPage lang={currentLang} />;
}

function ReferralTrackingBoundary() {
  useReferralTracking();
  return null;
}

function RecoveryRedirectBoundary() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
    if (hashParams.get("type") !== "recovery") {
      return;
    }

    if (location.pathname === "/auth/reset-password") {
      return;
    }

    navigate(`/auth/reset-password${location.hash}`, { replace: true });
  }, [location.hash, location.pathname, navigate]);

  return null;
}

function DashboardIndexPage() {
  const location = useLocation();
  const isDemoRoute = new URLSearchParams(location.search).has("demo");
  const accessQuery = useQuery({
    queryKey: ["portal-access"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured && !isDemoRoute,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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

  if (accessQuery.data.portalUser.role === "partner" && !hasAcceptedPortalLegal(accessQuery.data.portalUser)) {
    return <Navigate to="/dashboard/partner/legal" replace />;
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
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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

  if (requiredRole === "partner" && accessQuery.data.portalUser.role === "admin") {
    return children;
  }

  if (accessQuery.data.portalUser.role !== requiredRole) {
    return <Navigate to={`/dashboard/${accessQuery.data.portalUser.role}`} replace />;
  }

  if (requiredRole === "partner") {
    const legalPath = "/dashboard/partner/legal";
    const accepted = hasAcceptedPortalLegal(accessQuery.data.portalUser);

    if (!accepted && location.pathname !== legalPath) {
      return <Navigate to={legalPath} replace />;
    }

    if (accepted && location.pathname === legalPath) {
      return <Navigate to="/dashboard/partner" replace />;
    }
  }

  return children;
}

export default App;
