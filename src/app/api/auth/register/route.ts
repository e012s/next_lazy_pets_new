import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forbiddenOrigin } from "@/server/csrf";
import { WORKSPACE_TOKEN_COOKIE } from "@/server/lazyWorkspaceApi";
import { sessionForToken } from "@/server/profile";

export const dynamic = "force-dynamic";

/**
 * Mock registration submit. No cookie is written: the next path change re-reads
 * `registered` from `retrieve_third_party_user_profile`.
 */
export async function POST(request: Request) {
  if (forbiddenOrigin(request)) {
    return NextResponse.json(
      { status: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const jar = await cookies();
  const token = jar.get(WORKSPACE_TOKEN_COOKIE)?.value ?? null;
  const locale = new URL(request.url).searchParams.get("locale") ?? "cn";
  const session = await sessionForToken(token, locale);
  if (!session.authenticated) {
    return NextResponse.json(
      { status: false, message: "未登入" },
      { status: 401 },
    );
  }

  return NextResponse.json({ status: true, ...session, registered: true });
}
