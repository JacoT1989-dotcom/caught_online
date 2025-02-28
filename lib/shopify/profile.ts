import { shopifyFetch } from './client';
import { CUSTOMER_UPDATE } from './mutations';

interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export async function updateCustomerProfile(
  customerAccessToken: string,
  customerInput: CustomerUpdateInput
) {
  try {
    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_UPDATE,
      variables: {
        customerAccessToken,
        customer: customerInput,
      },
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerUpdate?.customerUserErrors?.length > 0) {
      throw new Error(data.customerUpdate.customerUserErrors[0].message);
    }

    return data.customerUpdate.customer;
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
}