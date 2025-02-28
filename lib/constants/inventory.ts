// Only two warehouses - Cape Town and Johannesburg
export const WAREHOUSE_LOCATIONS = {
  'cape-town': 'gid://shopify/Location/89012345',
  'johannesburg': 'gid://shopify/Location/89012346',
} as const;

export type WarehouseRegion = keyof typeof WAREHOUSE_LOCATIONS;

export const DEFAULT_INVENTORY_STATUS = {
  available: false,
  quantity: 0,
  locationAvailability: {}
} as const;