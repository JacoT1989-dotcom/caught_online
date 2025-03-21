export const STAMPED_CONFIG = {
  apiKey: 'pubkey-4R57319D5548L8eyo3k03s5CiWb08O',
  publicKey: 'apiKey',
  storeHash: '151250',
  apiUrl: 'https://stamped.io/api',
} as const;

export async function fetchReviewStats(productId?: string) {
  const params = new URLSearchParams({
    apiKey: STAMPED_CONFIG.apiKey,
    storeHash: STAMPED_CONFIG.storeHash,
    ...(productId ? { productId } : {})
  });

  const response = await fetch(`${STAMPED_CONFIG.apiUrl}/widget/stats?${params}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}