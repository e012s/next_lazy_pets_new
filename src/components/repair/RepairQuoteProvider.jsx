"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RepairQuoteBottomSheet } from "./RepairQuoteBottomSheet";

const RepairQuoteContext = createContext(null);

function RepairQuoteUrlSync() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { openQuote, setDemoLowBalance } = useRepairQuote();

  useEffect(() => {
    if (searchParams.get("quote") !== "1") return;
    setDemoLowBalance(searchParams.get("lowBalance") === "1");
    openQuote();
    const next = new URLSearchParams(searchParams.toString());
    next.delete("quote");
    next.delete("lowBalance");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, openQuote, setDemoLowBalance]);

  return null;
}

export function RepairQuoteProvider({ children }) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [open, setOpen] = useState(false);
  const [demoLowBalance, setDemoLowBalance] = useState(false);

  const openQuote = useCallback(() => {
    setOpen(true);
  }, []);

  const closeQuote = useCallback(() => {
    setOpen(false);
    setDemoLowBalance(false);
  }, []);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    closeQuote();
  }, [pathname, closeQuote]);

  const value = useMemo(
    () => ({
      open,
      openQuote,
      closeQuote,
      demoLowBalance,
      setDemoLowBalance,
    }),
    [open, openQuote, closeQuote, demoLowBalance],
  );

  return (
    <RepairQuoteContext.Provider value={value}>
      {children}
      <RepairQuoteBottomSheet />
      <Suspense fallback={null}>
        <RepairQuoteUrlSync />
      </Suspense>
    </RepairQuoteContext.Provider>
  );
}

export function useRepairQuote() {
  const context = useContext(RepairQuoteContext);
  if (!context) {
    throw new Error("useRepairQuote must be used within RepairQuoteProvider");
  }
  return context;
}
