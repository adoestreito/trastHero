"use client";

import { AppLayout } from "@/components/AppLayout";
import { AuthGate } from "@/components/AuthGate";
import { InventoryApp } from "@/components/InventoryApp";
import { AuthProvider } from "@/components/AuthProvider";

export default function Home() {
  return (
    <AuthProvider>
      <AuthGate>
        {({ userEmail, onSignOut }) => (
          <AppLayout
            userEmail={userEmail}
            onSignOut={onSignOut}
            title="Tu trastero"
            subtitle="Encuentra lo que necesitas en tu trastero"
          >
            <InventoryApp />
          </AppLayout>
        )}
      </AuthGate>
    </AuthProvider>
  );
}
