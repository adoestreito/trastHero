"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AppLayoutProps = {
  userEmail: string;
  onSignOut: () => Promise<void>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const navLinkClass = (active: boolean) =>
  `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-accent text-white"
      : "text-muted hover:bg-background hover:text-foreground"
  }`;

export function AppLayout({
  userEmail,
  onSignOut,
  title,
  subtitle,
  children,
}: AppLayoutProps) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            TrastHero
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <nav className="flex gap-1 rounded-lg border border-border bg-card p-1">
            <Link href="/" className={navLinkClass(pathname === "/")}>
              Inventory
            </Link>
            <Link
              href="/shopping-list"
              className={navLinkClass(pathname === "/shopping-list")}
            >
              Shopping list
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{userEmail}</span>
            <button
              type="button"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                try {
                  await onSignOut();
                } finally {
                  setSigningOut(false);
                }
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-background disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
