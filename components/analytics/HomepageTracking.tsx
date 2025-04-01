"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

export function HomePageTracker() {
  useEffect(() => {
    // Track the homepage view using your existing analytics function
    trackPageView();

    // Additional tracking for more detailed homepage data
    if (typeof window !== "undefined") {
      // Get user authentication status
      let isLoggedIn = false;
      try {
        const authData = localStorage.getItem("auth-storage");
        if (authData) {
          const parsedData = JSON.parse(authData);
          isLoggedIn = !!parsedData?.state?.accessToken;
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      }

      // Get UTM parameters if present
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") || "";
      const utmMedium = urlParams.get("utm_medium") || "";
      const utmCampaign = urlParams.get("utm_campaign") || "";

      // Safely push to dataLayer if it exists
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "view_home_page",
          page_type: "home",
          user_status: isLoggedIn ? "logged_in" : "guest",
          is_returning: !!localStorage.getItem("returning_visitor"),
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        });
      }

      // Mark as returning visitor for future visits
      localStorage.setItem("returning_visitor", "true");

      // Track performance metrics if supported
      if (window.performance && window.performance.timing) {
        // Wait for the page to fully load
        window.addEventListener("load", () => {
          setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime =
              perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domComplete - perfData.domLoading;

            // Safely push performance metrics
            if (window.dataLayer) {
              window.dataLayer.push({
                event: "performance_metrics",
                page_load_time: pageLoadTime,
                dom_ready_time: domReadyTime,
              });
            }
          }, 0);
        });
      }
    }

    // Set up section visibility tracking
    const trackSectionVisibility = () => {
      const sections = [
        { id: "hero", name: "Hero Section" },
        { id: "featured-products", name: "Featured Products" },
        { id: "subscription-plans", name: "Subscription Plans" },
        { id: "trending-subscriptions", name: "Trending Subscriptions" },
        { id: "wild-caught", name: "Wild Caught" },
        { id: "newsletter", name: "Newsletter" },
        { id: "delivery-areas", name: "Delivery Areas" },
      ];

      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (!element) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && window.dataLayer) {
                window.dataLayer.push({
                  event: "section_view",
                  section_id: section.id,
                  section_name: section.name,
                });
                // Only need to track once
                observer.disconnect();
              }
            });
          },
          { threshold: 0.5 }
        );

        observer.observe(element);
      });
    };

    // Wait a bit for the DOM to be fully rendered
    if (typeof document !== "undefined") {
      const timeout = setTimeout(trackSectionVisibility, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  return null; // This component doesn't render anything
}
