export const SUBSCRIPTION_OPTIONS = [
  { value: 'monthly', label: 'Monthly', discount: 0.10 },
  { value: 'bimonthly', label: 'Every 2 Months', discount: 0.075 },
  { value: 'quarterly', label: 'Every 3 Months', discount: 0.05 },
] as const;

export type SubscriptionInterval = typeof SUBSCRIPTION_OPTIONS[number]['value'];

export interface SubscriptionPlan {
  interval: SubscriptionInterval;
  label: string;
  discount: number;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionInterval, SubscriptionPlan> = {
  monthly: {
    interval: 'monthly',
    label: 'Monthly',
    discount: 0.10,
  },
  bimonthly: {
    interval: 'bimonthly',
    label: 'Every 2 Months',
    discount: 0.075,
  },
  quarterly: {
    interval: 'quarterly',
    label: 'Every 3 Months',
    discount: 0.05,
  },
};