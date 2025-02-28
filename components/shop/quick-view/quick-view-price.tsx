import { formatPrice } from '@/lib/utils';

interface QuickViewPriceProps {
  price: number;
  discountedPrice?: number;
}

export function QuickViewPrice({ price, discountedPrice }: QuickViewPriceProps) {
  if (!discountedPrice) {
    return (
      <span className="text-sm text-muted-foreground">
        {formatPrice(price)}
      </span>
    );
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-medium text-[#f6424a]">
        {formatPrice(discountedPrice)}
      </span>
      <span className="text-sm text-muted-foreground line-through">
        {formatPrice(price)}
      </span>
    </div>
  );
}