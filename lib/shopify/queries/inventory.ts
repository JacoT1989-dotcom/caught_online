//lib/shopify/queries/inventory.ts

export const GET_PRODUCT_INVENTORY = `
  query GetProductInventory($handle: String!) {
    product(handle: $handle) {
      availableForSale
      variants(first: 1) {
        edges {
          node {
            id
            availableForSale
            inventoryItem {
              inventoryLevels(first: 10) {
                edges {
                  node {
                    quantity
                    location {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;