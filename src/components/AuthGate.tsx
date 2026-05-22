"use client";

import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";

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
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            TrastHero
          </h1>
          <p className="mt-1 text-muted">
            Family storage room inventory — sign in to continue
          </p>
        </header>
        <AuthForm />
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
