import { shopifyFetch } from './client';

export async function getProductRecommendations(productId: string) {
  const query = `
    query GetRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
        id
        title
        handle
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
      cache: 'no-store'
    });

    return data?.productRecommendations || [];
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    return [];
  }
}