'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRegion } from './use-region';

interface CartRegionState {
  showRegionPrompt: boolean;
  setShowRegionPrompt: (show: boolean) => void;
  checkRegionSelection: () => boolean;
}

export const useCartRegion = create<CartRegionState>()(
  persist(
    (set) => ({
      showRegionPrompt: false,
      setShowRegionPrompt: (show) => set({ showRegionPrompt: show }),
      checkRegionSelection: () => {
        const { selectedRegion } = useRegion.getState();
        
        // Always show prompt if no region is selected
        if (!selectedRegion) {
          set({ showRegionPrompt: true });
          return false;
        }

        return true;
      },
    }),
    {
      name: 'cart-region-storage',
    }
  )
);