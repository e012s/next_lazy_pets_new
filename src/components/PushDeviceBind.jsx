"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Device } from "@capacitor/device";
import { PushNotifications } from "@capacitor/push-notifications";
import { useSession } from "@/context/SessionContext";
import {
  clearBoundPushToken,
  loadBoundPushToken,
  saveBoundPushToken,
} from "@/lib/pushDeviceToken";
import {
  device_token,
  USERABLE_TYPE_EXPERT,
} from "@/actions/Authenticate";

/** APNs/FCM token from native；登入前先到也會暫存，登入後再 POST。 */
let pendingNativePushToken = null;

async function ensurePushPermission() {
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "granted") return true;
  perm = await PushNotifications.requestPermissions();
  return perm.receive === "granted";
}

async function bindTokenToServer(tokenValue) {
  if (!tokenValue) return false;
  if (loadBoundPushToken() === tokenValue) return true;

  const info = await Device.getInfo();
  const res = await device_token({
    userable_type: USERABLE_TYPE_EXPERT,
    device_token: tokenValue,
    device_type: Capacitor.getPlatform(),
    model: info.model || "unknown",
    is_virtual: info.isVirtual ?? false,
  });

  if (res?.status === true) {
    saveBoundPushToken(tokenValue);
    if (process.env.NODE_ENV !== "production") {
      console.info("[push] device_token OK");
    }
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn("[push] device_token failed", res?.message);
  }
  return false;
}

async function flushPendingTokenIfAuthed(authenticated) {
  if (!authenticated || !pendingNativePushToken) return;
  const token = pendingNativePushToken;
  await bindTokenToServer(token);
}

/**
 * 登入後於原生 App 註冊推播並 POST `device_token`（無通知列表，僅綁定）。
 */
export function PushDeviceBind() {
  const session = useSession();
  const authenticatedRef = useRef(false);
  const listenersReadyRef = useRef(false);

  authenticatedRef.current = session?.authenticated === true;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;
    const handles = [];

    async function onRegistration(token) {
      const value = token?.value;
      if (!value || disposed) return;
      pendingNativePushToken = value;
      if (process.env.NODE_ENV !== "production") {
        console.info("[push] registration", value.slice(0, 12) + "…");
      }
      if (!authenticatedRef.current) return;
      try {
        await bindTokenToServer(value);
      } catch {
        // ignore — 不阻塞主流程
      }
    }

    async function setupListeners() {
      if (listenersReadyRef.current) return;
      listenersReadyRef.current = true;

      handles.push(
        await PushNotifications.addListener("registration", onRegistration),
      );
      handles.push(
        await PushNotifications.addListener("registrationError", (err) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[push] registrationError", err);
          }
        }),
      );
    }

    async function registerIfAuthed() {
      if (disposed || !authenticatedRef.current) return;
      await setupListeners();
      const granted = await ensurePushPermission();
      if (!granted || disposed) return;
      await PushNotifications.register();
      await flushPendingTokenIfAuthed(true);
    }

    void setupListeners();
    void registerIfAuthed();

    const resumePromise = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void registerIfAuthed();
    });
    resumePromise.then((h) => handles.push(h)).catch(() => {});

    return () => {
      disposed = true;
      for (const h of handles) {
        h.remove?.();
      }
    };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    if (session?.authenticated === true) {
      void (async () => {
        const granted = await ensurePushPermission();
        if (!granted) return;
        await PushNotifications.register();
        await flushPendingTokenIfAuthed(true);
      })();
      return;
    }

    clearBoundPushToken();
    pendingNativePushToken = null;
  }, [session?.authenticated]);

  return null;
}