"use client";

import api, { workspaceApi } from "@/lib/api/Axios.jsx";
import { persistWorkspaceTokenFromVerify } from "@/lib/api/authClient";
import {
  isLocalLoginMode,
  localLoginSendCode,
  localLoginVerifyCode,
} from "@/service/auth/localAuth";
import { mockThirdPartyGlobalData } from "@/service/mock/thirdPartyGlobal";

/** 專家 App 推播綁定： `userable_type` 3（師傅） */
export const USERABLE_TYPE_EXPERT = 3;

function postError(err, fallback) {
  return err?.response?.data ?? { status: false, message: fallback };
}

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
    device_token,
    retrieve_third_party_new_orders,
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
      const data = res.data;
      persistWorkspaceTokenFromVerify(data);
      return data;
    } catch (err) {
      const message = err?.response?.data?.message;
      return message ? { status: false, message } : { status: false };
    }
  }
}

export async function device_token(body) {
  try {
    const res = await api.post("device_token", body);
    return res.data;
  } catch (err) {
    return postError(err, "設備綁定失敗");
  }
}

export async function retrieve_third_party_new_orders(form = {}) {
  try {
    const res = await api.post("retrieve_third_party_new_orders", form);
    return res.data;
  } catch (err) {
    return postError(err, "載入訂單池失敗");
  }
}
