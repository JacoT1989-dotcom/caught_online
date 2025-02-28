import { NextResponse } from "next/server";
import { SHOPIFY_CONFIG } from "@/lib/shopify/config";
import { GET_PRODUCTS_WITH_INVENTORY } from "@/lib/shopify/queries";

export async function GET() {
  try {
    const response = await fetch(SHOPIFY_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({
        query: GET_PRODUCTS_WITH_INVENTORY,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const { data } = await response.json();

    if (!data?.products?.edges) {
      throw new Error("Invalid response format from Shopify");
    }

    const products = data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      featuredImage: edge.node.featuredImage || {
        url: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=500",
        altText: edge.node.title,
      },
      variants: edge.node.variants.edges.map((variantEdge: any) => ({
        id: variantEdge.node.id,
        title: variantEdge.node.title,
        price: variantEdge.node.price,
        quantityAvailable: variantEdge.node.quantityAvailable,
        availableForSale: variantEdge.node.availableForSale,
      })),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Shopify API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
