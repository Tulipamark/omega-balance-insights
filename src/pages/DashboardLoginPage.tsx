import { type FormEvent, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getPortalAccessState, signInWithPassword } from "@/lib/omega-data";

const DashboardLoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await signInWithPassword(email, password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign in.");
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
            Inloggning för admin och partners
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-subtle">
            Här loggar du in för att få tillgång till din vy i OmegaBalance och följa upp leads, kunder och partnerutveckling.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Admin får en samlad överblick över leads, kunder, partneransökningar och nätverk.",
              "Partners ser bara det som hör till deras egen länk, deras leads och deras team.",
              "Allt är byggt för tydlig uppföljning utan onödig komplexitet.",
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
                <span className="mb-2 block text-sm font-medium text-foreground">User ID / email</span>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="partner@omegabalance.se"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Password</span>
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="••••••••"
                />
              </label>
              <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl">
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
              {status ? <p className="text-sm leading-6 text-subtle">{status}</p> : null}
              {accessQuery.data?.authUser && !accessQuery.data.portalUser ? (
                <p className="text-sm leading-6 text-subtle">
                  Auth session found for <span className="font-medium text-foreground">{accessQuery.data.authUser.email || "this account"}</span>,
                  but the dashboard profile is still missing.
                </p>
              ) : null}
              <p className="text-sm leading-6 text-subtle">
                Use the email/user ID and password that have been created for your backoffice account in Supabase Auth.
              </p>
            </form>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-primary/35 bg-accent/50 p-5">
              <p className="text-sm leading-6 text-foreground/85">
                Supabase environment variables are not configured yet. Demo shortcuts below let you review the dashboard structure
                before wiring up the live project.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardLoginPage;
