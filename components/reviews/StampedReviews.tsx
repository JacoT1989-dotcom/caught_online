'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

interface StampedReviewsProps {
  productId: string;
  productTitle?: string;
  productUrl?: string;
  productHandle?: string;
}

interface Review {
  id: string;
  authorName: string;
  rating: number;
  reviewTitle: string;
  reviewMessage: string;
  createdAt: string;
  verified?: boolean;
  productTitle?: string;
}

interface ReviewsResponse {
  reviews: Review[];
  count: number;
  totalPages: number;
  currentPage: number;
  source: string;
}

export default function StampedReviews({
  productId,
  productTitle = '',
  productUrl = '',
  productHandle = '',
}: StampedReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Extract handle from URL if not provided
  const extractedHandle = productHandle || (productUrl ? extractHandleFromUrl(productUrl) : '');
  
  // Get current page from URL or default to 1
  useEffect(() => {
    const pageParam = searchParams?.get('reviewPage');
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setCurrentPage(parsedPage);
      }
    }
  }, [searchParams]);
  
  // Helper function to extract product handle from URL
  function extractHandleFromUrl(url: string): string {
    if (!url) return '';
    
    // Try to extract the handle from different URL patterns
    const productsMatch = url.match(/\/products\/([^/?#]+)/);
    if (productsMatch && productsMatch[1]) {
      return productsMatch[1];
    }
    
    return '';
  }

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build the URL with additional parameters for better matching
        const handle = extractedHandle;
        
        const endpoint = `/api/reviews/get-reviews?productId=${encodeURIComponent(productId)}` +
          (productTitle ? `&title=${encodeURIComponent(productTitle)}` : '') +
          (handle ? `&handle=${encodeURIComponent(handle)}` : '') +
          `&page=${currentPage}&limit=20`;
        
        console.log(`Fetching reviews from ${endpoint}`);
        
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data: ReviewsResponse = await response.json();
          console.log('Reviews data received:', data);
          
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
            setTotalReviews(data.count || data.reviews.length);
            setTotalPages(data.totalPages || Math.ceil((data.count || data.reviews.length) / 20));
          } else {
            console.log('No reviews found for this product');
            setReviews([]);
            setTotalReviews(0);
            setTotalPages(1);
          }
        } else {
          console.error('Failed to fetch reviews');
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setError('Failed to load reviews. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Could not connect to reviews service. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchReviews();
    }
  }, [productId, productTitle, extractedHandle, currentPage]);

  // Calculate average rating
  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Update the URL with the new page number
  const updatePageInUrl = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams?.entries() || []));
    current.set('reviewPage', newPage.toString());
    
    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    router.push(`${pathname}${query}`);
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    // Update URL with the new page
    updatePageInUrl(newPage);
    
    // Update state
    setCurrentPage(newPage);
    
    // Scroll to reviews section
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    // Calculate range of pages to display
    const range = 2; // Show 2 pages on each side of current
    const startPage = Math.max(1, currentPage - range);
    const endPage = Math.min(totalPages, currentPage + range);
    
    // Create array of page numbers to display
    const pages = [];
    
    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    // Add pages in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return (
      <div className="flex flex-wrap justify-center items-center mt-8 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          Previous
        </button>
        
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(Number(page))}
              disabled={currentPage === page}
              className={`px-3 py-2 border rounded-md text-sm ${
                currentPage === page 
                  ? 'bg-pink-600 text-white border-pink-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div id="reviews-section" className="my-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Customer Reviews</h2>
        <div className="text-center p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-300 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="reviews-section" className="my-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Customer Reviews</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div id="reviews-section" className="my-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Customer Reviews</h2>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">No reviews yet for this product.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="reviews-section" className="my-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Customer Reviews</h2>
      
      {/* Review Summary */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0 md:mr-6">
            <div className="text-3xl font-bold mr-3">{averageRating.toFixed(1)}</div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <svg 
                  key={star} 
                  className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="text-gray-600">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} • Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
      
      {/* Reviews list */}
      <div className="space-y-5 mb-8">
        {reviews.map(review => (
          <div key={review.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg 
                      key={star} 
                      className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  
                  {review.verified && (
                    <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-800 text-xs rounded">
                      Verified Buyer
                    </span>
                  )}
                </div>
                <h4 className="font-bold mt-1">{review.reviewTitle}</h4>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </div>
            </div>
            
            <p className="mt-2 text-gray-700">{review.reviewMessage}</p>
            
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">By:</span> {review.authorName}
            </div>
            
            {review.productTitle && review.productTitle !== productTitle && (
              <div className="mt-1 text-xs text-gray-500">
                <span className="font-semibold">For:</span> {review.productTitle}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}