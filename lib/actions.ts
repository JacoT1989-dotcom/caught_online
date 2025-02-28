'use client';

import { z } from 'zod';
import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';

const ReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  content: z.string().min(10),
  authorName: z.string(),
  authorEmail: z.string().email(),
});

export async function submitReview(formData: FormData) {
  const validatedFields = ReviewSchema.safeParse({
    productId: formData.get('productId'),
    rating: Number(formData.get('rating')),
    title: formData.get('title'),
    content: formData.get('content'),
    authorName: formData.get('authorName'),
    authorEmail: formData.get('authorEmail'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields.' };
  }

  const { productId } = validatedFields.data;

  try {
    // Store review in KV with TTL
    const reviewId = crypto.randomUUID();
    await kv.set(`review:${reviewId}`, validatedFields.data, { ex: 60 * 60 * 24 * 30 }); // 30 days

    // Update product reviews count
    await kv.incr(`product:${productId}:reviews`);
    
    return { success: true };
  } catch (error) {
    return { error: 'Failed to submit review.' };
  }
}