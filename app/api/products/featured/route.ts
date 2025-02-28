import { NextResponse } from "next/server";
import { SHOPIFY_CONFIG } from "@/lib/shopify/config";

// Type definitions
interface InventoryLevel {
  locationName: string;
  available: number;
}

interface ProductVariant {
  id: string;
  title: string;
  inventoryLevels: InventoryLevel[];
}

interface Product {
  id: string;
  title: string;
  handle: string;
  variants: ProductVariant[];
}

const INVENTORY_QUERY = `
  query GetInventory {
    locations(first: 10) {
      edges {
        node {
          id
          name
          isActive
        }
      }
    }
    products(first: 50) {
      edges {
        node {
          id
          title
          handle
          variants(first: 1) {
            edges {
              node {
                id
                title
                inventoryItem {
                  id
                  inventoryLevels(first: 10) {
                    edges {
                      node {
                        available
                        location {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Mark the route as dynamic
export const dynamic = "force-dynamic";

// Fallback inventory data if Shopify API fails
const fallbackInventory: Product[] = [
  {
    id: "gid://shopify/Product/1",
    title: "Norwegian Salmon",
    handle: "norwegian-salmon",
    variants: [
      {
        id: "gid://shopify/ProductVariant/1",
        title: "Default",
        inventoryLevels: [
          {
            locationName: "Main Warehouse",
            available: 25,
          },
        ],
      },
    ],
  },
  {
    id: "gid://shopify/Product/2",
    title: "Fresh Hake",
    handle: "fresh-hake",
    variants: [
      {
        id: "gid://shopify/ProductVariant/2",
        title: "Default",
        inventoryLevels: [
          {
            locationName: "Main Warehouse",
            available: 18,
          },
        ],
      },
    ],
  },
];

export async function GET() {
  try {
    const response = await fetch(SHOPIFY_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({
        query: INVENTORY_QUERY,
      }),
      // Remove no-store to allow caching
    });

    if (!response.ok) {
      console.warn(`HTTP error from Shopify: ${response.status}`);
      return NextResponse.json({ products: fallbackInventory });
    }

    const { data } = await response.json();

    if (!data?.products?.edges) {
      console.warn("Invalid response format from Shopify");
      return NextResponse.json({ products: fallbackInventory });
    }

    const products = data.products.edges.map(({ node }: { node: any }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      variants: node.variants.edges.map(({ node: variant }: { node: any }) => ({
        id: variant.id,
        title: variant.title,
        inventoryLevels: variant.inventoryItem.inventoryLevels.edges.map(
          ({ node: level }: { node: any }) => ({
            locationName: level.location.name,
            available: level.available,
          })
        ),
      })),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    // Return fallback data instead of an error
    return NextResponse.json({ products: fallbackInventory });
  }
}
