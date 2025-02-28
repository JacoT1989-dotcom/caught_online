import type { InventoryResponse } from '@/types/inventory';

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
  inventory?: InventoryResponse;
}

export interface SearchResponse {
  products: SearchProduct[];
  totalCount: number;
}