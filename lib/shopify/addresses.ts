import { shopifyFetch } from './client';
import {
  CUSTOMER_ADDRESS_CREATE,
  CUSTOMER_ADDRESS_UPDATE,
  CUSTOMER_ADDRESS_DELETE,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE
} from './mutations';

interface Address {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}

export async function createCustomerAddress(customerAccessToken: string, address: Address) {
  try {
    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_ADDRESS_CREATE,
      variables: {
        customerAccessToken,
        address,
      },
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerAddressCreate?.customerUserErrors?.length > 0) {
      throw new Error(data.customerAddressCreate.customerUserErrors[0].message);
    }

    return data.customerAddressCreate.customerAddress;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

export async function updateCustomerAddress(
  customerAccessToken: string,
  addressId: string,
  address: Address
) {
  try {
    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_ADDRESS_UPDATE,
      variables: {
        customerAccessToken,
        id: addressId,
        address,
      },
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerAddressUpdate?.customerUserErrors?.length > 0) {
      throw new Error(data.customerAddressUpdate.customerUserErrors[0].message);
    }

    return data.customerAddressUpdate.customerAddress;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

export async function deleteCustomerAddress(customerAccessToken: string, addressId: string) {
  try {
    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_ADDRESS_DELETE,
      variables: {
        customerAccessToken,
        id: addressId,
      },
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerAddressDelete?.customerUserErrors?.length > 0) {
      throw new Error(data.customerAddressDelete.customerUserErrors[0].message);
    }

    return data.customerAddressDelete.deletedCustomerAddressId;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}

export async function setDefaultCustomerAddress(customerAccessToken: string, addressId: string) {
  try {
    const { data, errors } = await shopifyFetch({
      query: CUSTOMER_DEFAULT_ADDRESS_UPDATE,
      variables: {
        customerAccessToken,
        addressId,
      },
      cache: 'no-store',
    });

    if (errors?.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data?.customerDefaultAddressUpdate?.customerUserErrors?.length > 0) {
      throw new Error(data.customerDefaultAddressUpdate.customerUserErrors[0].message);
    }

    return data.customerDefaultAddressUpdate.customer;
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
}