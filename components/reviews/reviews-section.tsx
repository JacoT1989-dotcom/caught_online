"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getProductReviews,
  getProductRatingSummary,
  Review,
  ReviewSubmission
} from "@/lib/reviews/stamped";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, StarHalf, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import ReviewForm from "@/components/reviews/review-form";

interface ReviewsSectionProps {
  productId: string;
  productName: string;
  productUrl: string;
  productHandle?: string;
}

// Define the API response structure
interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export function ReviewsSection({ 
  productId, 
  productName, 
  productUrl,
  productHandle = '' 
}: ReviewsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Query for reviews
  const { 
    data: reviews, 
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    refetch: refetchReviews 
  } = useQuery<ReviewsResponse>({
    queryKey: ["reviews", productId, currentPage, sortOrder],
    queryFn: async () => {
      try {
        const data = await getProductReviews(productId, currentPage);
        
        // Sort the reviews based on sortOrder
        let sortedData = [...data];
        if (sortOrder === 'highest') {
          sortedData.sort((a, b) => b.rating - a.rating);
        } else if (sortOrder === 'lowest') {
          sortedData.sort((a, b) => a.rating - b.rating);
        } // 'recent' is the default from the API

        return {
          data: sortedData,
          meta: {
            total: data.length,
            page: currentPage,
            perPage: 10,
            totalPages: Math.ceil(data.length / 10),
          },
        };
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }
    },
  });

  // Query for rating summary
  const { 
    data: ratingSummary, 
    isLoading: isLoadingSummary,
    isError: isSummaryError 
  } = useQuery({
    queryKey: ["ratingSummary", productId],
    queryFn: () => getProductRatingSummary(productId),
  });

  // Handle successful review submission
  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    refetchReviews();  // Refresh the reviews list
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Loading states
  if (isLoadingReviews || isLoadingSummary) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[200px] w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[150px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error states
  if (isReviewsError || isSummaryError) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Unable to Load Reviews</h3>
        <p className="mb-4 text-muted-foreground">
          We&apos;re having trouble loading reviews for this product. Please try again later.
        </p>
        <Button onClick={() => refetchReviews()}>Try Again</Button>
      </Card>
    );
  }

  // Empty state - no reviews yet
  if (!reviews?.data.length) {
    return (
      <div className="space-y-8">
        {/* Rating Summary - Even with 0 reviews */}
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">No Reviews Yet</h3>
            <p className="mb-6 text-muted-foreground">
              Be the first to review &quot;{productName}&quot;
            </p>
            {!showReviewForm ? (
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            ) : (
              <ReviewForm
                productId={productId}
                productName={productName}
                productUrl={productUrl}
                productHandle={productHandle}
                onSuccess={handleReviewSubmitted}
              />
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold mb-2">
              {ratingSummary?.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center md:justify-start mb-4">
              {renderStars(ratingSummary?.averageRating || 0)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Based on {ratingSummary?.totalReviews} reviews
            </p>
            {!showReviewForm ? (
              <Button 
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Write a Review
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingSummary?.ratingDistribution[stars] || 0;
              const percentage =
                (count / (ratingSummary?.totalReviews || 1)) * 100 || 0;

              return (
                <div key={stars} className="flex items-center gap-4">
                  <div className="w-12 text-sm">{stars} stars</div>
                  <Progress value={percentage} className="h-2" />
                  <div className="w-12 text-sm text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Review Form (when shown) */}
      {showReviewForm && (
        <Card className="p-6">
          <ReviewForm
            productId={productId}
            productName={productName}
            productUrl={productUrl}
            productHandle={productHandle}
            onSuccess={handleReviewSubmitted}
          />
        </Card>
      )}

      {/* Sorting Controls */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'recent' | 'highest' | 'lowest')}
            className="border rounded p-1 text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews?.data.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  {review.isVerifiedBuyer && (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified Buyer
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{review.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {review.content}
                </p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <div key={index} className="relative h-16 w-16">
                        <Image
                          src={image.thumbnail}
                          alt={`Review image ${index + 1}`}
                          fill
                          sizes="64px"
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{review.author.name}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(review.dateCreated), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {reviews && reviews.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1 px-4">
            <span className="text-sm">
              Page {currentPage} of {reviews.meta.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(reviews.meta.totalPages, p + 1))}
            disabled={currentPage >= reviews.meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}