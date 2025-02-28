'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function VideoHero() {
  return (
    <div className="relative rounded-xl border overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source 
            src="https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Sustainability%20Videos/Underwater%20Seals-050E0SooW3alq5WlnhCLcyHNHkwLGR" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-16 md:py-24 lg:py-32 max-w-2xl text-white">
        <Badge className="mb-4 bg-[#f6424a] text-white border-none">Our Mission</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Commitment to Sustainability</h1>
        <p className="text-lg mb-8 text-gray-200">
          We believe in responsible fishing practices and environmental stewardship. 
          Every product we offer is carefully selected with sustainability in mind.
        </p>
        <Button 
          asChild
          size="lg" 
          className="bg-[#f6424a] hover:bg-[#f6424a]/90 text-white"
        >
          <Link href="/products">
            Shop Sustainable Seafood
          </Link>
        </Button>
      </div>
    </div>
  );
}