import * as React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isBetaAccessGranted } from "@/lib/beta-access";
import InsideBalancePage from "./pages/InsideBalancePage.tsx";
import { defaultLang, isSupportedLang, Lang } from "./lib/i18n";
import { getPortalAccessState, signOutPortalUser } from "./lib/omega-data";
import { hasAcceptedPortalLegal } from "./lib/portal-legal";
import { isSupabaseConfigured } from "./integrations/supabase/client";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { useCookieConsent } from "./hooks/use-cookie-consent";
import { useReferralTracking } from "./hooks/use-referral-tracking";

const queryClient = new QueryClient();
const Index = React.lazy(() => import("./pages/Index.tsx"));
const PartnerPage = React.lazy(() => import("./pages/PartnerPage.tsx"));
const PrivacyPage = React.lazy(() => import("./pages/PrivacyPage.tsx"));
const TermsPage = React.lazy(() => import("./pages/TermsPage.tsx"));
const ContactPage = React.lazy(() => import("./pages/ContactPage.tsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.tsx"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage.tsx"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage.tsx"));
const GutBalancePage = React.lazy(() => import("./pages/GutBalancePage.tsx"));
const DashboardLoginPage = React.lazy(() => import("./pages/DashboardLoginPage.tsx"));
const AdminDashboardPage = React.lazy(() => import("./pages/AdminDashboardPage.tsx"));
const PartnerDashboardPage = React.lazy(() => import("./pages/PartnerDashboardPage.tsx"));
const PartnerLegalAcceptancePage = React.lazy(() => import("./pages/PartnerLegalAcceptancePage.tsx"));
const BetaEntryPage = React.lazy(() => import("./pages/BetaEntryPage.tsx"));

// Trigger rebuild for GitHub-linked preview environments.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieConsentBoundary />
        <ScrollRestorationBoundary />
        <RecoveryRedirectBoundary />
        <BetaAccessBoundary />
        <ReferralTrackingBoundary />
        <React.Suspense fallback={<RouteLoadingState />}>
          <Routes>
            <Route path="/beta-entry" element={<BetaEntryPage />} />
            <Route path="/" element={<InsideBalancePage lang={defaultLang} />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/integritet" element={<PrivacyPage />} />
            <Route path="/villkor" element={<TermsPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/inside-balance" element={<Navigate to="/" replace />} />
            <Route path="/gut-balance" element={<GutBalancePage lang={defaultLang} />} />
            <Route path="/omega-balance" element={<Index lang={defaultLang} />} />
            <Route path="/:lang/integritet" element={<PrivacyPage />} />
            <Route path="/:lang/villkor" element={<TermsPage />} />
            <Route path="/:lang/kontakt" element={<ContactPage />} />
            <Route path="/:lang/inside-balance" element={<LocalizedInsideBalanceRedirect />} />
            <Route path="/:lang/gut-balance" element={<GutBalancePage />} />
            <Route path="/:lang/omega-balance" element={<Index />} />
            <Route path="/dashboard" element={<DashboardIndexPage />} />
            <Route path="/dashboard/login" element={<DashboardLoginPage />} />
            <Route path="/dashboard/admin-login" element={<DashboardLoginPage variant="admin" />} />
            <Route path="/dashboard/admin" element={<ProtectedDashboardRoute requiredRole="admin"><AdminDashboardPage /></ProtectedDashboardRoute>} />
            <Route path="/dashboard/admin/legal-preview" element={<ProtectedDashboardRoute requiredRole="admin"><PartnerLegalAcceptancePage previewMode /></ProtectedDashboardRoute>} />
            <Route path="/dashboard/admin/:section" element={<ProtectedDashboardRoute requiredRole="admin"><AdminDashboardPage /></ProtectedDashboardRoute>} />
            <Route path="/dashboard/partner/legal" element={<ProtectedDashboardRoute requiredRole="partner"><PartnerLegalAcceptancePage /></ProtectedDashboardRoute>} />
            <Route path="/dashboard/partner" element={<ProtectedDashboardRoute requiredRole="partner"><PartnerDashboardPage /></ProtectedDashboardRoute>} />
            <Route path="/dashboard/partner/:section" element={<ProtectedDashboardRoute requiredRole="partner"><PartnerDashboardPage /></ProtectedDashboardRoute>} />
            <Route path="/:lang" element={<InsideBalancePage />} />
            <Route path="/partners" element={<PartnerPage lang={defaultLang} />} />
            <Route path="/:lang/partners" element={<PartnerPageWrapper />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function PartnerPageWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  return <PartnerPage lang={currentLang} />;
}

function LocalizedInsideBalanceRedirect() {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  return <Navigate to={currentLang === defaultLang ? "/" : `/${currentLang}`} replace />;
}

function ReferralTrackingBoundary() {
  useReferralTracking();
  return null;
}

function CookieConsentBoundary() {
  const location = useLocation();
  const { consentStatus, acceptOptionalTracking, declineOptionalTracking } = useCookieConsent();
  const firstSegment = location.pathname.split("/").filter(Boolean)[0];
  const lang = isSupportedLang(firstSegment) ? firstSegment : defaultLang;

  if (consentStatus !== "pending") {
    return null;
  }

  return (
    <CookieConsentBanner
      lang={lang}
      onAccept={acceptOptionalTracking}
      onDecline={declineOptionalTracking}
    />
  );
}

function BetaAccessBoundary() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const publicPreviewBypassPaths = new Set([
      "/beta-entry",
      "/dashboard",
      "/dashboard/login",
      "/dashboard/admin-login",
      "/auth/forgot-password",
      "/auth/reset-password",
    ]);

    const isDashboardPath = location.pathname.startsWith("/dashboard/");
    const isAllowedPath = publicPreviewBypassPaths.has(location.pathname) || isDashboardPath;

    if (isAllowedPath || isBetaAccessGranted()) {
      return;
    }

    navigate("/beta-entry", { replace: true, state: { from: location.pathname } });
  }, [location.pathname, navigate]);

  return null;
}

