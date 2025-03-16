"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { shopifyFetch } from "@/lib/shopify/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "../ui/button";

interface CategoryProduct {
  title: string;
  featuredImage: {
    url: string;
    altText: string;
  };
}

interface Category {
  title: string;
  description: string;
  href: string;
  collection: string;
  image?: string;
}

const categories: Category[] = [
  {
    title: "Salmon",
    description: "Premium Norwegian and local salmon",
    href: "/products?collection=salmon",
    collection: "salmon",
  },
  {
    title: "Kingklip",
    description: "Fresh local kingklip",
    href: "/products?collection=kingklip",
    collection: "kingklip",
  },
  {
    title: "Tuna",
    description: "Fresh and frozen tuna steaks",
    href: "/products?collection=tuna",
    collection: "tuna",
  },
  {
    title: "Prawns",
    description: "Wild-caught and farmed prawns",
    href: "/products?collection=prawns",
    collection: "prawns",
  },
  {
    title: "Lobster",
    description: "Rock and spiny lobster tails",
    href: "/products?collection=lobster",
    collection: "lobster",
  },
  {
    title: "Hake",
    description: "Local and imported hake fillets",
    href: "/products?collection=hake",
    collection: "hake",
  },
  {
    title: "Calamari",
    description: "Tubes, heads, and tentacles",
    href: "/products?collection=calamari",
    collection: "calamari",
  },
  {
    title: "Crumbed & Coated",
    description: "Ready to cook favorites",
    href: "/products?collection=crumbed-coated-seafood",
    collection: "crumbed-coated-seafood",
  },
];

const GET_COLLECTION_FEATURED_PRODUCT = `
  query GetCollectionFeaturedProduct($collection: String!) {
    collection(handle: $collection) {
      products(first: 1, sortKey: BEST_SELLING) {
        edges {
          node {
            title
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export function ProductCategories() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    async function fetchCategoryImages() {
      try {
        const imagePromises = categories.map(async (category) => {
          const { data } = await shopifyFetch({
            query: GET_COLLECTION_FEATURED_PRODUCT,
            variables: { collection: category.collection },
          });

          const product = data?.collection?.products?.edges[0]?.node;
          if (product?.featuredImage?.url) {
            return [category.collection, product.featuredImage.url] as const;
          }
          return null;
        });

        const results = await Promise.all(imagePromises);
        // Fix: Filter out null values and type the array correctly for Object.fromEntries
        const validResults = results.filter(
          (item): item is [string, string] => item !== null
        );
        const images = Object.fromEntries(validResults);
        setCategoryImages(images);
      } catch (error) {
        console.error("Error fetching category images:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryImages();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#41c8d2] mb-4">
          Choose from 100+ seafood products
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover a wide range of fish, shellfish & other seafood products
        </p>
      </div>

      {/* Desktop Grid - Hidden on Mobile */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="block group"
          >
            <Card
              className={cn(
                "overflow-hidden transition-all duration-300",
                "hover:border-[#41c8d2]/20 hover:shadow-lg"
              )}
            >
              <div className="aspect-square relative">
                <div className="absolute inset-0">
                  <Image
                    src={
                      categoryImages[category.collection] ||
                      "/placeholder-product.jpg"
                    }
                    alt={category.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className={cn(
                      "object-cover transition-transform duration-500",
                      "group-hover:scale-110"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {categories.map((category) => (
              <div
                key={category.title}
                className="flex-[0_0_85%] min-w-0 pl-4 first:pl-4"
              >
                <Link href={category.href} className="block">
                  <Card
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      "hover:border-[#41c8d2]/20 hover:shadow-lg"
                    )}
                  >
                    <div className="aspect-[3/4] relative">
                      <div className="absolute inset-0">
                        <Image
                          src={
                            categoryImages[category.collection] ||
                            "/placeholder-product.jpg"
                          }
                          alt={category.title}
                          fill
                          sizes="85vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {category.title}
                        </h3>
                        <p className="text-sm text-white/80 line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {categories.map((_, index) => (
            <Button
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-6 bg-[#41c8d2]"
                  : "w-1.5 bg-[#41c8d2]/20 hover:bg-[#41c8d2]/40"
              )}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
