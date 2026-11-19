"use client";

import { usePathname } from "next/navigation";
import { normalizePathname, readAppPathname } from "@/lib/pathname";

/** Cap static export uses `trailingSlash` — compare routes against this, not raw `usePathname()`. */
export function useAppPathname() {
  const fromRouter = normalizePathname(usePathname());
  if (fromRouter) return fromRouter;
  return typeof window !== "undefined" ? readAppPathname() : "";
}