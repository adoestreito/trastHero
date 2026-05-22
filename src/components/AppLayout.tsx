"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { btnSecondary } from "@/lib/ui";

type AppLayoutProps = {
  userEmail: string;
  onSignOut: () => Promise<void>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const navLinkClass = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-accent text-white shadow-sm"
      : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
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
    <div className="stripe-mesh min-h-screen">
      <header className="stripe-nav sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            TrastHero
          </Link>

          <nav className="flex gap-1 rounded-full border border-border bg-card/80 p-1 shadow-stripe-sm">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[12rem] truncate text-sm text-muted sm:inline">
              {userEmail}
            </span>
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
              className={`${btnSecondary} !py-2 !text-xs`}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <div className="mb-10">
          <h1 className="stripe-heading">{title}</h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
            {subtitle}
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}
