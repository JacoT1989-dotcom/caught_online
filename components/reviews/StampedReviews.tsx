"use client";

// components/reviews/StampedReviews.tsx
import React from 'react';
import { StarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StampedReviewsProps {
  productId: string;
  productTitle: string;
  productUrl: string;
  productHandle?: string;
}

interface Review {
  id: string;
  authorName: string;
  rating: number;
  reviewTitle?: string;
  reviewMessage: string;
  createdAt: string;
  verified: boolean;
}

export default function StampedReviews({
  productId,
  productTitle,
  productUrl,
  productHandle = ''
}: StampedReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Build the API URL with all available product info
        let url = `/api/reviews/get-reviews?productId=${encodeURIComponent(productId)}`;
        
        if (productTitle) {
          url += `&title=${encodeURIComponent(productTitle)}`;
        }
        
        if (productHandle) {
          url += `&handle=${encodeURIComponent(productHandle)}`;
        }
        
        console.log('Fetching reviews from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Use the reviews from the response
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, productTitle, productHandle]);
  
  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 my-4">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">No reviews yet for this product.</p>
          <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
            Write a Review
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    {renderStars(review.rating)}
                  </div>
                  {review.reviewTitle && (
                    <h3 className="text-lg font-semibold">{review.reviewTitle}</h3>
                  )}
                </div>
                {review.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Verified Purchase
                  </span>
                )}
              </div>
              
              <div className="mt-2 text-gray-700 whitespace-pre-line">
                {review.reviewMessage}
              </div>
              
              <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
                <div>
                  <span className="font-medium">{review.authorName}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}