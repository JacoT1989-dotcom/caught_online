'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VIDEO_URLS } from '@/lib/constants/videos';

interface VideoState {
  currentVideo: string | null;
  setCurrentVideo: (video: string) => void;
  getVideoUrl: (category: keyof typeof VIDEO_URLS, key: string) => string;
}

export const useVideos = create<VideoState>()(
  persist(
    (set, get) => ({
      currentVideo: null,
      setCurrentVideo: (video) => set({ currentVideo: video }),
      getVideoUrl: (category, key) => {
        const videos = VIDEO_URLS[category] as Record<string, string>;
        return videos[key] || '';
      },
    }),
    {
      name: 'video-storage',
    }
  )
);