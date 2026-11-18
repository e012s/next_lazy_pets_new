import { NextResponse } from "next/server";
import { applyLoginCookies } from "@/server/authCookies";
import type { LazyWorkspaceResponse, ThirdPartyLoginPayload } from "@/server/lazyWorkspaceApi";

const REJECTED = "此電話號碼未能登入";

function stripToken(record: Record<string, unknown>) {
  const next = { ...record };
  delete next.token;
  return next;
}

/**
 * After verify — HttpOnly token cookie + f7-style `{ status, data }` (no token in `data`).
 * No profile call here: Verification.jsx loads the session once through SessionContext
 * (`retrieve_third_party_user_profile`), which also rejects / clears a dead token.
 */
export async function respondAfterThirdPartyVerify(
  verifyRes: LazyWorkspaceResponse<ThirdPartyLoginPayload>,
) {
  const workspaceToken =
    verifyRes.data && typeof verifyRes.data === "object" && verifyRes.data.token
      ? String(verifyRes.data.token)
      : null;

  if (!workspaceToken) {
    return NextResponse.json({ status: false, message: verifyRes.message ?? REJECTED });
  }

  const response = NextResponse.json({
    status: true,
    data: stripToken({ ...verifyRes.data }),
    message: verifyRes.message,
  });
  applyLoginCookies(response, workspaceToken);
  return response;
}
