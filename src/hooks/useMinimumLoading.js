"use client";

import { useEffect, useRef, useState } from "react";
import appConfig from "../../appconfig.json";

function loadingMinMsFromConfig() {
  const n = appConfig.loadingMinMs;
  if (typeof n === "number" && Number.isFinite(n) && n >= 0) return n;
  return 1000;
}

export const MIN_LOADING_MS = loadingMinMsFromConfig();

export function useMinimumLoading(active, minMs = MIN_LOADING_MS) {
  const [visible, setVisible] = useState(active);
  const startedAtRef = useRef(null);

  useEffect(() => {
    if (active) {
      startedAtRef.current = Date.now();
      setVisible(true);
      return;
    }

    if (startedAtRef.current === null) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = minMs - elapsed;

    if (remaining <= 0) {
      startedAtRef.current = null;
      setVisible(false);
      return;
    }

    const id = window.setTimeout(() => {
      startedAtRef.current = null;
      setVisible(false);
    }, remaining);

    return () => window.clearTimeout(id);
  }, [active, minMs]);

  return visible;
}

/** Wait so a loading spell is at least `minMs` before navigate / teardown. */
export function ensureMinLoadingMs(startedAt, minMs = MIN_LOADING_MS) {
  if (startedAt == null) return Promise.resolve();
  const remaining = minMs - (Date.now() - startedAt);
  if (remaining <= 0) return Promise.resolve();
  return new Promise((resolve) => window.setTimeout(resolve, remaining));
}
