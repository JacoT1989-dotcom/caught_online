import { ReviewCard } from './review-card';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  dateCreated: string;
  isVerifiedBuyer: boolean;
  helpfulVotes: number;
  images?: Array<{
    url: string;
    thumbnail: string;
  }>;
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}