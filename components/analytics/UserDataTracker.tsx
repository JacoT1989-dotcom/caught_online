"use client";

import { useEffect } from "react";
import { trackUserData } from "@/lib/analytics";

export function UserDataTracker() {
  useEffect(() => {
    // Wait for GA to initialize
    const waitForGA = () => {
      if (
        typeof window !== "undefined" &&
        window.gtag &&
        window.gtag.apiResult
      ) {
        // Now track user data
        trackUserData();
      } else {
        // Check again in 500ms
        setTimeout(waitForGA, 500);
      }
    };

    waitForGA();
  }, []);

  // This component doesn't render anything
  return null;
}
