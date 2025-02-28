import { NextResponse } from "next/server";
import { checkInventory } from "@/lib/shopify/inventory";

// Export this config to mark the route as dynamic
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const region = searchParams.get("locationId");

    if (!handle || !region) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const inventoryData = await checkInventory(handle, region);

    // Type assertion to access the error property safely
    const inventoryResult = inventoryData as {
      error?: string;
    } & typeof inventoryData;

    if (inventoryResult.error) {
      return NextResponse.json(
        { error: inventoryResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      available: inventoryData.available,
      quantity: inventoryData.quantity,
    });
  } catch (error) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { error: "Failed to check inventory" },
      { status: 500 }
    );
  }
}
