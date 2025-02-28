'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notebook as Robot, ShoppingBag, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: Robot,
    text: "AI-Powered Shopping Assistant"
  },
  {
    icon: ShoppingBag,
    text: "Shop in Minutes via Chat"
  },
  {
    icon: Clock,
    text: "Quick Checkout Process"
  },
  {
    icon: CreditCard,
    text: "Secure Payment Options"
  },
];

// WhatsApp SVG Logo component
function WhatsAppLogo() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="currentColor"
      className="mr-2"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export function Newsletter() {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/27647045283?text=Hi%20I%27d%20like%20to%20shop%20with%20your%20AI%20assistant', '_blank');
  };

  return (
    <section className="px-2 md:px-8 py-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#41c8d2]/10 via-transparent to-[#f6424a]/10" />
        
        <div className="relative p-6 md:p-12">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Content Side */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-[#25D366] text-center lg:text-left">Shop with AI in minutes on WhatsApp!</h2>
                <p className="text-base md:text-lg text-muted-foreground text-center lg:text-left">
                  Experience a new way to shop! Our AI assistant helps you find the perfect seafood products and completes your order in minutes, all through WhatsApp.
                </p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-950 border shadow-sm hover:border-[#41c8d2]/20 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <benefit.icon className="h-4 w-4 md:h-5 md:w-5 text-[#41c8d2]" />
                    </div>
                    <span className="text-xs md:text-sm font-medium leading-tight">{benefit.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center lg:justify-start"
              >
                <Button 
                  onClick={handleWhatsAppClick}
                  size="lg"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#25D366]/90 text-white flex items-center justify-center text-sm md:text-base"
                >
                  <WhatsAppLogo />
                  Shop with AI on WhatsApp®
                </Button>
              </motion.div>
            </div>

            {/* Video Side - Hidden on mobile */}
            <div className="hidden lg:block relative h-[400px]">
              <div className="absolute inset-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-xl [filter:saturate(1.2)]"
                >
                  <source 
                    src="https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Homepage%20Video/Prawn%20Pasta-jGUf98NpB9MiKm54yMIBXyLtB9ooqv.mp4" 
                    type="video/mp4" 
                  />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/20 to-transparent dark:from-gray-950/50 dark:via-gray-950/20" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}