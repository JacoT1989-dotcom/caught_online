import { Card } from "@/components/ui/card";
import { Tag, Percent } from "lucide-react";
import { shopifyFetch } from "@/lib/shopify/client";
import { ProductGrid } from "@/components/shop/product-grid";

const GET_ALL_PRODUCTS = `
  query GetAllProducts {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function getDealsProducts() {
  try {
    const { data } = await shopifyFetch({
      query: GET_ALL_PRODUCTS,
    });

    if (!data?.products?.edges) {
      return [];
    }

    // Filter products to only include those with actual discounts
    return data.products.edges
      .map(({ node }: any) => node)
      .filter((product: any) => {
        const variant = product.variants.edges[0]?.node;
        return (
          variant?.compareAtPrice &&
          parseFloat(variant.compareAtPrice.amount) >
            parseFloat(variant.price.amount)
        );
      });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function DealsPage() {
  const products = await getDealsProducts();

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-full bg-[#f6424a]/10">
            <Tag className="h-5 w-5 text-[#f6424a]" />
          </div>
          <h1 className="text-2xl font-bold">Special Offers</h1>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <Card className="p-8 text-center">
            <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No Active Deals</h2>
            <p className="text-muted-foreground">
              Check back soon for new special offers!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}