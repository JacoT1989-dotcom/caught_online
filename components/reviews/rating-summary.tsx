'use client';

import React, { useState, useEffect } from 'react';
import { getProductRatingSummary, RatingSummary } from '@/lib/reviews/stamped';
import { Star, StarHalf } from 'lucide-react';

interface RatingSummaryProps {
  productId: string;
}

export default function RatingSummaryComponent({ productId }: RatingSummaryProps) {
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await getProductRatingSummary(productId);
        setSummary(data);
      } catch (error) {
        console.error('Error fetching rating summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [productId]);

  if (loading) {
    return <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"></div>;
  }

  if (!summary) {
    return null;
  }

  const { averageRating, totalReviews, ratingDistribution } = summary;

  // Find the highest count to calculate percentage
  const maxCount = Math.max(...Object.values(ratingDistribution));

  // Generate star display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="text-yellow-400 fill-yellow-400" size={20} />
      );
    }

    if (halfStar) {
      stars.push(<StarHalf key="half" className="text-yellow-400 fill-yellow-400" size={20} />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={20} />);
    }

    return stars;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-col md:flex-row">
        {/* Overall Rating */}
        <div className="mb-4 flex flex-col items-center justify-center md:mb-0 md:w-1/3">
          <div className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <div className="mt-1 flex">
            {renderStars(averageRating)}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="md:w-2/3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="mb-2 flex items-center">
              <div className="w-8 text-right text-sm font-medium text-gray-900">
                {rating}
              </div>
              <Star className="ml-1 text-yellow-400" size={14} />
              <div className="ml-2 flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{
                      width: `${maxCount > 0 ? (ratingDistribution[rating] / maxCount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="ml-2 w-8 text-sm text-gray-500">
                {ratingDistribution[rating]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}