'use client';

import { create } from 'zustand';

interface MediaPlaybackStore {
  currentlyPlaying: string | null;
  setCurrentlyPlaying: (id: string | null) => void;
  stopAll: () => void;
}

export const useMediaPlayback = create<MediaPlaybackStore>((set) => ({
  currentlyPlaying: null,
  setCurrentlyPlaying: (id) => set({ currentlyPlaying: id }),
  stopAll: () => set({ currentlyPlaying: null }),
}));