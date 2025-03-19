import { notFound } from "next/navigation"; 
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ProductDetails } from "@/components/product/product-details";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductErrorBoundary } from "@/components/error-boundary/product-error-boundary";
import { getProduct } from "@/lib/shopify/products";
import { collections, getCollectionByHandle } from "@/lib/collections";
import ProductReviews from '@/components/reviews/product-reviews';

interface ProductPageProps {
  params: {
    handle: string;
  };
  searchParams: {
    collection?: string;
  };
}

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface ProductImage {
  node: {
    url: string;
    altText: string | null;
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  if (!params.handle) {
    notFound();
  }

  console.log("Fetching product with handle:", params.handle);
  const product = await getProduct(params.handle);
  console.log("Product data:", product);

  if (!product) {
    console.log("Product not found:", params.handle);
    notFound();
  }

  const breadcrumbItems: BreadcrumbItem[] = [{ label: "Products", href: "/products" }];
  let collectionHandle = searchParams.collection;

  if (!collectionHandle && product.collections?.edges.length > 0) {
    collectionHandle = product.collections.edges[0].node.handle;
  }

  if (collectionHandle) {
    const parentCollection = collections.find((c) =>
      c.subcollections?.some((sub) => sub.handle === collectionHandle)
    );

    if (parentCollection) {
      breadcrumbItems.push({
        label: parentCollection.title,
        href: `/products?collection=${parentCollection.handle}`,
      });
      const subcollection = parentCollection.subcollections?.find(
        (sub) => sub.handle === collectionHandle
      );
      if (subcollection) {
        breadcrumbItems.push({
          label: subcollection.title,
          href: `/products?collection=${subcollection.handle}`,
        });
      }
    } else {
      const collection = getCollectionByHandle(collectionHandle);
      if (collection) {
        breadcrumbItems.push({
          label: collection.title,
          href: `/products?collection=${collection.handle}`,
        });
      }
    }
  }

  breadcrumbItems.push({
    label: product.title,
    href: `/products/${params.handle}`,
    current: true
  });

  return (
    <div className="px-4 md:px-8 py-2">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <ProductErrorBoundary>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                {product.featuredImage?.url ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    className="h-full w-full object-cover"
                    width={500}
                    height={500}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              {product.images?.edges && product.images.edges.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.images.edges.slice(0, 4).map((image: ProductImage, index: number) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={image.node.url}
                        alt={image.node.altText || `${product.title} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                        width={120}
                        height={120}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <div className="mt-4 text-xl font-semibold text-gray-900">
                ${product.priceRange?.minVariantPrice?.amount || "Price unavailable"}
              </div>
              <div className="mt-6 text-gray-700">
                <p>{product.description}</p>
              </div>
              <div className="mt-8">
                <button 
                  className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <ProductDetails product={product} />
          </div>
          
          <div className="mt-16">
            <ProductReviews productId={product.id} productName={product.title} />
          </div>
        </ProductErrorBoundary>
      </div>
    </div>
  );
}
