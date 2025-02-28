import { shopifyFetch } from './shopify/client';

const INVENTORY_QUERY = `
  query ProductInventory($id: ID!) {
    product(id: $id) {
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

export async function checkRegionalAvailability(productId: string, warehouseId: string): Promise<boolean> {
  try {
    const { data } = await shopifyFetch({
      query: INVENTORY_QUERY,
      variables: { id: productId },
      cache: 'no-store',
    });

    const variant = data?.product?.variants?.edges[0]?.node;
    
    if (!variant) {
      return false;
    }

    return variant.availableForSale && variant.quantityAvailable > 0;
  } catch (error) {
    console.error('Error checking inventory:', error);
    // Default to true to prevent blocking purchases if inventory check fails
    return true;
  }
}