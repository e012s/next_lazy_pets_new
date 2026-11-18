import axios from "axios";
import appConfig from "../../../appconfig.json";
import { loadLocale } from "@/lib/preferences";

const workspaceBaseUrl = appConfig.apiBaseUrl.replace(/\/$/, "");

/**
 * f7_lazy_cleaner style — `POST https://workspace.lazy.com.hk/api/<endpoint>?locale=…`
 * Use for login send-code (no cookie/token).
 */
export const workspaceApi = axios.create({
  baseURL: workspaceBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Same-origin BFF — reads `lp_workspace_token`, sets cookies on verify.
 * Network: `http://localhost:4317/api/<endpoint>?locale=…`
 */
const proxyApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

function withLocale(config) {
  config.params = { ...config.params, locale: loadLocale() };
  return config;
}

workspaceApi.interceptors.request.use(withLocale);
proxyApi.interceptors.request.use(withLocale);

/** Authenticated / verify workspace calls */
export default proxyApi;
