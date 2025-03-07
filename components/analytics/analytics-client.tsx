"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, trackPageView } from "@/lib/analytics";
import { initShopifyAnalytics } from "@/lib/analytics/shopify";

export function AnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize Shopify analytics (initAnalytics is handled in layout.tsx script)
    initShopifyAnalytics();

    // Log initial page view
    trackPageView();
  }, []);

  useEffect(() => {
    // Track page changes
    if (pathname) {
      trackPageView();
    }
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}
