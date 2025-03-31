import axios, { AxiosRequestConfig } from "axios";
import { authMiddleware } from "./authMiddleware";

const SF_API_URL = process.env.SUBSCRIPTION_FLOW_API_URL;

interface ApiOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, any>;
  data?: any;
  contentType?: string;
  retries?: number;
}

export const apiMiddleware = {
  request: async <T = any>({
    endpoint,
    method = "GET",
    params = {},
    data = null,
    contentType = "application/x-www-form-urlencoded", // Changed default to form-urlencoded
    retries = 1,
  }: ApiOptions): Promise<T> => {
    // Always ensure endpoint starts with api/v1 if not already
    if (!endpoint.startsWith("api/v1/") && !endpoint.startsWith("/api/v1/")) {
      endpoint = `api/v1/${endpoint}`;
    }

    // Remove any leading slash for consistency
    endpoint = endpoint.replace(/^\//, "");

    try {
      // Get token from auth middleware
      const token = await authMiddleware.getToken();

      // Prepare request config
      const config: AxiosRequestConfig = {
        method,
        url: `${SF_API_URL}/${endpoint}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          Accept: "application/json",
          "Accept-Encoding": "gzip, compress, deflate, br",
        },
      };

      // Handle query parameters for GET requests
      if (method === "GET" && Object.keys(params).length > 0) {
        // For GET requests, we use axios params which will be encoded correctly
        config.params = params;
      }

      // Add data if provided and not GET
      if (method !== "GET" && data) {
        if (contentType === "application/x-www-form-urlencoded") {
          // Convert data to URLSearchParams for form data
          const formData = new URLSearchParams();
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          config.data = formData.toString();
        } else {
          config.data = data;
        }
      }

      // Make the request
      const response = await axios(config);

      // Check if response is HTML (login page) instead of JSON
      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        throw new Error("Received HTML instead of JSON - token may be invalid");
      }

      return response.data;
    } catch (error) {
      console.error(`API error for ${endpoint}:`, error);

      // Add more detailed error logging
      if (axios.isAxiosError(error) && error.response) {
        console.error("SubscriptionFlow API error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      // Handle token expired errors by clearing cache and retrying
      if (
        retries > 0 &&
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        authMiddleware.clearTokenCache();
        return apiMiddleware.request({
          endpoint,
          method,
          params,
          data,
          contentType,
          retries: retries - 1,
        });
      }

      throw error;
    }
  },

  getCustomers: async () => {
    return apiMiddleware.request<any>({
      endpoint: "customers",
      method: "GET",
    });
  },

  getSubscriptions: async (customerId?: string) => {
    // Important: Properly format the Shopify customer ID for SubscriptionFlow
    // This is crucial - SubscriptionFlow expects numeric IDs, not the gid://shopify/Customer/123456 format
    let formattedCustomerId = customerId;

    if (customerId && customerId.includes("shopify/Customer/")) {
      // Extract the numeric part for SubscriptionFlow
      const matches = customerId.match(/\/Customer\/(\d+)/);
      if (matches && matches[1]) {
        formattedCustomerId = matches[1];
      }
    }

    // For GET filter requests, we'll use POST with form data which works better with SubscriptionFlow
    const formData: Record<string, any> = {};
    if (formattedCustomerId) {
      formData["filter[customer_id][$equals]"] = formattedCustomerId;
    }

    return apiMiddleware.request<any>({
      endpoint: "subscriptions/filter",
      method: "POST", // Changed to POST for filters
      data: formData,
      contentType: "application/x-www-form-urlencoded",
    });
  },

  getSubscriptionsByEmail: async (email: string) => {
    // First, find customers with this email
    const customerData = await apiMiddleware.request<any>({
      endpoint: "customers/filter",
      method: "POST",
      data: {
        "filter[email][$equals]": email,
      },
      contentType: "application/x-www-form-urlencoded",
    });

    // Extract customer IDs
    const customers = Array.isArray(customerData.data) ? customerData.data : [];

    if (customers.length === 0) {
      return { data: [] };
    }

    // Get subscriptions for the first customer found
    const customerId = customers[0].id;
    return apiMiddleware.request<any>({
      endpoint: "subscriptions/filter",
      method: "POST",
      data: {
        "filter[customer_id][$equals]": customerId,
      },
      contentType: "application/x-www-form-urlencoded",
    });
  },

  getSubscriptionsByCustomerNumber: async (customerNumber: string) => {
    // First, find customer with this customer number
    const customerData = await apiMiddleware.request<any>({
      endpoint: "customers/filter",
      method: "POST",
      data: {
        "filter[customer_number][$equals]": customerNumber,
      },
      contentType: "application/x-www-form-urlencoded",
    });

    // Extract customer IDs
    const customers = Array.isArray(customerData.data) ? customerData.data : [];

    if (customers.length === 0) {
      return { data: [] };
    }

    // Get subscriptions for the first customer found
    const customerId = customers[0].id;
    return apiMiddleware.request<any>({
      endpoint: "subscriptions/filter",
      method: "POST",
      data: {
        "filter[customer_id][$equals]": customerId,
      },
      contentType: "application/x-www-form-urlencoded",
    });
  },

  suspendSubscription: async (
    id: string,
    suspensionOption: string,
    date?: string
  ) => {
    const data: Record<string, any> = {
      suspension_option: suspensionOption,
    };

    if (suspensionOption === "Specific Date" && date) {
      data.date = date;
    }

    return apiMiddleware.request<any>({
      endpoint: `subscription/${id}/suspend`,
      method: "POST",
      data,
      contentType: "application/x-www-form-urlencoded",
    });
  },

  resumeSubscription: async (
    id: string,
    resumeOption: string,
    date?: string
  ) => {
    const data: Record<string, any> = {
      resume_option: resumeOption,
    };

    if (resumeOption === "Specific Date" && date) {
      data.date = date;
    }

    return apiMiddleware.request<any>({
      endpoint: `subscription/${id}/resume`,
      method: "POST",
      data,
      contentType: "application/x-www-form-urlencoded",
    });
  },
};
