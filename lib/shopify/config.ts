export const SHOPIFY_CONFIG = {
  domain:
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    "caught-online.myshopify.com",
  storefrontAccessToken:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    "059e76b4438e6068a3bb5aa39edd8e85",
  adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2024-01",
  customerAccountId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_ID,
  get endpoint() {
    return `https://${this.domain}/api/${this.apiVersion}/graphql.json`;
  },
  get isConfigured() {
    return Boolean(this.domain && this.storefrontAccessToken);
  },
} as const;
