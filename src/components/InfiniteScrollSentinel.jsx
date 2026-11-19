"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onLoadMore` when the sentinel enters the viewport (infinite scroll).
 * @param {{ enabled?: boolean; loading?: boolean; onLoadMore: () => void }} props
 */
export function InfiniteScrollSentinel({ enabled = true, loading = false, onLoadMore }) {
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled || loading) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        onLoadMoreRef.current();
      },
      { root: null, rootMargin: "160px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, loading]);

  if (!enabled && !loading) {
    return <div className="h-2" aria-hidden />;
  }

  return (
    <div
      ref={sentinelRef}
      className="flex min-h-10 w-full items-center justify-center py-4"
      aria-busy={loading}
    >
      {loading ? (
        <p className="text-body font-normal text-muted">載入中…</p>
      ) : (
        <div className="h-px w-full max-w-[1px] opacity-0" aria-hidden />
      )}
    </div>
  );
}