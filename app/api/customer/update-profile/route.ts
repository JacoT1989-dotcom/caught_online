import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify/client";
import { UpdateProfileRequest } from "@/lib/types/customer";

const UPDATE_CUSTOMER_MUTATION = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
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
    const { customerAccessToken, customer } =
      (await request.json()) as UpdateProfileRequest;

    if (!customerAccessToken) {
      return NextResponse.json(
        { error: "Unauthorized: No access token provided" },
        { status: 401 }
      );
    }

    const { data, errors } = await shopifyFetch({
      query: UPDATE_CUSTOMER_MUTATION,
      variables: {
        customerAccessToken,
        customer,
      },
      cache: "no-store",
    });

    if (errors?.length > 0) {
      console.error("GraphQL errors:", errors);
      return NextResponse.json({ error: errors[0].message }, { status: 500 });
    }

    if (data?.customerUpdate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer user errors:",
        data.customerUpdate.customerUserErrors
      );
      return NextResponse.json(
        { error: data.customerUpdate.customerUserErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data.customerUpdate.customer,
    });
  } catch (error) {
    console.error("Error updating customer profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
