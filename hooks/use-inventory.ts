// File: hooks/use-inventory.ts

"use client";

import { useState, useCallback, useEffect } from "react";
import { checkInventory } from "@/lib/shopify/inventory";
import { useRegion } from "@/hooks/use-region";
import type { InventoryResponse, ProductInventory } from "@/types/inventory";

const DEFAULT_INVENTORY_STATUS: InventoryResponse = {
  available: false,
  quantity: 0,
  locationAvailability: {},
};

export function useInventory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryResponse>(
    DEFAULT_INVENTORY_STATUS
  );
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const { selectedRegion } = useRegion();

  // Fetch products on component mount or when region changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products from API
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedRegion]);

  const checkProductInventory = useCallback(
    async (handle: string) => {
      if (!handle || !selectedRegion) {
        setInventoryStatus(DEFAULT_INVENTORY_STATUS);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const status = await checkInventory(handle, selectedRegion);
        setInventoryStatus(status);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Inventory check failed";
        console.error(errorMessage, err);
        setError(errorMessage);
        setInventoryStatus(DEFAULT_INVENTORY_STATUS);
      } finally {
        setLoading(false);
      }
    },
    [selectedRegion]
  );

  const getRegionInventory = useCallback(() => {
    if (!selectedRegion) return null;
    return inventoryStatus.locationAvailability[selectedRegion];
  }, [selectedRegion, inventoryStatus]);

  return {
    loading,
    error,
    products,
    inventoryStatus,
    checkProductInventory,
    isAvailable: selectedRegion
      ? getRegionInventory()?.available || false
      : inventoryStatus.available,
    quantity: selectedRegion
      ? getRegionInventory()?.quantity || 0
      : inventoryStatus.quantity,
    getRegionInventory,
  };
}
