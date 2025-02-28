"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Update the CartItem interface to mark variantId as required
export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  subscription?: string | null;
  variantId: string; // Required for Shopify checkout
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

interface CartStore extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setIsOpen: (open: boolean) => void;
  clearCart: () => void;
  // New function to fix missing variant IDs
  ensureVariantIds: () => void;
}

// Function to convert product ID to variant ID
function getVariantIdFromProductId(productId: string): string {
  if (!productId) return "";

  // If it's already a variant ID, return it
  if (productId.includes("ProductVariant")) {
    return productId;
  }

  // Extract the numeric part of the product ID
  const idMatch = productId.match(/\/Product\/([^/]+)/);
  if (idMatch && idMatch[1]) {
    return `gid://shopify/ProductVariant/${idMatch[1]}`;
  }

  return productId;
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Create the cart store with standard localStorage
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      total: 0,

      // New function to fix missing variant IDs in cart items
      ensureVariantIds: () => {
        const currentItems = get().items;
        const itemsWithVariantIds = currentItems.map((item) => {
          // If item already has a variantId, keep it
          if (item.variantId) {
            return item;
          }

          // Otherwise, derive it from the product ID
          return {
            ...item,
            variantId: getVariantIdFromProductId(item.id),
          };
        });

        set({
          items: itemsWithVariantIds,
        });

        console.log("Fixed variant IDs for cart items:", itemsWithVariantIds);
      },

      addItem: (item) => {
        // Ensure the item has a variant ID
        if (!item.variantId) {
          console.warn(
            "Item added without variant ID, deriving from product ID:",
            item.title
          );
          item = {
            ...item,
            variantId: getVariantIdFromProductId(item.id),
          };
        }

        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);

        if (existingItem) {
          const updatedItems = currentItems.map((i) =>
            i.id === item.id
              ? {
                  ...item,
                  quantity: i.quantity + (item.quantity || 1),
                }
              : i
          );
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          });
        } else {
          const newItems = [...currentItems, item];
          set({
            items: newItems,
            total: calculateTotal(newItems),
          });
        }

        // Save to user-specific storage if logged in
        saveCartToUserStorage(get());
      },

      removeItem: (id) => {
        const filteredItems = get().items.filter((i) => i.id !== id);
        set({
          items: filteredItems,
          total: calculateTotal(filteredItems),
        });

        // Save to user-specific storage if logged in
        saveCartToUserStorage(get());
      },

      updateQuantity: (id, quantity) => {
        if (quantity === 0) {
          get().removeItem(id);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        });

        // Save to user-specific storage if logged in
        saveCartToUserStorage(get());
      },

      setIsOpen: (isOpen) => set({ isOpen }),

      clearCart: () => {
        set({
          items: [],
          total: 0,
        });

        // Save empty cart to user-specific storage if logged in
        saveCartToUserStorage({ items: [], isOpen: false, total: 0 });
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        // Fix variant IDs after rehydration
        if (state) {
          console.log("[Cart] Rehydrated from storage");
          // Schedule a fix for the next tick to ensure we have the full state
          setTimeout(() => {
            state.ensureVariantIds();
          }, 0);
        }
      },
    }
  )
);

// Helper functions for user-specific cart storage

// Get the current user ID
function getCurrentUserId(): string | null {
  try {
    if (typeof window === "undefined") return null;

    const authData = localStorage.getItem("auth-storage");
    if (!authData) return null;

    const parsedData = JSON.parse(authData);
    return parsedData?.state?.user?.id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

// Save cart to user-specific storage
function saveCartToUserStorage(cartState: CartState): void {
  try {
    if (typeof window === "undefined") return;

    const userId = getCurrentUserId();
    if (!userId) return; // Don't save if not logged in

    const storageKey = `user-cart-${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(cartState));
    console.log(`[Cart] Saved to user storage: ${storageKey}`);
  } catch (error) {
    console.error("Error saving user cart:", error);
  }
}

// Load cart from user-specific storage
export function loadUserCart(): CartState | null {
  try {
    if (typeof window === "undefined") return null;

    const userId = getCurrentUserId();
    if (!userId) return null; // Return null if not logged in

    const storageKey = `user-cart-${userId}`;
    const savedCart = localStorage.getItem(storageKey);

    if (!savedCart) return null;

    const parsedCart = JSON.parse(savedCart);
    console.log(`[Cart] Loaded from user storage: ${storageKey}`);

    return parsedCart;
  } catch (error) {
    console.error("Error loading user cart:", error);
    return null;
  }
}

// Clear cart when logging out (call this from your auth logout function)
export function clearCartOnLogout(): void {
  try {
    if (typeof window === "undefined") return;

    const cart = useCart.getState();
    cart.clearCart();

    console.log("[Cart] Cleared on logout");
  } catch (error) {
    console.error("Error clearing cart on logout:", error);
  }
}
