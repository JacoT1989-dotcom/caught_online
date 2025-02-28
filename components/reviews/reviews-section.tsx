"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getProductReviews,
  getProductRatingSummary,
  Review,
} from "@/lib/reviews/stamped";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, StarHalf, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface ReviewsSectionProps {
  productId: string;
}

// Define the API response structure if your getProductReviews includes pagination metadata
interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: reviews, isLoading: isLoadingReviews } =
    useQuery<ReviewsResponse>({
      queryKey: ["reviews", productId, currentPage],
      queryFn: async () => {
        const data = await getProductReviews(productId, currentPage);
        // If your API doesn't return the expected structure, transform it here
        // This assumes getProductReviews returns an array of reviews
        return {
          data: data,
          meta: {
            total: data.length,
            page: currentPage,
            perPage: 10,
            totalPages: Math.ceil(data.length / 10),
          },
        };
      },
    });

  const { data: ratingSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["ratingSummary", productId],
    queryFn: () => getProductRatingSummary(productId),
  });

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
            <p className="text-sm text-muted-foreground">
              Based on {ratingSummary?.totalReviews} reviews
            </p>
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
      {reviews && reviews.meta.total > 10 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage * 10 >= reviews.meta.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
