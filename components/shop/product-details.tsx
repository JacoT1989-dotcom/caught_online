import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ZAR Currency formatter function
function formatCurrency(amount: number, currencyCode: string): string {
  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

interface ProductDetailsProps {
  product: {
    title: string;
    description: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    featuredImage: {
      url: string;
      altText: string;
    } | null;
    images: Array<{
      url: string;
      altText: string;
    }>;
    availableForSale: boolean;
    quantityAvailable: number;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const {
    title,
    description,
    price,
    featuredImage,
    images,
    availableForSale,
    quantityAvailable,
  } = product;

  const formattedPrice = formatCurrency(
    parseFloat(price.amount),
    price.currencyCode
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="relative aspect-square">
          {featuredImage && (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText || title}
              fill
              className="object-cover rounded-lg"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, i) => (
            <div key={i} className="relative aspect-square">
              <Image
                src={image.url}
                alt={image.altText || `${title} ${i + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(min-width: 768px) 12.5vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-2xl font-semibold mt-2">{formattedPrice}</p>
        </div>
        {!availableForSale && <Badge variant="destructive">Out of Stock</Badge>}
        {availableForSale && quantityAvailable > 0 && (
          <Badge variant="secondary">In Stock</Badge>
        )}
        <div className="prose max-w-none">
          <p>{description}</p>
        </div>
        <Button size="lg" className="w-full" disabled={!availableForSale}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
