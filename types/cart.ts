export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  subscription?: string | null;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setIsOpen: (open: boolean) => void;
  clearCart: () => void;
}
