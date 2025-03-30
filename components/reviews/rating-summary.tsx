// components/reviews/rating-summary.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getProductRatingSummary, type RatingSummary } from '@/lib/reviews/stamped';

interface RatingSummaryProps {
  productId: string;
}

export default function RatingSummaryComponent({ productId }: RatingSummaryProps) {
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getProductRatingSummary(productId);
        setSummary(data);
      } catch (err) {
        console.error('Error fetching rating summary:', err);
        setError('Failed to load rating summary.');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchSummary();
    }
  }, [productId]);

  if (loading) {
    return <div className="h-32 flex items-center justify-center">Loading ratings...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!summary || summary.totalReviews === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p>No reviews yet. Be the first to write a review!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="text-yellow-400 text-xl">
                  {star <= Math.round(summary.averageRating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-lg font-medium">
              {summary.averageRating.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          {/* Rating distribution */}
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = summary.ratingDistribution[rating] || 0;
              const percentage = summary.totalReviews > 0 
                ? (count / summary.totalReviews) * 100 
                : 0;
                
              return (
                <div key={rating} className="flex items-center">
                  <span className="w-12 text-sm">{rating} stars</span>
                  <div className="w-48 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

