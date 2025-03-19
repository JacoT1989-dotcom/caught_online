'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RatingSummaryComponent from '@/components/reviews/rating-summary';
import ReviewList from '@/components/reviews/review-list';
import ReviewForm from '@/components/reviews/review-form';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  const [refreshKey, setRefreshKey] = useState(0);

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
    setRefreshKey(prev => prev + 1); // Force refresh of reviews
  };

  return (
    <div className="my-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Customer Reviews</h2>
      
      <RatingSummaryComponent productId={productId} />
      
      <div className="mt-6 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="reviews">All Reviews</TabsTrigger>
            {showReviewForm && <TabsTrigger value="write">Write a Review</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="reviews" className="mt-4">
            <div className="mb-4 flex justify-end">
              <Button onClick={handleWriteReviewClick}>Write a Review</Button>
            </div>
            <ReviewList key={refreshKey} productId={productId} />
          </TabsContent>
          
          {showReviewForm && (
            <TabsContent value="write" className="mt-4">
              <ReviewForm
                productId={productId}
                productName={productName}
                onClose={() => setShowReviewForm(false)}
                onSubmitSuccess={handleReviewSubmitted}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}