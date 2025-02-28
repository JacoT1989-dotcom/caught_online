"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initGTM } from "@/lib/analytics/gtm";
import { initPixel, trackPageView } from "@/lib/analytics/pixel";

// Add type declaration for window.dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize analytics on first load
    initGTM();
    initPixel();
  }, []);

  useEffect(() => {
    // Track page views
    if (typeof window !== "undefined") {
      // GTM page view
      window.dataLayer?.push({
        event: "page_view",
        page: {
          path: pathname,
          search: searchParams.toString(),
          title: document.title,
        },
      });

      // Meta Pixel page view
      trackPageView();
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
