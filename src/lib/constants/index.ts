// Constants used throughout the application
export const VAT_RATE = 0.15;

export const FREE_SHIPPING_THRESHOLD = 950;

export const REGIONS = {
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
  'pretoria': {
    name: 'Pretoria',
    delivery: 'Next Day Delivery',
    postalCodes: [
      [1, 199],
      [200, 299],
    ],
  },
  'durban': {
    name: 'Durban',
    delivery: 'Every Friday',
    postalCodes: [
      [4000, 4099],
      [3600, 3699],
    ],
  },
} as const;

export const SUBSCRIPTION_INTERVALS = {
  monthly: {
    label: 'Monthly',
    discount: 0.10,
  },
  bimonthly: {
    label: 'Every 2 Months',
    discount: 0.075,
  },
  quarterly: {
    label: 'Every 3 Months',
    discount: 0.05,
  },
} as const;