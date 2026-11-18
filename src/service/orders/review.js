/**
 * @param {{ review?: number | { stars?: number; text?: string }; reviewText?: string } | null | undefined} doneList
 * @returns {{ stars: number; text: string } | null}
 */
export function resolveListReview(doneList) {
  if (!doneList) return null;
  const { review, reviewText } = doneList;
  if (typeof review === "number") {
    return { stars: review, text: reviewText ?? "" };
  }
  if (review && typeof review === "object") {
    return {
      stars: review.stars ?? 0,
      text: review.text ?? reviewText ?? "",
    };
  }
  if (reviewText) return { stars: 0, text: reviewText };
  return null;
}

/** @param {number | { stars?: number; text?: string; reviewText?: string } | null | undefined} review */
export function reviewStarCount(review) {
  if (typeof review === "number") return review;
  if (review && typeof review === "object") return review.stars ?? 0;
  return 0;
}

/** @param {number | { text?: string; reviewText?: string } | null | undefined} review */
export function reviewQuoteText(review, reviewText) {
  if (typeof review === "object" && review?.text) return review.text;
  if (typeof review === "object" && review?.reviewText) return review.reviewText;
  return reviewText ?? "";
}
