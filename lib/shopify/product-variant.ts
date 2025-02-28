import { shopifyFetch } from "./client";

// Cache to avoid repeated API calls for the same product
const variantCache: Record<string, string> = {};

/**
 * Query to get the first published variant for a product
 */
const GET_PRODUCT_VARIANTS_QUERY = `
  query GetProductVariants($id: ID!) {
    product(id: $id) {
      id
      title
      variants(first: 10) {
        edges {
          node {
            id
            availableForSale
            currentlyNotInStock
          }
        }
      }
    }
  }
`;

/**
 * Get a valid, published variant ID for a product
 * @param productId Shopify product ID (gid://shopify/Product/123456)
 * @returns Promise with valid variant ID or null if none found
 */
export async function getValidVariantId(
  productId: string
): Promise<string | null> {
  try {
    // Return from cache if available
    if (variantCache[productId]) {
      return variantCache[productId];
    }

    // Make GraphQL request to get variants
    const { data } = await shopifyFetch({
      query: GET_PRODUCT_VARIANTS_QUERY,
      variables: { id: productId },
      cache: "no-store",
    });

    // Check if product and variants exist
    if (!data?.product?.variants?.edges?.length) {
      console.warn(`No variants found for product: ${productId}`);
      return null;
    }

    // Find the first available variant
    const variants = data.product.variants.edges;
    const availableVariant = variants.find(
      (edge: any) => edge.node.availableForSale
    );

    // If an available variant is found, use it
    if (availableVariant) {
      const variantId = availableVariant.node.id;
      variantCache[productId] = variantId;
      return variantId;
    }

    // If no available variant, use the first one as a fallback (might not work for checkout)
    const firstVariantId = variants[0].node.id;
    console.warn(
      `No available variants for ${data.product.title}, using first variant: ${firstVariantId}`
    );
    variantCache[productId] = firstVariantId;
    return firstVariantId;
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    return null;
  }
}

/**
 * Process cart items to get valid variant IDs from Shopify
 * @param items Cart items to process
 * @returns Promise with processed items with valid variant IDs
 */
export async function getValidCartItems(items: any[]): Promise<any[]> {
  if (!items || !items.length) return [];

  // Process all items in parallel
  const processedItems = await Promise.all(
    items.map(async (item) => {
      // Skip if item already has a valid variant ID
      if (item.variantId && item.variantId.includes("ProductVariant")) {
        return item;
      }

      // Get a valid variant ID from Shopify
      const variantId = await getValidVariantId(item.id);

      if (variantId) {
        return { ...item, variantId };
      }

      // If no valid variant ID, keep the original item (might not work for checkout)
      console.warn(`Could not get valid variant ID for ${item.title}`);
      return item;
    })
  );

  return processedItems;
}
