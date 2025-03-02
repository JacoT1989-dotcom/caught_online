import { NextResponse } from "next/server";
import { SHOPIFY_CONFIG } from "@/lib/shopify/config";
import { GET_PRODUCTS_WITH_INVENTORY } from "@/lib/shopify/queries";

// Define TypeScript interfaces for Shopify API responses
interface ShopifyImage {
  url: string;
  altText: string | null;
}

interface ShopifyVariantNode {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantityAvailable: number;
}

interface ShopifyVariantEdge {
  node: ShopifyVariantNode;
}

interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  variants: {
    edges: ShopifyVariantEdge[];
  };
}

interface ShopifyProductEdge {
  node: ShopifyProductNode;
}

interface ShopifyProductsResponse {
  data: {
    products: {
      edges: ShopifyProductEdge[];
    };
  };
}

// Export config to mark this route as dynamic
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log(
      "Fetching products with token:",
      SHOPIFY_CONFIG.storefrontAccessToken
    );

    const response = await fetch(SHOPIFY_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // For storefront API, use the correct header
        "X-Shopify-Storefront-Access-Token":
          SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({
        query: GET_PRODUCTS_WITH_INVENTORY,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API error (${response.status}):`, errorText);
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const jsonResponse = await response.json();

    // Log the response structure to help debug
    console.log(
      "Shopify response structure:",
      JSON.stringify(jsonResponse, null, 2).substring(0, 200) + "..."
    );

    if (!jsonResponse.data?.products?.edges) {
      console.error("Invalid response format:", jsonResponse);
      throw new Error("Invalid response format from Shopify");
    }

    const products = jsonResponse.data.products.edges.map(
      (edge: ShopifyProductEdge) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        featuredImage: edge.node.featuredImage || {
          url: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=500",
          altText: edge.node.title,
        },
        variants: edge.node.variants.edges.map(
          (variantEdge: ShopifyVariantEdge) => ({
            id: variantEdge.node.id,
            title: variantEdge.node.title,
            price: variantEdge.node.price,
            quantityAvailable: variantEdge.node.quantityAvailable,
            availableForSale: variantEdge.node.availableForSale,
          })
        ),
      })
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Shopify API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
