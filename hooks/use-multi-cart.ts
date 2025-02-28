"use client";

import { create } from "zustand";
import { useCart } from "./use-cart";
import { useSubscriptionToggle } from "./use-subscription-toggle";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  variantId?: string;
  availableForSale?: boolean;
}

interface MultiCartStore {
  selectedProducts: Map<string, Product>;
  toggleProduct: (productId: string, productDetails: Product) => void;
  clearSelection: () => void;
  addSelectedToCart: () => void;
}

export const useMultiCart = create<MultiCartStore>((set, get) => ({
  selectedProducts: new Map(),

  toggleProduct: (productId: string, productDetails: Product) => {
    set((state) => {
      const newSelection = new Map(state.selectedProducts);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
      } else {
        newSelection.set(productId, productDetails);
      }
      return { selectedProducts: newSelection };
    });
  },

  clearSelection: () => set({ selectedProducts: new Map() }),

  addSelectedToCart: () => {
    const { selectedProducts, clearSelection } = get();
    const { addItem } = useCart.getState();
    const { isSubscriptionMode, selectedInterval, getDiscount } =
      useSubscriptionToggle.getState();

    selectedProducts.forEach((product) => {
      const finalPrice = isSubscriptionMode
        ? product.price * (1 - getDiscount())
        : product.price;

      addItem({
        id: product.id,
        title: product.title,
        price: finalPrice,
        image: product.image,
        variantId: product.variantId || product.id, // Adding the missing variantId property
        quantity: 1,
        subscription: isSubscriptionMode ? selectedInterval : undefined,
      });
    });

    const count = selectedProducts.size;
    const subscriptionText = isSubscriptionMode ? " subscription" : "";

    toast.success(
      `Added ${count} item${count > 1 ? "s" : ""}${subscriptionText} to cart`
    );
    clearSelection();
  },
}));
