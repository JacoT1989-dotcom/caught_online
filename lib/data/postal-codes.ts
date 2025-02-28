type Region = 'cape-town' | 'johannesburg' | 'pretoria' | 'durban';

interface DeliveryCheckResult {
  available: boolean;
  region?: Region;
}

// Example postal code ranges for each region
const POSTAL_CODE_RANGES = {
  'cape-town': [
    [7000, 7999], // Cape Town and surrounds
    [8000, 8999], // Western Cape
  ],
  'johannesburg': [
    [2000, 2199], // Johannesburg
    [1600, 1699], // Johannesburg surrounds
  ],
  'pretoria': [
    [1, 199],   // Pretoria - converted from 0001-0199
    [200, 299], // Pretoria surrounds - converted from 0200-0299
  ],
  'durban': [
    [4000, 4099], // Durban Central
    [3600, 3699], // Durban surrounds
  ],
} as const;

export function checkDeliveryAvailability(postalCode: string): DeliveryCheckResult {
  // Pad the postal code with leading zeros if needed
  const paddedCode = postalCode.padStart(4, '0');
  const numericCode = parseInt(paddedCode, 10);
  
  if (isNaN(numericCode)) {
    return { available: false };
  }

  for (const [region, ranges] of Object.entries(POSTAL_CODE_RANGES)) {
    for (const [min, max] of ranges) {
      // Convert the input code to match our range format
      const compareCode = numericCode;
      if (compareCode >= min && compareCode <= max) {
        return { 
          available: true, 
          region: region as Region 
        };
      }
    }
  }

  return { available: false };
}