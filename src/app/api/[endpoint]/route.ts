import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forbiddenOrigin } from "@/server/csrf";
import { respondAfterThirdPartyVerify } from "@/server/thirdPartyLoginCookies";
import { clearAuthCookies } from "@/server/authCookies";
import { retrieveThirdPartyUserProfile } from "@/server/profile";
import { PROFILE_ENDPOINT } from "@/service/auth/profile";
import {
  WORKSPACE_TOKEN_COOKIE,
  postRetrieveThirdPartyServices,
  postRetrieveThirdPartySkills,
  postWorkspaceEndpoint,
  type LazyWorkspaceResponse,
  type ThirdPartyLoginPayload,
} from "@/server/lazyWorkspaceApi";

export const dynamic = "force-dynamic";

const ENDPOINT_PATTERN = /^[a-z0-9_]+$/i;

export async function POST(
  request: Request,
  context: { params: Promise<{ endpoint: string }> },
) {
  const { endpoint } = await context.params;

  if (!ENDPOINT_PATTERN.test(endpoint)) {
    return NextResponse.json(
      { status: false, message: "Invalid endpoint" },
      { status: 400 },
    );
  }

  if (forbiddenOrigin(request)) {
    return NextResponse.json(
      { status: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "cn";
  const jar = await cookies();
  const token = jar.get(WORKSPACE_TOKEN_COOKIE)?.value ?? null;

  let body: Record<string, unknown> = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: false, message: "請求格式錯誤" },
      { status: 400 },
    );
  }

  /** Called by the client on every path change. Missing / invalid token → clear the cookie. */
  if (endpoint === PROFILE_ENDPOINT) {
    const profile = await retrieveThirdPartyUserProfile(token, locale);
    const response = NextResponse.json(profile);
    if (!profile.status) clearAuthCookies(response);
    return response;
  }

  if (endpoint === "retrieve_third_party_services") {
    const catalog = await postRetrieveThirdPartyServices({ locale, body });
    return NextResponse.json(catalog);
  }

  if (endpoint === "retrieve_third_party_skills") {
    const skills = await postRetrieveThirdPartySkills({ locale, body });
    return NextResponse.json(skills);
  }

  const result = await postWorkspaceEndpoint(endpoint, { locale, token, body });

  if (
    endpoint === "third_party_login_verify_code" &&
    result.status === true
  ) {
    return respondAfterThirdPartyVerify(
      result as LazyWorkspaceResponse<ThirdPartyLoginPayload>,
    );
  }

  return NextResponse.json(result);
}
