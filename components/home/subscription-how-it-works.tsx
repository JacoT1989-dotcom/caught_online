'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSubscriptionToggle } from '@/hooks/use-subscription-toggle';
import { 
  CalendarRange,
  PackageSearch,
  Settings2,
  Truck
} from 'lucide-react';

const howItWorks = [
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
  const router = useRouter();
  const { toggle, setInterval } = useSubscriptionToggle();

  const handleGetStarted = () => {
    setInterval('monthly');
    toggle();
    router.push('/products');
  };

  return (
    <section className="py-8">
      <div className="bg-background/95 px-2 md:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">How Subscriptions Work</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Start saving with our simple subscription process
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-8 md:gap-8 max-w-[1440px] mx-auto">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="relative p-4 md:p-6 rounded-lg border bg-card"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#f6424a] text-white flex items-center justify-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#f6424a] text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mt-12 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          <Button
            onClick={handleGetStarted}
            className="mt-12 bg-[#f6424a] hover:bg-[#f6424a]/90"
            size="lg"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </section>
  );
}