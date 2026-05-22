"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import {
  alertError,
  alertSuccess,
  btnPrimary,
  cardElevatedClass,
  inputClass,
} from "@/lib/ui";

type Mode = "sign-in" | "sign-up";

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

  const tabClass = (active: boolean) =>
    `flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-accent text-white shadow-sm"
        : "text-muted hover:text-foreground"
    }`;

  return (
    <div className="w-full">
      <div className="mb-6 flex rounded-full border border-border bg-card p-1 shadow-stripe-sm">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
            setMessage(null);
          }}
          className={tabClass(mode === "sign-in")}
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
          className={tabClass(mode === "sign-up")}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`${cardElevatedClass} p-8`}>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {mode === "sign-in" ? "Family sign in" : "Create family account"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {mode === "sign-in"
            ? "Use the email and password your family set up."
            : "Each family member can create their own account."}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-light">
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
            <span className="mb-1.5 block text-xs font-medium text-muted-light">
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
          <p role="alert" className={`mt-4 ${alertError}`}>
            {error}
          </p>
        )}

        {message && (
          <p className={`mt-4 ${alertSuccess}`}>{message}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={`mt-6 w-full ${btnPrimary} !py-3`}
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
