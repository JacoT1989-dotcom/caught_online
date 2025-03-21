import type { Product } from "@/types/product";
import type { FilterState } from "@/types/filters";

export function filterProducts(
  products: Product[],
  filters: FilterState
): Product[] {
  // Return all products if no filters are active
  const hasActiveFilters = Object.values(filters).some(
    (values) => values.length > 0
  );

  if (!hasActiveFilters) return products;

  return products.filter((product) => {
    // Get product tags, collections, and type for matching
    const tags = product.tags?.map((tag) => tag.toLowerCase()) || [];

    // Get collection handles from product
    const collections =
      product.collections?.edges?.map((edge) =>
        edge.node.handle?.toLowerCase()
      ) || [];

    const type = product.productType?.toLowerCase() || "";

    // Check each filter category
    return Object.entries(filters).every(([category, values]) => {
      // Skip empty filter categories
      if (values.length === 0) return true;

      // Check if product matches any value in the category
      return values.some((value: string) => {
        const searchValue = value.toLowerCase();

        // Check in tags
        if (tags.includes(searchValue)) {
          return true;
        }

        // Check in collections
        if (collections.includes(searchValue)) {
          return true;
        }

        // Check in product type
        if (type.includes(searchValue)) {
          return true;
        }

        return false;
      });
    });
  });
}
