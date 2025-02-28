"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useRegion } from "./use-region";
import { checkDeliveryAvailability } from "@/lib/data/postal-codes";

interface PostalCodeStore {
  postalCode: string;
  isValid: boolean;
  isChecking: boolean;
  checkResult: {
    checked: boolean;
    available: boolean;
    region?: string;
    lastCheckedCode?: string; // Added lastCheckedCode to the checkResult object
  };
  setPostalCode: (code: string) => void;
  checkDelivery: () => void;
  reset: () => void;
}

export const usePostalCode = create<PostalCodeStore>()(
  persist(
    (set, get) => ({
      postalCode: "",
      isValid: false,
      isChecking: false,
      checkResult: {
        checked: false,
        available: false,
        lastCheckedCode: undefined,
      },
      setPostalCode: (code) => {
        set({
          postalCode: code,
          // Reset check result if code changes from last checked
          checkResult:
            code !== get().checkResult.lastCheckedCode
              ? {
                  checked: false,
                  available: false,
                  lastCheckedCode: undefined,
                }
              : get().checkResult,
        });
      },
      checkDelivery: () => {
        const { postalCode } = get();
        if (postalCode.length !== 4) return;

        set({ isChecking: true });

        // Simulate API delay
        setTimeout(() => {
          const result = checkDeliveryAvailability(postalCode);

          // Set region if available
          if (result.available && result.region) {
            const { setRegion } = useRegion.getState();
            setRegion(result.region);
          }

          set({
            isChecking: false,
            checkResult: {
              checked: true,
              available: result.available,
              region: result.region,
              lastCheckedCode: postalCode, // Store the last checked code in checkResult
            },
            isValid: result.available,
          });
        }, 500);
      },
      reset: () =>
        set({
          postalCode: "",
          isValid: false,
          isChecking: false,
          checkResult: {
            checked: false,
            available: false,
            lastCheckedCode: undefined, // Reset lastCheckedCode
          },
        }),
    }),
    {
      name: "postal-code-storage",
    }
  )
);
