// app/page.tsx
import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { ProductCategories } from "@/components/home/product-categories";
import { Testimonials } from "@/components/home/testimonials";
import { SubscriptionPlans } from "@/components/home/subscription-plans";
import { DeliveryAreas } from "@/components/home/delivery-areas";
import { Newsletter } from "@/components/home/newsletter";
import { WildCaught } from "@/components/home/wild-caught";
import { ProductGridSection } from "@/components/home/product-grid-section";
import { SustainabilityPreview } from "@/components/home/sustainability-preview";
import { getProducts } from "@/lib/shopify/products";
import { UserDataTracker } from "@/components/analytics/UserDataTracker";

// Set appropriate revalidation time for this page
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Option 1: Use static data for build time, then client-side fetch
  let featuredProducts = [];
  let newArrivals = [];

  try {
    // Remove the no-store cache option in getProducts function
    [featuredProducts, newArrivals] = await Promise.all([
      getProducts({ sortKey: "BEST_SELLING", first: 8 }),
      getProducts({ sortKey: "CREATED_AT", reverse: true, first: 8 }),
    ]);
  } catch (error) {
    console.error("Error fetching products for homepage:", error);
    // Return empty arrays which will be handled in the UI
  }

  return (
    <main>
      <UserDataTracker />
      <Hero />
      <Testimonials />
      <ProductCategories />
      <Suspense
        fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}
      >
        {featuredProducts.length > 0 ? (
          <ProductGridSection
            title="Featured Products"
            products={featuredProducts}
          />
        ) : (
          <div className="container py-12">
            <h2 className="text-2xl font-bold text-center">
              Featured Products
            </h2>
            <p className="text-center mt-4">Loading products...</p>
          </div>
        )}
      </Suspense>
      <SubscriptionPlans />
      <Suspense
        fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}
      >
        {newArrivals.length > 0 ? (
          <ProductGridSection
            title="Trending Subscriptions"
            products={newArrivals}
            subscriptionMode={true}
          />
        ) : (
          <div className="container py-12">
            <h2 className="text-2xl font-bold text-center">
              Trending Subscriptions
            </h2>
            <p className="text-center mt-4">Loading products...</p>
          </div>
        )}
      </Suspense>
      <WildCaught />
      <Newsletter />
      <DeliveryAreas />
      <SustainabilityPreview />
    </main>
  );
}
//
