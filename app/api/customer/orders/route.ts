import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrders } from "@/lib/shopify/customer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerAccessToken } = body;

    if (!customerAccessToken) {
      return NextResponse.json(
        { error: "Customer access token is required" },
        { status: 400 }
      );
    }

    const orders = await getCustomerOrders(customerAccessToken);

    // Add this logging
    console.log("Orders from Shopify:", JSON.stringify(orders, null, 2));
    console.log("Orders edge count:", orders?.edges?.length || 0);

    return NextResponse.json({ customer: { orders } });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders" },
      { status: 500 }
    );
  }
}
