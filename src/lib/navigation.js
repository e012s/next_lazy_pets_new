"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Set once from root providers so `navigate()` avoids full document reloads. */
let appRouter = null;

export function AppNavigationBridge() {
  const router = useRouter();
  useEffect(() => {
    appRouter = router;
    return () => {
      appRouter = null;
    };
  }, [router]);
  return null;
}

function internalPath(href) {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/**
 * @param {string} href
 * @param {"push" | "replace"} [mode] — use `"replace"` so Back cannot return to the current page
 */
export function navigate(href, mode = "push") {
  if (typeof window === "undefined") return;
  const replace = mode === "replace";
  const path = internalPath(href);
  if (path && appRouter) {
    if (replace) appRouter.replace(path);
    else appRouter.push(path);
    return;
  }
  if (replace) window.location.replace(href);
  else window.location.assign(href);
}
