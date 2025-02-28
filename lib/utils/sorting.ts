import type { Product } from '@/types/product';
import type { SortOption } from '@/hooks/use-shop-sort';

export function sortProducts(products: Product[], sortKey: SortOption): Product[] {
  // First, separate in-stock and out-of-stock products
  const inStock: Product[] = [];
  const outOfStock: Product[] = [];

  products.forEach(product => {
    const variant = product.variants?.edges[0]?.node;
    const isAvailable = variant?.availableForSale ?? product.availableForSale;
    
    if (isAvailable) {
      inStock.push(product);
    } else {
      outOfStock.push(product);
    }
  });

  // Sort each group based on the sortKey
  const sortGroups = (items: Product[]) => {
    return [...items].sort((a, b) => {
      const aPrice = parseFloat(
        a.variants.edges[0]?.node.price?.amount || 
        a.priceRange.minVariantPrice.amount
      );
      const bPrice = parseFloat(
        b.variants.edges[0]?.node.price?.amount || 
        b.priceRange.minVariantPrice.amount
      );

      switch (sortKey) {
        case 'price-asc':
          return aPrice - bPrice;
        case 'price-desc':
          return bPrice - aPrice;
        default:
          return 0;
      }
    });
  };

  // Sort each group and concatenate them
  const sortedInStock = sortGroups(inStock);
  const sortedOutOfStock = sortGroups(outOfStock);

  // Return in-stock products first, followed by out-of-stock
  return [...sortedInStock, ...sortedOutOfStock];
}