import { Capacitor } from "@capacitor/core";

/** Native shell loads static `out/` and talks to workspace directly (no remote Next URL). */
export function isCapacitorApp() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}