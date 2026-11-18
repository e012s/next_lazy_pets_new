import { NextResponse } from "next/server";
import appConfig from "../../../../../appconfig.json";
import { accountFor } from "@/service/mock/accounts";
import { forbiddenOrigin } from "@/server/csrf";
import { applyLoginCookies } from "@/server/authCookies";
import { localPhoneFromApi } from "@/lib/phoneApi";

export const dynamic = "force-dynamic";

const REJECTED = "此電話號碼未能登入";
const CODE_FAIL = "驗證碼無效";

export async function POST(request: Request) {
  if (appConfig.loginUseWorkspaceApi !== false) {
    return NextResponse.json(
      { status: false, message: "Local login is disabled" },
      { status: 403 },
    );
  }

  if (forbiddenOrigin(request)) {
    return NextResponse.json(
      { status: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: false, message: "請求格式錯誤" },
      { status: 400 },
    );
  }

  const phone = localPhoneFromApi(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();

  if (phone.length !== 8 || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ status: false, message: CODE_FAIL });
  }

  const account = accountFor(phone);
  if (!account) {
    return NextResponse.json({ status: false, message: REJECTED });
  }

  const data = {
    phone,
    role: account.role,
    is_new_user: 1,
  };

  const response = NextResponse.json({
    status: true,
    data,
    message: "登入成功",
  });

  /** `local-<phone>` — `retrieveThirdPartyUserProfile` answers it from mock accounts. */
  applyLoginCookies(response, `local-${phone}`);

  return response;
}
