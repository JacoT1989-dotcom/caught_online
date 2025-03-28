import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/product-details";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductErrorBoundary } from "@/components/error-boundary/product-error-boundary";
import { getProduct } from "@/lib/shopify/products";
import { collections, getCollectionByHandle } from "@/lib/collections";
import ProductReviews from "@/components/reviews/product-reviews";

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

  return (
    <div className="px-4 md:px-8 py-2">
      <div className="max-w-6xl mx-auto">
        <div className="mb-1">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <ProductErrorBoundary>
          <ProductDetails product={product} />

          <div className="mt-16">
            <ProductReviews
              productId={product.id}
              productName={product.title}
            />
          </div>
        </ProductErrorBoundary>
      </div>
    </div>
  );
}
