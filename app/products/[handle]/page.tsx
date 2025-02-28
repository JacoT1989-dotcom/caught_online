import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { ProductDetails } from '@/components/product/product-details';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ProductErrorBoundary } from '@/components/error-boundary/product-error-boundary';
import { getProduct } from '@/lib/shopify/products';
import { collections, getCollectionByHandle } from '@/lib/collections';

interface ProductPageProps {
  params: {
    handle: string;
  };
  searchParams: {
    collection?: string;
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  if (!params.handle) {
    notFound();
  }

  // Add debug logging
  console.log('Fetching product with handle:', params.handle);
  const product = await getProduct(params.handle);
  console.log('Product data:', product);

  // If no product found, throw 404
  if (!product) {
    console.log('Product not found:', params.handle);
    notFound();
  }

  // Build breadcrumb items based on navigation context
  const breadcrumbItems = [
    { label: 'Products', href: '/products' }
  ];

  // Determine collection context
  let collectionHandle = searchParams.collection;
  
  // If no collection in URL, try to find product's primary collection
  if (!collectionHandle && product.collections?.edges.length > 0) {
    collectionHandle = product.collections.edges[0].node.handle;
  }

  if (collectionHandle) {
    // Find parent collection if this is a subcollection
    const parentCollection = collections.find(c => 
      c.subcollections?.some(sub => sub.handle === collectionHandle)
    );
    
    if (parentCollection) {
      // Add subcollection only
      const subcollection = parentCollection.subcollections?.find(
        sub => sub.handle === collectionHandle
      );
      if (subcollection) {
        breadcrumbItems.push({
          label: subcollection.title,
          href: `/products?collection=${subcollection.handle}`
        });
      }
    } else {
      // Direct collection
      const collection = getCollectionByHandle(collectionHandle);
      if (collection) {
        breadcrumbItems.push({
          label: collection.title,
          href: `/products?collection=${collection.handle}`
        });
      }
    }
  }

  return (
    <div className="px-4 md:px-8 py-2">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-1">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        <ProductErrorBoundary>
          <ProductDetails product={product} />
        </ProductErrorBoundary>
      </div>
    </div>
  );
}