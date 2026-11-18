const STORAGE_KEY = "lp_order_service_started";

export function readServiceOverlays() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function startOrderService(orderId) {
  if (typeof window === "undefined") return;
  const overlays = readServiceOverlays();
  overlays[orderId] = { startedAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(overlays));
  window.dispatchEvent(new CustomEvent("order-service-changed"));
}

/** Elapsed MM:SS for list badge (e.g. 進行中 23:41). */
export function formatServiceElapsed(startedAtMs, now = Date.now()) {
  const totalSec = Math.max(0, Math.floor((now - startedAtMs) / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Clock time for report status card (e.g. 09:02). */
export function formatStartedClock(startedAtMs) {
  const d = new Date(startedAtMs);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function withRevealedPlace(order) {
  const place = order.placeRevealed ?? order.place;
  return {
    ...order,
    place,
    mapQuery: order.placeRevealed ?? order.mapQuery ?? order.place,
  };
}

/** Merge mock row with client「已開始服務」state (list + detail + report). */
export function applyServiceOverlay(order, overlays, now = Date.now()) {
  if (!order) return order;

  const overlay = overlays[order.id];
  const canStart =
    order.tab === "today" &&
    order.kind !== "boarding" &&
    order.status !== "done" &&
    order.status !== "upcoming";

  if (order.status === "accepted" && overlay && canStart) {
    return withRevealedPlace({
      ...order,
      status: "in_progress",
      badge: `進行中 ${formatServiceElapsed(overlay.startedAt, now)}`,
      badgeTone: "alert",
      serviceStartedAtMs: overlay.startedAt,
    });
  }

  if (order.status === "in_progress" && overlay && canStart) {
    return withRevealedPlace({
      ...order,
      badge: `進行中 ${formatServiceElapsed(overlay.startedAt, now)}`,
      serviceStartedAtMs: overlay.startedAt,
    });
  }

  if (order.status === "in_progress" && canStart) {
    return withRevealedPlace({
      ...order,
      serviceStartedAtMs: order.serviceStartedAtMs,
    });
  }

  return order;
}

export function isInProgressForUi(order, overlays) {
  if (!order) return false;
  const merged = applyServiceOverlay(order, overlays);
  return merged.status === "in_progress" && order.kind !== "boarding";
}
