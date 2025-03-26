import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify/client";
import { AddAddressRequest } from "@/lib/types/customer";
const ADD_ADDRESS_MUTATION = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        country
        zip
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { customerAccessToken, address } =
      (await request.json()) as AddAddressRequest;

    if (!customerAccessToken) {
      return NextResponse.json(
        { error: "Unauthorized: No access token provided" },
        { status: 401 }
      );
    }

    // First, create the address
    const { data, errors } = await shopifyFetch({
      query: ADD_ADDRESS_MUTATION,
      variables: {
        customerAccessToken,
        address,
      },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      console.error("GraphQL errors:", errors);
      return NextResponse.json({ error: errors[0].message }, { status: 500 });
    }

    if (data?.customerAddressCreate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer user errors:",
        data.customerAddressCreate.customerUserErrors
      );
      return NextResponse.json(
        { error: data.customerAddressCreate.customerUserErrors[0].message },
        { status: 400 }
      );
    }

    // If address creation was successful, set it as default
    const addressId = data.customerAddressCreate.customerAddress.id;

    const { data: defaultData, errors: defaultErrors } = await shopifyFetch({
      query: SET_DEFAULT_ADDRESS_MUTATION,
      variables: {
        customerAccessToken,
        addressId,
      },
      cache: "no-store",
    });

    if (defaultErrors?.length > 0) {
      console.error("GraphQL errors setting default address:", defaultErrors);
      // Don't fail the request if setting default fails, still return success for address creation
    }

    if (
      defaultData?.customerDefaultAddressUpdate?.customerUserErrors?.length > 0
    ) {
      console.error(
        "Customer user errors setting default address:",
        defaultData.customerDefaultAddressUpdate.customerUserErrors
      );
      // Don't fail the request if setting default fails, still return success for address creation
    }

    return NextResponse.json({
      success: true,
      address: data.customerAddressCreate.customerAddress,
      isDefault:
        !defaultErrors &&
        !defaultData?.customerDefaultAddressUpdate?.customerUserErrors?.length,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}
