import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PostalChecker } from "@/components/home/postal-checker";
import {
  CalendarRange,
  PackageSearch,
  Settings2,
  Truck,
  ShoppingCart,
  CreditCard,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const oneTimeSteps = [
  {
    step: 1,
    title: "Browse Products",
    description: "Explore our wide selection of premium, fresh seafood.",
    icon: ShoppingCart,
  },
  {
    step: 2,
    title: "Add to Cart",
    description: "Select your favorite items and add them to your cart.",
    icon: PackageSearch,
  },
  {
    step: 3,
    title: "Checkout",
    description: "Enter your delivery details and complete your payment.",
    icon: CreditCard,
  },
  {
    step: 4,
    title: "Enjoy Delivery",
    description: "Receive your fresh seafood right at your doorstep.",
    icon: Truck,
  },
];

const subscriptionSteps = [
  {
    step: 1,
    title: "Choose Your Plan",
    description:
      "Select a subscription frequency that fits your lifestyle and budget.",
    icon: CalendarRange,
  },
  {
    step: 2,
    title: "Customize Your Box",
    description:
      "Pick your favorite seafood items from our premium selection for each delivery.",
    icon: PackageSearch,
  },
  {
    step: 3,
    title: "Flexible Management",
    description:
      "Skip deliveries, change items, or adjust dates through your account dashboard.",
    icon: Settings2,
  },
  {
    step: 4,
    title: "Regular Delivery",
    description:
      "Enjoy fresh seafood delivered on your schedule with exclusive subscriber savings.",
    icon: Truck,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section */}
      <div className="rounded-xl border bg-background/95 shadow-sm p-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">How It Works</h1>
          <p className="text-lg text-muted-foreground">
            Whether you prefer a one-time order or regular deliveries, we make
            it easy to get premium seafood delivered directly to your door.
            Here`&apos;`s everything you need to know about ordering from Caught
            Online.
          </p>
        </div>
      </div>

      {/* One-Time Order Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#41c8d2]/10 rounded-xl" />
        <div className="relative z-10 p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">One-Time Orders</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Want to try us out first? Here`&apos;`s how to place a single
              order
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {oneTimeSteps.map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-lg border bg-card"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#f6424a] text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <item.icon className="h-6 w-6 text-[#f6424a]" />
                </div>
                <h3 className="font-semibold text-lg mt-12 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#41c8d2]/10 rounded-xl" />
        <div className="relative z-10 p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Subscribe & Save</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Save up to 10% and never run out of your favorite seafood with our
              flexible subscription service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subscriptionSteps.map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-lg border bg-card"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#f6424a] text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <item.icon className="h-6 w-6 text-[#f6424a]" />
                </div>
                <h3 className="font-semibold text-lg mt-12 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Check Section */}
      <Card className="p-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f6424a]/10 mb-4">
            <MapPin className="h-6 w-6 text-[#f6424a]" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Check If We Deliver To You
          </h2>
          <p className="text-muted-foreground mb-8">
            Enter your postal code to see if we deliver to your area and view
            available delivery options
          </p>
          <div className="max-w-xl mx-auto">
            <PostalChecker />
          </div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/delivery">View Full Delivery Information</Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* CTA Section */}
      <Card className="p-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
            Join thousands of satisfied customers enjoying premium seafood
            delivered right to their door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 text-[#f6424a] font-semibold"
            >
              <Link href="/products">Start Shopping Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 text-[#f6424a] font-semibold"
            >
              <Link href="/subscription">View Subscription Plans</Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-[#f6424a]" />
      </Card>
    </div>
  );
}
