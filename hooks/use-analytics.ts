"use client";
import { useCallback } from "react";
import {
  trackAddToCart,
  trackViewContent,
  trackInitiateCheckout,
  trackPurchase,
  trackSubscription,
} from "@/lib/analytics"; // Import from the unified module

export function useAnalytics() {
  const logAddToCart = useCallback((product: any) => {
    // Now just one call needed
    trackAddToCart(product);
  }, []);

  const logViewItem = useCallback((product: any) => {
    // Now just one call needed
    trackViewContent(product);
  }, []);

  const logBeginCheckout = useCallback((items: any[], total: number) => {
    // Now just one call needed
    trackInitiateCheckout(total, items);
  }, []);

  const logPurchase = useCallback(
    (orderId: string, total: number, items?: any[]) => {
      trackPurchase(total, orderId, items);
    },
    []
  );

  const logSubscriptionStart = useCallback((plan: string, value: number) => {
    trackSubscription(plan, value);
  }, []);

  return {
    logAddToCart,
    logViewItem,
    logBeginCheckout,
    logPurchase,
    logSubscriptionStart,
  };
}
