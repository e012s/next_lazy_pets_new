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
  if (options.exactPaths?.includes(pathname)) return 1000;
  if (href.includes("?")) return -1;
  if (href === "/") return pathname === "/" ? 1 : -1;
  if (pathname === href) return href.length + 1;
  if (pathname.startsWith(`${href}/`)) return href.length;
  return -1;
}
