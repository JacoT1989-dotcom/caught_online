'use client';

import { create } from 'zustand';
import { useCart } from './use-cart';

interface CheckoutStore {
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetCheckout: () => void;
}

export const useCheckout = create<CheckoutStore>((set) => ({
  isCheckoutOpen: false,
  setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),
  resetCheckout: () => set({ currentStep: 1, isCheckoutOpen: false }),
}));