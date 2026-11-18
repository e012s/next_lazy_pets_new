"use client";

import { usePhotoBrowser } from "@/components/PhotoBrowser/PhotoBrowserProvider";

/**
 * Tap-to-open full-screen photo browser. Pass one src or many with index.
 */
export function PhotoBrowseImage({
  src,
  sources,
  index = 0,
  alt = "",
  className,
  imgClassName,
  ...buttonProps
}) {
  const { open } = usePhotoBrowser();
  const list = sources?.length ? sources : src ? [src] : [];
  if (list.length === 0) return null;

  const safeIndex = sources?.length ? index : 0;

  return (
    <button
      type="button"
      aria-label={alt || "查看相片"}
      onClick={() => open(list, safeIndex)}
      className={`overflow-hidden p-0 active:opacity-95${className}`}
      {...buttonProps}
    >
      <img src={list[safeIndex] ?? list[0]} alt={alt} className={`pointer-events-none${imgClassName}`} />
    </button>
  );
}
