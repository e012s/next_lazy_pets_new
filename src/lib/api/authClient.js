import { isCapacitorApp } from "@/lib/api/capacitorApp";
import { clearAuthStorage, saveToken } from "@/lib/preferences";

export function persistWorkspaceTokenFromVerify(result) {
  if (!isCapacitorApp() || !result?.status) return;
  const nested =
    result?.data && typeof result.data === "object" ? result.data.token : null;
  const token =
    (typeof nested === "string" && nested) ||
    (typeof result?.token === "string" ? result.token : null);
  if (token) void saveToken(token);
}

export async function clientLogout() {
  if (!isCapacitorApp()) {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {});
  }
  clearAuthStorage();
}