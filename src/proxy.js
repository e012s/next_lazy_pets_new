import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/server/authCookies";
import { WORKSPACE_TOKEN_COOKIE } from "@/server/lazyWorkspaceApi";
import { sessionForToken } from "@/server/profile";
import { HOME, isPublicAuthPath } from "@/service/auth/profile";

/**
 * Cheap server guard: no token cookie → /login (redirect, no history entry).
 * Token validity, role and registered are checked by the client on every path change
 * (`retrieve_third_party_user_profile`, see SessionContext). Only /login and /verification
 * call the API here, to send a still-valid user home without looping on a dead token.
 */
export async function proxy(request) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/api/"))
        return NextResponse.next();
    const token = request.cookies.get(WORKSPACE_TOKEN_COOKIE)?.value ?? null;
    const publicPath = isPublicAuthPath(pathname);
    if (!token)
        return publicPath ? NextResponse.next() : redirect(request, "/login");
    if (!publicPath)
        return NextResponse.next();
    const session = await sessionForToken(token, request.nextUrl.searchParams.get("locale") ?? "cn");
    if (session.authenticated)
        return redirect(request, session.next ?? HOME);
    const response = NextResponse.next();
    clearAuthCookies(response);
    return response;
}
function redirect(request, pathname) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    return NextResponse.redirect(url);
}
export const config = {
    matcher: ["/((?!_next/static|_next/image|images/|icons/|fonts/|favicon.ico).*)"],
};
