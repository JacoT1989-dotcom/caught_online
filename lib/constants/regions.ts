import type { RegionConfig } from '@/types/region';

export const REGIONS: Record<string, RegionConfig> = {
  'cape-town': {
    name: 'Cape Town',
    delivery: 'Next Day Delivery',
    postalCodes: [
      [7000, 7999],
      [8000, 8999],
    ],
  },
  'johannesburg': {
    name: 'Johannesburg',
    delivery: 'Next Day Delivery',
    postalCodes: [
      [2000, 2199],
      [1600, 1699],
    ],
  },
} as const;

export const WAREHOUSE_LOCATIONS = {
  'cape-town': 'gid://shopify/Location/89012345',
  'johannesburg': 'gid://shopify/Location/89012346',
} as const;