function ScrollRestorationBoundary() {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace(/^#/, "");
      let frameId = 0;
      let timeoutId = 0;
      let attempts = 0;

      const scrollToHashTarget = () => {
        const target = document.getElementById(id);

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        attempts += 1;

        if (attempts < 12) {
          frameId = window.requestAnimationFrame(scrollToHashTarget);
          return;
        }

        timeoutId = window.setTimeout(() => {
          const delayedTarget = document.getElementById(id);

          if (delayedTarget) {
            delayedTarget.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 120);
      };

      scrollToHashTarget();

      return () => {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }

        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

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

function useDashboardRecoveryLoading(isLoading: boolean) {
  const [showRecovery, setShowRecovery] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setShowRecovery(false);
      return;
    }

    const timeout = window.setTimeout(() => setShowRecovery(true), 2500);
    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  return showRecovery;
}

function DashboardLoadingState({ admin }: { admin: boolean }) {
  const showRecovery = useDashboardRecoveryLoading(true);
  const loginPath = admin ? "/dashboard/admin-login?force_login=1" : "/dashboard/login?force_login=1";
  const demoPath = admin ? "/dashboard/admin?demo=1" : "/dashboard/partner?demo=1";

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-border/70 bg-white/95 p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Instrumentpanel</p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Laddar åtkomst...</h1>
        <p className="mt-3 text-sm leading-6 text-subtle">
          Vi kontrollerar din portalåtkomst och session just nu.
        </p>

        {showRecovery ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Det tar ovanligt lång tid. Om en gammal session har fastnat kan du gå vidare härifrån i stället.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild type="button" variant="outline" className="rounded-xl">
                <Link to={loginPath}>Till inloggning</Link>
              </Button>
              <Button asChild type="button" variant="outline" className="rounded-xl">
                <Link to={demoPath}>Öppna demoläge</Link>
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => void signOutPortalUser()}>
                Logga ut fastnad session
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RouteLoadingState() {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-border/70 bg-white/95 p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Laddar vy</p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Vi hämtar nästa del av appen...</h1>
        <p className="mt-3 text-sm leading-6 text-subtle">
          Sidan delas upp i mindre delar för att hålla laddningen lättare och snabbare.
        </p>
      </div>
    </div>
  );
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
    return <DashboardLoadingState admin={false} />;
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
    return <DashboardLoadingState admin={requiredRole === "admin"} />;
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
