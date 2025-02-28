'use client';

import { Card } from "@/components/ui/card";

export function OceanToTable() {
  return (
    <Card className="relative overflow-hidden">
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
            src="https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Sustainability%20Videos/Kalk-Bay-Harbour-P1OszVi2XrwZF0RbLxNUwz76DZpQF1.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[400px] md:min-h-[600px] flex items-center">
        <div className="w-full p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-6">
              Ocean to Table
            </h2>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              We make the food system more sustainable by delivering sustainable species caught or farmed in the right way. 
              We get seafood from our fishers and farmers to your forks faster, through fewer hands and over a shorter total 
              distance than grocery stores.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}