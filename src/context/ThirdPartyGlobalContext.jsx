"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { third_party_global } from "@/actions/Authenticate";
import { useSession } from "@/context/SessionContext";
import {
  deleteGlobalData,
  loadGlobalData,
  loadLocale,
  saveGlobalData,
  setGlobalPersistAllowed,
} from "@/lib/preferences";

const ThirdPartyGlobalContext = createContext(null);

const globalInflightByLocale = new Map();

function localeKey(locale) {
  return locale ?? "cn";
}

function readCachedGlobalData() {
  return loadGlobalData();
}

function writeCachedGlobalData(data) {
  saveGlobalData(data);
}

async function fetchThirdPartyGlobal(locale, { force = false } = {}) {
  const key = localeKey(locale);

  if (!force) {
    const cached = readCachedGlobalData();
    if (cached) {
      return { status: true, data: cached };
    }
  }

  let inflight = globalInflightByLocale.get(key);
  if (!inflight) {
    inflight = third_party_global({}, locale)
      .then((result) => {
        if (result?.status && result.data) {
          writeCachedGlobalData(result.data);
        }
        return result;
      })
      .finally(() => {
        globalInflightByLocale.delete(key);
      });
    globalInflightByLocale.set(key, inflight);
  }
  return inflight;
}

export function ThirdPartyGlobalProvider({ children }) {
  const session = useSession();
  const authed = session?.authenticated === true;
  const locale = loadLocale();
  const [global, setGlobal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    if (!global) setIsLoading(true);
    try {
      const result = await fetchThirdPartyGlobal(locale, { force: true });
      if (result?.status && result.data) {
        setGlobal(result.data);
        return result.data;
      }
      setError(result?.message ?? "獲取全局數據失敗");
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "獲取全局數據失敗");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [locale, global]);

  useEffect(() => {
    let cancelled = false;

    if (!authed) {
      setGlobalPersistAllowed(false);
      deleteGlobalData();
      setGlobal(null);
      setIsLoading(false);
      setError(null);
      globalInflightByLocale.clear();
      return undefined;
    }

    setGlobalPersistAllowed(true);

    const cached = readCachedGlobalData();
    if (cached) {
      setGlobal(cached);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await fetchThirdPartyGlobal(locale);
        if (cancelled) return;
        if (result?.status && result.data) {
          setGlobal(result.data);
        } else {
          setError(result?.message ?? "獲取全局數據失敗");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "獲取全球數據失敗");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authed, locale]);

  const value = useMemo(
    () => ({
      global,
      isLoading,
      error,
      refresh,
      ready: Boolean(global),
    }),
    [global, isLoading, error, refresh],
  );

  return (
    <ThirdPartyGlobalContext.Provider value={value}>
      {children}
    </ThirdPartyGlobalContext.Provider>
  );
}

export function useThirdPartyGlobal() {
  const ctx = useContext(ThirdPartyGlobalContext);
  if (ctx) {
    return ctx;
  }
  throw new Error("useThirdPartyGlobal must be used within ThirdPartyGlobalProvider");
}
