"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "@/components/AppLogo";
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
  `rounded-full px-2.5 py-1 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm ${
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

  const nav = (
    <nav className="flex w-full gap-0.5 rounded-full border border-border bg-card/60 p-0.5 shadow-fj-sm backdrop-blur-sm sm:w-auto sm:gap-1 sm:p-1">
      <Link href="/" className={`flex-1 text-center sm:flex-none ${navLinkClass(pathname === "/")}`}>
        Inventory
      </Link>
      <Link
        href="/shopping-list"
        className={`flex-1 text-center sm:flex-none ${navLinkClass(pathname === "/shopping-list")}`}
      >
        Shopping list
      </Link>
    </nav>
  );

  return (
    <div className="fj-mesh min-h-screen">
      <header className="fj-nav sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-3 py-2 sm:px-6 sm:py-3">
          <div className="flex flex-col gap-2 sm:hidden">
            <div className="flex items-center justify-between gap-2">
              <AppLogo size="sm" priority />
              <div className="flex items-center gap-1.5">
                <ThemeToggle compact />
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
                  className={`${btnSecondary} !px-2.5 !py-1 !text-[11px]`}
                >
                  {signingOut ? "…" : "Sign out"}
                </button>
              </div>
            </div>
            {nav}
          </div>

          <div className="hidden flex-wrap items-center justify-between gap-4 sm:flex">
            <AppLogo size="md" priority />

            {nav}

            <div className="flex items-center gap-3">
              <ThemeToggle />
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
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 pb-12 pt-3 sm:px-6 sm:pb-16 sm:pt-10">
        <div className="mb-4 sm:mb-10">
          <span className="fj-badge mb-4 hidden sm:inline-flex">
            <span className="fj-badge-dot" aria-hidden />
            Family storage
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:fj-heading sm:mt-3">
            {title}
          </h1>
          <p className="mt-3 hidden max-w-xl text-base leading-relaxed text-muted sm:block">
            {subtitle}
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}
