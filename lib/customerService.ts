// lib/subscriptionService.ts
/**
 * Interface for subscription data
 */
export interface Subscription {
  id: string;
  name: string;
  display_name?: string;
  status: string;
  type: string;
  renewal_type: string;
  total_amount: number;
  is_auto_renew: number;
  payment_status?: string;
  created_at: string;
  suspended_at: string | null;
  cancelled_at: string | null;
  billing_end_date: string | null;
  next_bill_date: string | null;
  updated_at: string;
  customer_id?: string;
  customer_email?: string;
  customer_number?: string;
  customer?: {
    id?: string;
    email?: string;
    customer_number?: string;
  };
  items?: any[];
  [key: string]: any; // Allow for additional properties
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Service for interacting with the SubscriptionFlow-related API routes
 */
export const SubscriptionFlowService = {
  /**
   * Get subscriptions for a customer by ID
   * @param customerId - The customer ID (Shopify ID or SubscriptionFlow ID)
   */
  getSubscriptions: async (customerId?: string): Promise<Subscription[]> => {
    try {
      console.log("Fetching subscriptions for customer ID:", customerId);

      const url = customerId
        ? `/api/subscriptionsflow/subscriptions?customerId=${encodeURIComponent(customerId)}`
        : `/api/subscriptionsflow/subscriptions`;

      const response = await fetch(url);

      // Log status for debugging
      console.log(`Subscription fetch response status: ${response.status}`);

      if (!response.ok) {
        // Try to get detailed error message
        const errorText = await response.text();
        console.error("Error response:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to fetch subscriptions");
        } catch (e) {
          throw new Error(
            `Request failed with status ${response.status}: ${errorText}`
          );
        }
      }

      const result = await response.json() as ApiResponse<Subscription[]>;

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch subscriptions");
      }

      // Ensure we always have an array, even if data is null/undefined
      const subscriptions = result.data || [];
      console.log(`Received ${subscriptions.length} subscriptions for customer ID: ${customerId}`);
      
      return subscriptions;
    } catch (error) {
      console.error("Subscription service error:", error);
      throw error;
    }
  },

  /**
   * Get subscriptions for a customer by email
   * @param email - The customer's email address
   */
  getSubscriptionsByEmail: async (email: string): Promise<Subscription[]> => {
    try {
      console.log("Fetching subscriptions for customer email:", email);

      const url = `/api/subscriptionsflow/subscriptions?email=${encodeURIComponent(email)}`;

      const response = await fetch(url);

      // Log status for debugging
      console.log(`Subscription by email fetch response status: ${response.status}`);

      if (!response.ok) {
        // Try to get detailed error message
        const errorText = await response.text();
        console.error("Error response:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            errorJson.error || "Failed to fetch subscriptions by email"
          );
        } catch (e) {
          throw new Error(
            `Request failed with status ${response.status}: ${errorText}`
          );
        }
      }

      const result = await response.json() as ApiResponse<Subscription[]>;

      if (!result.success) {
        throw new Error(
          result.error || "Failed to fetch subscriptions by email"
        );
      }

      // Ensure we always have an array, even if data is null/undefined
      const subscriptions = result.data || [];
      console.log(`Retrieved ${subscriptions.length} subscriptions by email`);
      console.log("Subscriptions retrieved:", subscriptions);
      
      return subscriptions;
    } catch (error) {
      console.error("Subscription by email service error:", error);
      throw error;
    }
  },

  /**
   * Get subscriptions for a customer by customer number
   * @param customerNumber - The customer number (e.g., CUST_3)
   */
  getSubscriptionsByCustomerNumber: async (
    customerNumber: string
  ): Promise<Subscription[]> => {
    try {
      console.log(
        "Fetching subscriptions for customer number:",
        customerNumber
      );

      const url = `/api/subscriptionsflow/subscriptions?customerNumber=${encodeURIComponent(customerNumber)}`;

      const response = await fetch(url);

      // Log status for debugging
      console.log(
        `Subscription by customer number fetch response status: ${response.status}`
      );

      if (!response.ok) {
        // Try to get detailed error message
        const errorText = await response.text();
        console.error("Error response:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            errorJson.error ||
              "Failed to fetch subscriptions by customer number"
          );
        } catch (e) {
          throw new Error(
            `Request failed with status ${response.status}: ${errorText}`
          );
        }
      }

      const result = await response.json() as ApiResponse<Subscription[]>;

      if (!result.success) {
        throw new Error(
          result.error || "Failed to fetch subscriptions by customer number"
        );
      }

      // Ensure we always have an array, even if data is null/undefined
      const subscriptions = result.data || [];
      console.log(`Retrieved ${subscriptions.length} subscriptions by customer number`);
      
      return subscriptions;
    } catch (error) {
      console.error("Subscription by customer number service error:", error);
      throw error;
    }
  },

  /**
   * Suspend a subscription
   * @param subscriptionId - The ID of the subscription to suspend
   * @param suspensionOption - The suspension option (Today, End of Last Invoice Period, etc.)
   * @param date - Optional date for Specific Date suspension
   */
  suspendSubscription: async (
    subscriptionId: string,
    suspensionOption: string,
    date?: string
  ): Promise<any> => {
    try {
      console.log("Suspending subscription:", {
        subscriptionId,
        suspensionOption,
        date,
      });

      const response = await fetch("/api/subscriptionsflow/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
          suspensionOption,
          date,
        }),
      });

      // Log status for debugging
      console.log(`Suspension response status: ${response.status}`);

      if (!response.ok) {
        // Try to get detailed error message
        const errorText = await response.text();
        console.error("Error response:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to suspend subscription");
        } catch (e) {
          throw new Error(
            `Request failed with status ${response.status}: ${errorText}`
          );
        }
      }

      const result = await response.json() as ApiResponse<any>;

      if (!result.success) {
        throw new Error(result.error || "Failed to suspend subscription");
      }

      return result.data;
    } catch (error) {
      console.error("Subscription service error:", error);
      throw error;
    }
  },

  /**
   * Resume a subscription
   * @param subscriptionId - The ID of the subscription to resume
   * @param resumeOption - The resume option (Today, Specific Date)
   * @param date - Optional date for Specific Date resumption
   */
  resumeSubscription: async (
    subscriptionId: string,
    resumeOption: string,
    date?: string
  ): Promise<any> => {
    try {
      console.log("Resuming subscription:", {
        subscriptionId,
        resumeOption,
        date,
      });

      const response = await fetch("/api/subscriptionsflow/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
          resumeOption,
          date,
        }),
      });

      // Log status for debugging
      console.log(`Resume response status: ${response.status}`);

      if (!response.ok) {
        // Try to get detailed error message
        const errorText = await response.text();
        console.error("Error response:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to resume subscription");
        } catch (e) {
          throw new Error(
            `Request failed with status ${response.status}: ${errorText}`
          );
        }
      }

      const result = await response.json() as ApiResponse<any>;

      if (!result.success) {
        throw new Error(result.error || "Failed to resume subscription");
      }

      return result.data;
    } catch (error) {
      console.error("Subscription service error:", error);
      throw error;
    }
  },
};

export default SubscriptionFlowService;