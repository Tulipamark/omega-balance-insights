import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { DashboardShell, dashboardIcons } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { acceptPortalLegal, getPortalAccessState, signOutPortalUser } from "@/lib/omega-data";
import { hasAcceptedPortalLegal, buildPortalLegalAcceptancePayload } from "@/lib/portal-legal";
import { portalNoticePoints, portalPrivacySections, portalTermsSections } from "@/content/portal-legal-content";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

function hasScrolledToBottom(element: HTMLDivElement | null) {
  if (!element) {
    return false;
  }

  return element.scrollTop + element.clientHeight >= element.scrollHeight - 8;
}

type PartnerLegalAcceptancePageProps = {
  previewMode?: boolean;
};

const PartnerLegalAcceptancePage = ({ previewMode = false }: PartnerLegalAcceptancePageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [termsReachedEnd, setTermsReachedEnd] = useState(false);
  const [privacyReachedEnd, setPrivacyReachedEnd] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptNotice, setAcceptNotice] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const termsRef = useRef<HTMLDivElement | null>(null);
  const privacyRef = useRef<HTMLDivElement | null>(null);

  const accessQuery = useQuery({
    queryKey: ["portal-access"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptPortalLegal(buildPortalLegalAcceptancePayload(typeof navigator !== "undefined" ? navigator.userAgent : null)),
    onSuccess: async () => {
      setStatus("Villkor och integritet är godkända.");
      await queryClient.invalidateQueries({ queryKey: ["portal-access"] });
      navigate("/dashboard/partner", { replace: true });
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara godkännandet.");
    },
  });

  const canSubmit = termsReachedEnd && privacyReachedEnd && acceptTerms && acceptPrivacy && acceptNotice;
  const user = accessQuery.data?.portalUser;

  const navigation = useMemo(() => {
    if (previewMode) {
      return [{ label: "Legal preview", href: "/dashboard/admin/legal-preview", icon: dashboardIcons.dashboard }];
    }

    return [{ label: "Godkänn villkor", href: "/dashboard/partner/legal", icon: dashboardIcons.dashboard }];
  }, [previewMode]);

  if (!isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (accessQuery.isLoading) {
    return <div className="min-h-screen bg-background px-6 py-10">Laddar portalåtkomst...</div>;
  }

  if (!accessQuery.data?.authUser) {
    return <Navigate to="/dashboard/login?reason=auth-required" replace />;
  }

  if (!user) {
    return <Navigate to="/dashboard/login?reason=profile-missing" replace />;
  }

  if (!previewMode && user.role !== "partner") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (!previewMode && hasAcceptedPortalLegal(user)) {
    return <Navigate to="/dashboard/partner" replace />;
  }

  return (
    <DashboardShell
      title={previewMode ? "Legal preview" : "Godkänn villkor"}
      subtitle={
        previewMode
          ? "Förhandsvisning av första-inloggningssteget för portalvillkor och integritet."
          : "Innan du använder portalen behöver du läsa igenom och godkänna portalvillkor, integritetspolicy, förstå att detta är vårt interna teamlager och bekräfta att du är minst 18 år och myndig."
      }
      roleLabel={previewMode ? "Admin preview" : "Partner"}
      navigation={navigation}
      onSignOut={previewMode ? undefined : () => void signOutPortalUser()}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-border/70 bg-white/90 p-6 shadow-card md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Portalvillkor</h2>
              <p className="mt-2 text-sm leading-6 text-subtle">
                Skrolla längst ned i båda dokumenten innan du godkänner.
              </p>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Obligatoriskt
            </Badge>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Villkor</p>
                <Link to="/villkor" target="_blank" rel="noreferrer" className="text-sm text-primary hover:text-primary/80">
                  Öppna separat sida
                </Link>
              </div>
              <div
                ref={termsRef}
                onScroll={(event) => setTermsReachedEnd(hasScrolledToBottom(event.currentTarget))}
                className="h-80 overflow-y-auto rounded-[1.25rem] border border-border/70 bg-secondary/20 p-4"
              >
                <div className="space-y-5">
                  {portalTermsSections.map((section) => (
                    <section key={section.title}>
                      <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-subtle">{section.body}</p>
                    </section>
                  ))}
                </div>
              </div>
              <p className="text-xs text-subtle">
                {termsReachedEnd ? "Du har nått slutet av villkoren." : "Skrolla längst ned för att låsa upp godkännandet."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Integritetspolicy</p>
                <Link to="/integritet" target="_blank" rel="noreferrer" className="text-sm text-primary hover:text-primary/80">
                  Öppna separat sida
                </Link>
              </div>
              <div
                ref={privacyRef}
                onScroll={(event) => setPrivacyReachedEnd(hasScrolledToBottom(event.currentTarget))}
                className="h-80 overflow-y-auto rounded-[1.25rem] border border-border/70 bg-secondary/20 p-4"
              >
                <div className="space-y-5">
                  {portalPrivacySections.map((section) => (
                    <section key={section.title}>
                      <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-subtle">{section.body}</p>
                    </section>
                  ))}
                </div>
              </div>
              <p className="text-xs text-subtle">
                {privacyReachedEnd ? "Du har nått slutet av integritetspolicyn." : "Skrolla längst ned för att låsa upp godkännandet."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-white/90 p-6 shadow-card md:p-7">
          <div className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-secondary/20 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Viktigt att förstå</p>
              <div className="mt-3 space-y-2">
                {portalNoticePoints.map((item) => (
                  <p key={item} className="text-sm leading-6 text-subtle">{item}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/10 p-4">
              <Checkbox checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked === true)} disabled={!termsReachedEnd} />
              <span className="text-sm leading-6 text-foreground">Jag har läst och godkänner portalvillkoren.</span>
            </label>

            <label className="flex items-start gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/10 p-4">
              <Checkbox checked={acceptPrivacy} onCheckedChange={(checked) => setAcceptPrivacy(checked === true)} disabled={!privacyReachedEnd} />
              <span className="text-sm leading-6 text-foreground">Jag har tagit del av integritetspolicyn.</span>
            </label>

            <label className="flex items-start gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/10 p-4">
              <Checkbox checked={acceptNotice} onCheckedChange={(checked) => setAcceptNotice(checked === true)} />
              <span className="text-sm leading-6 text-foreground">Jag bekräftar att jag är minst 18 år, myndig och förstår att portalen är vårt interna teamlager och inte Zinzinos officiella plattform.</span>
            </label>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-border/70 bg-accent/50 p-4">
            <p className="text-sm leading-6 text-subtle">
              Godkännandet sparas med tidsstämpel och versionsnummer för villkor och integritetspolicy.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="button"
              className="h-11 rounded-xl"
              disabled={previewMode || !canSubmit || acceptMutation.isPending}
              onClick={() => acceptMutation.mutate()}
            >
              {previewMode ? "Previewläge" : acceptMutation.isPending ? "Sparar..." : "Jag har läst och godkänner"}
            </Button>
            {previewMode ? (
              <p className="text-sm leading-6 text-subtle">Det här är en förhandsvisning. Godkännandet sparas inte från adminläget.</p>
            ) : (
              <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => void signOutPortalUser()}>
                Logga ut
              </Button>
            )}
            {status ? <p className="text-sm leading-6 text-subtle">{status}</p> : null}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default PartnerLegalAcceptancePage;
