import { shopifyFetch } from "@/lib/shopify/client";
import { GET_ALL_PRODUCTS } from "@/lib/shopify/queries";
import { ProductGrid } from "@/components/shop/product-grid";
import { Product, ProductConnection } from "@/types/product";

interface ShopifyResponse {
  body: {
    data?: {
      products?: ProductConnection;
    };
  };
}

async function getProducts(): Promise<Product[]> {
  const { body }: ShopifyResponse = await shopifyFetch({
    query: GET_ALL_PRODUCTS,
  });

  if (!body?.data?.products?.edges) {
    return [];
  }

  // We're returning the Product objects directly without transformation
  // This assumes the GraphQL query returns all required fields
  return body.data.products.edges.map(({ node }) => node);
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-8">Fresh Seafood</h1>
      <ProductGrid products={products} />
    </div>
  );
}