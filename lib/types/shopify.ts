export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

/**
 * Response from Shopify checkout creation
 */
export interface ShopifyCheckout {
  id: string;
  webUrl: string;
  totalPrice?: {
    amount: string;
    currencyCode: string;
  };
}

/**
 * Error returned from Shopify checkout operations
 */
export interface ShopifyCheckoutError {
  code: string;
  field: string[];
  message: string;
}

/**
 * Response structure from Shopify GraphQL API for checkout creation
 */
export interface ShopifyCheckoutCreateResponse {
  data?: {
    checkoutCreate?: {
      checkout: ShopifyCheckout;
      checkoutUserErrors: ShopifyCheckoutError[];
    };
  };
  errors?: any[];
}

/**
 * Response structure from Shopify GraphQL API for adding items to checkout
 */
export interface ShopifyCheckoutAddItemsResponse {
  data?: {
    checkoutLineItemsAdd?: {
      checkout: ShopifyCheckout;
      checkoutUserErrors: ShopifyCheckoutError[];
    };
  };
  errors?: any[];
}

/**
 * Type-safe wrapper for creating a checkout
 */
export async function createTypedCheckout(
  items: CheckoutLineItem[]
): Promise<ShopifyCheckout> {
  // Implementation would call your existing createCheckout function
  // but with proper type safety

  // This is a placeholder - replace with your actual implementation
  const response = await fetch("/api/create-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lineItems: items }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create checkout");
  }

  const data = await response.json();
  return data.checkout;
}
