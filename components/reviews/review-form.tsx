// components/reviews/review-form.tsx
'use client';

import React, { useState, useRef } from 'react';
import { submitProductReview, type ReviewSubmission } from '@/lib/reviews/stamped';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ReviewFormProps {
  productId: string;
  productName?: string;
  productUrl?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ 
  productId, 
  productName = '', 
  productUrl = '',
  onSuccess 
}: ReviewFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    content: '',
    isRecommended: true
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const newImages: File[] = [];
    const newPreviewUrls: string[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check if it's an image file
      if (!file.type.startsWith('image/')) continue;
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) continue;
      
      newImages.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }
    
    setImages(prev => [...prev, ...newImages]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.title || !formData.content) {
      setError('Please fill out all required fields');
      setLoading(false);
      return;
    }
    
    try {
      // Prepare submission data
      const reviewData: ReviewSubmission = {
        productId,
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
        name: formData.name,
        email: formData.email,
        isRecommended: formData.isRecommended,
        images: images.length > 0 ? images : undefined
      };
      
      // Submit the review
      const result = await submitProductReview(reviewData);
      
      if (result.success) {
        setSuccess(true);
        
        // Reset form data
        setFormData({
          name: '',
          email: '',
          rating: 5,
          title: '',
          content: '',
          isRecommended: true
        });
        
        // Clear images
        setImages([]);
        setImagePreviewUrls(prev => {
          // Revoke all object URLs
          prev.forEach(url => URL.revokeObjectURL(url));
          return [];
        });
        
        // Callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to submit review. Please try again later.');
      console.error('Review submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="p-6 bg-green-50 border border-green-100 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-green-700 mb-2">Thank You!</h3>
        <p className="text-green-700 mb-4">Your review has been submitted successfully.</p>
        <Button 
          onClick={() => setSuccess(false)}
          variant="outline"
        >
          Write Another Review
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="text-2xl focus:outline-none"
              >
                <span className={star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Review title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Review content */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Reviewer name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Reviewer email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Your Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">Your email will not be published</p>
        </div>
        
        {/* Recommendation */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecommended"
              name="isRecommended"
              checked={formData.isRecommended}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="isRecommended" className="ml-2 text-sm text-gray-700">
              I recommend this product
            </label>
          </div>
        </div>
        
        {/* Photo upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Photos (optional)
          </label>
          
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mr-2"
            >
              Select Images
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <span className="text-xs text-gray-500">
              Max 5 images (5MB each)
            </span>
          </div>
          
          {/* Image previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imagePreviewUrls.map((url, index) => (
                <div 
                  key={index}
                  className="relative w-20 h-20"
                >
                  <div className="relative w-20 h-20 rounded overflow-hidden">
                    <Image 
                      src={url} 
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit button */}
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}