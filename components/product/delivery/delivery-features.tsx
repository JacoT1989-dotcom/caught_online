'use client';

import { Truck, Clock, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Next Day Delivery",
    description: "Order by 10 PM for next-day delivery in main metros",
    icon: Truck,
  },
  {
    title: "Temperature Controlled",
    description: "Delivered in specialized cooling boxes to maintain freshness",
    icon: PackageCheck,
  },
  {
    title: "Flexible Scheduling",
    description: "Choose your preferred delivery date at checkout",
    icon: Clock,
  },
];

export function DeliveryFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature) => (
        <div 
          key={feature.title} 
          className={cn(
            "flex flex-col items-center text-center gap-4",
            "p-6 rounded-lg border bg-card hover:border-[#41c8d2]/20 transition-colors"
          )}
        >
          <div className="p-3 rounded-full bg-[#41c8d2]/10">
            <feature.icon className="h-6 w-6 text-[#41c8d2]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}