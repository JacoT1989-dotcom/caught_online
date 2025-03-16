"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginCustomer,
  registerCustomer,
  getCustomerData,
} from "@/lib/shopify/customer";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: string | null;
  user: any | null;
  customerAccessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
      address1: string;
      address2?: string;
      city: string;
      province: string;
      zip: string;
      country: string;
    };
  }) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      user: null,
      customerAccessToken: null,

      login: async (email: string, password: string) => {
        try {
          const { accessToken, expiresAt } = await loginCustomer(
            email,
            password
          );
          const userData = await getCustomerData(accessToken);

          set({
            isAuthenticated: true,
            accessToken,
            expiresAt,
            user: userData,
            customerAccessToken: accessToken,
          });
        } catch (error) {
          throw error;
        }
      },

      register: async (userData) => {
        try {
          // The userData object now includes the address property
          await registerCustomer(userData);

          // After registration, log the user in
          await get().login(userData.email, userData.password);
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        // Get current user ID before logging out
        const userId = get().user?.id;

        // Update auth state
        set({
          isAuthenticated: false,
          accessToken: null,
          expiresAt: null,
          user: null,
          customerAccessToken: null,
        });

        // Don't need to clear the cart here - the AuthProvider will handle it
        // based on auth state changes
      },

      refreshUserData: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          const userData = await getCustomerData(accessToken);
          set({ user: userData });
        } catch (error) {
          console.error("Error refreshing user data:", error);
          // If token is invalid, log the user out
          if ((error as Error).message.includes("Invalid access token")) {
            get().logout();
          }
        }
      },

      checkSession: async () => {
        const { accessToken, expiresAt, logout } = get();

        if (!accessToken || !expiresAt) {
          logout();
          return;
        }
        // Check if token is expired
        const now = new Date();
        const expiry = new Date(expiresAt);

        if (now >= expiry) {
          logout();
          return;
        }
        // If token is valid but expires soon (within 1 hour), refresh it
        const oneHour = 60 * 60 * 1000;
        if (expiry.getTime() - now.getTime() < oneHour) {
          try {
            const { accessToken: newToken, expiresAt: newExpiry } =
              await loginCustomer(
                get().user.email,

                "refresh"
              );

            set({
              accessToken: newToken,
              expiresAt: newExpiry,
              customerAccessToken: newToken,
            });
          } catch (error) {
            console.error("Failed to refresh token:", error);
          }
        }
      },
    }),
    {
      name: "auth-storage",
      // Only store necessary auth data
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        customerAccessToken: state.accessToken,
        user: {
          id: state.user?.id,
          email: state.user?.email,
          firstName: state.user?.firstName,
          lastName: state.user?.lastName,
        },
      }),
    }
  )
);
