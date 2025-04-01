import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// SubscriptionFlow API configuration
const SF_API_URL = process.env.SUBSCRIPTION_FLOW_API_URL;
const SF_CLIENT_ID = process.env.SUBSCRIPTION_FLOW_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SUBSCRIPTION_FLOW_CLIENT_SECRET;

interface SuspendRequestBody {
  subscriptionId: string;
  suspensionOption: string;
  date?: string;
}

// Get auth token from SubscriptionFlow
async function getAuthToken(): Promise<string | null> {
  try {
    const formData = new URLSearchParams();
    formData.append("client_id", SF_CLIENT_ID || "");
    formData.append("client_secret", SF_CLIENT_SECRET || "");
    formData.append("grant_type", "client_credentials");

    const response = await axios.post(
      `${SF_API_URL}/oauth/token`,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          Origin: "https://caughtonline.subscriptionflow.com",
          Referer: "https://caughtonline.subscriptionflow.com/",
        },
      }
    );

    // For HTTPS redirects, manually handle them
    if (
      response.status === 301 ||
      response.status === 302 ||
      response.status === 307 ||
      response.status === 308
    ) {
      const redirectUrl = response.headers.location;

      const redirectResponse = await axios.post(
        redirectUrl,
        formData.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      return redirectResponse.data.access_token;
    }

    return response.data.access_token;
  } catch (error) {
    // Add more detailed error logging
    if (axios.isAxiosError(error) && error.response) {
      console.error("SubscriptionFlow API error response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    return null;
  }
}

// Handle POST requests for suspending subscriptions
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get request body
    const body = (await request.json()) as SuspendRequestBody;
    const { subscriptionId, suspensionOption, date } = body;

    if (!subscriptionId || !suspensionOption) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription ID and suspension option are required",
        },
        { status: 400 }
      );
    }

    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to authenticate with SubscriptionFlow",
        },
        { status: 401 }
      );
    }

    // Build form data according to the SubscriptionFlow API docs
    const formData = new URLSearchParams();
    formData.append("suspension_option", suspensionOption);
    if (suspensionOption === "Specific Date" && date) {
      formData.append("date", date);
    }

    try {
      // Use the correct endpoint structure for SubscriptionFlow
      // The API URL might need adjustment - check with SubscriptionFlow documentation
      const apiEndpoint = `/api/v1/subscriptions/${subscriptionId}/suspend`;

      // Make API request according to the official documentation
      const response = await axios.post(
        `${SF_API_URL}${apiEndpoint}`,
        formData.toString(),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            Accept: "application/json",
          },
        }
      );

      return NextResponse.json({ success: true, data: response.data });
    } catch (apiError) {
      console.error("API error suspending subscription:", apiError);

      // Handle specific API errors
      if (axios.isAxiosError(apiError) && apiError.response) {
        console.error("SubscriptionFlow API error details:", {
          status: apiError.response.status,
          data: apiError.response.data,
          url: apiError.config?.url,
        });

        const errorData = apiError.response.data as any;
        const statusCode = apiError.response.status;
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          "SubscriptionFlow API error";

        // Try alternative endpoint format if the first one fails
        if (statusCode === 405) {
          try {
            const alternativeEndpoint = `/api/v1/subscriptions/${subscriptionId}/suspend`;
            if (apiError.config?.url?.includes(alternativeEndpoint)) {
              // If we already tried this format, try another
              const secondAlternativeEndpoint = `/api/v1/subscription/${subscriptionId}/suspend`;

              const secondResponse = await axios.post(
                `${SF_API_URL}${secondAlternativeEndpoint}`,
                formData.toString(),
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                    Accept: "application/json",
                  },
                }
              );

              return NextResponse.json({
                success: true,
                data: secondResponse.data,
              });
            } else {
              const altResponse = await axios.post(
                `${SF_API_URL}${alternativeEndpoint}`,
                formData.toString(),
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                    Accept: "application/json",
                  },
                }
              );

              return NextResponse.json({
                success: true,
                data: altResponse.data,
              });
            }
          } catch (altError) {
            console.error("Alternative endpoint also failed:", altError);
            // Continue to the error response below
          }
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: statusCode }
        );
      }

      throw apiError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error("Error suspending subscription:", error);

    // General error handling
    return NextResponse.json(
      {
        success: false,
        error: "Failed to suspend your subscription. Please try again later.",
      },
      { status: 500 }
    );
  }
}
