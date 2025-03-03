'use client';

import { SubscriptionPlans } from '@/components/subscription/subscription-plans';
import { SubscriptionHowItWorks } from '@/components/subscription/subscription-how-it-works';
import { Fish, Truck, CalendarRange, Percent, ShoppingBag, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const floatingIcons = [
  { Icon: Fish, color: '#f6424a', size: 24, position: { top: '10%', left: '5%' } },
  { Icon: Truck, color: '#41c8d2', size: 28, position: { top: '20%', right: '10%' } },
  { Icon: CalendarRange, color: '#f6424a', size: 20, position: { bottom: '20%', left: '15%' } },
  { Icon: Percent, color: '#41c8d2', size: 22, position: { top: '15%', left: '30%' } },
  { Icon: ShoppingBag, color: '#f6424a', size: 26, position: { bottom: '25%', right: '20%' } },
  { Icon: CreditCard, color: '#41c8d2', size: 24, position: { bottom: '15%', right: '5%' } },
];

export default function SubscriptionPage() {
  return (
    <div className="py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header with floating background */}
        <div className="relative">
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f6424a]/5 via-[#41c8d2]/5 to-[#f6424a]/5 rounded-3xl overflow-hidden">
            {/* Animated pattern overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #f6424a 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />
          </div>

          {/* Floating Icons */}
          {floatingIcons.map(({ Icon, color, size, position }, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={position as any}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 0.3,
                y: 0,
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                delay: index * 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Icon size={size} color={color} />
            </motion.div>
          ))}
          
          {/* Content */}
          <div className="relative px-8 py-16 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-bold mb-4">Subscribe and Save</h1>
                <p className="text-lg text-muted-foreground">
                  Get premium seafood delivered regularly and enjoy exclusive discounts. 
                  Save up to 10% on every order with our flexible subscription plans.
                </p>
              </motion.div>

              {/* Subscription Features */}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 backdrop-blur-sm">
                  <CalendarRange className="h-6 w-6 text-[#f6424a]" />
                  <span className="text-sm font-medium">Flexible Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 backdrop-blur-sm">
                  <Percent className="h-6 w-6 text-[#41c8d2]" />
                  <span className="text-sm font-medium">Save up to 10%</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 backdrop-blur-sm sm:col-span-1 col-span-2">
                  <Truck className="h-6 w-6 text-[#f6424a]" />
                  <span className="text-sm font-medium">Free Delivery</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <SubscriptionPlans />

        {/* How It Works */}
        <SubscriptionHowItWorks />
      </div>
    </div>
  );
}