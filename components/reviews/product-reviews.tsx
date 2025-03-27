'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star } from 'lucide-react';

interface ReviewProps {
  id: string;
  productId: string;
  rating: number;
  title: string;
  review: string;
  date: string;
  authorName: string;
  productInfo?: {
    name: string;
    fit?: string;
    type?: string;
  };
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={24}
          fill={i < rating ? "#f3c06b" : "none"}
          color={i < rating ? "#f3c06b" : "#d1d5db"}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: ReviewProps }) => {
  return (
    <div className="flex flex-col mb-8">
      <div className="flex justify-between items-center mb-2">
        <StarRating rating={review.rating} />
        <span className="text-gray-500">{review.date}</span>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{review.title}</h3>
      
      <p className="text-gray-600 italic mb-4">
        {review.review}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold text-gray-700">
          {review.authorName}
        </div>
        
        {review.productInfo && (
          <div className="text-xs uppercase tracking-wider text-gray-500">
            {review.productInfo.fit && <span>{review.productInfo.fit}-</span>}
            {review.productInfo.type && <span>{review.productInfo.type}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  
  // Sample review data for Norwegian Salmon - HARDCODED FOR TESTING PURPOSES
  const sampleReviews: ReviewProps[] = [
    {
      id: '1',
      productId: productId,
      rating: 5,
      title: 'Exceptional flavor and freshness',
      review: 'The Norwegian Salmon Ribbons are absolutely delicious. The oak smoking process gives them a wonderful flavor without overpowering the natural taste of the salmon. Perfect with cream cheese on a bagel for breakfast. Will definitely order again!',
      date: '02/15/2023',
      authorName: 'Sarah M.',
      productInfo: {
        name: 'Norwegian Salmon Ribbons',
        type: 'OAK SMOKED'
      }
    },
    {
      id: '2',
      productId: productId,
      rating: 5,
      title: 'Premium quality that you can taste',
      review: 'These salmon ribbons are worth every penny. The quality is evident from the moment you open the package - beautiful color, perfect texture, and a clean, fresh taste. I appreciate that they\'re sustainably sourced too. Makes for an elegant appetizer when entertaining guests.',
      date: '01/30/2023',
      authorName: 'Michael P.',
      productInfo: {
        name: 'Norwegian Salmon Ribbons',
        type: 'OAK SMOKED'
      }
    },
    {
      id: '3',
      productId: productId,
      rating: 4,
      title: 'Great product, delivery could be improved',
      review: 'The salmon itself is fantastic - moist, flaky and with that distinctive bright orange color. The flavor is clean and fresh. Only giving 4 stars because my delivery was delayed by a day, which for fresh fish is significant. The product was still good though, and I\'ll order again.',
      date: '12/05/2022',
      authorName: 'John V.',
      productInfo: {
        name: 'Norwegian Salmon Ribbons',
        type: 'OAK SMOKED'
      }
    }
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleWriteReviewClick = () => {
    setShowReviewForm(true);
    setActiveTab('write');
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setActiveTab('reviews');
  };

  // This is a placeholder component for the ReviewForm
  const ReviewForm = () => (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-4">Write Your Review</h3>
      <p className="text-gray-500 text-sm mb-4">This is a placeholder review form. In a real implementation, this would contain rating selectors, text inputs, and a submit button.</p>
      <div className="flex justify-end">
        <Button onClick={handleReviewSubmitted}>Submit Review (Demo)</Button>
      </div>
    </div>
  );

  return (
    <div className="my-8 max-w-4xl mx-auto">
      {/* Header section similar to screenshot */}
      <div className="text-center mb-8">
        <h2 className="uppercase text-2xl font-bold tracking-wide text-gray-800 mb-6">See What Our Customer Said</h2>
        <div className="w-full h-px bg-gray-300 mb-8"></div>
      </div>
      
      {/* Reviews display section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sampleReviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>
      
      {/* Review writing section - shown conditionally */}
      {showReviewForm ? (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Write a Review</h3>
          <ReviewForm />
        </div>
      ) : (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleWriteReviewClick} className="px-6 py-2">
            Write a Review
          </Button>
        </div>
      )}
      
      {/* Note about sample data */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This component is currently using hardcoded sample data for testing and demonstration purposes. In a production environment, this would fetch real review data from an API endpoint.
        </p>
      </div>
    </div>
  );
}