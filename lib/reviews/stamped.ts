// // //lib/reviews/stamped.ts
// // import { STAMPED_CONFIG } from "./config";

// // export interface Review {
// //   id: string;
// //   rating: number;
// //   title: string;
// //   content: string;
// //   author: {
// //     name: string;
// //     email: string;
// //   };
// //   dateCreated: string;
// //   isVerifiedBuyer: boolean;
// //   helpfulVotes: number;
// //   images?: Array<{
// //     url: string;
// //     thumbnail: string;
// //   }>;
// // }

// // export interface RatingSummary {
// //   averageRating: number;
// //   totalReviews: number;
// //   ratingDistribution: {
// //     [key: number]: number;
// //   };
// // }

// // const DEFAULT_SUMMARY: RatingSummary = {
// //   averageRating: 0,
// //   totalReviews: 0,
// //   ratingDistribution: {
// //     1: 0,
// //     2: 0,
// //     3: 0,
// //     4: 0,
// //     5: 0,
// //   },
// // };

// // export async function getProductReviews(
// //   productId: string,
// //   page = 1
// // ): Promise<Review[]> {
// //   if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
// //     return [];
// //   }

// //   try {
// //     const response = await fetch(
// //       `${STAMPED_CONFIG.apiUrl}/reviews?` +
// //         `apiKey=${STAMPED_CONFIG.publicKey}&` +
// //         `storeHash=${STAMPED_CONFIG.storeHash}&` +
// //         `productId=${productId}&` +
// //         `page=${page}&` +
// //         `perPage=10&` +
// //         `sortBy=dateCreated&` +
// //         `sortDirection=desc`,
// //       {
// //         headers: {
// //           Accept: "application/json",
// //           "Content-Type": "application/json",
// //         },
// //         next: { revalidate: 3600 }, // Cache for 1 hour
// //       }
// //     );

// //     if (!response.ok) {
// //       return [];
// //     }

// //     const data = await response.json();
// //     return data.reviews || [];
// //   } catch {
// //     return [];
// //   }
// // }

// // export async function getProductRatingSummary(
// //   productId: string
// // ): Promise<RatingSummary> {
// //   if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
// //     return DEFAULT_SUMMARY;
// //   }

// //   try {
// //     const response = await fetch(
// //       `${STAMPED_CONFIG.apiUrl}/widget/stats?` +
// //         `apiKey=${STAMPED_CONFIG.publicKey}&` +
// //         `storeHash=${STAMPED_CONFIG.storeHash}&` +
// //         `productId=${productId}`,
// //       {
// //         headers: {
// //           Accept: "application/json",
// //           "Content-Type": "application/json",
// //         },
// //         next: { revalidate: 3600 },
// //       }
// //     );

// //     if (!response.ok) {
// //       return DEFAULT_SUMMARY;
// //     }

// //     const data = await response.json();

// //     return {
// //       averageRating: data.rating || 0,
// //       totalReviews: data.total || 0,
// //       ratingDistribution: data.distribution || {
// //         1: 0,
// //         2: 0,
// //         3: 0,
// //         4: 0,
// //         5: 0,
// //       },
// //     };
// //   } catch {
// //     return DEFAULT_SUMMARY;
// //   }
// // }

// // // Interface for review submission
// // export interface ReviewSubmission {
// //   productId: string;
// //   rating: number;
// //   title: string;
// //   content: string;
// //   authorName: string;
// //   authorEmail: string;
// //   images?: File[];
// // }

// // export async function submitProductReview({
// //   productId,
// //   rating,
// //   title,
// //   content,
// //   authorName,
// //   authorEmail,
// //   images = [],
// // }: ReviewSubmission): Promise<boolean> {
// //   if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
// //     throw new Error("Missing required configuration");
// //   }

// //   // Create FormData for multipart submission (needed for images)
// //   const formData = new FormData();
// //   formData.append("apiKey", STAMPED_CONFIG.publicKey);
// //   formData.append("storeHash", STAMPED_CONFIG.storeHash);
// //   formData.append("productId", productId);
// //   formData.append("rating", rating.toString());
// //   formData.append("title", title);
// //   formData.append("content", content);
// //   formData.append("authorName", authorName);
// //   formData.append("authorEmail", authorEmail);

// //   // Add images if provided
// //   images.forEach((file, index) => {
// //     formData.append(`reviewImages[${index}]`, file);
// //   });

// //   try {
// //     const response = await fetch(`${STAMPED_CONFIG.apiUrl}/reviews/create`, {
// //       method: "POST",
// //       body: formData,
// //       // No Content-Type header needed as browser sets it automatically with boundary for FormData
// //     });

// //     if (!response.ok) {
// //       const errorData = await response.json();
// //       throw new Error(errorData.message || "Failed to submit review");
// //     }

// //     return true;
// //   } catch (error) {
// //     console.error("Error submitting review:", error);
// //     throw error;
// //   }
// // }
// import { STAMPED_CONFIG } from "./config";

// export interface Review {
//   id: string;
//   rating: number;
//   title: string;
//   content: string;
//   author: {
//     name: string;
//     email: string;
//   };
//   dateCreated: string;
//   isVerifiedBuyer: boolean;
//   helpfulVotes: number;
//   images?: Array<{
//     url: string;
//     thumbnail: string;
//   }>;
// }

