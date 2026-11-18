"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { clearAuthStorage } from "@/lib/preferences";
import { isPublicAuthPath } from "@/service/auth/profile";

const SessionContext = createContext(null);

let sessionCache = null;
let sessionInflight = null;
const sessionListeners = new Set();

function notifySessionListeners() {
  for (const listener of sessionListeners) {
    listener(sessionCache);
  }
}

export function primeSessionCache(data) {
  sessionCache = data?.authenticated ? data : { authenticated: false };
  notifySessionListeners();
}

export function consumeAuthFlash() {
  if (!sessionCache?.authFlash) return null;
  const message = sessionCache.authFlash;
  const { authFlash: _drop, ...rest } = sessionCache;
  sessionCache = rest;
  return message;
}

function fetchSessionJson() {
  if (!sessionInflight) {
    sessionInflight = import("@/service/auth/profile")
      .then(({ readClientSession }) => readClientSession())
      .then((data) => {
        /** Network blip (no API answer): keep a signed-in session instead of logging out. */
        if (data?.transient && sessionCache?.authenticated) return sessionCache;
        const flash = sessionCache?.authFlash;
        primeSessionCache(flash && data?.authenticated ? { ...data, authFlash: flash } : data);
        return sessionCache;
      })
      .catch(() => {
        primeSessionCache({ authenticated: false });
        return sessionCache;
      })
      .finally(() => {
        sessionInflight = null;
      });
  }
  return sessionInflight;
}

const PROFILE_THROTTLE_MS = 5000;
let lastProfileCallAt = 0;

export function loadSession({ force = false } = {}) {
  if (sessionInflight) return sessionInflight;
  if (!force && Date.now() - lastProfileCallAt < PROFILE_THROTTLE_MS) {
    return Promise.resolve(sessionCache);
  }
  lastProfileCallAt = Date.now();
  return fetchSessionJson();
}

function currentPathname() {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

function addNativeResumeListener(onResume) {
  if (!Capacitor.isNativePlatform()) return () => {};
  let handle = null;
  let disposed = false;
  App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) onResume();
  })
    .then((h) => {
      if (disposed) h.remove();
      else handle = h;
    })
    .catch(() => {});
  return () => {
    disposed = true;
    handle?.remove();
  };
}

export function SessionProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(sessionCache);

  const refreshSession = useCallback(() => {
    return loadSession({ force: true }).then((data) => {
      setSession(data);
      return data;
    });
  }, []);

  useEffect(() => {
    sessionListeners.add(setSession);
    return () => {
      sessionListeners.delete(setSession);
    };
  }, []);

  /** Dead / missing token → BFF already cleared the cookie; leave with replace (no history entry). */
  const expireSession = useCallback(() => {
    clearAuthStorage();
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (isPublicAuthPath(pathname)) {
      if (!sessionCache) primeSessionCache({ authenticated: false });
      return;
    }
    let cancelled = false;
    loadSession().then((data) => {
      if (cancelled || !data || data.authenticated) return;
      expireSession();
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, expireSession]);

  useEffect(() => {
    function onResume() {
      if (document.visibilityState !== "visible") return;
      if (isPublicAuthPath(currentPathname())) return;
      loadSession().then((data) => {
        if (!data || data.authenticated || isPublicAuthPath(currentPathname())) return;
        expireSession();
      });
    }
    function onPageShow(event) {
      if (event.persisted) onResume();
    }
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("focus", onResume);
    window.addEventListener("pageshow", onPageShow);
    const removeNative = addNativeResumeListener(onResume);
    return () => {
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("focus", onResume);
      window.removeEventListener("pageshow", onPageShow);
      removeNative();
    };
  }, [expireSession]);

  const value = useMemo(
    () => ({ session, refreshSession }),
    [session, refreshSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx.session;
}

export function useRefreshSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useRefreshSession must be used within SessionProvider");
  }
  return ctx.refreshSession;
}
