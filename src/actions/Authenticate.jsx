"use client";

import api, { workspaceApi } from "@/lib/api/Axios.jsx";
import {
  isLocalLoginMode,
  localLoginSendCode,
  localLoginVerifyCode,
} from "@/service/auth/localAuth";
import { mockThirdPartyGlobalData } from "@/service/mock/thirdPartyGlobal";

export async function third_party_global(form = {}, locale) {
  if (isLocalLoginMode()) {
    return { status: true, data: mockThirdPartyGlobalData() };
  }
  try {
    const res = await api.post(
      "third_party_global",
      form,
      locale ? { params: { locale } } : undefined,
    );
    return res.data;
  } catch {
    return { status: false, message: "獲取全局數據失敗" };
  }
}

export default useAuthenticate;

export function useAuthenticate() {
  return {
    login,
    verification,
    third_party_global,
    retrieve_third_party_services,
  };

  async function retrieve_third_party_services(form = {}) {
    try {
      const res = await api.post("retrieve_third_party_services", form);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message;
      return message ? { status: false, message } : { status: false };
    }
  }

  async function login(form) {
    if (isLocalLoginMode()) {
      return localLoginSendCode(form);
    }
    try {
      const res = await workspaceApi.post("third_party_login_send_code", form);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message;
      return message ? { status: false, message } : { status: false };
    }
  }

  async function verification(form) {
    if (isLocalLoginMode()) {
      return localLoginVerifyCode(form);
    }
    try {
      const res = await api.post("third_party_login_verify_code", form);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message;
      return message ? { status: false, message } : { status: false };
    }
  }
}
