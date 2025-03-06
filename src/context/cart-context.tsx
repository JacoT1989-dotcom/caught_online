"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { syncCartWithShopify } from "@/lib/shopify/cart-sync";

// Define the cart item type
export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variantId: string;
}

// Define the cart context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

// Create the context
const CartContext = createContext<CartContextType | null>(null);

// Define the provider props type
interface CartProviderProps {
  children: React.ReactNode;
}

// Create the provider component
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Calculate total
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Cart operations
  const addItem = (newItem: CartItem) => {
    setItems((current) => {
      const existingItemIndex = current.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...current];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add it
        return [...current, newItem];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Sync with Shopify when cart changes
  useEffect(() => {
    if (isSyncing) return;

    const timeoutId = setTimeout(() => {
      const doSync = async () => {
        setIsSyncing(true);
        try {
          const shopifyItems = items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          }));

          await syncCartWithShopify(shopifyItems);
        } finally {
          setIsSyncing(false);
        }
      };

      doSync();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [items, isSyncing]);

  // Load cart from local storage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart from storage:", error);
      }
    }
  }, []);

  // Save cart to local storage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Create the context value
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Create the hook to use the context
export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
