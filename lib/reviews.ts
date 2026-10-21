import { getOrderById } from "./orders";

export interface Review {
  id: string;
  productId: string;
  reviewerName: string;
  rating: number; // 1 - 5
  title?: string;
  comment: string;
  createdAt: string; // ISO date
  isVerifiedPurchase: boolean;
  orderId?: string;
  images?: string[]; // photos only when actually provided by reviewer
}

const STORAGE_KEY = "aura_product_reviews";

/**
 * Retrieve real stored reviews from local persistence.
 * Never fabricates or injects mock reviews.
 */
export function getStoredReviews(productId?: string): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Review[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    if (productId) {
      return parsed.filter(
        (r) => r.productId === productId || r.productId.toLowerCase() === productId.toLowerCase()
      );
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load stored reviews", err);
    return [];
  }
}

/**
 * Calculate the true average rating and count strictly from real stored reviews.
 * Returns count: 0 and averageRating: null when no authentic reviews exist.
 */
export function getProductReviewStats(productId: string): {
  count: number;
  averageRating: number | null;
} {
  const productReviews = getStoredReviews(productId);
  if (productReviews.length === 0) {
    return { count: 0, averageRating: null };
  }

  const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = Number((sum / productReviews.length).toFixed(1));
  return {
    count: productReviews.length,
    averageRating: avg,
  };
}

/**
 * Validates whether an order ID actually exists in the store records and contains the specified product.
 * Returns true ONLY when a qualifying match is verified.
 */
export function verifyQualifyingOrder(
  orderId: string,
  productId: string
): { isVerified: boolean; message: string } {
  const cleanOrderId = orderId.trim();
  if (!cleanOrderId) {
    return {
      isVerified: false,
      message: "No Order ID provided. Review will be submitted without a Verified Purchase badge.",
    };
  }

  const order = getOrderById(cleanOrderId);
  if (!order) {
    return {
      isVerified: false,
      message: `Order ID "${cleanOrderId}" could not be found in store purchase records.`,
    };
  }

  const containsProduct = order.items.some(
    (item) => item.product.id === productId || item.product.slug === productId
  );

  if (!containsProduct) {
    return {
      isVerified: false,
      message: `Order "${cleanOrderId}" was located, but does not contain this specific product.`,
    };
  }

  return {
    isVerified: true,
    message: `Order "${cleanOrderId}" verified! Your review will receive the official "Verified Purchase" badge.`,
  };
}

/**
 * Save a genuine customer review.
 */
export function submitProductReview(input: {
  productId: string;
  reviewerName: string;
  rating: number;
  title?: string;
  comment: string;
  orderId?: string;
  images?: string[];
}): { success: boolean; review: Review; message: string } {
  if (typeof window === "undefined") {
    return {
      success: false,
      review: null as any,
      message: "Reviews can only be submitted from the browser.",
    };
  }

  const verification = input.orderId
    ? verifyQualifyingOrder(input.orderId, input.productId)
    : { isVerified: false, message: "" };

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    productId: input.productId,
    reviewerName: input.reviewerName.trim(),
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    title: input.title?.trim() || undefined,
    comment: input.comment.trim(),
    createdAt: new Date().toISOString(),
    isVerifiedPurchase: verification.isVerified,
    orderId: input.orderId ? input.orderId.trim() : undefined,
    images: input.images && input.images.length > 0 ? input.images.filter(Boolean) : undefined,
  };

  try {
    const existing = getStoredReviews();
    const updated = [newReview, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch update event for live UI reactivity
    window.dispatchEvent(new CustomEvent("aura_reviews_updated", { detail: { productId: input.productId } }));

    return {
      success: true,
      review: newReview,
      message: verification.isVerified
        ? "Review published with Verified Purchase status!"
        : "Thank you for your review! It has been posted to the product page.",
    };
  } catch (err) {
    console.error("Failed to save review", err);
    return {
      success: false,
      review: newReview,
      message: "An error occurred while saving your review. Please try again.",
    };
  }
}
