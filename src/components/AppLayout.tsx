"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { btnSecondary } from "@/lib/ui";

type AppLayoutProps = {
  userEmail: string;
  onSignOut: () => Promise<void>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const navLinkClass = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-all ${
    active
      ? "fj-pill-active"
      : "text-muted fj-hover-surface hover:text-foreground"
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
    <div className="fj-mesh min-h-screen">
      <header className="fj-nav sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <span className="fj-badge-dot" aria-hidden />
            TrastHero
          </Link>

          <nav className="flex gap-1 rounded-full border border-border bg-card/60 p-1 shadow-fj-sm backdrop-blur-sm">
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
            <ThemeToggle className="hidden sm:flex" />
            <span className="hidden max-w-[12rem] truncate text-sm text-muted md:inline">
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
        <div className="mb-6 flex justify-end sm:hidden">
          <ThemeToggle />
        </div>

        <div className="mb-10">
          <span className="fj-badge mb-4">
            <span className="fj-badge-dot" aria-hidden />
            Family storage
          </span>
          <h1 className="fj-heading mt-3">{title}</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            {subtitle}
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}
