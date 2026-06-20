"use client";

import { AppLogo } from "@/components/AppLogo";
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
      <div className="fj-mesh flex min-h-screen flex-col items-center justify-center gap-4">
        <AppLogo size="md" href={null} priority />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fj-mesh min-h-screen">
        <header className="fj-nav">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-3 py-2 sm:px-6 sm:py-3">
            <AppLogo size="sm" priority />
            <ThemeToggle compact className="sm:hidden" />
            <ThemeToggle className="hidden sm:flex" />
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-lg text-center">
            <AppLogo
              size="lg"
              href={null}
              className="mx-auto"
              priority
            />
            <span className="fj-badge mt-6">
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
