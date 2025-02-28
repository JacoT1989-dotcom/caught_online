'use client';

import { Card } from "@/components/ui/card";
import { CalendarRange, PackageSearch, Settings2, Truck } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: "Choose Your Plan",
    description: "Select a subscription frequency that fits your lifestyle and budget.",
    icon: CalendarRange
  },
  {
    step: 2,
    title: "Customize Your Box",
    description: "Pick your favorite seafood items from our premium selection for each delivery.",
    icon: PackageSearch
  },
  {
    step: 3,
    title: "Flexible Management",
    description: "Skip deliveries, change items, or adjust dates through your account dashboard.",
    icon: Settings2
  },
  {
    step: 4,
    title: "Enjoy Fresh Delivery",
    description: "Receive restaurant-quality seafood at your doorstep, perfectly packaged.",
    icon: Truck
  }
];

export function SubscriptionHowItWorks() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">How Subscriptions Work</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start saving with our simple subscription process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((item) => (
          <Card
            key={item.step}
            className="relative p-6 bg-[#f6424a] text-white"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#f6424a] text-white flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <item.icon className="h-6 w-6 text-[#f6424a]" />
            </div>
            <h3 className="font-semibold text-lg mt-12 mb-2">{item.title}</h3>
            <p className="text-sm text-white/90">{item.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}