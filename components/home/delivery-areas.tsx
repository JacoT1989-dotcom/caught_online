'use client';

import { Truck, Clock, MapPin, CalendarRange } from 'lucide-react';
import { PostalChecker } from './postal-checker';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const deliveryAreas = [
  {
    city: 'Cape Town',
    delivery: 'Next Day',
    icon: Truck,
  },
  {
    city: 'Johannesburg',
    delivery: 'Next Day',
    icon: Truck,
  },
  {
    city: 'Pretoria',
    delivery: 'Next Day',
    icon: Truck,
  },
  {
    city: 'Durban',
    delivery: 'Every Friday',
    icon: CalendarRange,
  },
  {
    city: 'Garden Route & Winelands',
    delivery: 'Weekly',
    icon: Truck,
  },
];

export function DeliveryAreas() {
  return (
    <section className="py-12">
      <div className="px-2 md:px-8">
        <div className="bg-[#41c8d2]/10 rounded-xl p-8 md:p-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-6">Check Delivery Availability</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Enter your postal code to see if we deliver to your area
            </p>
            <div className="max-w-xl mx-auto">
              <PostalChecker />
            </div>
          </div>

          {/* Delivery Areas Grid - Hidden on mobile */}
          <div className="relative mt-12 hidden md:block">
            <div className="py-6 px-4">
              <h3 className="text-lg font-medium text-center mb-6">Current Delivery Areas</h3>
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                {deliveryAreas.map((area) => (
                  <Card
                    key={area.city}
                    className={cn(
                      "flex flex-col items-center p-4 transition-colors",
                      "hover:border-[#41c8d2] hover:shadow-md",
                      "bg-white/50 backdrop-blur-sm"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-[#41c8d2]/10 mb-3">
                      <area.icon className="h-5 w-5 text-[#41c8d2]" />
                    </div>
                    <h3 className="text-sm font-medium text-center mb-1">{area.city}</h3>
                    <p className="text-xs text-muted-foreground text-center">
                      {area.delivery}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}