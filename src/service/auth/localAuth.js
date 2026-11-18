import appConfig from "../../../appconfig.json";
import { accountFor } from "@/service/mock/accounts";
import { localPhoneFromApi } from "@/lib/phoneApi";

export function isLocalLoginMode() {
  return appConfig.loginUseWorkspaceApi === false;
}

const REJECTED = "此電話號碼未能登入";
const CODE_FAIL = "驗證碼無效";

/** Mock SMS — only `expertAccounts` phones succeed. */
export async function localLoginSendCode({ phone }) {
  const digits = localPhoneFromApi(phone);
  if (digits.length !== 8 || !accountFor(digits)) {
    return { status: false, message: REJECTED };
  }
  return { status: true, message: "驗證碼已發送" };
}

/** Mock OTP — sets HttpOnly cookies via `/api/auth/local-verify`. */
export async function localLoginVerifyCode(body) {
  try {
    const res = await fetch("/api/auth/local-verify", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return { status: false, message: CODE_FAIL };
  }
}
