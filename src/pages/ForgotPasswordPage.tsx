import { type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (!supabase) {
      setStatus("error");
      setErrorMessage("Systemet är inte konfigurerat ännu.");
      return;
    }

    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("Ange din e-postadress.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setStatus("success");
      setSubmittedEmail(email);
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Det gick inte att skicka återställningslänken. Försök igen.",
      );
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
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Återställ lösenord</h1>
          </div>
          <Link to="/sv" className="text-sm text-primary transition-colors hover:text-primary/80">
            Till sajten
          </Link>
        </div>

        {status === "success" ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-green-300/70 bg-green-50 px-4 py-4 text-sm leading-6 text-green-900">
              <p className="font-medium">Länk skickad!</p>
              <p className="mt-2">
                Vi har skickat en återställningslänk till {submittedEmail}. Kontrollera din e-post, och titta gärna i
                skräpposten om mejlet inte syns direkt.
              </p>
            </div>
            <Button
              onClick={() => {
                setStatus("idle");
                setEmail("");
                setSubmittedEmail("");
              }}
              className="h-12 w-full rounded-xl"
              variant="outline"
            >
              Skicka länk till en annan adress
            </Button>
            <Link
              to="/dashboard/login"
              className="block text-center text-sm text-primary transition-colors hover:text-primary/80"
            >
              Tillbaka till inloggning
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <p className="text-sm leading-6 text-subtle">
              Ange e-postadressen för ditt konto, så skickar vi en länk där du kan ange ett nytt lösenord.
            </p>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">E-post</span>
              <Input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl"
                placeholder="partner@omegabalance.se"
                disabled={status === "loading"}
              />
            </label>
            {status === "error" && errorMessage ? (
              <div className="rounded-2xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
                {errorMessage}
              </div>
            ) : null}
            <Button type="submit" disabled={status === "loading"} className="h-12 w-full rounded-xl">
              {status === "loading" ? "Skickar..." : "Skicka återställningslänk"}
            </Button>
            <Link
              to="/dashboard/login"
              className="block text-center text-sm text-primary transition-colors hover:text-primary/80"
            >
              Eller gå tillbaka till inloggning
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
