"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { CheckoutDialog } from "@/components/checkout/checkout-dialog";

interface CartIntegrationProps {
  children: React.ReactNode;
}

// Most minimal cart integration - only uses clearCart
export function CartIntegration({ children }: CartIntegrationProps) {
  const { user, isAuthenticated } = useAuth();
  const cart = useCart();

  // Track previous user ID
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get current user ID
    const currentUserId = isAuthenticated && user?.id ? user.id : null;

    // Log for debugging

    // Check if user ID changed
    if (prevUserIdRef.current !== currentUserId) {
      // Use window.location.reload() as a last resort if needed
      // This is a more drastic approach but will ensure the cart loads correctly
      // Uncomment this if the solution doesn't work without it
      // setTimeout(() => window.location.reload(), 100);
    }

    // Update ref for next comparison
    prevUserIdRef.current = currentUserId;
  }, [isAuthenticated, user]);

  return (
    <>
      <CheckoutDialog />
      {children}
    </>
  );
}
