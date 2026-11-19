import axios from "axios";
import appConfig from "../../../appconfig.json";
import { isCapacitorApp } from "@/lib/api/capacitorApp";
import { loadLocale, loadToken } from "@/lib/preferences";

const workspaceBaseUrl = appConfig.apiBaseUrl.replace(/\/$/, "");

export const workspaceApi = axios.create({
  baseURL: workspaceBaseUrl,
  headers: { "Content-Type": "application/json" },
});

const proxyApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

function withLocale(config) {
  config.params = { ...config.params, locale: loadLocale() };
  return config;
}

workspaceApi.interceptors.request.use(withLocale);
workspaceApi.interceptors.request.use(async (config) => {
  if (!isCapacitorApp()) return config;
  const token = await loadToken();
  if (token) config.headers.token = token;
  return config;
});
proxyApi.interceptors.request.use(withLocale);

function client() {
  return isCapacitorApp() ? workspaceApi : proxyApi;
}

const api = {};
for (const method of [
  "request",
  "get",
  "delete",
  "head",
  "options",
  "post",
  "put",
  "patch",
]) {
  api[method] = (...args) => client()[method](...args);
}

/** Browser: `/api` BFF. Capacitor: workspace + `localStorage` token. */
export default api;