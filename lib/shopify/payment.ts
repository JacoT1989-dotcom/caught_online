import { shopifyFetch } from './client';

const GET_PAYMENT_METHODS_QUERY = `
  query GetCustomerPaymentMethods {
    customer {
      paymentMethods(first: 10) {
        edges {
          node {
            id
            instrument {
              ... on PaymentCardInstrument {
                brand
                expiryMonth
                expiryYear
                lastDigits
                name
                isDefault
              }
            }
          }
        }
      }
    }
  }
`;

const DELETE_PAYMENT_METHOD_MUTATION = `
  mutation CustomerPaymentMethodDelete($paymentMethodId: ID!) {
    customerPaymentMethodDelete(paymentMethodId: $paymentMethodId) {
      deletedCustomerPaymentMethodId
      userErrors {
        field
        message
      }
    }
  }
`;

export async function getPaymentMethods() {
  try {
    const { data } = await shopifyFetch({
      query: GET_PAYMENT_METHODS_QUERY,
    });

    if (!data?.customer?.paymentMethods?.edges) {
      return [];
    }

    return data.customer.paymentMethods.edges.map(({ node }: any) => ({
      id: node.id,
      brand: node.instrument.brand,
      last4: node.instrument.lastDigits,
      expiryMonth: node.instrument.expiryMonth,
      expiryYear: node.instrument.expiryYear,
      isDefault: node.instrument.isDefault,
    }));
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
}

export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    const { data } = await shopifyFetch({
      query: DELETE_PAYMENT_METHOD_MUTATION,
      variables: { paymentMethodId },
    });

    if (data?.customerPaymentMethodDelete?.userErrors?.length > 0) {
      throw new Error(data.customerPaymentMethodDelete.userErrors[0].message);
    }

    return data?.customerPaymentMethodDelete?.deletedCustomerPaymentMethodId;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}