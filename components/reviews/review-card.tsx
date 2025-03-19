import React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Star, ThumbsUp, User } from 'lucide-react';
import { Review } from '@/lib/reviews/stamped';

interface ReviewCardProps {
  review: Review;
  onVoteHelpful?: (reviewId: string) => void;
}

export default function ReviewCard({ review, onVoteHelpful }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={i < review.rating 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-gray-300"
                }
                size={16}
              />
            ))}
          </div>
          <h4 className="ml-3 text-sm font-semibold text-gray-900">{review.title}</h4>
        </div>
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(review.dateCreated), { addSuffix: true })}
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-700">
        <p>{review.content}</p>
      </div>
      
      {review.images && review.images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.images.map((image, index) => (
            <div key={index} className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={image.thumbnail || image.url}
                alt={`Review image ${index + 1}`}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-700">{review.author.name}</span>
          {review.isVerifiedBuyer && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              Verified Buyer
            </span>
          )}
        </div>
        
        <button
          onClick={() => onVoteHelpful && onVoteHelpful(review.id)}
          className="flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
        >
          <ThumbsUp size={12} />
          <span>Helpful {review.helpfulVotes > 0 ? `(${review.helpfulVotes})` : ''}</span>
        </button>
      </div>
    </div>
  );
}
