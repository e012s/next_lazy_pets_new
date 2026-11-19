"use client";

import { Suspense } from "react";
import { PhotoBrowserProvider } from "@/components/PhotoBrowser/PhotoBrowserProvider";
import { RepairQuoteProvider } from "@/components/repair/RepairQuoteProvider";
import { SessionProvider } from "@/context/SessionContext";
import { ThirdPartyGlobalProvider } from "@/context/ThirdPartyGlobalContext";
import { AppNavigationBridge } from "@/lib/navigation";
import { CapacitorNativeChrome } from "@/components/CapacitorNativeChrome";
import { PushDeviceBind } from "@/components/PushDeviceBind";

export function AppProviders({ children }) {
  return (
    <Suspense fallback={null}>
      <CapacitorNativeChrome />
      <AppNavigationBridge />
      <SessionProvider>
        <PushDeviceBind />
        <ThirdPartyGlobalProvider>
          <PhotoBrowserProvider>
            <RepairQuoteProvider>{children}</RepairQuoteProvider>
          </PhotoBrowserProvider>
        </ThirdPartyGlobalProvider>
      </SessionProvider>
    </Suspense>
  );
}
