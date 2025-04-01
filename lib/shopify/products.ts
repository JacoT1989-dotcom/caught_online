import { shopifyFetch } from "./client";

const GET_PRODUCTS_QUERY = `
  query GetProducts(
    $first: Int = 250,
    $sortKey: ProductSortKeys = BEST_SELLING,
    $reverse: Boolean = false,
    $query: String = ""
  ) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          productType
          tags
          featuredImage {
            url
            altText
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 20) {  # Changed from 1 to 20 to get all variants
            edges {
              node {
                id
                title  # Added title field
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {  
                  name
                  value
                }
                quantityAvailable
              }
            }
          }
          collections(first: 5) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

const GET_COLLECTION_PRODUCTS_QUERY = `
  query GetCollectionProducts(
    $handle: String!,
    $first: Int = 250,
    $sortKey: ProductCollectionSortKeys = BEST_SELLING,
    $reverse: Boolean = false
  ) {
    collection(handle: $handle) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            description
            availableForSale
            productType
            tags
            featuredImage {
              url
              altText
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 20) {
           
              edges {
                node {
                  id
                  title   
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {  # Added selectedOptions field
                    name
                    value
                  }
                  quantityAvailable
                }
              }
            }
            collections(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      availableForSale
      productType
      tags
      featuredImage {
        url
        altText
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 20) {  # Changed from 1 to 20 to get all variants
        edges {
          node {
            id
            title  # Added title field
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {  # Added selectedOptions field
              name
              value
            }
            quantityAvailable
          }
        }
      }
      collections(first: 5) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  }
`;

// Enhanced search query for better fuzzy matching
const ENHANCED_SEARCH_QUERY = `
  query EnhancedSearch(
    $query: String!,
    $first: Int = 20,
    $sortKey: ProductSortKeys = RELEVANCE
  ) {
    products(first: $first, sortKey: $sortKey, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          productType
          tags
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
              }
            }
          }
        }
      }
    }
  }
`;

export interface GetProductsOptions {
  query?: string;
  collection?: string;
  first?: number;
  sortKey?: string;
  reverse?: boolean;
}

// Helper to convert product sort key to collection sort key
function getCollectionSortKey(sortKey: string): string {
  switch (sortKey) {
    case "PRICE":
      return "PRICE";
    case "BEST_SELLING":
      return "BEST_SELLING";
    case "CREATED":
      return "CREATED";
    case "TITLE":
      return "TITLE";
    default:
      return "BEST_SELLING";
  }
}

export async function getProducts(options: GetProductsOptions = {}) {
  const {
    collection,
    first = 250,
    sortKey = "BEST_SELLING",
    reverse = false,
    query = "",
  } = options;

  try {
    // Use different queries for collection vs all products
    if (collection) {
      const { data } = await shopifyFetch({
        query: GET_COLLECTION_PRODUCTS_QUERY,
        variables: {
          handle: collection,
          first,
          sortKey: getCollectionSortKey(sortKey),
          reverse,
        },
        // Remove cache: 'no-store' or use next: { revalidate: 3600 } for ISR
      });

      if (!data?.collection?.products?.edges) {
        console.warn("No products found in collection");
        return [];
      }

      return data.collection.products.edges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description,
        availableForSale: node.availableForSale,
        productType: node.productType,
        tags: node.tags,
        featuredImage: node.featuredImage,
        images: node.images,
        priceRange: node.priceRange,
        variants: node.variants,
        collections: node.collections,
      }));
    }

    // Get all products
    const { data } = await shopifyFetch({
      query: GET_PRODUCTS_QUERY,
      variables: {
        first,
        sortKey,
        reverse,
        query,
      },
      // Remove cache: 'no-store' or use next: { revalidate: 3600 } for ISR
    });

    if (!data?.products?.edges) {
      console.warn("No products found");
      return [];
    }

    return data.products.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      availableForSale: node.availableForSale,
      productType: node.productType,
      tags: node.tags,
      featuredImage: node.featuredImage,
      images: node.images,
      priceRange: node.priceRange,
      variants: node.variants,
      collections: node.collections,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProduct(handle: string) {
  if (!handle) {
    throw new Error("Product handle is required");
  }

  try {
    const { data } = await shopifyFetch({
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle },
      // Remove cache: 'no-store' or use next: { revalidate: 3600 } for ISR
    });

    const product = data?.product;
    if (!product) {
      console.log("Product not found:", handle);
      return null;
    }

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      availableForSale: product.availableForSale,
      productType: product.productType,
      tags: product.tags,
      featuredImage: product.featuredImage,
      images: product.images,
      priceRange: product.priceRange,
      variants: product.variants,
      collections: product.collections,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

const GET_PRODUCT_RECOMMENDATIONS_QUERY = `
  query GetProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      description
      availableForSale
      productType
      tags
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
      variants(first: 20) {  
        edges {
          node {
            id
            title  
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {   
              name
              value
            }
            quantityAvailable
          }
        }
      }
    }
  }
