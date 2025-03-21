"use client";

interface SubscriptionFlowOptions {
  variantId: string;
  quantity: number;
}

/**
 * Formats a Shopify variant ID by removing the 'gid://shopify/ProductVariant/' prefix
 * @param variantId Full Shopify variant ID
 * @returns Numeric portion of the variant ID
 */
function formatVariantId(variantId: string): string {
  // Check if the variant ID has the gid:// prefix
  if (variantId.startsWith("gid://shopify/ProductVariant/")) {
    // Extract just the numeric ID at the end
    return variantId.replace("gid://shopify/ProductVariant/", "");
  }
  return variantId;
}

/**
 * Handles the creation and navigation to a SubscriptionFlow checkout URL using variant IDs
 */
export function handleSubscriptionFlow({
  variantId,
  quantity,
}: SubscriptionFlowOptions): void {
  // Debug logging
  console.log("Handling subscription flow with:", { variantId, quantity });

  if (!variantId) {
    console.error("No variant ID provided for subscription flow");
    return;
  }

  // Format the variant ID
  const formattedVariantId = formatVariantId(variantId);
  console.log("Formatted variant ID:", formattedVariantId);

  // Make sure quantity is a valid number
  const safeQuantity = Math.max(1, Math.min(99, quantity || 1));

  // Hard-code the plan ID based on example URL from earlier
  // Plan ID for monthly subscription from your example: 42656409419836
  const planId = "42656409419836"; // This might need to be changed for your store

  // Construct subscription URL with the formatted variant ID and plan ID
  const subscriptionUrl = `https://caughtonline.subscriptionflow.com/en/hosted-page/commerceflow?items[0][pr]=${formattedVariantId}&items[0][pl]=${planId}&items[0][q]=${safeQuantity}&cart=${encodeURIComponent("https://caught-online.myshopify.com/cart")}`;

  console.log("Redirecting to:", subscriptionUrl);

  // Navigate to subscription page
  window.location.href = subscriptionUrl;
}
