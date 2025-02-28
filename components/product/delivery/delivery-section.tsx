'use client';

import { DeliveryTitle } from './delivery-title';
import { DeliveryFeatures } from './delivery-features';
import { DeliveryInfo } from './delivery-info';

export function DeliverySection() {
  return (
    <div className="space-y-8">
      <DeliveryTitle />
      <DeliveryFeatures />
      <DeliveryInfo />
    </div>
  );
}