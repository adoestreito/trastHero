"use client";

import { AppLayout } from "@/components/AppLayout";
import { AuthGate } from "@/components/AuthGate";
import { ShoppingListApp } from "@/components/ShoppingListApp";
import { AuthProvider } from "@/components/AuthProvider";

export default function ShoppingListPage() {
  return (
    <AuthProvider>
      <AuthGate>
        {({ userEmail, onSignOut }) => (
          <AppLayout
            userEmail={userEmail}
            onSignOut={onSignOut}
            title="Shopping list"
            subtitle="Things to buy for the storage room"
          >
            <ShoppingListApp />
          </AppLayout>
        )}
      </AuthGate>
    </AuthProvider>
  );
}
