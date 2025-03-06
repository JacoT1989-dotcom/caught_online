"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart, CartItem } from "@/hooks/use-cart";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, user } = useAuth();
  const cart = useCart();

  // Handle authentication state changes
  useEffect(() => {
    // Store previous auth state for comparison
    const prevAuthState = sessionStorage.getItem("prevAuthState");
    const currentAuthState = isAuthenticated
      ? `user-${user?.id || "unknown"}`
      : "logged-out";

    // Handle login (when previously logged out)
    if (isAuthenticated && user?.id && prevAuthState === "logged-out") {
      // Load user's saved cart directly from localStorage
      try {
        const storageKey = `user-cart-${user.id}`;
        const savedCartData = localStorage.getItem(storageKey);

        if (savedCartData) {
          const savedCart = JSON.parse(savedCartData);

          if (savedCart && savedCart.items && savedCart.items.length > 0) {
            // Clear current cart first
            cart.clearCart();

            // Add each item to the cart
            savedCart.items.forEach((item: any) => {
              // Ensure the item has a variantId before adding it to the cart
              if (!item.variantId) {
                // Use the getVariantIdFromProductId function or a similar approach
                item.variantId = item.id;
              }
              cart.addItem(item as CartItem);
            });
          }
        }
      } catch (error) {
        console.error("[Auth] Error loading user cart:", error);
      }
    }

    // Handle logout (when previously logged in)
    if (!isAuthenticated && prevAuthState && prevAuthState !== "logged-out") {
      // Clear the cart on logout
      cart.clearCart();
    }

    // Save current auth state for next comparison
    sessionStorage.setItem("prevAuthState", currentAuthState);
  }, [isAuthenticated, user, cart]);

  // Handle cart changes to save user cart
  useEffect(() => {
    // Only save cart if user is logged in
    if (isAuthenticated && user?.id && cart.items.length > 0) {
      try {
        const storageKey = `user-cart-${user.id}`;
        const cartData = {
          items: cart.items,
          total: cart.total,
        };

        localStorage.setItem(storageKey, JSON.stringify(cartData));
      } catch (error) {
        console.error("[Auth] Error saving cart to user storage:", error);
      }
    }
  }, [isAuthenticated, user, cart.items, cart.total]);

  return <>{children}</>;
}
