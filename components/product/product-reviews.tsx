"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getProductReviews,
  getProductRatingSummary,
} from "@/lib/reviews/stamped";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  StarHalf,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: reviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
  } = useQuery({
    queryKey: ["reviews", productId, currentPage],
    queryFn: () => getProductReviews(productId),
    retry: 1,
  });

  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useQuery({
    queryKey: ["ratingSummary", productId],
    queryFn: () => getProductRatingSummary(productId),
    retry: 1,
  });

  if (isLoadingReviews || isLoadingSummary) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show empty state for both errors and no reviews
  if (reviewsError || summaryError || !reviews?.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-medium">No Reviews Yet</h3>
          <p className="text-muted-foreground">
            Be the first to review this product
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      {summary && summary.totalReviews > 0 && (
        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold mb-2">
                {summary.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center md:justify-start mb-4">
                {[...Array(5)].map((_, i) => {
                  const value = summary.averageRating - i;
                  return value >= 1 ? (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ) : value > 0 ? (
                    <StarHalf
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ) : (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {summary.totalReviews} reviews
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = summary.ratingDistribution[stars] || 0;
                const percentage = summary.totalReviews
                  ? (count / summary.totalReviews) * 100
                  : 0;

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
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
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
                          width={500}
                          height={300}
                          priority
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
      {reviews.length > 0 && (
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
            disabled={currentPage * 10 >= (reviews?.length || 0)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
