import { loadEnvConfig } from "@next/env";
import type { CapacitorConfig } from "@capacitor/cli";

loadEnvConfig(process.cwd());

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