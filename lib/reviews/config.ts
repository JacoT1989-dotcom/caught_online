// //lib/reviews/config.ts
// export const STAMPED_CONFIG = {
//   publicKey: process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY || 'pubkey-4R57319D5548L8eyo3k03s5CiWb08O',
//   storeHash: process.env.NEXT_PUBLIC_STAMPED_STORE_HASH || '151250',
//   apiUrl: 'https://stamped.io/api/v2',
// } as const;
export const STAMPED_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY || 'pubkey-4R57319D5548L8eyo3k03s5CiWb08O',
  storeHash: process.env.NEXT_PUBLIC_STAMPED_STORE_HASH || '151250',
  apiUrl: 'https://stamped.io/api/v2',
} as const;