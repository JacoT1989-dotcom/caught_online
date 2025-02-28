import { NextResponse } from "next/server";
import { SHOPIFY_CONFIG } from "@/lib/shopify/config";

export async function GET() {
  try {
    const response = await fetch(SHOPIFY_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({
        query: `{
          locations(first: 10) {
            edges {
              node {
                id
                name
                address {
                  address1
                  city
                  province
                  zip
                }
                isActive
              }
            }
          }
        }`,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
