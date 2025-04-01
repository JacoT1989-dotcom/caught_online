// src/lib/shopify/cart-sync.ts
interface SyncCartItem {
  variantId: string;
  quantity: number;
}

/**
 * Syncs the local cart state with Shopify's cart
 */
export async function syncCartWithShopify(
  items: SyncCartItem[]
): Promise<boolean> {
  try {
    console.group("Shopify Cart Sync");

    // Step 1: Clear the Shopify cart
    const clearResponse = await fetch("/cart/clear.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!clearResponse.ok) {
      console.error("Failed to clear Shopify cart");
      console.groupEnd();
      return false;
    }

    // If cart is empty, we're done
    if (items.length === 0) {
      console.groupEnd();
      return true;
    }

    // Step 2: Add all items to Shopify cart
    for (const item of items) {
      // Make sure variantId is valid
      if (!item.variantId) {
        console.error("Invalid variant ID for cart sync", item);
        continue;
      }

      // Add item to Shopify cart
      const response = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.variantId,
          quantity: item.quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding item to Shopify cart", errorData);
      } else {
        console.log(`Added item ${item.variantId} (qty: ${item.quantity})`);
      }
    }

    // Step 3: Verify cart was updated correctly
    const cartResponse = await fetch("/cart.js");
    const shopifyCart = await cartResponse.json();

    console.groupEnd();
    return true;
  } catch (error) {
    console.error("Failed to sync cart with Shopify:", error);
    console.groupEnd();
    return false;
  }
}
