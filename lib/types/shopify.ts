// types/shopify.ts

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: string;
  image: {
    src: string;
  } | null;
  variants: ShopifyProductVariant[];
  options: ShopifyProductOption[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  available: boolean;
  inventoryQuantity: number;
}

export interface ShopifyProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  email: string;
  createdAt: string;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  currencyCode: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customerLocale: string;
  lineItems: ShopifyLineItem[];
  shippingAddress: ShopifyAddress;
  billingAddress: ShopifyAddress;
}

export interface ShopifyLineItem {
  id: string;
  title: string;
  variantId: string;
  quantity: number;
  price: string;
  totalDiscount: string;
  sku: string;
}

export interface ShopifyAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
}

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
