import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LockKeyhole } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      navigate("/dashboard", { replace: true });
    } catch {
      setErrorMessage("That email or password wasn't recognized. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="paper flex min-h-screen items-center justify-center bg-paper-deep px-4 py-8 text-ink sm:px-6">
      <section className="relative w-full max-w-[520px] overflow-hidden border-2 border-rule bg-paper px-6 py-8 shadow-paper sm:px-10 sm:py-10" aria-labelledby="admin-sign-in-title">
        <div aria-hidden="true" className="absolute inset-x-0 top-3 border-t-2 border-rule" />

        <div className="mb-7 flex items-center justify-between border-b border-rule pb-4">
          <p className="font-display text-xs font-semibold uppercase text-rule-text">Private Market Log</p>
          <LockKeyhole className="h-5 w-5 text-rule-text" aria-hidden="true" />
        </div>

        <header className="mb-8 text-center">
          <p className="font-hand text-2xl text-rule-text">For the keeper of the log</p>
          <h1 id="admin-sign-in-title" className="mt-1 font-display text-3xl font-bold uppercase sm:text-4xl">Admin Sign In</h1>
          <p className="mx-auto mt-3 max-w-sm text-lg leading-relaxed">Enter an approved admin account to view journey analytics.</p>
        </header>

        <form onSubmit={handleAuth} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-display text-sm font-semibold uppercase text-rule-text">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              aria-describedby={errorMessage ? "sign-in-error" : undefined}
              aria-invalid={Boolean(errorMessage)}
              className="min-h-12 border-2 border-ink bg-paper text-base text-ink placeholder:text-ink/85"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-display text-sm font-semibold uppercase text-rule-text">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              aria-describedby={errorMessage ? "sign-in-error" : undefined}
              aria-invalid={Boolean(errorMessage)}
              className="min-h-12 border-2 border-ink bg-paper text-base text-ink placeholder:text-ink/85"
            />
          </div>

          {errorMessage && <p id="sign-in-error" role="alert" className="border-l-4 border-rule pl-3 text-base font-semibold text-ink">{errorMessage}</p>}

          <Button type="submit" className="min-h-12 w-full bg-ink font-display text-base font-semibold uppercase text-paper hover:bg-ink/90" disabled={loading}>
            {loading ? "Signing In…" : "Sign In"}
          </Button>
        </form>

        <Link to="/" className="mt-7 flex min-h-11 items-center justify-center gap-2 font-display text-sm font-semibold uppercase text-rule-text underline decoration-rule underline-offset-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to Market Log
        </Link>
      </section>
    </main>
  );
};

export default Auth;
