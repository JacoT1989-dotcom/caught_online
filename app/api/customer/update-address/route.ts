import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify/client";
import { UpdateAddressRequest } from "@/lib/types/customer";

const UPDATE_ADDRESS_MUTATION = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { customerAccessToken, id, address } =
      (await request.json()) as UpdateAddressRequest;

    if (!customerAccessToken) {
      return NextResponse.json(
        { error: "Unauthorized: No access token provided" },
        { status: 401 }
      );
    }

    const { data, errors } = await shopifyFetch({
      query: UPDATE_ADDRESS_MUTATION,
      variables: {
        customerAccessToken,
        id,
        address,
      },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      console.error("GraphQL errors:", errors);
      return NextResponse.json({ error: errors[0].message }, { status: 500 });
    }

    if (data?.customerAddressUpdate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer user errors:",
        data.customerAddressUpdate.customerUserErrors
      );
      return NextResponse.json(
        { error: data.customerAddressUpdate.customerUserErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      address: data.customerAddressUpdate.customerAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}
