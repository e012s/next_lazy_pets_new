/** `/login/` → `/login` so auth guards match static export (`trailingSlash`). */
export function normalizePathname(pathname) {
  if (pathname == null || pathname === "") return "";
  const path = String(pathname).split("?")[0].split("#")[0];
  if (path === "/") return "/";
  const trimmed = path.replace(/\/+$/, "");
  return trimmed || "/";
}

/** Non-React listeners (`visibilitychange`, Cap resume). */
export function readAppPathname() {
  if (typeof window === "undefined") return "";
  return normalizePathname(window.location.pathname);
}