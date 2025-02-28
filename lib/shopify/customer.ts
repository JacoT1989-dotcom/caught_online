import { shopifyFetch } from './client';

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
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
      throw new Error(data.customerAccessTokenCreate.customerUserErrors[0].message);
    }

    const { accessToken, expiresAt } = data.customerAccessTokenCreate.customerAccessToken;
    return { accessToken, expiresAt };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}) {
  try {
    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_REGISTER_MUTATION,
      variables: { input },
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerCreate?.customerUserErrors?.length > 0) {
      throw new Error(data.customerCreate.customerUserErrors[0].message);
    }

    return data.customerCreate.customer;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function getCustomerData(customerAccessToken: string) {
  try {
    const { data, errors } = await shopifyFetch({
      query: GET_CUSTOMER_QUERY,
      variables: { customerAccessToken },
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    return data.customer;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    throw error;
  }
}

export async function getCustomerDefaultPostalCode(customerAccessToken: string): Promise<string | null> {
  try {
    const customerData = await getCustomerData(customerAccessToken);
    return customerData?.defaultAddress?.zip || null;
  } catch (error) {
    console.error('Error getting customer postal code:', error);
    return null;
  }
}