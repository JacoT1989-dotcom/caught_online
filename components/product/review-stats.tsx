import { getProductRatingSummary } from '@/lib/reviews/stamped';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

export async function ReviewStats({ productId }: { productId: string }) {
  const summary = await getProductRatingSummary(productId);

  if (!summary) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="text-center md:text-left">
        <div className="text-4xl font-bold mb-2">
          {summary.averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center md:justify-start mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(summary.averageRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Based on {summary.totalReviews} reviews
        </p>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = summary.ratingDistribution[stars] || 0;
          const percentage = (count / summary.totalReviews) * 100 || 0;
          
          return (
            <div key={stars} className="flex items-center gap-4">
              <div className="w-12 text-sm">{stars} stars</div>
              <Progress value={percentage} className="h-2" />
              <div className="w-12 text-sm text-right">{percentage.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}