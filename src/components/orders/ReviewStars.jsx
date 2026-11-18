import { iconSrc } from "@/icons/sources";

const MAX_STARS = 5;

function RatingStarIcon({ filled }) {
  return (
    <img
      src={filled ? iconSrc["order-star-fill"] : iconSrc["order-star"]}
      alt=""
      aria-hidden
      className="block size-[14px] shrink-0 object-contain"
    />
  );
}

export function ReviewStarRow({ count, className = "", labelled = false }) {
  const rating = Math.min(MAX_STARS, Math.max(0, Number(count) || 0));
  if (rating === 0) return null;

  const row = (
    <span className={`inline-flex items-center gap-[2px] ${className}`}>
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <RatingStarIcon key={i} filled={i < rating} />
      ))}
    </span>
  );

  if (labelled) {
    return (
      <span className="inline-flex shrink-0 items-center" aria-label={`${rating} 星評價`}>
        {row}
      </span>
    );
  }

  return row;
}

export function ReviewSectionStarIcon({ className = "" }) {
  return (
    <img
      src={iconSrc["order-star"]}
      alt=""
      aria-hidden
      className={`mt-0.5 block size-4 shrink-0 object-contain ${className}`}
    />
  );
}
