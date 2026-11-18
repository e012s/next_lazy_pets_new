"use client";

import { useEffect, useRef } from "react";

/**
 * Centered auth feedback (login / verification). HttpOnly-safe — message only.
 * @param {"light" | "dark"} variant — login (white page) vs verification (#212429)
 */
export function AuthToast({
  message,
  onDismiss,
  variant = "light",
  duration = 2800,
}) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!message || duration <= 0) return undefined;
    const id = window.setTimeout(() => {
      onDismissRef.current?.();
    }, duration);
    return () => window.clearTimeout(id);
  }, [message, duration]);

  if (!message) return null;

  return (
    <button
      type="button"
      className={`auth-toast auth-toast--${variant}`}
      onClick={onDismiss}
      role="status"
      aria-live="polite"
    >
      {message}
    </button>
  );
}
