import { shopifyFetch } from "./client";
import type { InventoryResponse, LocationInventory } from "@/types/inventory";

const INVENTORY_QUERY = `
  query GetProductInventory($handle: String!) {
    product(handle: $handle) {
      availableForSale
      totalInventory
      variants(first: 1) {
        edges {
          node {
            id
            availableForSale
            quantityAvailable
          }
        }
      }
    }
  }
`;

// Create a new response type that extends the official one to include errors internally
interface InternalInventoryResponse extends InventoryResponse {
  error?: string;
}

export async function checkInventory(
  handle: string,
  region: string
): Promise<InternalInventoryResponse> {
  if (!handle || !region) {
    return {
      available: false,
      quantity: 0,
      locationAvailability: {},
      error: "Missing handle or region",
    };
  }

  try {
    // Using the cache option instead of next for backward compatibility
    const { data } = await shopifyFetch({
      query: INVENTORY_QUERY,
      variables: { handle },
      cache: "force-cache", // This is equivalent to setting a revalidation time
    });

    // Check if product data exists
    if (!data?.product) {
      return {
        available: false,
        quantity: 0,
        locationAvailability: {},
        error: "Product not found",
      };
    }

    const variant = data.product.variants?.edges[0]?.node;
    const isAvailable =
      variant?.availableForSale ?? data.product.availableForSale;
    const quantity =
      variant?.quantityAvailable ?? data.product.totalInventory ?? 0;

    // Create location availability object that matches the LocationInventory type
    const locationInventory: LocationInventory = {
      available: isAvailable,
      quantity: quantity,
    };

    const locationAvailability: Record<string, LocationInventory> = {
      [region]: locationInventory,
    };

    return {
      available: isAvailable,
      quantity: quantity,
      locationAvailability,
    };
  } catch (error) {
    console.error("Inventory check failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      available: false,
      quantity: 0,
      locationAvailability: {},
      error: `Inventory check failed: ${errorMessage}`,
    };
  }
}
