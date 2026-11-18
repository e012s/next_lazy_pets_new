import appConfig from "../../appconfig.json";
import { accountFor } from "@/service/mock/accounts";
import { sessionFromProfileResponse } from "@/service/auth/profile";
import {
  postRetrieveThirdPartyUserProfile,
  type LazyWorkspaceResponse,
  type ThirdPartyProfileData,
} from "@/server/lazyWorkspaceApi";

const LOCAL_PREFIX = "local-";

function localProfile(token: string): LazyWorkspaceResponse<ThirdPartyProfileData> {
  const phone = token.slice(LOCAL_PREFIX.length);
  const account = accountFor(phone);
  if (appConfig.loginUseWorkspaceApi !== false || !account) {
    return { status: false, message: "用戶不存在", data: undefined };
  }
  const skillId = account.role === "repair" ? 1 : 2;
  return {
    status: true,
    data: {
      is_new_user: 0,
      user: {
        phone,
        name: "陳大文",
        status: 1,
        skill: [skillId],
        need_basic_info: true,
        services: [],
      },
    },
  };
}

function withoutToken(res: LazyWorkspaceResponse<ThirdPartyProfileData>) {
  if (!res.data || typeof res.data !== "object") return res;
  const data = { ...res.data };
  delete data.token;
  return { ...res, data };
}

export async function retrieveThirdPartyUserProfile(
  token: string | null,
  locale = "cn",
): Promise<LazyWorkspaceResponse<ThirdPartyProfileData>> {
  if (!token) return { status: false, message: "未登入" };
  if (token.startsWith(LOCAL_PREFIX)) return localProfile(token);
  const res = await postRetrieveThirdPartyUserProfile({ locale, token, body: { token } });
  return withoutToken(res);
}

export async function sessionForToken(token: string | null, locale = "cn") {
  return sessionFromProfileResponse(await retrieveThirdPartyUserProfile(token, locale));
}
