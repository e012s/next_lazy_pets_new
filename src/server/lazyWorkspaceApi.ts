import appConfig from "../../appconfig.json";

/** Real Lazy workspace API (same base URL as `appconfig.json` `apiBaseUrl`). */
export const LAZY_WORKSPACE_API_URL = appConfig.apiBaseUrl.replace(/\/$/, "");

/** Workspace token from real login — the only auth cookie (HttpOnly). */
export const WORKSPACE_TOKEN_COOKIE = "lp_workspace_token";

export type ThirdPartyGlobalPayload = {
  holidays?: unknown[];
  districts?: unknown[];
  regions?: { code?: string; name?: string }[];
  skills?: unknown;
  [key: string]: unknown;
};

export type LazyWorkspaceResponse<T> = {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
};

type PostWorkspaceOptions = {
  locale?: string;
  token?: string | null;
  body?: Record<string, unknown>;
};

export async function postWorkspaceEndpoint<T>(
  endpoint: string,
  { locale = "cn", token = null, body = {} }: PostWorkspaceOptions = {},
): Promise<LazyWorkspaceResponse<T>> {
  const url = new URL(`${LAZY_WORKSPACE_API_URL}/${endpoint}`);
  url.searchParams.set("locale", locale);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.token = token;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = (await response.json()) as LazyWorkspaceResponse<T>;
    if (!response.ok && json.status !== true) {
      return {
        status: false,
        message: json.message ?? "請求失敗",
        error: `HTTP ${response.status}`,
      };
    }
    return json;
  } catch (error) {
    const message = error instanceof Error ? error.message : "請求失敗";
    return { status: false, message, error: message };
  }
}

export type SupplierLoginPayload = {
  token?: string;
  [key: string]: unknown;
};

/** POST `third_party_global` — query `locale`, header `token` (f7_lazy_cleaner Axios style). */
export function postThirdPartyGlobal(
  options: PostWorkspaceOptions = {},
): Promise<LazyWorkspaceResponse<ThirdPartyGlobalPayload>> {
  return postWorkspaceEndpoint<ThirdPartyGlobalPayload>("third_party_global", options);
}

export type ThirdPartyLoginPayload = {
  token?: string;
  [key: string]: unknown;
};

/** `retrieve_third_party_user_profile` — `data` shape (simplified). */
export type ThirdPartyProfileUser = {
  id?: number;
  name?: string;
  name_en?: string;
  phone?: string;
  email?: string;
  gender?: number;
  profile_image?: string;
  status?: number;
  skill?: number[];
  need_basic_info?: boolean;
  service_area?: unknown[];
  services?: {
    service?: number;
    service_name?: string;
    status?: number;
    status_name?: string;
    skills?: unknown[];
  }[];
  [key: string]: unknown;
};

export type ThirdPartyProfileData = {
  user?: ThirdPartyProfileUser;
  /** Profile 支固定 0（与 login verify 的 is_new_user 不同） */
  is_new_user?: number;
  token?: string;
  [key: string]: unknown;
};

export function postThirdPartyLoginSendCode(
  options: PostWorkspaceOptions = {},
): Promise<LazyWorkspaceResponse<unknown>> {
  return postWorkspaceEndpoint("third_party_login_send_code", options);
}

export function postThirdPartyLoginVerifyCode(
  options: PostWorkspaceOptions = {},
): Promise<LazyWorkspaceResponse<ThirdPartyLoginPayload>> {
  return postWorkspaceEndpoint<ThirdPartyLoginPayload>(
    "third_party_login_verify_code",
    options,
  );
}

export function postRetrieveThirdPartyUserProfile(
  options: PostWorkspaceOptions = {},
): Promise<LazyWorkspaceResponse<ThirdPartyProfileData>> {
  return postWorkspaceEndpoint<ThirdPartyProfileData>(
    "retrieve_third_party_user_profile",
    options,
  );
}

export type ThirdPartyServiceCatalog = {
  id?: number;
  name?: string;
  groups?: unknown[];
  [key: string]: unknown;
};

export type ThirdPartyServicesPayload = {
  services?: ThirdPartyServiceCatalog[];
  [key: string]: unknown;
};

/** POST `retrieve_third_party_services` — 不需 token。 */
export function postRetrieveThirdPartyServices(
  options: PostWorkspaceOptions = {},
): Promise<LazyWorkspaceResponse<ThirdPartyServicesPayload>> {
  return postWorkspaceEndpoint<ThirdPartyServicesPayload>(
    "retrieve_third_party_services",
    { ...options, token: null },
  );
}

export type ThirdPartySkillCatalog = {
  id?: number;
  name?: string;
  groups?: { title?: string; items?: { content?: string; is_need_cert?: boolean }[] }[];
  [key: string]: unknown;
};

export type ThirdPartySkillsPayload = {
  services?: ThirdPartySkillCatalog[];
  [key: string]: unknown;
};

/** POST `retrieve_third_party_skills` — 不需 token。 */
export function postRetrieveThirdPartySkills(
  options: PostWorkspaceOptions = {},
): Promise<LazyWorkspaceResponse<ThirdPartySkillsPayload>> {
  return postWorkspaceEndpoint<ThirdPartySkillsPayload>(
    "retrieve_third_party_skills",
    { ...options, token: null },
  );
}

type PostWorkspaceMultipartOptions = {
  locale?: string;
  token?: string | null;
  formData: FormData;
};

/** POST multipart — e.g. `apply_third_parties`. */
export async function postWorkspaceMultipart<T>(
  endpoint: string,
  { locale = "cn", token = null, formData }: PostWorkspaceMultipartOptions,
): Promise<LazyWorkspaceResponse<T>> {
  const url = new URL(`${LAZY_WORKSPACE_API_URL}/${endpoint}`);
  url.searchParams.set("locale", locale);

  const headers: Record<string, string> = {};
  if (token) {
    headers.token = token;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
    });

    const json = (await response.json()) as LazyWorkspaceResponse<T>;
    if (!response.ok && json.status !== true) {
      return {
        status: false,
        message: json.message ?? "請求失敗",
        error: `HTTP ${response.status}`,
      };
    }
    return json;
  } catch (error) {
    const message = error instanceof Error ? error.message : "請求失敗";
    return { status: false, message, error: message };
  }
}
