"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
import { useAppPathname } from "@/hooks/useAppPathname";

export const MY_ORDER_TABS = [
  { id: "today", label: "今日" },
  { id: "upcoming", label: "即將" },
  { id: "done", label: "已完成" },
];

const MyOrdersTabContext = createContext(null);

/** Keeps 今日/即將/已完成 tab while navigating between /orders and /orders/[id]. */
export function MyOrdersTabProvider({ children }) {
  const pathname = useAppPathname();
  const [tab, setTab] = useState("today");
  const [doneMonth, setDoneMonth] = useState(null);
  const [doneServiceFilter, setDoneServiceFilter] = useState("all");

  useLayoutEffect(() => {
    if (pathname === "/orders") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      doneMonth,
      setDoneMonth,
      doneServiceFilter,
      setDoneServiceFilter,
    }),
    [tab, doneMonth, doneServiceFilter],
  );

  return <MyOrdersTabContext.Provider value={value}>{children}</MyOrdersTabContext.Provider>;
}

export function useMyOrdersTab() {
  const ctx = useContext(MyOrdersTabContext);
  if (!ctx) {
    throw new Error("useMyOrdersTab must be used within MyOrdersTabProvider");
  }
  return ctx;
}
