import type { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/server/sessionCookieOptions";
import { WORKSPACE_TOKEN_COOKIE } from "@/server/lazyWorkspaceApi";

const LEGACY_COOKIES = ["lp_session", "lp_registered"];

type CookieResponse = Pick<NextResponse, "cookies">;

function expire(response: CookieResponse, name: string) {
  response.cookies.set(name, "", { ...sessionCookieOptions, maxAge: 0 });
}

export function applyLoginCookies(response: CookieResponse, workspaceToken: string) {
  response.cookies.set(WORKSPACE_TOKEN_COOKIE, workspaceToken, sessionCookieOptions);
  for (const name of LEGACY_COOKIES) expire(response, name);
}

export function clearAuthCookies(response: CookieResponse) {
  expire(response, WORKSPACE_TOKEN_COOKIE);
  for (const name of LEGACY_COOKIES) expire(response, name);
}