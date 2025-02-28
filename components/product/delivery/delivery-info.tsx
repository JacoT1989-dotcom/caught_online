'use client';

import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useRegion } from '@/hooks/use-region';

const deliveryAreas = {
  'cape-town': {
    name: 'Cape Town',
    schedule: 'Next Day Delivery',
    cutoff: '10:00 PM',
    areas: 'Cape Town Metro, Stellenbosch, Somerset West, Paarl'
  },
  'johannesburg': {
    name: 'Johannesburg',
    schedule: 'Next Day Delivery',
    cutoff: '10:00 PM',
    areas: 'Greater Johannesburg, Sandton, Randburg, Roodepoort'
  },
  'pretoria': {
    name: 'Pretoria',
    schedule: 'Next Day Delivery',
    cutoff: '10:00 PM',
    areas: 'Pretoria, Centurion, Midrand'
  },
  'durban': {
    name: 'Durban',
    schedule: 'Every Friday',
    cutoff: 'Wednesday 10:00 PM',
    areas: 'Durban Metro, Umhlanga, Ballito'
  }
};

export function DeliveryInfo() {
  const { selectedRegion } = useRegion();
  const regionInfo = selectedRegion ? deliveryAreas[selectedRegion as keyof typeof deliveryAreas] : null;

  return (
    <Card className="p-6 bg-[#41c8d2]/5 border-[#41c8d2]/20">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-[#41c8d2]/10 mt-1">
          <MapPin className="h-5 w-5 text-[#41c8d2]" />
        </div>
        <div className="space-y-2">
          {regionInfo ? (
            <>
              <h3 className="font-semibold">{regionInfo.name} Delivery</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Schedule: {regionInfo.schedule}</li>
                <li>Cut-off time: {regionInfo.cutoff}</li>
                <li>Areas covered: {regionInfo.areas}</li>
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground">
              Please select your delivery region to see delivery information
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}