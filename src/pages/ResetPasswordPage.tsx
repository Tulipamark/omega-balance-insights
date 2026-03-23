import { type FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRecoveryLink = useMemo(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return hashParams.get("type") === "recovery";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setStatus("Systemet är inte konfigurerat ännu.");
      return;
    }

    if (password.length < 8) {
      setStatus("Lösenordet måste vara minst 8 tecken långt.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Lösenorden matchar inte. Kontrollera att du skrev samma lösenord två gånger.");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      setStatus("success");
      window.history.replaceState({}, document.title, "/auth/reset-password");
      setTimeout(() => navigate("/dashboard/login", { replace: true }), 2000);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Det gick inte att uppdatera lösenordet. Försök igen eller begär en ny länk.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return (
    <div className="min-h-screen bg-hero px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-border/70 bg-card p-8 shadow-elevated md:p-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Åtkomst</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Nytt lösenord</h1>
          </div>
          <Link to="/sv" className="text-sm text-primary transition-colors hover:text-primary/80">
            Till sajten
          </Link>
        </div>

        {!isRecoveryLink ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <p className="font-medium">Länken är inte giltig</p>
              <p className="mt-2">
                Det ser ut som att du har kommit hit utan en återställningslänk. Gå tillbaka till inloggningen och
                klicka på &quot;Glömt lösenordet?&quot; för att begära en ny länk.
              </p>
            </div>
            <Link
              to="/dashboard/login"
              className="block text-center text-sm text-primary transition-colors hover:text-primary/80"
            >
              Tillbaka till inloggning
            </Link>
          </div>
        ) : status === "success" ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-green-300/70 bg-green-50 px-4 py-4 text-sm leading-6 text-green-900">
              <p className="font-medium">Lösenordet uppdaterat!</p>
              <p className="mt-2">Ditt nya lösenord är sparat. Du omdirigeras till inloggningen...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <p className="text-sm leading-6 text-subtle">Ange ett nytt lösenord för ditt OmegaBalance-konto.</p>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Nytt lösenord</span>
              <Input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl"
                placeholder="Minst 8 tecken"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Bekräfta lösenord</span>
              <Input
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-xl"
                placeholder="Upprepa lösenordet"
              />
            </label>
            <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl">
              {submitting ? "Sparar..." : "Spara nytt lösenord"}
            </Button>
            {status && status !== "success" ? (
              <div className="rounded-2xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
                {status}
              </div>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
