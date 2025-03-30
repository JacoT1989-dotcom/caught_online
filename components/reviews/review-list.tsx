// components/reviews/review-list.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getProductReviews, type Review } from '@/lib/reviews/stamped';
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Import Next.js Image component

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getProductReviews(productId, page);
        
        if (page === 1) {
          setReviews(data);
        } else {
          setReviews(prev => [...prev, ...data]);
        }
        
        // If we got fewer reviews than expected, there might be no more pages
        setHasMore(data.length === 10);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchReviews();
    }
  }, [productId, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && reviews.length === 0) {
    return <div className="p-4 text-center">Loading reviews...</div>;
  }

  if (error && reviews.length === 0) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="p-4 text-center">No reviews yet. Be the first to write a review!</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6">
          <div className="flex justify-between">
            <div>
              <div className="flex mb-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className="text-yellow-400">
                    {star <= review.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <h3 className="font-semibold">{review.title}</h3>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(review.dateCreated).toLocaleDateString()}
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-700">{review.content}</p>
          </div>
          
          {review.images && review.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {review.images.map((image: { thumbnail: string; url: string }, index: number) => (
                <div 
                  key={index}
                  className="relative h-16 w-16 rounded overflow-hidden cursor-pointer"
                  onClick={() => window.open(image.url, '_blank')}
                >
                  <Image 
                    src={image.thumbnail}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3 text-sm">
            <span className="font-medium">{review.author.name}</span>
            {review.isVerifiedBuyer && (
              <span className="ml-2 text-green-600">✓ Verified Buyer</span>
            )}
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  );
}