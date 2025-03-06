// src/lib/analytics/shopify.ts
// Shopify-specific analytics integration

import { TrackableProduct } from "./index";

// Note: We're not redeclaring ShopifyAnalytics here, as it's already declared in index.ts
// This avoids the "Subsequent property declarations" error

/**
 * Initialize Shopify analytics
 */
export function initShopifyAnalytics() {
  if (typeof window === "undefined") return;

  // Shopify might already have initialized analytics through their theme
  if (window.ShopifyAnalyticsObject) {
    console.log("Shopify Analytics already initialized");
    return;
  }

  // Create a script to connect with Shopify's analytics if needed
  const script = document.createElement("script");
  script.innerHTML = `
    window.ShopifyAnalyticsObject = 'analytics';
    window.ShopifyAnalytics = window.ShopifyAnalytics || {};
    window.ShopifyAnalytics.meta = window.ShopifyAnalytics.meta || {};
    window.ShopifyAnalytics.meta.currency = 'ZAR';
    window.ShopifyAnalytics.lib = window.ShopifyAnalytics.lib || {};
    
    // Create stub functions if Shopify analytics isn't fully loaded
    if (!window.ShopifyAnalytics.lib.track) {
      window.ShopifyAnalytics.lib.track = function() {
        console.log('Shopify Analytics Track:', arguments);
      };
    }
  `;

  document.head.appendChild(script);
}

/**
 * Track a page view in Shopify analytics
 */
export function trackShopifyPageView() {
  if (typeof window === "undefined" || !window.ShopifyAnalytics?.lib) return;

  try {
    // Track pageview using Shopify's method if available
    if (typeof window.ShopifyAnalytics.lib.trackPageview === "function") {
      window.ShopifyAnalytics.lib.trackPageview();
    } else if (typeof window.ShopifyAnalytics.lib.track === "function") {
      // Fallback to generic track method
      window.ShopifyAnalytics.lib.track("Viewed Page", {
        pageType: getPageType(),
        path: window.location.pathname,
      });
    }

    // Update the page meta information if meta exists
    if (window.ShopifyAnalytics.meta) {
      const pageType = getPageType();

      window.ShopifyAnalytics.meta.page = {
        pageType,
        resourceType: pageType === "product" ? "product" : "",
        resourceId: getResourceId(),
      };
    }

    console.log("Shopify pageview tracked", window.ShopifyAnalytics.meta?.page);
  } catch (error) {
    console.error("Failed to track Shopify pageview:", error);
  }
}

/**
 * Track product view in Shopify analytics
 */
export function trackShopifyProductView(product: TrackableProduct) {
  if (typeof window === "undefined" || !window.ShopifyAnalytics?.lib) return;

  try {
    // Format the product data for Shopify
    const shopifyProduct = {
      id: product.id,
      title: product.title,
      price: product.price,
      vendor: "Caught Online", // Replace with your actual vendor name
      type: "Seafood", // Replace with your product type
      variants: [
        {
          id: product.variantId || product.id,
          price: product.price,
          name: product.title,
          public_title: "",
          sku: "",
          available: true,
        },
      ],
    };

    // Update the product meta information if meta exists
    if (window.ShopifyAnalytics.meta) {
      window.ShopifyAnalytics.meta.product = shopifyProduct;
    }

    // Track the event
    if (typeof window.ShopifyAnalytics.lib.track === "function") {
      window.ShopifyAnalytics.lib.track("Viewed Product", {
        id: product.id,
        name: product.title,
        price: product.price,
        currency: "ZAR",
        variant: product.variantId || null,
      });
    }

    console.log("Shopify product view tracked", product);
  } catch (error) {
    console.error("Failed to track Shopify product view:", error);
  }
}

/**
 * Track adding a product to cart in Shopify analytics
 */
export function trackShopifyAddToCart(product: TrackableProduct) {
  if (typeof window === "undefined" || !window.ShopifyAnalytics?.lib) return;

  try {
    if (typeof window.ShopifyAnalytics.lib.track === "function") {
      window.ShopifyAnalytics.lib.track("Added Product", {
        id: product.id,
        name: product.title,
        price: product.price,
        currency: "ZAR",
        quantity: product.quantity || 1,
        variant: product.variantId || null,
      });
    }

    console.log("Shopify add to cart tracked", product);
  } catch (error) {
    console.error("Failed to track Shopify add to cart:", error);
  }
}

/**
 * Track checkout initiation in Shopify analytics
 */
export function trackShopifyBeginCheckout(
  value: number,
  items: TrackableProduct[]
) {
  if (typeof window === "undefined" || !window.ShopifyAnalytics?.lib) return;

  try {
    if (typeof window.ShopifyAnalytics.lib.track === "function") {
      window.ShopifyAnalytics.lib.track("Started Checkout", {
        value,
        currency: "ZAR",
        lineItems: items.map((item) => ({
          product_id: item.id,
          variant_id: item.variantId || null,
          quantity: item.quantity || 1,
          price: item.price,
        })),
      });
    }

    console.log("Shopify checkout started", { value, items });
  } catch (error) {
    console.error("Failed to track Shopify checkout start:", error);
  }
}

/**
 * Detect page type based on URL
 */
function getPageType(): string {
  const path = window.location.pathname;

  if (path === "/" || path === "") return "home";
  if (path.includes("/products/")) return "product";
  if (path.includes("/collections/")) return "collection";
  if (path.includes("/cart")) return "cart";
  if (path.includes("/checkout")) return "checkout";
  if (path.includes("/account")) return "account";
  if (path.includes("/pages/")) return "page";

  return "other";
}

/**
 * Extract resource ID from URL
 */
function getResourceId(): string {
  const path = window.location.pathname;

  // Try to extract product ID
  if (path.includes("/products/")) {
    const matches = path.match(/\/products\/([^/?#]+)/);
    if (matches && matches[1]) return matches[1];
  }

  // Try to extract collection ID
  if (path.includes("/collections/")) {
    const matches = path.match(/\/collections\/([^/?#]+)/);
    if (matches && matches[1]) return matches[1];
  }

  return "";
}
