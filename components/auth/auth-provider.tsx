"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart, CartItem } from "@/hooks/use-cart";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, user } = useAuth();
  const cart = useCart();

  // Track if cart has loaded
  const cartLoadedRef = useRef(false);

  // Use a ref to store userId for persistence across renders
  const userIdRef = useRef<string | null>(null);

  // Track the last saved cart state to avoid unnecessary saves
  const lastSavedCartRef = useRef<string>("");

  // Use a ref to track unload listener added state
  const unloadListenerAddedRef = useRef(false);

  // Handle authentication state changes and cart loading
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Store user ID in ref for later use (especially during unload)
      userIdRef.current = user.id;

      // Only load cart once per session
      if (!cartLoadedRef.current) {
        console.log("[Auth] Loading cart for user:", user.id);
        cartLoadedRef.current = true;

        // Load cart from localStorage
        try {
          const storageKey = `user-cart-${user.id}`;
          const savedCartData = localStorage.getItem(storageKey);

          if (savedCartData) {
            const savedCart = JSON.parse(savedCartData);

            if (savedCart && savedCart.items && savedCart.items.length > 0) {
              console.log(
                "[Auth] Found saved cart with",
                savedCart.items.length,
                "items"
              );

              // Clear current cart first
              cart.clearCart();

              // Add each item to the cart
              savedCart.items.forEach((item: any) => {
                // Ensure the item has a variantId before adding it to the cart
                if (!item.variantId) {
                  item.variantId = item.id;
                }
                cart.addItem(item as CartItem);
              });

              // Update last saved cart state
              lastSavedCartRef.current = JSON.stringify(savedCart.items);

              console.log("[Auth] Cart loaded successfully");
            }
          }
        } catch (error) {
          console.error("[Auth] Error loading cart from localStorage:", error);
        }
      }

      // Add beforeunload event listener to save cart before page unload
      // This is crucial for Shopify auth which redirects for logout
      if (!unloadListenerAddedRef.current) {
        const handleBeforeUnload = () => {
          // Save cart to localStorage before page unloads
          if (userIdRef.current) {
            try {
              // Always save the cart state, even if empty
              // This ensures deleted items stay deleted
              const storageKey = `user-cart-${userIdRef.current}`;
              const cartData = {
                items: cart.items,
                total: cart.total,
              };
              localStorage.setItem(storageKey, JSON.stringify(cartData));
              console.log("[Auth] Saved cart to localStorage before unload");
            } catch (error) {
              console.error("[Auth] Error saving cart before unload:", error);
            }
          }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        unloadListenerAddedRef.current = true;

        // Return cleanup function
        return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
          unloadListenerAddedRef.current = false;
        };
      }
    } else if (!isAuthenticated) {
      // Reset cart loaded state when logged out
      cartLoadedRef.current = false;
      userIdRef.current = null;
      lastSavedCartRef.current = "";

      // Clear cart when logged out
      if (cart.items.length > 0) {
        cart.clearCart();
      }
    }
  }, [isAuthenticated, user, cart]);

  // Handle cart changes to save to localStorage
  useEffect(() => {
    // Always save cart changes for logged in users
    // including when cart becomes empty (items deleted)
    if (isAuthenticated && user?.id) {
      try {
        const currentCartState = JSON.stringify(cart.items);

        // Only save if the cart state has actually changed
        if (currentCartState !== lastSavedCartRef.current) {
          const storageKey = `user-cart-${user.id}`;
          const cartData = {
            items: cart.items,
            total: cart.total,
          };
          localStorage.setItem(storageKey, JSON.stringify(cartData));

          // Update last saved state
          lastSavedCartRef.current = currentCartState;

          console.log(
            "[Auth] Cart saved to localStorage",
            cart.items.length > 0
              ? `with ${cart.items.length} items`
              : "(empty cart)"
          );
        }
      } catch (error) {
        console.error("[Auth] Error saving cart to localStorage:", error);
      }
    }
  }, [isAuthenticated, user, cart.items, cart.total]);

  return <>{children}</>;
}
