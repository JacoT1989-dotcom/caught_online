import { NextRequest, NextResponse } from "next/server";
import { apiMiddleware } from "@/lib/middlewares/apiMiddleware";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // Get request data
    const data = await request.json();
    const {
      endpoint,
      method = "GET",
      params = {},
      body = {},
      contentType = "application/json",
    } = data;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: "Endpoint is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use the middleware to make the request
    const response = await apiMiddleware.request({
      endpoint,
      method,
      params,
      data: body,
      contentType,
    });

    return NextResponse.json(
      { success: true, data: response },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in SF proxy:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process your request",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
