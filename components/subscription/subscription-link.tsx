'use client';

import Link from 'next/link';
import { useSubscriptionRoutes } from '@/hooks/use-subscription-routes';
import type { SubscriptionInterval } from '@/lib/types/subscription';

interface SubscriptionLinkProps {
  interval: SubscriptionInterval;
  children: React.ReactNode;
  className?: string;
}

export function SubscriptionLink({ interval, children, className }: SubscriptionLinkProps) {
  const { getSubscriptionUrl } = useSubscriptionRoutes();

  return (
    <Link href={getSubscriptionUrl(interval)} className={className}>
      {children}
    </Link>
  );
}