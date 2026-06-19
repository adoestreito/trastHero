"use client";

import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

type AuthGateProps = {
  children: (props: {
    userEmail: string;
    onSignOut: () => Promise<void>;
  }) => React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="fj-mesh flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fj-mesh min-h-screen">
        <header className="fj-nav">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="fj-badge-dot" aria-hidden />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                TrastHero
              </span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-lg text-center">
            <span className="fj-badge">
              <span className="fj-badge-dot" aria-hidden />
              Built for your household
            </span>
            <h1 className="fj-heading-gradient mt-6">
              Know what&apos;s in your storage room
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Track inventory, expiration dates, and shopping lists — one
              shared hub for your family.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-md">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children({
        userEmail: user.email ?? "Signed in",
        onSignOut: signOut,
      })}
    </>
  );
}
