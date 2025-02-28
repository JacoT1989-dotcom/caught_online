'use client';

import { useState, useEffect } from 'react';

interface ScrollState {
  y: number;
  lastY: number;
  direction: 'up' | 'down' | null;
}

export function useScroll(threshold = 50) {
  const [scroll, setScroll] = useState<ScrollState>({
    y: 0,
    lastY: 0,
    direction: null,
  });

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const direction = currentY > lastScrollY ? 'down' : 'up';

          // Show navigation when:
          // 1. At the top of the page
          // 2. Scrolling up
          if (currentY < threshold || direction === 'up') {
            setIsVisible(true);
          } 
          // Hide navigation when scrolling down past threshold
          else if (direction === 'down' && currentY > threshold) {
            setIsVisible(false);
          }

          setScroll({
            y: currentY,
            lastY: lastScrollY,
            direction,
          });

          lastScrollY = currentY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return {
    isVisible,
    scrollY: scroll.y,
    direction: scroll.direction,
  };
}