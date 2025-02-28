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
  data: {
    locations: {
      edges: LocationEdge[];
    };
  };
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

export async function GET() {
  try {
    // Check if the adminAccessToken exists
    if (!SHOPIFY_CONFIG.adminAccessToken) {
      throw new Error("Shopify admin access token is not configured");
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
    });

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = (await response.json()) as LocationsResponse;
    return NextResponse.json(
      data.data.locations.edges.map((edge: LocationEdge) => edge.node)
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
