import { localPhoneDigits, phoneForWorkspaceApi } from "@/lib/phoneApi";
import { LOGIN_VERIFY_DEVICE_TYPE } from "@/lib/workspaceDeviceType";

export function thirdPartyLoginForm({
  phone,
  code,
  device_type,
  usePrefix = false,
} = {}) {
  const local = localPhoneDigits(phone);
  const phoneValue =
    usePrefix && local.length === 8 ? phoneForWorkspaceApi(local) : local;
  const payload = {
    device_type: device_type ?? LOGIN_VERIFY_DEVICE_TYPE,
    phone: phoneValue,
  };
  if (code != null && String(code).length > 0) {
    payload.code = String(code);
  }
  return payload;
}
