import appConfig from "../../appconfig.json";
import { clearRegisteredCategories } from "@/service/catalog/expertCategories";
import { clearBoundPushToken } from "@/lib/pushDeviceToken";

export async function loadToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export async function saveToken(token) {
  if (typeof window === "undefined") return;
  if (token == null || token === "") {
    window.localStorage.removeItem("token");
    return;
  }
  window.localStorage.setItem("token", String(token));
}

export function loadLocale() {
  if (typeof window === "undefined") return "cn";
  return window.localStorage.getItem("lng") ?? "cn";
}

export function saveLocale(locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("lng", locale ?? "cn");
}

function globalDataStorageKey() {
  const prefix = String(appConfig.storagePrefix ?? "lazy_pets").trim() || "lazy_pets";
  return `global_data_${prefix}`;
}

let globalPersistAllowed = true;

export function setGlobalPersistAllowed(allowed) {
  globalPersistAllowed = Boolean(allowed);
}

export function saveGlobalData(data) {
  if (typeof window === "undefined" || data == null || !globalPersistAllowed) return;
  try {
    window.localStorage.setItem(globalDataStorageKey(), JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function loadGlobalData() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(globalDataStorageKey());
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteGlobalData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(globalDataStorageKey());
}

export async function saveUser(user) {
  if (typeof window === "undefined") return;
  if (user == null) {
    window.localStorage.removeItem("user");
    return;
  }
  window.localStorage.setItem("user", JSON.stringify(user));
}

export async function loadUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("user");
}

export async function deleteToken() {
  await saveToken(null);
  await deleteUser();
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  setGlobalPersistAllowed(false);
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  deleteGlobalData();
  clearRegisteredCategories();
  clearBoundPushToken();
}
