import { shopifyFetch } from "./client";

const CUSTOMER_LOGIN_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_REGISTER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Update the addCustomerAddress function in lib/shopify/customer.ts

export async function addCustomerAddress(
  customerAccessToken: string,
  address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    firstName?: string;
    lastName?: string;
  }
) {
  // Include first name and last name in the address if not provided
  // This is because Shopify often requires these fields for addresses
  const ADD_ADDRESS_MUTATION = `
    mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress {
          id
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  try {
    // Get customer data to ensure we have firstName and lastName if needed
    const customerData = await getCustomerData(customerAccessToken);

    // Add customer name to address if not provided
    const completeAddress = {
      ...address,
      firstName: address.firstName || customerData.firstName,
      lastName: address.lastName || customerData.lastName,
    };

    console.log("Adding address with data:", JSON.stringify(completeAddress));

    const { data, errors } = await shopifyFetch({
      query: ADD_ADDRESS_MUTATION,
      variables: {
        customerAccessToken,
        address: completeAddress,
      },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      console.error("GraphQL errors:", errors);
      throw new Error(errors[0].message);
    }

    if (data?.customerAddressCreate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer user errors:",
        data.customerAddressCreate.customerUserErrors
      );
      throw new Error(data.customerAddressCreate.customerUserErrors[0].message);
    }

    const addressId = data.customerAddressCreate.customerAddress.id;

    // Now set this as the default address
    await setDefaultAddress(customerAccessToken, addressId);

    return data.customerAddressCreate.customerAddress;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
}

// Add this function to set the default address
export async function setDefaultAddress(
  customerAccessToken: string,
  addressId: string
) {
  const SET_DEFAULT_ADDRESS_MUTATION = `
    mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
      customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
        customer {
          id
          defaultAddress {
            id
          }
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  try {
    const { data, errors } = await shopifyFetch({
      query: SET_DEFAULT_ADDRESS_MUTATION,
      variables: {
        customerAccessToken,
        addressId,
      },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      console.error("GraphQL errors setting default address:", errors);
      throw new Error(errors[0].message);
    }

    if (data?.customerDefaultAddressUpdate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer user errors setting default address:",
        data.customerDefaultAddressUpdate.customerUserErrors
      );
      throw new Error(
        data.customerDefaultAddressUpdate.customerUserErrors[0].message
      );
    }

    return data.customerDefaultAddressUpdate.customer;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
}

// Now update the registerCustomer function to handle potential timing issues
export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
}) {
  const { address, ...customerInput } = input;

  try {
    console.log(
      "Registering customer with data:",
      JSON.stringify({
        ...customerInput,
        password: "******", // Don't log actual password
      })
    );

    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_REGISTER_MUTATION,
      variables: {
        input: {
          ...customerInput,
          acceptsMarketing: true,
        },
      },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      console.error("GraphQL errors registering customer:", errors);
      throw new Error(errors[0].message);
    }

    if (data?.customerCreate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer user errors registering customer:",
        data.customerCreate.customerUserErrors
      );
      throw new Error(data.customerCreate.customerUserErrors[0].message);
    }

    const customerData = data.customerCreate.customer;
    console.log("Customer created successfully:", customerData.id);

    // If address is provided and customer was created successfully, add the address
    if (address) {
      try {
        console.log("Attempting to add address for customer:", customerData.id);

        // We'll need to login first to get access token
        const { accessToken } = await loginCustomer(
          input.email,
          input.password
        );
        console.log("Login successful, obtained access token");

        // Add a delay to ensure token is properly processed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Then add the address
        const addressData = {
          ...address,
          firstName: input.firstName,
          lastName: input.lastName,
        };

        await addCustomerAddress(accessToken, addressData);
        console.log("Address added successfully");
      } catch (addressError) {
        console.error("Error adding address:", addressError);
        // We won't fail the registration if adding address fails
        // The user can add their address later
      }
    }

    return customerData;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

const GET_CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        address1
        address2
        city
        province
        zip
        country
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            zip
            country
          }
        }
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function loginCustomer(email: string, password: string) {
  try {
    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_LOGIN_MUTATION,
      variables: {
        input: {
          email,
          password,
        },
      },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
      throw new Error(
        data.customerAccessTokenCreate.customerUserErrors[0].message
      );
    }

    const { accessToken, expiresAt } =
      data.customerAccessTokenCreate.customerAccessToken;
    return { accessToken, expiresAt };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function getCustomerData(customerAccessToken: string) {
  try {
    const { data, errors } = await shopifyFetch({
      query: GET_CUSTOMER_QUERY,
      variables: { customerAccessToken },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    return data.customer;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw error;
  }
}

export async function getCustomerDefaultPostalCode(
  customerAccessToken: string
): Promise<string | null> {
  try {
    const customerData = await getCustomerData(customerAccessToken);
    return customerData?.defaultAddress?.zip || null;
  } catch (error) {
    console.error("Error getting customer postal code:", error);
    return null;
  }
}

const GET_CUSTOMER_ORDERS_QUERY = `
  query getCustomerOrders($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPriceV2: currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  originalTotalPrice {
                    amount
                    currencyCode
                  }
                  variant {
                    id
                    title
                    image {
                      url
                      altText
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

export async function getCustomerOrders(customerAccessToken: string) {
  try {
    const { data, errors } = await shopifyFetch({
      query: GET_CUSTOMER_ORDERS_QUERY,
      variables: { customerAccessToken },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    return data.customer?.orders || { edges: [] };
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return { edges: [] };
  }
}
