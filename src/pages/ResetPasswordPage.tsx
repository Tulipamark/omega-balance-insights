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
      setStatus("Supabase is not configured.");
      return;
    }

    if (password.length < 8) {
      setStatus("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      setStatus("Password updated. Redirecting to login...");
      window.history.replaceState({}, document.title, "/auth/reset-password");
      setTimeout(() => navigate("/dashboard/login", { replace: true }), 1200);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update password.");
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
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Backoffice access</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Set new password</h1>
          </div>
          <Link to="/sv" className="text-sm text-primary transition-colors hover:text-primary/80">
            Till sajten
          </Link>
        </div>

        {!isRecoveryLink ? (
          <div className="mt-8 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            No active recovery session was found. Open the password recovery link from your email again.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">New password</span>
              <Input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl"
                placeholder="At least 8 characters"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Confirm password</span>
              <Input
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-xl"
                placeholder="Repeat the new password"
              />
            </label>
            <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl">
              {submitting ? "Saving..." : "Save new password"}
            </Button>
            {status ? <p className="text-sm leading-6 text-subtle">{status}</p> : null}
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
