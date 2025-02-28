import { shopifyFetch } from "./client";

const CREATE_CHECKOUT_MUTATION = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
        totalPrice {
          amount
          currencyCode
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

const ADD_LINES_MUTATION = `
  mutation checkoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
    checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
      checkout {
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function createCheckout(items: any[]) {
  try {
    // Filter out items that don't have a variantId
    const validItems = items.filter((item) => item.variantId);

    // If no valid items, throw an error
    if (validItems.length === 0) {
      throw new Error("No items with valid variantId found in cart");
    }

    // Log for debugging
    console.log("Creating checkout with valid items:", validItems);

    const lineItems = items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const { data } = await shopifyFetch({
      query: CREATE_CHECKOUT_MUTATION,
      variables: {
        input: {
          lineItems,
          allowPartialAddresses: true,
        },
      },
      cache: "no-store",
    });

    if (data?.checkoutCreate?.checkoutUserErrors?.length > 0) {
      throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
    }

    return data?.checkoutCreate?.checkout;
  } catch (error) {
    console.error("Error creating checkout:", error);
    throw error;
  }
}

export async function addItemsToCheckout(checkoutId: string, items: any[]) {
  try {
    const lineItems = items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const { data } = await shopifyFetch({
      query: ADD_LINES_MUTATION,
      variables: {
        checkoutId,
        lineItems,
      },
      cache: "no-store",
    });

    if (data?.checkoutLineItemsAdd?.checkoutUserErrors?.length > 0) {
      throw new Error(data.checkoutLineItemsAdd.checkoutUserErrors[0].message);
    }

    return data?.checkoutLineItemsAdd?.checkout;
  } catch (error) {
    console.error("Error adding items to checkout:", error);
    throw error;
  }
}