`;

const GET_PRODUCTS_BY_TYPE_QUERY = `
  query GetProductsByType($type: String!, $first: Int = 10) {
    products(first: $first, query: $type) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          productType
          tags
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
          variants(first: 20) {
            edges {
              node {
                id
                title  # Added title field
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {  
                  name
                  value
                }
                quantityAvailable
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Get product recommendations from Shopify
 * @param productId The Shopify product ID to get recommendations for
 * @returns Array of recommended products
 */
export async function getProductRecommendations(productId: string) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  try {
    const { data } = await shopifyFetch({
      query: GET_PRODUCT_RECOMMENDATIONS_QUERY,
      variables: { productId },
    });

    const recommendedProducts = data?.productRecommendations || [];

    return recommendedProducts.map((product: any) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      availableForSale: product.availableForSale,
      productType: product.productType,
      tags: product.tags,
      featuredImage: product.featuredImage,
      priceRange: product.priceRange,
      variants: product.variants,
    }));
  } catch (error) {
    console.error("Error fetching product recommendations:", error);
    return [];
  }
}

/**
 * Get popular, new, or other categorized products
 * @param type Type of products to fetch (popular, new, etc.)
 * @param first Number of products to fetch
 * @returns Array of products
 */
export async function getProductsByType(
  type: string = "popular",
  first: number = 10
) {
  let query = "";

  switch (type) {
    case "popular":
      query = "tag:popular";
      break;
    case "new":
      query = "tag:new";
      break;
    default:
      query = `product_type:${type}`;
  }

  try {
    const { data } = await shopifyFetch({
      query: GET_PRODUCTS_BY_TYPE_QUERY,
      variables: {
        type: query,
        first,
      },
    });

    if (!data?.products?.edges) {
      return [];
    }

    return data.products.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      availableForSale: node.availableForSale,
      productType: node.productType,
      tags: node.tags,
      featuredImage: node.featuredImage,
      priceRange: node.priceRange,
      variants: node.variants,
    }));
  } catch (error) {
    console.error(`Error fetching ${type} products:`, error);
    return [];
  }
}

/**
 * Enhanced search function that improves fuzzy matching capabilities
 * @param query Search query text
 * @param limit Number of results to return
 * @returns Array of product search results
 */
export async function enhancedProductSearch(query: string, limit: number = 20) {
  if (!query.trim()) {
    return [];
  }

  try {
    // Process the search query to handle multiple terms and improve fuzzy matching
    const processedQuery = processSearchQuery(query);

    const { data } = await shopifyFetch({
      query: ENHANCED_SEARCH_QUERY,
      variables: {
        query: processedQuery,
        first: limit,
        sortKey: "RELEVANCE",
      },
      cache: "no-store", // Don't cache search results
    });

    if (!data?.products?.edges) {
      return [];
    }

    return data.products.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      availableForSale: node.availableForSale,
      productType: node.productType,
      tags: node.tags,
      featuredImage: node.featuredImage,
      priceRange: node.priceRange,
      variants: node.variants,
    }));
  } catch (error) {
    console.error("Error in enhanced product search:", error);
    return [];
  }
}

/**
 * Process search query for better fuzzy matching
 * This improves results for typos, misspellings, and partial matches
 */
function processSearchQuery(query: string): string {
  // Split query into individual terms
  const terms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.trim().length > 0);

  // Create an array of processed terms
  const processedTerms = terms.map((term) => {
    // Use wildcard for partial matching on each term
    return `*${term}*`;
  });

  // Join terms with OR operator for fuzzy matching
  return processedTerms.join(" OR ");
}
