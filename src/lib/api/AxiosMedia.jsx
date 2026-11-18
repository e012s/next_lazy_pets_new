import axios from "axios";
import { loadLocale } from "@/lib/preferences";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  config.params = { ...config.params, locale: loadLocale() };
  return config;
});

export default api;
