// lib/middlewares/authMiddleware.ts
import axios from "axios";

// Static token cache
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
const TOKEN_LIFETIME_MS = 10 * 60 * 1000; // 10 minutes

export const authMiddleware = {
  getToken: async (): Promise<string> => {
    // Check if we have a valid cached token
    const now = Date.now();
    if (cachedToken && tokenExpiry && now < tokenExpiry) {
      return cachedToken;
    }

    try {
      const SF_API_URL = process.env.SUBSCRIPTION_FLOW_API_URL;
      const SF_CLIENT_ID = process.env.SUBSCRIPTION_FLOW_CLIENT_ID;
      const SF_CLIENT_SECRET = process.env.SUBSCRIPTION_FLOW_CLIENT_SECRET;

      if (!SF_API_URL || !SF_CLIENT_ID || !SF_CLIENT_SECRET) {
        throw new Error("Missing environment variables for authentication");
      }

      const formData = new URLSearchParams();
      formData.append("client_id", SF_CLIENT_ID);
      formData.append("client_secret", SF_CLIENT_SECRET);
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
          maxRedirects: 0, // Disable automatic redirects
        }
      );

      // Handle redirects manually if needed
      if (
        [301, 302, 307, 308].includes(response.status) &&
        response.headers.location
      ) {
        const redirectResponse = await axios.post(
          response.headers.location,
          formData.toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            },
          }
        );

        if (!redirectResponse.data.access_token) {
          throw new Error(
            "Invalid or missing access token in redirect response"
          );
        }

        cachedToken = redirectResponse.data.access_token;
        tokenExpiry = now + TOKEN_LIFETIME_MS;
        return cachedToken as string;
      }

      // Check response
      if (!response.data || !response.data.access_token) {
        throw new Error("Invalid or missing access token in response");
      }

      cachedToken = response.data.access_token;
      tokenExpiry = now + TOKEN_LIFETIME_MS;
      return cachedToken as string;
    } catch (error) {
      console.error("Authentication error:", error);

      // Add more detailed error logging
      if (axios.isAxiosError(error) && error.response) {
        console.error("Auth API error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      throw new Error("Failed to get authentication token");
    }
  },

  clearTokenCache: () => {
    cachedToken = null;
    tokenExpiry = null;
  },
};
