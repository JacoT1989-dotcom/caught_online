import { shopifyFetch } from "./client";

const GET_CUSTOMER_SUBSCRIPTIONS = `
  query GetCustomerSubscriptions($customerId: ID!) {
    customer(id: $customerId) {
      subscriptions(first: 10) {
        edges {
          node {
            id
            status
            nextDeliveryDate
            interval
            product {
              title
              featuredImage {
                url
                altText
              }
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const UPDATE_SUBSCRIPTION_STATUS = `
  mutation UpdateSubscriptionStatus($id: ID!, $status: SubscriptionStatus!) {
    subscriptionUpdate(input: {
      id: $id
      status: $status
    }) {
      subscription {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_SUBSCRIPTION_DETAILS = `
  mutation UpdateSubscriptionDetails($id: ID!, $interval: String!, $nextDeliveryDate: Date!) {
    subscriptionUpdate(input: {
      id: $id
      interval: $interval
      nextDeliveryDate: $nextDeliveryDate
    }) {
      subscription {
        id
        interval
        nextDeliveryDate
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Define TypeScript interfaces
interface Subscription {
  id: string;
  status: "ACTIVE" | "PAUSED";
  nextDeliveryDate: string;
  interval: string;
  product: {
    title: string;
    image: string;
  };
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface SubscriptionDetails {
  interval: string;
  nextDeliveryDate: string;
}

export async function getCustomerSubscriptions(
  customerId: string
): Promise<Subscription[]> {
  try {
    const { data } = await shopifyFetch({
      query: GET_CUSTOMER_SUBSCRIPTIONS,
      variables: { customerId },
    });

    if (!data?.customer?.subscriptions?.edges) {
      return [];
    }

    return data.customer.subscriptions.edges.map(({ node }: any) => ({
      id: node.id,
      status: node.status,
      nextDeliveryDate: node.nextDeliveryDate,
      interval: node.interval,
      product: {
        title: node.product.title,
        image: node.product.featuredImage?.url || "",
      },
      price: node.price,
    }));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
}

export async function updateSubscriptionStatus(
  id: string,
  status: "ACTIVE" | "PAUSED"
) {
  try {
    const { data } = await shopifyFetch({
      query: UPDATE_SUBSCRIPTION_STATUS,
      variables: { id, status },
      cache: "no-store",
    });

    if (data?.subscriptionUpdate?.userErrors?.length > 0) {
      throw new Error(data.subscriptionUpdate.userErrors[0].message);
    }

    return data?.subscriptionUpdate?.subscription;
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
}

export async function updateSubscriptionDetails(
  id: string,
  details: SubscriptionDetails
) {
  try {
    const { data } = await shopifyFetch({
      query: UPDATE_SUBSCRIPTION_DETAILS,
      variables: {
        id,
        interval: details.interval,
        nextDeliveryDate: details.nextDeliveryDate,
      },
      cache: "no-store",
    });

    if (data?.subscriptionUpdate?.userErrors?.length > 0) {
      throw new Error(data.subscriptionUpdate.userErrors[0].message);
    }

    return data?.subscriptionUpdate?.subscription;
  } catch (error) {
    console.error("Error updating subscription details:", error);
    throw error;
  }
}
