import { NextRequest, NextResponse } from "next/server";
import { apiMiddleware } from "@/lib/middlewares/apiMiddleware";

export async function GET() {
  try {
    const customers = await apiMiddleware.getCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch customers",
      },
      { status: 500 }
    );
  }
}
