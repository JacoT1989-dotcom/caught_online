"use client";

import { useOptimistic, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitReview } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticRating, addOptimisticRating] = useOptimistic(
    0,
    (state: number, newRating: number) => newRating
  );

  const { register, handleSubmit, reset, watch } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = async (data: ReviewFormData) => {
    const formData = new FormData();
    formData.append("productId", productId);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    startTransition(async () => {
      addOptimisticRating(data.rating);
      const result = await submitReview(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted successfully");
        reset();
      }
    });
  };

  const rating = watch("rating", 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              className="p-1"
              onClick={() => {
                const ratingInput = document.querySelector(
                  'input[name="rating"]'
                ) as HTMLInputElement;
                if (ratingInput) {
                  ratingInput.value = value.toString();
                  ratingInput.dispatchEvent(
                    new Event("input", { bubbles: true })
                  );
                }
              }}
            >
              <Star
                className={`h-6 w-6 ${
                  value <= (optimisticRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </Button>
          ))}
        </div>
        <input type="hidden" {...register("rating", { valueAsNumber: true })} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input {...register("title")} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Review</label>
        <Textarea {...register("content")} rows={4} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
}
