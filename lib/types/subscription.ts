export type SubscriptionInterval = "monthly" | "bimonthly" | "quarterly";

export interface SubscriptionPlan {
  interval: SubscriptionInterval;
  label: string;
  discount: number;
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionInterval,
  SubscriptionPlan
> = {
  monthly: {
    interval: "monthly",
    label: "Monthly",
    discount: 0.1, // 10% off
    description: "Save 10% on every order",
  },
  bimonthly: {
    interval: "bimonthly",
    label: "Every 2 Months",
    discount: 0.075, // 7.5% off
    description: "Save 7.5% on every order",
  },
  quarterly: {
    interval: "quarterly",
    label: "Every 3 Months",
    discount: 0.05, // 5% off
    description: "Save 5% on every order",
  },
};
