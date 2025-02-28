"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { fetchRatingSummary, StampedRatingSummary } from "@/lib/stamped";

interface RatingSummaryProps {
  productId?: string;
}

export function RatingSummary({ productId }: RatingSummaryProps) {
  const [summary, setSummary] = useState<StampedRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRatings = async () => {
      try {
        setLoading(true);
        const data = await fetchRatingSummary(productId);
        setSummary(data);
      } catch (error) {
        console.error("Error loading ratings:", error);
        setSummary({
          stars: 0,
          count: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    getRatings();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-gray-200" />
          ))}
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.round(summary.stars)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {summary.count > 0 ? `(${summary.count} reviews)` : "(No reviews yet)"}
      </span>
    </div>
  );
}
