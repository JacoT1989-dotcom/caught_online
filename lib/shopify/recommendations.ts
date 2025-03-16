import { shopifyFetch } from "./client";

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

interface ProductEdge {
  node: ProductNode;
}
export async function getProductRecommendations(productId: string) {
  const query = `
    query GetRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
        id
        title
        handle
         description
        availableForSale
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;
  try {
    const { data } = await shopifyFetch({
      query,
      variables: { productId },
      cache: "no-store",
    });
    return data?.productRecommendations || [];
  } catch (error) {
    console.error("Error fetching product recommendations:", error);
    return [];
  }
}

/**
 * Get products by type or tag
 */
export async function getProductsByType(
  type: string = "popular",
  first: number = 10
) {
  // Convert type to query syntax
  let query = "";
  switch (type) {
    case "popular":
      query = "tag:popular";
      break;
    case "new":
      query = "tag:new";
      break;
    case "featured":
      query = "tag:featured";
      break;
    case "bestseller":
      query = "tag:bestseller";
      break;
    default:
      query = `product_type:${type}`;
  }

  const graphqlQuery = `
    query GetProductsByType($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            title
            handle
            description 
            availableForSale
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const { data } = await shopifyFetch({
      query: graphqlQuery,
      variables: { query, first },
      cache: "no-store",
    });

    if (!data?.products?.edges) {
      return [];
    }

    return data.products.edges.map(({ node }: ProductEdge) => node);
  } catch (error) {
    console.error(`Error fetching ${type} products:`, error);
    return [];
  }
}

/**
 * Get random products as fallback
 */
export async function getRandomProducts(count: number = 10) {
  const query = `
    query GetRandomProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
              description
            availableForSale
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const { data } = await shopifyFetch({
      query,
      variables: { first: Math.max(20, count * 2) }, // Get more products than needed for better randomization
      cache: "no-store",
    });

    if (!data?.products?.edges) {
      return [];
    }

    const products = data.products.edges.map(({ node }: ProductEdge) => node);
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error("Error fetching random products:", error);
    return [];
  }
}
