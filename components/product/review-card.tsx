"use client";

import { useState } from "react";
import { Star, ThumbsUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image"; // Add this import
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ReviewCardProps {
  review: {
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
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulVotes);
  const [isHelpful, setIsHelpful] = useState(false);

  const handleHelpfulClick = () => {
    if (!isHelpful) {
      setHelpfulCount((prev) => prev + 1);
      setIsHelpful(true);
    } else {
      setHelpfulCount((prev) => prev - 1);
      setIsHelpful(false);
    }
  };

  return (
    <div className="space-y-4 p-6 rounded-lg border bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {review.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.author.name}</span>
              {review.isVerifiedBuyer && (
                <Badge variant="secondary" className="text-xs">
                  Verified Purchase
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(review.dateCreated), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center">
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
      </div>

      <div>
        <h4 className="font-medium mb-2">{review.title}</h4>
        <p className="text-muted-foreground">{review.content}</p>
      </div>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-4">
          {review.images.map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Button className="relative h-20 w-20 rounded-lg overflow-hidden border">
                  <Image
                    src={image.thumbnail}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={image.url}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2", isHelpful && "text-green-600")}
          onClick={handleHelpfulClick}
        >
          <ThumbsUp className="h-4 w-4" />
          Helpful ({helpfulCount})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
        >
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </div>
    </div>
  );
}
