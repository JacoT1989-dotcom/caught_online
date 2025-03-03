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
    console.log("Fetching products with options:", {
      collection,
      query,
      sortKey,
      reverse,
    });

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
    console.log("Fetching product with handle:", handle);

    const { data } = await shopifyFetch({
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle },
      // Remove cache: 'no-store' or use next: { revalidate: 3600 } for ISR
    });

    console.log("Raw product API response:", data);

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
