import { loadEnvConfig } from "@next/env";
import type { CapacitorConfig } from "@capacitor/cli";

// `cap sync` 不设 NODE_ENV 时也要读到 `.env.local`
loadEnvConfig(process.cwd(), true);

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "com.lazypets.expert",
  appName: "Lazy Pets 專家",
  webDir: "capacitor-web",
  android: {
    allowMixedContent: true,
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