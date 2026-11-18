"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { FullPageLoadingGate } from "@/components/FullPageLoadingGate";

/**
 * Client-side auth guard for (main) routes.
 * Static export (`output: "export"`) means src/proxy.js never runs, so the
 * redirect to /login must happen in the browser.
 */
export function AuthGate({ children }) {
  const session = useSession();
  const router = useRouter();
  const authed = session?.authenticated === true;

  useEffect(() => {
    if (session && !authed) router.replace("/login");
  }, [session, authed, router]);

  if (!authed) return <FullPageLoadingGate active />;
  return children;
}
