'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useShopNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateWithParams = useCallback((baseUrl: string, params: Record<string, string>) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    
    // Update params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    });

    const queryString = urlParams.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    router.push(url);
  }, [router, searchParams]);

  return {
    navigateWithParams
  };
}