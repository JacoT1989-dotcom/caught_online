export interface AddressInput {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  firstName?: string;
  lastName?: string;
}

export interface CustomerAddress extends AddressInput {
  id: string;
}

// Customer profile related types
export interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

// API request types
export interface UpdateProfileRequest {
  customerAccessToken: string;
  customer: CustomerUpdateInput;
}

export interface UpdateAddressRequest {
  customerAccessToken: string;
  id: string;
  address: AddressInput;
}

export interface AddAddressRequest {
  customerAccessToken: string;
  address: AddressInput;
}

// Order related types
export interface OrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    image?: {
      url: string;
      altText: string | null;
    };
    title?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  totalPriceV2: {
    amount: string;
    currencyCode: string;
  };
  fulfillmentStatus: string | null;
  lineItems: {
    edges: Array<{
      node: OrderLineItem;
    }>;
  };
}

export interface OrdersResponse {
  edges: Array<{
    node: Order;
  }>;
}

// Auth types
export interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  defaultAddress?: CustomerAddress;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: string | null;
  user: User | null;
  customerAccessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: AddressInput;
  }) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  checkSession: () => Promise<void>;
}
