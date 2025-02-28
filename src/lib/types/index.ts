import { REGIONS } from "../constants";

// Common TypeScript types used across the application
export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  subscription?: string | null;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  dateCreated: string;
  isVerifiedBuyer: boolean;
  helpfulVotes: number;
  images?: Array<{
    url: string;
    thumbnail: string;
  }>;
}

export type Region = keyof typeof REGIONS;
