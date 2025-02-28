// hooks/useInventory.js
import { useState, useEffect } from "react";

export function useInventory() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInventory() {
      try {
        // In development, you might want to fetch from API
        if (
          process.env.NODE_ENV === "development" &&
          typeof window !== "undefined"
        ) {
          const apiResponse = await fetch("/api/inventory");
          if (!apiResponse.ok) {
            throw new Error("Failed to fetch inventory from API");
          }
          const data = await apiResponse.json();
          setInventory(data);
        } else {
          // In production/static build, fetch from pre-generated JSON
          const response = await fetch("/data/inventory.json");
          if (!response.ok) {
            throw new Error("Failed to fetch inventory data");
          }
          const data = await response.json();
          setInventory(data);
        }
      } catch (err) {
        console.error("Error in useInventory:", err);
        setError(err.message);
        // Set empty inventory as fallback
        setInventory({ products: [] });
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  return { inventory, loading, error };
}
