import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grantBetaAccess, getBetaAccessCodeHint, isBetaAccessGranted, isValidBetaAccessCode } from "@/lib/beta-access";

const BetaEntryPage = () => {
  const location = useLocation();
  const [accessCode, setAccessCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [granted, setGranted] = React.useState(() => isBetaAccessGranted());
  const redirectPath =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/";

  if (granted) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidBetaAccessCode(accessCode)) {
      setError("That access code did not match. Try again.");
      return;
    }

    grantBetaAccess();
    setGranted(true);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef7f0_0%,#f7f4ec_48%,#f3efe5_100%)] px-4 py-10 text-foreground md:px-6 md:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <section className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-sm font-medium text-foreground/70 shadow-sm">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Private preview
            </span>
            <h1 className="mt-6 max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Access the new
              {" "}
              <span className="text-primary">InsideBalance</span>
              {" "}
              preview
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-foreground/70 md:text-lg">
              This live environment is currently protected while we redesign and develop the next version of the site.
              Enter your InsideBalance access code to continue.
            </p>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white/88 p-6 shadow-[0_24px_60px_rgba(31,41,55,0.08)] backdrop-blur md:p-8">
            <div className="rounded-[1.5rem] border border-[#e6dfd0] bg-[#faf8f2] p-6 md:p-7">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-foreground/50">Access</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground md:text-[2.2rem]">
                Enter your InsideBalance access code
              </h2>
              <p className="mt-3 text-sm leading-7 text-foreground/65 md:text-base">
                Use your access code to continue into InsideBalance.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="access-code" className="text-sm font-medium text-foreground/80">
                    Access Code
                  </label>
                  <Input
                    id="access-code"
                    type="text"
                    autoComplete="off"
                    inputMode="text"
                    placeholder={getBetaAccessCodeHint()}
                    value={accessCode}
                    onChange={(event) => {
                      setAccessCode(event.target.value.toUpperCase());
                      if (error) {
                        setError("");
                      }
                    }}
                    className="h-14 rounded-2xl border-[#d9d1c3] bg-white px-4 text-base tracking-[0.2em] placeholder:tracking-[0.2em]"
                  />
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button type="submit" className="h-14 w-full rounded-2xl text-base font-medium">
                  Continue
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default BetaEntryPage;
