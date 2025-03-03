import { SHOPIFY_CONFIG } from "./config";

interface ShopifyFetchProps {
  query: string;
  variables?: Record<string, any>;
  cache?: RequestCache;
}
export async function shopifyFetch({
  query,
  variables = {},
  cache = "force-cache", // Default to force-cache instead of dynamic option
}: ShopifyFetchProps) {
  try {
    // Validate required config
    if (!SHOPIFY_CONFIG.storefrontAccessToken || !SHOPIFY_CONFIG.domain) {
      throw new Error("Missing required Shopify configuration");
    }

    const endpoint = `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

    // Log request details in development
    if (process.env.NODE_ENV === "development") {
      console.log("Shopify GraphQL Request:", {
        endpoint,
        query: query.slice(0, 100) + "...",
        variables,
      });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache, // Use the provided cache option, defaults to force-cache
      // You can also use this for ISR (Incremental Static Regeneration):
      // next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Check for GraphQL errors
    if (json.errors) {
      throw new Error(
        `GraphQL Error: ${json.errors.map((e: any) => e.message).join(", ")}`
      );
    }

    return json;
  } catch (error) {
    // Enhanced error logging
    console.error("Shopify fetch error:", {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
      query: query.slice(0, 100) + "...",
      variables,
    });

    // Re-throw error for handling by caller
    throw error;
  }
}
