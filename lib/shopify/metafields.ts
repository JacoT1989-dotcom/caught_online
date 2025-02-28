import { shopifyFetch } from './client';

export async function getProductMetafields(handle: string) {
  const query = `
    query GetProductMetafields($handle: String!) {
      product(handle: $handle) {
        metafields(first: 20) {
          edges {
            node {
              key
              value
              namespace
              type
            }
          }
        }
      }
    }
  `;

  try {
    const { data } = await shopifyFetch({
      query,
      variables: { handle },
      cache: 'no-store'
    });

    return data?.product?.metafields?.edges.map((edge: any) => edge.node) || [];
  } catch (error) {
    console.error('Error fetching product metafields:', error);
    return [];
  }
}

export async function getCollectionMetafields(handle: string) {
  const query = `
    query GetCollectionMetafields($handle: String!) {
      collection(handle: $handle) {
        metafields(first: 20) {
          edges {
            node {
              key
              value
              namespace
              type
            }
          }
        }
      }
    }
  `;

  try {
    const { data } = await shopifyFetch({
      query,
      variables: { handle },
      cache: 'no-store'
    });

    return data?.collection?.metafields?.edges.map((edge: any) => edge.node) || [];
  } catch (error) {
    console.error('Error fetching collection metafields:', error);
    return [];
  }
}