import { useEffect } from 'react';
import { useCart } from './use-cart';
import { useRegion } from './use-region';
import { usePostalCode } from './use-postal-code';

export function useCartPostalCheck() {
  const { items } = useCart();
  const { selectedRegion } = useRegion();
  const { checkResult, checkDelivery } = usePostalCode();

  useEffect(() => {
    // Check if this is the first item being added to cart
    if (items.length === 1 && !selectedRegion && !checkResult.checked) {
      // Trigger postal code check if no region is selected
      checkDelivery();
    }
  }, [items.length, selectedRegion, checkResult.checked, checkDelivery]);

  return {
    needsRegionSelection: items.length > 0 && !selectedRegion,
    hasCheckedPostalCode: checkResult.checked,
    isDeliveryAvailable: checkResult.available
  };
}