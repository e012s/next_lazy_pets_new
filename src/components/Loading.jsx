"use client";

import { MIN_LOADING_MS, useMinimumLoading } from "@/hooks/useMinimumLoading";

const LOGO_SRC = "/images/lazy-company-logo.png";

const markSizes = {
  sm: {
    box: " size-14",
    outer: " inset-[3px] border-[1.5px]",
    inner: " inset-[5px] border",
    logo: " w-[50%]",
  },
  md: {
    box: " size-20",
    outer: " inset-[4px] border-2",
    inner: " inset-[7px] border-[1.5px]",
    logo: " w-[48%]",
  },
  lg: {
    box: " size-26",
    outer: " inset-[5px] border-2",
    inner: " inset-[9px] border-2",
    logo: " w-[46%]",
  },
};

export function LazyLoadingMark({ size = "md", className }) {
  const s = markSizes[size] ?? markSizes.md;
  return (
    <div
      className={`lazy-loading-shell relative inline-flex shrink-0 items-center justify-center${s.box} ${className}`}
      role="status"
      aria-label="載入中"
    >
      <span
        className={`lazy-loading-ring pointer-events-none absolute inset-0 rounded-full border-brand-soft/80 border-t-brand border-r-brand/30${s.outer}`}
        aria-hidden
      />
      <span
        className={`lazy-loading-ring-inner pointer-events-none absolute rounded-full border-transparent border-b-brand/50 border-l-brand-soft/60${s.inner}`}
        aria-hidden
      />
      <img
        src={LOGO_SRC}
        alt=""
        className={`lazy-loading-logo relative z-[1] h-auto max-w-full${s.logo}`}
      />
    </div>
  );
}

export function InPageLoading({
  label = "載入中…",
  className,
  minHeight = true,
  size = "md",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-10${minHeight ? " min-h-[min(40vh,320px)]" : ""} ${className ?? ""}`}
      aria-busy="true"
      aria-live="polite"
    >
      <LazyLoadingMark size={size} />
      {label ? (
        <p className="lazy-loading-label mt-4 text-sm leading-5 text-muted">{label}</p>
      ) : null}
    </div>
  );
}

export function FullPageLoading({ label = "載入中…", className }) {
  return (
    <div
      className={`lazy-loading-backdrop fixed inset-0 z-[100] flex flex-col items-center justify-center px-6${className ?? ""}`}
      aria-busy="true"
      aria-live="polite"
    >
      <LazyLoadingMark size="lg" />
      {label ? (
        <p className="lazy-loading-label mt-5 text-sm leading-5 text-muted">{label}</p>
      ) : null}
    </div>
  );
}

/** `busy` 時顯示 InPageLoading，至少 `loadingMinMs`；結束後顯示 `children`。 */
export function PageLoading({
  busy = false,
  children,
  label = "載入中…",
  className,
  minHeight = true,
  size = "md",
  minMs = MIN_LOADING_MS,
}) {
  const show = useMinimumLoading(busy, minMs);
  if (show) {
    return (
      <InPageLoading
        label={label}
        className={className}
        minHeight={minHeight}
        size={size}
      />
    );
  }
  return children ?? null;
}