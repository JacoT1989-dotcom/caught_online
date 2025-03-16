// types/order.ts

export interface OrderImage {
  url: string;
  altText: string | null;
}

export interface OrderVariant {
  id: string;
  title: string;
  image?: OrderImage;
}

export interface OrderPrice {
  amount: string;
  currencyCode: string;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  originalTotalPrice: OrderPrice;
  variant?: OrderVariant;
}

export interface OrderLineItemEdge {
  node: OrderLineItem;
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  totalPriceV2: OrderPrice;
  lineItems: {
    edges: OrderLineItemEdge[];
  };
}

export interface OrderEdge {
  node: Order;
}

export interface OrdersResponse {
  edges: OrderEdge[];
}
