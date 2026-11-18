/** @param {{ kind?: string }} order */
export function orderServiceFilterKey(order) {
  return order.kind === "repair" ? "repair" : "pet";
}

export const DONE_SERVICE_FILTERS = [
  { id: "all", label: "全部服務" },
  { id: "pet", label: "寵物" },
  { id: "repair", label: "維修" },
];

/** @param {{ serviceMonth?: number; schedule?: string; headerSchedule?: string; startDate?: string }} order */
export function getServiceMonth(order) {
  if (order.serviceMonth != null) return order.serviceMonth;
  const text = [order.startDate, order.headerSchedule, order.schedule].filter(Boolean).join(" ");
  const zh = text.match(/(\d{1,2})月/);
  if (zh) return Number(zh[1]);
  const iso = text.match(/\/(\d{2})\//);
  if (iso) return Number(iso[1]);
  return null;
}

export function formatDoneMonthLabel(month) {
  return `${month}月`;
}

/** Month filter choices: 1月 … 12月 */
export const DONE_MONTH_FILTER_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

/** @param {ReturnType<import("@/service/mock/assignments").listMyOrders>} orders */
export function filterCompletedOrders(orders, { month, serviceId }) {
  return orders.filter((order) => {
    if (order.tab !== "done") return false;
    if (month != null && getServiceMonth(order) !== month) return false;
    if (serviceId !== "all" && orderServiceFilterKey(order) !== serviceId) return false;
    return true;
  });
}