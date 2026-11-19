import { normalizePathname } from "@/lib/pathname";

/** Side drawer links (flat list). */
export const sideMenuLinks = [
  { href: "/", label: "主頁", id: "home", exactPaths: ["/"] },
  { href: "/find", label: "尋找任務", id: "tasks", exactPaths: ["/find"] },
  { href: "/apply/role", label: "註冊", id: "register" },
  { href: "/orders", label: "我的訂單", id: "orders" },
  { href: "/income", label: "我的收入", id: "income" },
  { href: "/balance", label: "我的儲值金", id: "balance" },
];

export function menuScore(pathname, href, options = {}) {
  const path = normalizePathname(pathname);
  const base = normalizePathname(href.split("?")[0]);
  if (options.exactPaths?.some((p) => normalizePathname(p) === path)) return 1000;
  if (href.includes("?")) return -1;
  if (base === "/") return path === "/" ? 1 : -1;
  if (path === base) return base.length + 1;
  if (path.startsWith(`${base}/`)) return base.length;
  return -1;
}
