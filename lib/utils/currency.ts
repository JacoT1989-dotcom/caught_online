import { VAT_RATE } from "../utils";

export function formatPrice(amount: number | string, currency = "ZAR") {
  const validAmount = amount || 0;
  const numericAmount =
    typeof validAmount === "string" ? parseFloat(validAmount) : validAmount;

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

export function calculateVAT(inclusiveAmount: number): number {
  return inclusiveAmount - inclusiveAmount / (1 + VAT_RATE);
}

export function calculatePriceExcludingVAT(inclusiveAmount: number): number {
  return inclusiveAmount / (1 + VAT_RATE);
}

export function getPriceBreakdown(inclusiveAmount: number) {
  const vatAmount = calculateVAT(inclusiveAmount);
  const excludingVAT = calculatePriceExcludingVAT(inclusiveAmount);

  return {
    total: inclusiveAmount,
    vat: vatAmount,
    excluding: excludingVAT,
  };
}
