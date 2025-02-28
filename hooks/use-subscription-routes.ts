'use client';

import { useRouter } from 'next/navigation';
import { useSubscriptionToggle } from './use-subscription-toggle';
import type { SubscriptionInterval } from '@/lib/types/subscription';

export function useSubscriptionRoutes() {
  const router = useRouter();
  const { toggle, setInterval } = useSubscriptionToggle();

  const activateSubscription = (interval: SubscriptionInterval) => {
    setInterval(interval);
    toggle();
    router.push(`/products?subscription=${interval}`);
  };

  const getSubscriptionUrl = (interval: SubscriptionInterval) => {
    // For external use - returns full URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/subscribe/${interval}`;
  };

  return {
    activateSubscription,
    getSubscriptionUrl,
    subscribeMonthly: () => activateSubscription('monthly'),
    subscribeBimonthly: () => activateSubscription('bimonthly'),
    subscribeQuarterly: () => activateSubscription('quarterly'),
    getMonthlyUrl: () => getSubscriptionUrl('monthly'),
    getBimonthlyUrl: () => getSubscriptionUrl('bimonthly'),
    getQuarterlyUrl: () => getSubscriptionUrl('quarterly'),
  };
}