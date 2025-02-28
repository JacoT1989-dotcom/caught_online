import { STAMPED_CONFIG } from "./config";

export interface Review {
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

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

const DEFAULT_SUMMARY: RatingSummary = {
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
};

export async function getProductReviews(
  productId: string,
  page = 1
): Promise<Review[]> {
  if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
    return [];
  }

  try {
    const response = await fetch(
      `${STAMPED_CONFIG.apiUrl}/reviews?` +
        `apiKey=${STAMPED_CONFIG.publicKey}&` +
        `storeHash=${STAMPED_CONFIG.storeHash}&` +
        `productId=${productId}&` +
        `page=${page}&` +
        `perPage=10&` +
        `sortBy=dateCreated&` +
        `sortDirection=desc`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.reviews || [];
  } catch {
    return [];
  }
}

export async function getProductRatingSummary(
  productId: string
): Promise<RatingSummary> {
  if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
    return DEFAULT_SUMMARY;
  }

  try {
    const response = await fetch(
      `${STAMPED_CONFIG.apiUrl}/widget/stats?` +
        `apiKey=${STAMPED_CONFIG.publicKey}&` +
        `storeHash=${STAMPED_CONFIG.storeHash}&` +
        `productId=${productId}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return DEFAULT_SUMMARY;
    }

    const data = await response.json();

    return {
      averageRating: data.rating || 0,
      totalReviews: data.total || 0,
      ratingDistribution: data.distribution || {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  } catch {
    return DEFAULT_SUMMARY;
  }
}

// Interface for review submission
export interface ReviewSubmission {
  productId: string;
  rating: number;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  images?: File[];
}

export async function submitProductReview({
  productId,
  rating,
  title,
  content,
  authorName,
  authorEmail,
  images = [],
}: ReviewSubmission): Promise<boolean> {
  if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
    throw new Error("Missing required configuration");
  }

  // Create FormData for multipart submission (needed for images)
  const formData = new FormData();
  formData.append("apiKey", STAMPED_CONFIG.publicKey);
  formData.append("storeHash", STAMPED_CONFIG.storeHash);
  formData.append("productId", productId);
  formData.append("rating", rating.toString());
  formData.append("title", title);
  formData.append("content", content);
  formData.append("authorName", authorName);
  formData.append("authorEmail", authorEmail);

  // Add images if provided
  images.forEach((file, index) => {
    formData.append(`reviewImages[${index}]`, file);
  });

  try {
    const response = await fetch(`${STAMPED_CONFIG.apiUrl}/reviews/create`, {
      method: "POST",
      body: formData,
      // No Content-Type header needed as browser sets it automatically with boundary for FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit review");
    }

    return true;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}
