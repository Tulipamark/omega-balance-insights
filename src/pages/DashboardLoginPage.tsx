import { type FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getPortalAccessState, signInWithPassword, signOutPortalUser } from "@/lib/omega-data";

type DashboardLoginPageProps = {
  variant?: "partner" | "admin";
};

const DashboardLoginPage = ({ variant = "partner" }: DashboardLoginPageProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const forceLogin = searchParams.get("force_login") === "1";

  const accessQuery = useQuery({
    queryKey: ["portal-access"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const accessState = query.state.data;
      return accessState?.authUser && !accessState.portalUser ? 3000 : false;
    },
  });

  const reasonMessage = useMemo(() => {
    const reason = searchParams.get("reason");
    const activeEmail = searchParams.get("email");

    if (reason === "profile-missing") {
      return activeEmail
        ? `Du är inloggad som ${activeEmail}, men du har ännu inte tillgång till instrumentpanelen. Kontakta en admin för att få åtkomst.`
        : "Du är inloggad, men du har ännu inte tillgång till instrumentpanelen. Kontakta en admin för att få åtkomst.";
    }

    if (reason === "auth-required") {
      return "Logga in för att få tillgång till instrumentpanelen.";
    }

    return null;
  }, [searchParams]);

  const isAdminVariant = variant === "admin";
  const hasWrongRole =
    isAdminVariant &&
    accessQuery.isFetched &&
    !accessQuery.isFetching &&
    Boolean(accessQuery.data?.authUser) &&
    accessQuery.data?.portalUser?.role === "partner";
  const showWrongRoleBanner = hasWrongRole && !status;
  const introTitle = isAdminVariant ? "Admininloggning" : "Partnerinloggning";
  const introText = isAdminVariant
    ? "Här loggar du in för att arbeta vidare i OmegaBalance som administratör."
    : "Här loggar du in för att följa din länk, dina leads och din utveckling i OmegaBalance.";
  const featureList = isAdminVariant
    ? [
        "Följ upp leads, kunder och partneransökningar.",
        "Granska ansökningar och skapa verifierade partnerkonton.",
        "Allt är samlat på ett ställe.",
      ]
    : [
        "Se vad som kommer in via din länk.",
        "Följ leads och utveckling över tid.",
        "Allt är samlat på ett ställe.",
      ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await signInWithPassword(email, password);
      const result = await accessQuery.refetch();
      const role = result.data?.portalUser?.role;

      if (isAdminVariant && role !== "admin") {
        setStatus("Det här kontot har inte adminåtkomst.");
        return;
      }

      navigate(isAdminVariant ? "/dashboard/admin" : "/dashboard/partner", { replace: true });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Det gick inte att logga in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (
    isSupabaseConfigured &&
    !forceLogin &&
    accessQuery.isFetched &&
    !accessQuery.isFetching &&
    accessQuery.data?.portalUser &&
    (!isAdminVariant || accessQuery.data.portalUser.role === "admin")
  ) {
      return (
        <Navigate
          to={
            isAdminVariant
              ? "/dashboard/admin"
              : "/dashboard/partner"
          }
          replace
        />
      );
  }

  return (
    <div className="min-h-screen bg-hero px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-border/70 bg-white/90 p-8 shadow-elevated md:p-10">
          <p className="badge-accent inline-flex rounded-full px-4 py-1.5 text-sm font-medium">
            OmegaBalance Backoffice
          </p>
          <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {introTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-subtle">
            {introText}
          </p>

          <div className="mt-8 space-y-4">
            {featureList.map((item) => (
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
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Åtkomst</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                {isAdminVariant ? "Adminåtkomst" : "Logga in"}
              </h2>
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
              {forceLogin ? (
                <div className="rounded-2xl border border-sky-300/70 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">
                  Automatisk redirect är pausad här så att du kan bryta en fastnad session eller logga in på nytt.
                </div>
              ) : null}
              {showWrongRoleBanner ? (
                <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  Du är redan inloggad med ett partnerkonto. Logga ut först om du vill byta till ett adminkonto.
                </div>
              ) : null}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">E-post</span>
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
                <span className="mb-2 block text-sm font-medium text-foreground">Lösenord</span>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 rounded-xl pr-12"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Dölj lösenord" : "Visa lösenord"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl">
                {submitting ? "Loggar in..." : "Logga in"}
              </Button>
              {status ? <p className="text-sm leading-6 text-subtle">{status}</p> : null}
              <p className="text-sm leading-6 text-subtle">
                {isAdminVariant
                  ? "Logga in med din e-postadress och lösenordet för ditt adminkonto."
                  : "Logga in med din e-postadress och lösenordet för ditt backoffice-konto."}
              </p>
              {accessQuery.data?.authUser && !accessQuery.data.portalUser ? (
                <p className="text-sm leading-6 text-subtle">
                  Vi hittade din inloggning för{" "}
                  <span className="font-medium text-foreground">{accessQuery.data.authUser.email || "ditt konto"}</span>
                  , men du har ännu inte åtkomst till instrumentpanelen. Kontakta en admin.
                </p>
              ) : null}
              {showWrongRoleBanner ? (
                <Button type="button" variant="outline" className="h-12 w-full rounded-xl" onClick={() => void signOutPortalUser()}>
                  Logga ut och byt konto
                </Button>
              ) : null}
              {forceLogin && accessQuery.data?.authUser ? (
                <Button type="button" variant="outline" className="h-12 w-full rounded-xl" onClick={() => void signOutPortalUser()}>
                  Logga ut befintlig session
                </Button>
              ) : null}
              <div className="flex items-center justify-between">
                <Link to="/auth/forgot-password" className="text-sm text-primary transition-colors hover:text-primary/80">
                  Glömt lösenordet?
                </Link>
              </div>
            </form>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-primary/35 bg-accent/50 p-5">
              <p className="text-sm leading-6 text-foreground/85">
                Instrumentpanelen är inte helt konfigurerad ännu. Du kan utforska strukturen i demolägena nedan innan systemet är helt etablerat.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardLoginPage;
