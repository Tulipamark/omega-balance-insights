import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Link2, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getDemoPartnerOptions, getPortalAccessState, sendMagicLink } from "@/lib/omega-data";

const demoPartners = getDemoPartnerOptions();

const DashboardLoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const accessQuery = useQuery({
    queryKey: ["portal-access"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured,
  });

  const reasonMessage = useMemo(() => {
    const reason = searchParams.get("reason");
    const activeEmail = searchParams.get("email");

    if (reason === "profile-missing") {
      return activeEmail
        ? `You are signed in as ${activeEmail}, but no dashboard profile exists in OmegaBalance users yet. Ask an admin to create or connect your profile first.`
        : "You are signed in, but no dashboard profile exists in OmegaBalance users yet. Ask an admin to create or connect your profile first.";
    }

    if (reason === "auth-required") {
      return "Sign in to continue to the dashboard.";
    }

    return null;
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await sendMagicLink(email);
      setStatus("Magic link sent. Open the email and you will land directly in the dashboard.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send the login link.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSupabaseConfigured && accessQuery.data?.portalUser) {
    return <Navigate to={accessQuery.data.portalUser.role === "admin" ? "/dashboard/admin" : "/dashboard/partner"} replace />;
  }

  return (
    <div className="min-h-screen bg-hero px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-border/70 bg-white/90 p-8 shadow-elevated md:p-10">
          <p className="badge-accent inline-flex rounded-full px-4 py-1.5 text-sm font-medium">OmegaBalance Backoffice</p>
          <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Ett gemensamt dashboard för admin och partners
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-subtle">
            Samma webbplats, samma datamodell och tydlig attribution från första klick till lead, kund och partnerteam.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Admin följer leads, kunder, partneransökningar och nätverk från ett ställe.",
              "Partners ser endast sina egna leads, kunder, klick och direktrekryterade partners.",
              "Referral codes sparas i browsern och skickas vidare till formulären.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-secondary/40 p-4">
                <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                <p className="text-sm leading-6 text-foreground/85">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border/70 bg-card p-8 shadow-elevated md:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Access</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Sign in</h2>
            </div>
            <Link to="/sv" className="text-sm text-primary transition-colors hover:text-primary/80">
              Till sajten
            </Link>
          </div>

          {isSupabaseConfigured ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {reasonMessage ? (
                <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  {reasonMessage}
                </div>
              ) : null}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Email</span>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="partner@omegabalance.se"
                />
              </label>
              <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl">
                {submitting ? "Sending..." : "Send magic link"}
              </Button>
              {status ? <p className="text-sm leading-6 text-subtle">{status}</p> : null}
              {accessQuery.data?.authUser && !accessQuery.data.portalUser ? (
                <p className="text-sm leading-6 text-subtle">
                  Auth session found for <span className="font-medium text-foreground">{accessQuery.data.authUser.email || "this account"}</span>,
                  but the dashboard profile is still missing.
                </p>
              ) : null}
            </form>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-primary/35 bg-accent/50 p-5">
              <p className="text-sm leading-6 text-foreground/85">
                Supabase environment variables are not configured yet. Demo shortcuts below let you review the dashboard structure
                before wiring up the live project.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/admin?demo=admin")}
              className="rounded-[1.5rem] border border-border/70 bg-white/95 p-5 text-left shadow-card transition-transform hover:-translate-y-0.5"
            >
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Demo</p>
              <p className="mt-3 font-serif text-2xl font-semibold tracking-tight">Admin dashboard</p>
              <p className="mt-2 text-sm leading-6 text-subtle">Overview, attribution tables and latest partner applications.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Open demo <ArrowRight className="h-4 w-4" />
              </span>
            </button>

            <div className="rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Partner demos</p>
              <div className="mt-4 space-y-3">
                {demoPartners.map((partner) => (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => navigate(`/dashboard/partner?demo=partner&partnerId=${partner.id}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-border/70 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <div>
                      <p className="font-medium text-foreground">{partner.name}</p>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{partner.referral_code}</p>
                    </div>
                    <Link2 className="h-4 w-4 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardLoginPage;
