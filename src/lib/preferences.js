import { Capacitor } from "@capacitor/core";
import appConfig from "../../appconfig.json";
import { clearRegisteredCategories } from "@/service/catalog/expertCategories";
import { clearBoundPushToken } from "@/lib/pushDeviceToken";
import {
  LEGACY_TOKEN_STORAGE_KEY,
  WORKSPACE_TOKEN_KEY,
} from "@/lib/workspaceToken";

function isNative() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

async function preferences() {
  const { Preferences } = await import("@capacitor/preferences");
  return Preferences;
}

async function removeWorkspaceTokenFromPreferences() {
  if (!isNative()) return;
  try {
    const Preferences = await preferences();
    await Preferences.remove({ key: WORKSPACE_TOKEN_KEY });
  } catch {
    // plugin unavailable (e.g. web build in browser)
  }
}

/**
 * Web: always null (token stays in HttpOnly cookie via BFF).
 * Native: `@capacitor/preferences` (`lp_workspace_token`).
 */
export async function loadToken() {
  if (typeof window === "undefined" || !isNative()) return null;

  const Preferences = await preferences();
  const { value } = await Preferences.get({ key: WORKSPACE_TOKEN_KEY });
  if (value) return value;

  const legacy = window.localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
  if (!legacy) return null;

  await Preferences.set({ key: WORKSPACE_TOKEN_KEY, value: legacy });
  window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  return legacy;
}

/** Web: no-op. Native: Preferences only (never expose token to web storage). */
export async function saveToken(token) {
  if (typeof window === "undefined" || !isNative()) return;

  const Preferences = await preferences();
  if (token == null || token === "") {
    await Preferences.remove({ key: WORKSPACE_TOKEN_KEY });
    window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    return;
  }
  await Preferences.set({ key: WORKSPACE_TOKEN_KEY, value: String(token) });
  window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
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

/** Clears native Preferences token and legacy localStorage keys. */
export async function clearAuthStorage() {
  if (typeof window === "undefined") return;
  setGlobalPersistAllowed(false);
  await removeWorkspaceTokenFromPreferences();
  window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem("user");
  deleteGlobalData();
  clearRegisteredCategories();
  clearBoundPushToken();
}