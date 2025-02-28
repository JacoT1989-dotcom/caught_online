import { getProducts } from '@/lib/shopify/products';
import { ProductsClientPage } from '@/components/shop/products-client-page';

interface SearchParams {
  collection?: string;
  subscription?: string;
  q?: string;
  [key: string]: string | undefined;
}

export const revalidate = 0; // Disable caching at the page level

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  try {
    console.log('Fetching products with params:', searchParams); // Debug log

    const products = await getProducts({
      collection: searchParams.collection,
      sortKey: searchParams.sort?.toUpperCase() || 'BEST_SELLING',
      reverse: searchParams.sort?.includes('-desc') || false,
      query: searchParams.q,
    });

    console.log(`Found ${products.length} products`); // Debug log

    return (
      <ProductsClientPage 
        products={products} 
        searchParams={searchParams}
      />
    );
  } catch (error) {
    console.error('Error loading products:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }
}