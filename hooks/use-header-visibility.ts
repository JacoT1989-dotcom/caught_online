'use client';

import { useState, useEffect } from 'react';

export function useHeaderVisibility(threshold = 200) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlVisibility = () => {
      const currentScrollY = window.scrollY;

      // Show header when:
      // 1. Scrolling up (current scroll position is less than last scroll position)
      // 2. At the top of the page (within threshold)
      if (currentScrollY < lastScrollY || currentScrollY < threshold) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down past threshold
      else if (currentScrollY > lastScrollY && currentScrollY > threshold) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlVisibility, { passive: true });
    return () => window.removeEventListener('scroll', controlVisibility);
  }, [lastScrollY, threshold]);

  return isVisible;
}