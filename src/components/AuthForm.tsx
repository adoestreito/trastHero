"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabase();

    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          setMessage("Account created. You're signed in.");
        } else {
          setMessage(
            "Account created. Check your email to confirm your address, then sign in."
          );
          setMode("sign-in");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
            setMessage(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "sign-in"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
            setMessage(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "sign-up"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {mode === "sign-in" ? "Family sign in" : "Create family account"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {mode === "sign-in"
            ? "Use the email and password your family set up."
            : "Each family member can create their own account."}
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Email
            </span>
            <input
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Password
            </span>
            <input
              className={inputClass}
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {busy
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
