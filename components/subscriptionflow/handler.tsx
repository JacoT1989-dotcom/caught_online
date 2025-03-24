"use client";

import { SubscriptionInterval } from "@/lib/types/subscription";

interface SubscriptionVariantIds {
  monthly: string;
  bimonthly: string;
  quarterly: string;
}

interface SubscriptionFlowOptions {
  productId: string; // The base product ID - needs to be 7962053935164 format
  subscriptionVariantIds: SubscriptionVariantIds;
  selectedInterval: SubscriptionInterval;
  quantity: number;
}

/**
 * Formats a Shopify ID by removing the GraphQL prefix
 */
function formatShopifyId(id: string): string {
  if (id.includes("gid://shopify/ProductVariant/")) {
    return id.replace("gid://shopify/ProductVariant/", "");
  }
  if (id.includes("gid://shopify/Product/")) {
    return id.replace("gid://shopify/Product/", "");
  }
  return id;
}

/**
 * Handles the creation and navigation to a SubscriptionFlow checkout URL
 */

/**
 * Handles the creation and navigation to a SubscriptionFlow checkout URL
 */
export function handleSubscriptionFlow({
  productId,
  subscriptionVariantIds,
  selectedInterval,
  quantity,
}: SubscriptionFlowOptions): void {
  // Format the product ID
  const formattedProductId = formatShopifyId(productId);

  // Get the variant ID for the selected subscription interval
  const variantId = subscriptionVariantIds[selectedInterval] || "";

  if (!variantId) {
    console.error(`No variant ID found for interval: ${selectedInterval}`);
    return;
  }

  // Format the variant ID
  const formattedVariantId = formatShopifyId(variantId);

  // Make sure quantity is a valid number
  const safeQuantity = Math.max(1, quantity || 1);

  // Add debugging
  console.log("Subscription details:", {
    interval: selectedInterval,
    productId: formattedProductId,
    variantId: formattedVariantId,
    quantity: safeQuantity,
  });

  // Construct the URL with the EXACT format that works
  // Notice that [pr] uses the product ID (not variant ID)
  // And [pl] uses the variant/plan ID
  const subscriptionUrl = `https://caughtonline.subscriptionflow.com/en/hosted-page/commerceflow?items[0][pr]=${formattedProductId}&items[0][pl]=${formattedVariantId}&items[0][q]=${safeQuantity}&cart=https://caught-online.myshopify.com/cart`;

  console.log("Redirecting to subscription flow:", subscriptionUrl);

  // Navigate to subscription page
  window.location.href = subscriptionUrl;
}
