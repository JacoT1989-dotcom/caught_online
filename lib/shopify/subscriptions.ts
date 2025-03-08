import { shopifyFetch } from "./client";

// Define TypeScript interfaces
export interface Subscription {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
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

export interface SubscriptionDetails {
  interval: string;
  nextDeliveryDate: string;
}

// Updated GraphQL queries that align with Shopify Subscription API
const GET_CUSTOMER_SUBSCRIPTIONS = `
  query GetCustomerSubscriptions($customerId: ID!) {
    customer(id: $customerId) {
      id
      metafield(namespace: "subscriptions", key: "customer_subscriptions") {
        value
      }
      orders(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  id
                  title
                  quantity
                  variant {
                    id
                    image {
                      url
                      altText
                    }
                    product {
                      id
                      title
                    }
                  }
                  metafield(namespace: "subscriptions", key: "subscription_details") {
                    value
                  }
                }
              }
            }
            metafield(namespace: "subscriptions", key: "order_subscription") {
              value
            }
          }
        }
      }
    }
  }
`;

const UPDATE_SUBSCRIPTION_STATUS = `
  mutation UpdateSubscriptionMetafield($subscriptionId: ID!, $status: String!) {
    metafieldUpdate(
      metafield: {
        id: $subscriptionId,
        value: $status
      }
    ) {
      metafield {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_SUBSCRIPTION_DETAILS = `
  mutation UpdateSubscriptionMetafield($subscriptionId: ID!, $value: String!) {
    metafieldUpdate(
      metafield: {
        id: $subscriptionId,
        value: $value
      }
    ) {
      metafield {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Processing function to extract subscription data
function processSubscriptionData(data: any): Subscription[] {
  console.log("Processing subscription data:", data);

  if (!data?.customer) {
    console.log("No customer data found");
    return [];
  }

  const subscriptions: Subscription[] = [];

  // First check for subscription metafield on customer (some apps store data this way)
  if (data.customer.metafield && data.customer.metafield.value) {
    try {
      const metafieldValue = JSON.parse(data.customer.metafield.value);
      console.log("Found customer subscription metafield:", metafieldValue);

      // Process metafield subscription data (adjust based on your app's data structure)
      if (Array.isArray(metafieldValue)) {
        return metafieldValue.map((sub) => ({
          id: sub.id,
          status: sub.status,
          nextDeliveryDate: sub.next_delivery_date || sub.nextDeliveryDate,
          interval: sub.interval,
          product: {
            title: sub.product_title || sub.productTitle,
            image: sub.product_image || sub.productImage || "",
          },
          price: {
            amount: sub.price?.amount || sub.amount || "0",
            currencyCode: sub.price?.currencyCode || sub.currencyCode || "USD",
          },
        }));
      }
    } catch (e) {
      console.error("Error parsing customer subscription metafield:", e);
    }
  }

  // Check for subscription data in order metafields
  if (data.customer.orders?.edges) {
    data.customer.orders.edges.forEach(({ node: order }: any) => {
      // Check for order-level subscription metafield
      if (order.metafield && order.metafield.value) {
        try {
          const orderSubData = JSON.parse(order.metafield.value);
          console.log("Found order subscription metafield:", orderSubData);

          // Convert to our Subscription format (adjust based on your app's data structure)
          if (orderSubData.id) {
            subscriptions.push({
              id: orderSubData.id,
              status: orderSubData.status,
              nextDeliveryDate:
                orderSubData.next_delivery_date ||
                orderSubData.nextDeliveryDate,
              interval: orderSubData.interval,
              product: {
                title:
                  orderSubData.product_title ||
                  order.lineItems?.edges[0]?.node.title ||
                  "Subscription",
                image:
                  orderSubData.product_image ||
                  order.lineItems?.edges[0]?.node.variant?.image?.url ||
                  "",
              },
              price: {
                amount: orderSubData.price || order.totalPrice.amount,
                currencyCode:
                  orderSubData.currency_code || order.totalPrice.currencyCode,
              },
            });
          }
        } catch (e) {
          console.error("Error parsing order subscription metafield:", e);
        }
      }

      // Check for line-item level subscription metafields
      if (order.lineItems?.edges) {
        order.lineItems.edges.forEach(({ node: item }: any) => {
          if (item.metafield && item.metafield.value) {
            try {
              const itemSubData = JSON.parse(item.metafield.value);
              console.log(
                "Found line item subscription metafield:",
                itemSubData
              );

              // Convert to our Subscription format
              if (itemSubData.subscription_id || itemSubData.id) {
                subscriptions.push({
                  id: itemSubData.subscription_id || itemSubData.id,
                  status: itemSubData.status || "ACTIVE",
                  nextDeliveryDate:
                    itemSubData.next_delivery_date ||
                    itemSubData.nextDeliveryDate ||
                    new Date().toISOString(),
                  interval: itemSubData.interval || "monthly",
                  product: {
                    title: item.title,
                    image: item.variant?.image?.url || "",
                  },
                  price: {
                    amount: itemSubData.price || order.totalPrice.amount,
                    currencyCode:
                      itemSubData.currency_code ||
                      order.totalPrice.currencyCode,
                  },
                });
              }
            } catch (e) {
              console.error(
                "Error parsing line item subscription metafield:",
                e
              );
            }
          }
        });
      }
    });
  }

  return subscriptions;
}

export async function getCustomerSubscriptions(
  customerId: string
): Promise<Subscription[]> {
  console.log("Fetching subscriptions for customer ID:", customerId);

  try {
    const { data, errors } = await shopifyFetch({
      query: GET_CUSTOMER_SUBSCRIPTIONS,
      variables: { customerId },
    });

    if (errors) {
      console.error("GraphQL errors:", errors);
      throw new Error(errors[0].message);
    }

    return processSubscriptionData(data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error; // Properly throw the error in production
  }
}

export async function updateSubscriptionStatus(
  id: string,
  status: "ACTIVE" | "PAUSED"
): Promise<any> {
  try {
    // For many subscription apps, we need to update the value as a JSON string
    const currentSubscription = JSON.stringify({ status });

    const { data } = await shopifyFetch({
      query: UPDATE_SUBSCRIPTION_STATUS,
      variables: { subscriptionId: id, status: currentSubscription },
      cache: "no-store",
    });

    if (data?.metafieldUpdate?.userErrors?.length > 0) {
      throw new Error(data.metafieldUpdate.userErrors[0].message);
    }

    return data?.metafieldUpdate?.metafield;
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
}

export async function updateSubscriptionDetails(
  id: string,
  details: SubscriptionDetails
): Promise<any> {
  try {
    // Create a JSON string with the updated details
    const updatedDetails = JSON.stringify(details);

    const { data } = await shopifyFetch({
      query: UPDATE_SUBSCRIPTION_DETAILS,
      variables: { subscriptionId: id, value: updatedDetails },
      cache: "no-store",
    });

    if (data?.metafieldUpdate?.userErrors?.length > 0) {
      throw new Error(data.metafieldUpdate.userErrors[0].message);
    }

    return data?.metafieldUpdate?.metafield;
  } catch (error) {
    console.error("Error updating subscription details:", error);
    throw error;
  }
}
