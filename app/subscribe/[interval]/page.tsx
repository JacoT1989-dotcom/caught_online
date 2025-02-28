import { redirect } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/types/subscription';
import type { SubscriptionInterval } from '@/lib/types/subscription';

interface SubscribePageProps {
  params: {
    interval: string;
  };
}

export default function SubscribePage({ params }: SubscribePageProps) {
  // Validate interval
  const interval = params.interval as SubscriptionInterval;
  if (!SUBSCRIPTION_PLANS[interval]) {
    redirect('/products');
  }

  // Redirect to products page with subscription parameter
  redirect(`/products?subscription=${interval}`);
}