"use client";

import { useEffect } from "react";
import { trackUserData } from "@/lib/analytics";

export function UserDataTracker() {
  useEffect(() => {
    // Wait for gtag to initialize properly
    const timer = setTimeout(() => {
      trackUserData();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // This component doesn't render anything
  return null;
}