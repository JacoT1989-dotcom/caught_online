import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

// SubscriptionFlow API configuration
const SF_API_URL = process.env.SUBSCRIPTION_FLOW_API_URL;
const SF_CLIENT_ID = process.env.SUBSCRIPTION_FLOW_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SUBSCRIPTION_FLOW_CLIENT_SECRET;

// Define interfaces for type safety
interface Subscription {
  id: string;
  name: string;
  display_name?: string;
  status: string;
  type: string;
  renewal_type: string;
  total_amount: number;
  is_auto_renew: number;
  customer_id?: string;
  customer_email?: string;
  customer_number?: string;
  payment_status?: string;
  [key: string]: any; // For additional properties
}

interface Customer {
  id: string;
  email?: string;
  name?: string;
  customer_number?: string;
  [key: string]: any;
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
    console.error("Error getting auth token:", error);
    return null;
  }
}

// Extract data from response object
function extractData<T>(responseData: any): T[] {
  if (!responseData) return [];

  if (Array.isArray(responseData)) {
    return responseData as T[];
  }

  if (responseData.data && Array.isArray(responseData.data)) {
    return responseData.data as T[];
  }

  return [];
}

// Handle GET requests for listing subscriptions
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");
  const customerId = searchParams.get("customerId");
  const customerNumber = searchParams.get("customerNumber");

  // Security check: at least one identifier must be provided
  if (!email && !customerId && !customerNumber) {
    return NextResponse.json(
      { success: false, error: "Customer identifier required" },
      { status: 400 }
    );
  }

  try {
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

    // Create authenticated API client
    const apiClient = axios.create({
      baseURL: SF_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded", // Use form content type
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache",
        Accept: "application/json",
      },
    });

    // STEP 1: Find the customer by email, customerId, or customerNumber
    if (email) {
      try {
        // Create form data for customer lookup
        const customerFormData = new URLSearchParams();
        customerFormData.append("filter[email][$equals]", email);

        // Make the request using form-data format
        const customerResponse = await apiClient.post(
          "/api/v1/customers/filter",
          customerFormData.toString()
        );

        const customers = extractData<Customer>(customerResponse.data);

        if (customers.length > 0) {
          // For each customer found, get their subscriptions
          let allSubscriptions: Subscription[] = [];

          for (const customer of customers) {
            // Create form data for subscription lookup
            const subFormData = new URLSearchParams();
            subFormData.append("filter[customer_id][$equals]", customer.id);

            // Make the request using form-data format
            const subResponse = await apiClient.post(
              "/api/v1/subscriptions/filter",
              subFormData.toString()
            );

            const customerSubscriptions = extractData<Subscription>(
              subResponse.data
            );

            // Add to our collection
            allSubscriptions = [...allSubscriptions, ...customerSubscriptions];
          }

          return NextResponse.json({ success: true, data: allSubscriptions });
        } else {
        }
      } catch (error) {
        console.error("Error finding customer by email:", error);
      }
    } else if (customerId) {
      // Get subscriptions by direct customer ID
      try {
        // Create form data for subscription lookup
        const subFormData = new URLSearchParams();
        subFormData.append("filter[customer_id][$equals]", customerId);

        // Make the request using form-data format
        const response = await apiClient.post(
          "/api/v1/subscriptions/filter",
          subFormData.toString()
        );

        const subscriptions = extractData<Subscription>(response.data);

        return NextResponse.json({ success: true, data: subscriptions });
      } catch (error) {
        console.error("Error getting subscriptions by customer ID:", error);
      }
    } else if (customerNumber) {
      // Find customer by customer number first
      try {
        // Create form data for customer lookup
        const customerFormData = new URLSearchParams();
        customerFormData.append(
          "filter[customer_number][$equals]",
          customerNumber
        );

        // Make the request using form-data format
        const customerResponse = await apiClient.post(
          "/api/v1/customers/filter",
          customerFormData.toString()
        );

        const customers = extractData<Customer>(customerResponse.data);

        if (customers.length > 0) {
          const customer = customers[0];

          // Create form data for subscription lookup
          const subFormData = new URLSearchParams();
          subFormData.append("filter[customer_id][$equals]", customer.id);

          // Make the request using form-data format
          const subResponse = await apiClient.post(
            "/api/v1/subscriptions/filter",
            subFormData.toString()
          );

          const subscriptions = extractData<Subscription>(subResponse.data);

          return NextResponse.json({ success: true, data: subscriptions });
        } else {
          console.log(
            `No customer found with customer number: ${customerNumber}`
          );
        }
      } catch (error) {
        console.error("Error finding customer by customer number:", error);
      }
    }

    // Return empty array if no subscriptions found
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error processing subscription list request:", error);

    // Handle specific error responses
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const errorData = axiosError.response.data as any;
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          "SubscriptionFlow API error";

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: statusCode }
        );
      }
    }

    // General error handling
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
