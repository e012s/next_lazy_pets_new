import { Capacitor } from "@capacitor/core";

export const LOGIN_VERIFY_DEVICE_TYPE = "1";

export function workspacePlatform() {
  return Capacitor.getPlatform();
}

export function workspaceDeviceType() {
  switch (Capacitor.getPlatform()) {
    case "android":
      return "1";
    case "ios":
      return "2";
    case "web":
      return "3";
    default:
      return "4";
  }
}
