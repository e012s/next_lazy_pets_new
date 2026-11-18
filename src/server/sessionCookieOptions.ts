import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import appConfig from "../../appconfig.json";

const YEAR = 60 * 60 * 24 * 365;

export const sessionCookieOptions: Omit<ResponseCookie, "name" | "value"> = {
  httpOnly: true,
  secure: appConfig.cookieSecure,
  sameSite: "lax",
  path: "/",
  maxAge: YEAR,
};
