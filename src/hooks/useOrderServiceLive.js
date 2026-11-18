"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyServiceOverlay,
  readServiceOverlays,
  startOrderService,
} from "@/service/orders/orderServiceFlow";

export function useOrderServiceLive() {
  const [overlays, setOverlays] = useState({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setOverlays(readServiceOverlays());
    const refresh = () => setOverlays(readServiceOverlays());
    window.addEventListener("order-service-changed", refresh);
    return () => window.removeEventListener("order-service-changed", refresh);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const apply = useCallback(
    (order) => {
      if (!order) return order;
      void tick;
      return applyServiceOverlay(order, overlays);
    },
    [overlays, tick],
  );

  const start = useCallback((orderId) => {
    startOrderService(orderId);
    setOverlays(readServiceOverlays());
  }, []);

  return { apply, start, overlays };
}
