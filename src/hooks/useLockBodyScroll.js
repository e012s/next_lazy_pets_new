"use client";

import { useEffect } from "react";

/** Prevent page scroll behind full-screen overlays (sheet, photo browser, etc.). */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { overflow, position, top, left, right, width } = document.body.style;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.left = left;
      document.body.style.right = right;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