// export interface RatingSummary {
//   averageRating: number;
//   totalReviews: number;
//   ratingDistribution: {
//     [key: number]: number;
//   };
// }

// const DEFAULT_SUMMARY: RatingSummary = {
//   averageRating: 0,
//   totalReviews: 0,
//   ratingDistribution: {
//     1: 0,
//     2: 0,
//     3: 0,
//     4: 0,
//     5: 0,
//   },
// };

// export async function getProductReviews(
//   productId: string,
//   page = 1
// ): Promise<Review[]> {
//   if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
//     return [];
//   }

//   try {
//     const response = await fetch(
//       `${STAMPED_CONFIG.apiUrl}/reviews?` +
//         `apiKey=${STAMPED_CONFIG.publicKey}&` +
//         `storeHash=${STAMPED_CONFIG.storeHash}&` +
//         `productId=${productId}&` +
//         `page=${page}&` +
//         `perPage=10&` +
//         `sortBy=dateCreated&` +
//         `sortDirection=desc`,
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         next: { revalidate: 3600 }, // Cache for 1 hour
//       }
//     );

//     if (!response.ok) {
//       return [];
//     }

//     const data = await response.json();
//     return data.reviews || [];
//   } catch {
//     return [];
//   }
// }

// export async function getProductRatingSummary(
//   productId: string
// ): Promise<RatingSummary> {
//   if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
//     return DEFAULT_SUMMARY;
//   }

//   try {
//     const response = await fetch(
//       `${STAMPED_CONFIG.apiUrl}/widget/stats?` +
//         `apiKey=${STAMPED_CONFIG.publicKey}&` +
//         `storeHash=${STAMPED_CONFIG.storeHash}&` +
//         `productId=${productId}`,
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         next: { revalidate: 3600 },
//       }
//     );

//     if (!response.ok) {
//       return DEFAULT_SUMMARY;
//     }

//     const data = await response.json();

//     return {
//       averageRating: data.rating || 0,
//       totalReviews: data.total || 0,
//       ratingDistribution: data.distribution || {
//         1: 0,
//         2: 0,
//         3: 0,
//         4: 0,
//         5: 0,
//       },
//     };
//   } catch {
//     return DEFAULT_SUMMARY;
//   }
// }

// // Interface for review submission
// export interface ReviewSubmission {
//   productId: string;
//   rating: number;
//   title: string;
//   content: string;
//   authorName: string;
//   authorEmail: string;
//   images?: File[];
// }

// export async function submitProductReview({
//   productId,
//   rating,
//   title,
//   content,
//   authorName,
//   authorEmail,
//   images = [],
// }: ReviewSubmission): Promise<boolean> {
//   if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
//     throw new Error("Missing required configuration");
//   }

//   // Create FormData for multipart submission (needed for images)
//   const formData = new FormData();
//   formData.append("apiKey", STAMPED_CONFIG.publicKey);
//   formData.append("storeHash", STAMPED_CONFIG.storeHash);
//   formData.append("productId", productId);
//   formData.append("rating", rating.toString());
//   formData.append("title", title);
//   formData.append("content", content);
//   formData.append("authorName", authorName);
//   formData.append("authorEmail", authorEmail);

//   // Add images if provided
//   images.forEach((file, index) => {
//     formData.append(`reviewImages[${index}]`, file);
//   });

//   try {
//     const response = await fetch(`${STAMPED_CONFIG.apiUrl}/reviews/create`, {
//       method: "POST",
//       body: formData,
//       // No Content-Type header needed as browser sets it automatically with boundary for FormData
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to submit review");
//     }

//     return true;
//   } catch (error) {
//     console.error("Error submitting review:", error);
//     throw error;
//   }
// }
// lib/reviews/stamped.ts
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
    // Use server-side API route instead of direct API call
    const response = await fetch(
      `/api/reviews/get-reviews?` +
        `productId=${encodeURIComponent(productId)}&` +
        `page=${encodeURIComponent(page)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch reviews:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
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
    // Use server-side API route instead of direct API call
    const response = await fetch(
      `/api/reviews/get-rating-summary?productId=${encodeURIComponent(productId)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch rating summary:", await response.text());
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
  } catch (error) {
    console.error("Error fetching rating summary:", error);
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

export async function submitProductReview(submission: ReviewSubmission): Promise<boolean> {
  if (!submission.productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
    throw new Error("Missing required configuration");
  }

  try {
    // Create FormData for multipart submission
    const formData = new FormData();
    formData.append("productId", submission.productId);
    formData.append("rating", submission.rating.toString());
    formData.append("title", submission.title);
    formData.append("content", submission.content);
    formData.append("authorName", submission.authorName);
    formData.append("authorEmail", submission.authorEmail);

    // Add images if provided
    if (submission.images && submission.images.length > 0) {
      submission.images.forEach((file, index) => {
        formData.append(`images`, file);
      });
    }

    // Send to our server-side API route
    const response = await fetch('/api/reviews/submit-review', {
      method: "POST",
      body: formData,
      // No need to set Content-Type for FormData
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