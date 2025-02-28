export interface ProductImage {
  url: string;
  altText: string;
}

export interface ProductPrice {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ProductPrice;
  compareAtPrice?: ProductPrice;
  quantityAvailable: number;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductCollection {
  id: string;
  title: string;
  handle: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  availableForSale: boolean;
  productType?: string;
  tags?: string[];
  featuredImage: ProductImage;
  images?: {
    edges: Array<{
      node: ProductImage;
    }>;
  };
  priceRange: {
    minVariantPrice: ProductPrice;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  options?: ProductOption[];
  collections?: {
    edges: Array<{
      node: ProductCollection;
    }>;
  };
}

export interface ProductConnection {
  edges: Array<{
    node: Product;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}