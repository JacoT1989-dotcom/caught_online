'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Region = 'cape-town' | 'johannesburg' | 'pretoria' | 'durban';

interface RegionStore {
  selectedRegion: Region | null;
  setRegion: (region: Region) => void;
  resetRegion: () => void;
}

export const useRegion = create<RegionStore>()(
  persist(
    (set) => ({
      selectedRegion: null,
      setRegion: (region) => set({ selectedRegion: region }),
      resetRegion: () => set({ selectedRegion: null }),
    }),
    {
      name: 'region-storage',
    }
  )
);