"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

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
  addItem: (item: CartItem) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setIsOpen: (open: boolean) => void;
  clearCart: () => void;
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
      },

      addItem: (item) => {
        // Ensure the item has a variant ID
        if (!item.variantId) {
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

        return true; // Always return true
      },

      removeItem: (id) => {
        const filteredItems = get().items.filter((i) => i.id !== id);
        set({
          items: filteredItems,
          total: calculateTotal(filteredItems),
        });

        // Try to save to user-specific storage if logged in
        try {
          saveCartToUserStorage(get());
        } catch (error) {
          // Ignore errors
        }
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

        // Try to save to user-specific storage if logged in
        try {
          saveCartToUserStorage(get());
        } catch (error) {
          // Ignore errors
        }
      },

      setIsOpen: (isOpen) => set({ isOpen }),

      clearCart: () => {
        set({
          items: [],
          total: 0,
        });

        // Try to save empty cart to user-specific storage if logged in
        try {
          saveCartToUserStorage({ items: [], isOpen: false, total: 0 });
        } catch (error) {
          // Ignore errors
        }
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        // Fix variant IDs after rehydration
        if (state) {
          // Schedule a fix for the next tick to ensure we have the full state
          setTimeout(() => {
            state.ensureVariantIds();
          }, 0);
        }
      },
    }
  )
);

// Get current user identifier based on localStorage
function getCurrentUserId(): string | null {
  try {
    if (typeof window === "undefined") return null;

    // Look for user cart keys in localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("user-cart-gid://shopify/Customer/")) {
        // Extract the customer ID from the key
        const customerId = key.replace("user-cart-gid://shopify/Customer/", "");
        return customerId;
      }
    }

    return null;
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

    let storageKey = `user-cart-gid://shopify/Customer/${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(cartState));
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

    let storageKey = `user-cart-gid://shopify/Customer/${userId}`;
    const savedCart = localStorage.getItem(storageKey);

    if (!savedCart) return null;

    const parsedCart = JSON.parse(savedCart);
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
  } catch (error) {
    console.error("Error clearing cart on logout:", error);
  }
}
