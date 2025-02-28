"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image"; // Add this import

interface SustainabilitySectionProps {
  title?: string;
  description?: string;
  image?: string;
  className?: string;
}

export function SustainabilitySection({
  title,
  description,
  image,
  className,
}: SustainabilitySectionProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] md:h-[300px] w-full">
        {image ? (
          <Image
            src={image}
            alt={title || "Sustainability image"}
            fill
            className="object-cover rounded-xl"
            priority={false}
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              // TypeScript will complain about this with Image component
              // Using a fallback image is better handled through next.config.js
              // or a wrapper component that handles errors
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/800x600?text=Image+Not+Found";
            }}
          />
        ) : (
          <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
        )}
      </div>

      {/* Content Container */}
      <Card className="p-6 md:p-8 bg-[#e5f9ff] border-none rounded-xl flex items-center">
        <div className="space-y-3">
          {title ? (
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          ) : (
            <Skeleton className="h-8 w-2/3" />
          )}
          {description ? (
            <p className="text-sm md:text-base leading-relaxed">
              {description}
            </p>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
