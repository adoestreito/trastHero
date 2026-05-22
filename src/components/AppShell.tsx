"use client";

import { AppLayout } from "@/components/AppLayout";
import { AuthGate } from "@/components/AuthGate";
import { InventoryApp } from "@/components/InventoryApp";

/** @deprecated Use AuthGate + AppLayout on each page instead. */
export function AppShell() {
  return (
    <AuthGate>
      {({ userEmail, onSignOut }) => (
        <AppLayout
          userEmail={userEmail}
          onSignOut={onSignOut}
          title="Inventory"
          subtitle="Family storage room inventory"
        >
          <InventoryApp />
        </AppLayout>
      )}
    </AuthGate>
  );
}
