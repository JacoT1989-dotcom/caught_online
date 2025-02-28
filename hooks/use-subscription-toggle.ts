'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SUBSCRIPTION_PLANS } from '@/lib/types/subscription';
import type { SubscriptionInterval } from '@/lib/types/subscription';

interface SubscriptionToggleStore {
  isSubscriptionMode: boolean;
  selectedInterval: SubscriptionInterval | null;
  toggle: () => void;
  setInterval: (interval: SubscriptionInterval | 'none') => void;
  getDiscount: () => number;
  reset: () => void;
}

export const useSubscriptionToggle = create<SubscriptionToggleStore>()(
  persist(
    (set, get) => ({
      isSubscriptionMode: false,
      selectedInterval: null,
      toggle: () => set((state) => ({ 
        isSubscriptionMode: !state.isSubscriptionMode,
        selectedInterval: !state.isSubscriptionMode ? 'monthly' : null
      })),
      setInterval: (interval) => set({ 
        selectedInterval: interval === 'none' ? null : interval,
        isSubscriptionMode: interval !== 'none'
      }),
      getDiscount: () => {
        const { selectedInterval } = get();
        if (!selectedInterval || !SUBSCRIPTION_PLANS[selectedInterval]) return 0;
        return SUBSCRIPTION_PLANS[selectedInterval].discount;
      },
      reset: () => set({
        isSubscriptionMode: false,
        selectedInterval: null
      }),
    }),
    {
      name: 'subscription-toggle',
      partialize: (state) => ({
        isSubscriptionMode: state.isSubscriptionMode,
        selectedInterval: state.selectedInterval,
      }),
    }
  )
);