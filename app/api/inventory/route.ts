import { NextResponse } from "next/server";
import { SHOPIFY_CONFIG } from "@/lib/shopify/config";

// Mark this route as dynamic
export const dynamic = "force-dynamic";

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
      // Remove the no-store cache option or handle it differently
      // for static generation, use revalidate instead
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();

    if (!data?.products?.edges) {
      throw new Error("Invalid response format from Shopify");
    }

    const products = data.products.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      variants: node.variants.edges.map(({ node: variant }: any) => ({
        id: variant.id,
        title: variant.title,
        inventoryLevels: variant.inventoryItem.inventoryLevels.edges.map(
          ({ node: level }: any) => ({
            locationName: level.location.name,
            available: level.available,
          })
        ),
      })),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch inventory",
      },
      { status: 500 }
    );
  }
}
