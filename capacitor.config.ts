import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "lazy.com.lazyrepair",
  appName: "Lazy Pets 專家",
  webDir: "out",
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
};

export default config;