'use client';

import { ProductCard } from '@/components/shop/product-card';

interface ProductGridSlidesProps {
  products: any[];
  isMobile: boolean;
  slidesCount: number;
}

export function ProductGridSlides({ products, isMobile, slidesCount }: ProductGridSlidesProps) {
  if (isMobile) {
    return (
      <div className="flex">
        {Array.from({ length: slidesCount }).map((_, slideIndex) => (
          <div key={slideIndex} className="flex-[0_0_100%] min-w-0 pl-4 first:pl-4 md:first:pl-0">
            <div className="grid grid-cols-2 gap-4 pr-4">
              {products.slice(slideIndex * 4, (slideIndex + 1) * 4).map((product) => (
                <div key={product.id} className="min-w-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex">
      {products.map((product) => (
        <div key={product.id} className="flex-[0_0_280px] min-w-0 pl-4 first:pl-0">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}