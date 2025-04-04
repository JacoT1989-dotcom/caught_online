// app/products/[handle]/page.tsx
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/product-details";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductErrorBoundary } from "@/components/error-boundary/product-error-boundary";
import { getProduct } from "@/lib/shopify/products";
import { collections, getCollectionByHandle } from "@/lib/collections";
import dynamic from 'next/dynamic';

// Dynamically import the ReviewsSection to avoid server/client hydration issues
const ReviewsSection = dynamic(
  () => import('@/components/reviews/reviews-section').then(mod => ({ default: mod.ReviewsSection })),
  {
    ssr: false,
    loading: () => (
      <div className="mt-16 p-12 border rounded-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading reviews...</p>
      </div>
    ),
  }
);

interface ProductPageProps {
  params: {
    handle: string;
  };
  searchParams: {
    collection?: string;
  };
}

// Add a type definition for breadcrumb items that includes the 'current' property
interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  if (!params.handle) {
    notFound();
  }

  const product = await getProduct(params.handle);

  // If no product found, throw 404
  if (!product) {
    console.log("Product not found:", params.handle);
    notFound();
  }
  
  // Build breadcrumb items based on navigation context
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Products", href: "/products" },
  ];
  
  // Determine collection context
  let collectionHandle = searchParams.collection;
  
  // If no collection in URL, try to find product's primary collection
  if (!collectionHandle && product.collections?.edges.length > 0) {
    collectionHandle = product.collections.edges[0].node.handle;
  }
  
  if (collectionHandle) {
    // Find parent collection if this is a subcollection
    const parentCollection = collections.find((c) =>
      c.subcollections?.some((sub) => sub.handle === collectionHandle)
    );
    
    if (parentCollection) {
      // Add subcollection only
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
      // Direct collection
      const collection = getCollectionByHandle(collectionHandle);
      
      if (collection) {
        breadcrumbItems.push({
          label: collection.title,
          href: `/products?collection=${collection.handle}`,
        });
      }
    }
  }

  // Add product to breadcrumbs
  breadcrumbItems.push({
    label: product.title,
    href: `/products/${params.handle}`,
    current: true,
  });
  
  // Prepare the product URL for Stamped.io
  const productUrl = `${process.env.NEXT_PUBLIC_STORE_URL || 'https://caught-online.myshopify.com'}/products/${params.handle}`;

  return (
    <div className="px-4 md:px-8 py-2">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-1">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        <ProductErrorBoundary>
          {/* Product details section */}
          <ProductDetails product={product} />
          
          {/* Reviews section */}
          <div className="mt-16">
            <ReviewsSection
              productId={product.id}
              productName={product.title}
              productUrl={productUrl}
              productHandle={params.handle}
            />
          </div>
        </ProductErrorBoundary>
      </div>
    </div>
  );
}