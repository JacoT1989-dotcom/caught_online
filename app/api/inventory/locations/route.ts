import { NextResponse } from "next/server";
import { SHOPIFY_CONFIG } from "@/lib/shopify/config";

// Define types for your Shopify response
interface ShopifyLocation {
  id: string;
  name: string;
  address: {
    address1: string;
    city: string;
    province: string;
    zip: string;
  };
  isActive: boolean;
}

interface LocationEdge {
  node: ShopifyLocation;
}

interface LocationsResponse {
  data?: {
    locations?: {
      edges: LocationEdge[];
    };
  };
  errors?: any[];
}

const LOCATIONS_QUERY = `
  {
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
  }
`;

// Export config to mark this route as dynamic
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check if the adminAccessToken exists
    if (!SHOPIFY_CONFIG.adminAccessToken) {
      console.error("Shopify admin access token is not configured");
      return NextResponse.json(
        { error: "Shopify admin access token is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(SHOPIFY_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_CONFIG.adminAccessToken,
      },
      body: JSON.stringify({
        query: LOCATIONS_QUERY,
      }),
      // Remove the cache option or use next.js recommended pattern:
      next: { revalidate: 0 }, // 0 means no cache (equivalent to "no-store")
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Shopify API responded with ${response.status}: ${errorText}`
      );
      return NextResponse.json(
        { error: `Shopify API error: ${response.status}` },
        { status: response.status }
      );
    }

    const jsonData = (await response.json()) as LocationsResponse;

    // Check for GraphQL errors
    if (jsonData.errors && jsonData.errors.length > 0) {
      console.error("GraphQL errors:", JSON.stringify(jsonData.errors));
      return NextResponse.json(
        { error: "GraphQL errors from Shopify API" },
        { status: 422 }
      );
    }

    // Make sure we have the expected data structure
    if (!jsonData.data?.locations?.edges) {
      console.error("Unexpected data structure:", JSON.stringify(jsonData));
      return NextResponse.json(
        { error: "Invalid response structure from Shopify API" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      jsonData.data.locations.edges.map((edge: LocationEdge) => edge.node)
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
