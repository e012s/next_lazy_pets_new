const STORAGE_KEY = "lp_push_device_token";

export function loadBoundPushToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function saveBoundPushToken(token) {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(STORAGE_KEY, String(token));
}

export function clearBoundPushToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}