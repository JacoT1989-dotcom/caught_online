'use client';

import React, { useState, useEffect } from 'react';
import { getProductReviews, Review } from '@/lib/reviews/stamped';
import ReviewCard from '@/components/reviews/review-card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch initial reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const fetchedReviews = await getProductReviews(productId, 1);
        setReviews(fetchedReviews);
        setHasMore(fetchedReviews.length === 10); // Assuming 10 reviews per page
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Load more reviews
  const loadMoreReviews = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const moreReviews = await getProductReviews(productId, nextPage);
      
      if (moreReviews.length > 0) {
        setReviews(prevReviews => [...prevReviews, ...moreReviews]);
        setPage(nextPage);
        setHasMore(moreReviews.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle helpful vote
  const handleVoteHelpful = async (reviewId: string) => {
    // Implement logic to vote review as helpful
    // This would typically involve an API call to Stamped.io
    console.log(`Voted review ${reviewId} as helpful`);
    
    // For now, we'll just update the UI optimistically
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulVotes: review.helpfulVotes + 1 } 
          : review
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-gray-200">
        {reviews.map(review => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            onVoteHelpful={handleVoteHelpful}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={loadMoreReviews} 
            disabled={loadingMore}
            variant="outline"
            className="text-sm"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Reviews'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}