// File: types/inventory.ts

export interface LocationInventory {
  available: boolean;
  quantity: number;
}

export interface InventoryLevel {
  quantity: number;
  locationId: string;
}

export interface InventoryResponse {
  available: boolean;
  quantity: number;
  locationAvailability: Record<string, LocationInventory>;
}

export interface ProductInventory {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  inventoryLevels: InventoryLevel[];
  price?: string;
  imageUrl?: string;
  description?: string;
}
