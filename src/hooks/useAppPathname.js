"use client";

import { usePathname } from "next/navigation";
import { normalizePathname } from "@/lib/pathname";

/** Cap static export uses `trailingSlash` — compare routes against this, not raw `usePathname()`. */
export function useAppPathname() {
  return normalizePathname(usePathname());
}