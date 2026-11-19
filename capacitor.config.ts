import { loadEnvConfig } from "@next/env";
import type { CapacitorConfig } from "@capacitor/cli";

// `cap sync` 不设 NODE_ENV 时也要读到 `.env.local`
loadEnvConfig(process.cwd(), true);

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "lazy.com.lazyrepair",
  appName: "Lazy Pets 專家",
  webDir: "capacitor-web",
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: "never",
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#ffffff",
      overlaysWebView: false,
    },
  },
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
        },
      }
    : {}),
};

export default config;