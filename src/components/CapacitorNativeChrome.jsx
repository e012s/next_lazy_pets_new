"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/** Native shell: status bar + sync safe-area CSS vars for Capacitor WebView. */
export function CapacitorNativeChrome() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        /* plugin unavailable in web build */
      }

      const root = document.documentElement;
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);";
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe);
      const top = computed.paddingTop;
      const bottom = computed.paddingBottom;
      probe.remove();

      if (cancelled) return;
      if (top && top !== "0px") root.style.setProperty("--safe-area-top", top);
      if (bottom && bottom !== "0px") {
        root.style.setProperty("--safe-area-bottom", bottom);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}