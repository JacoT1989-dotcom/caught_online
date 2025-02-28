export interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  availableForSale: boolean;
  image?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  variantId?: string;
}

export interface SearchResponse {
  products: SearchProduct[];
  totalCount: number;
}