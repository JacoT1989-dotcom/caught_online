"use client";

import { useCallback } from "react";
import {
  trackAddToCart as trackGTMAddToCart,
  trackViewItem as trackGTMViewItem,
  trackBeginCheckout as trackGTMBeginCheckout,
} from "@/lib/analytics/gtm";
import {
  trackAddToCart as trackPixelAddToCart,
  trackViewContent,
  trackInitiateCheckout,
  trackPurchase,
  trackSubscriptionStart,
} from "@/lib/analytics/pixel";

export function useAnalytics() {
  const logAddToCart = useCallback((product: any) => {
    // Track in both GTM and Pixel
    trackGTMAddToCart(product);
    trackPixelAddToCart(product);
  }, []);

  const logViewItem = useCallback((product: any) => {
    // Track in both GTM and Pixel
    trackGTMViewItem(product);
    trackViewContent(product);
  }, []);

  const logBeginCheckout = useCallback((items: any[], total: number) => {
    // Track in both GTM and Pixel
    trackGTMBeginCheckout(items, total);
    trackInitiateCheckout(total);
  }, []);

  const logPurchase = useCallback((orderId: string, total: number) => {
    trackPurchase(total, orderId);
  }, []);

  const logSubscriptionStart = useCallback((plan: string, value: number) => {
    trackSubscriptionStart(plan, value);
  }, []);

  return {
    logAddToCart,
    logViewItem,
    logBeginCheckout,
    logPurchase,
    logSubscriptionStart,
  };
}
