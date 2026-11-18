"use client";

import { FullPageLoading } from "@/components/Loading";
import { MIN_LOADING_MS, useMinimumLoading } from "@/hooks/useMinimumLoading";

export function FullPageLoadingGate({
  active,
  label = "載入中…",
  minMs = MIN_LOADING_MS,
  className,
}) {
  const show = useMinimumLoading(active, minMs);
  if (!show) return null;
  return <FullPageLoading label={label} className={className} />;
}
