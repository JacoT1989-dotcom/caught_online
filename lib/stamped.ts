// @/lib/reviews/stamped.ts

export const STAMPED_CONFIG = {
  storeHash: process.env.NEXT_PUBLIC_STAMPED_STORE_HASH || "151250",
  publicKey:
    process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY ||
    "pubkey-4R57319D5548L8eyo3k03s5CiWb08O",
  apiUrl: "https://stamped.io/api/v2",
} as const;

// Define a proper interface for the rating summary
export interface StampedRatingSummary {
  stars: number;
  count: number;
}

export async function fetchStampedStats(productId?: string) {
  const url = productId
    ? `${STAMPED_CONFIG.apiUrl}/stats/${STAMPED_CONFIG.storeHash}/${productId}`
    : `${STAMPED_CONFIG.apiUrl}/stats/${STAMPED_CONFIG.storeHash}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STAMPED_CONFIG.publicKey}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching Stamped.io stats:", error);
    throw error;
  }
}

/**
 * Fetches the overall rating summary for the store or a specific product
 */
export async function fetchRatingSummary(
  productId?: string
): Promise<StampedRatingSummary> {
  try {
    const data = await fetchStampedStats(productId);

    return {
      stars: data.rating || 0,
      count: data.count || 0,
    };
  } catch (error) {
    console.error("Error fetching rating summary:", error);
    return {
      stars: 0,
      count: 0,
    };
  }
}
