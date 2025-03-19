'use client';

import React, { useState, useRef } from 'react';
import { Star, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitProductReview } from '@/lib/reviews/stamped';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function ReviewForm({
  productId,
  productName,
  onClose,
  onSubmitSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    if (images.length + newImages.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }

    setImages([...images, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await submitProductReview({
        productId,
        rating,
        title,
        content,
        authorName,
        authorEmail,
        images,
      });

      if (success) {
        onSubmitSuccess();
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Write a Review for {productName}
      </h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label className="mb-1 block">Rating</Label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="mr-1 focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="title" className="mb-1 block">
            Review Title
          </Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" required />
        </div>

        <div className="mb-4">
          <Label htmlFor="content" className="mb-1 block">
            Review Content
          </Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What did you like or dislike about this product?" rows={4} required minLength={10} />
        </div>

        <div className="mb-4">
          <Label className="mb-1 block">Add Images (Optional)</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200">
                <Image src={URL.createObjectURL(image)} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" width={64} height={64} />
                <button type="button" onClick={() => removeImage(index)} className="absolute right-0 top-0 rounded-bl-md bg-white p-0.5 text-gray-700 hover:bg-gray-100">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || rating === 0}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</Button>
        </div>
      </form>
    </div>
  );
}
