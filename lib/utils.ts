import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency = 'ZAR') {
  const validAmount = amount || 0;
  const numericAmount = typeof validAmount === 'string' ? parseFloat(validAmount) : validAmount;
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

// VAT rate for South Africa (15%)
export const VAT_RATE = 0.15;

// Calculate VAT amount from VAT-inclusive price
export function calculateVAT(inclusiveAmount: number): number {
  return inclusiveAmount - (inclusiveAmount / (1 + VAT_RATE));
}

// Calculate price excluding VAT
export function calculatePriceExcludingVAT(inclusiveAmount: number): number {
  return inclusiveAmount / (1 + VAT_RATE);
}

// Get price breakdown for display
export function getPriceBreakdown(inclusiveAmount: number) {
  const vatAmount = calculateVAT(inclusiveAmount);
  const excludingVAT = calculatePriceExcludingVAT(inclusiveAmount);
  
  return {
    total: inclusiveAmount,
    vat: vatAmount,
    excluding: excludingVAT
  };
}