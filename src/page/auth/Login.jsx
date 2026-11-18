"use client";
import { iconSrc } from "@/icons/sources";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import useAuthenticate from "@/actions/Authenticate";
import { navigate } from "@/lib/navigation";
import { useSession } from "@/context/SessionContext";
import { AuthToast } from "@/components/AuthToast";
import { FullPageLoadingGate } from "@/components/FullPageLoadingGate";
import { ensureMinLoadingMs } from "@/hooks/useMinimumLoading";
import { thirdPartyLoginForm } from "@/lib/thirdPartyLoginForm";

const LOGIN_PHONE_USE_PREFIX_DEFAULT = false;

const HK = {
  dial: "+852",
  flag: "/images/hk-flag.png",
};

export default function Login() {
  const pathname = usePathname();
  const session = useSession();
  const { login } = useAuthenticate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);
  const wasAuthenticatedRef = useRef(session?.authenticated === true);

  function clearForm() {
    setPhoneNumber("");
    setToast("");
    setCountryOpen(false);
    setIsLoading(false);
  }

  useLayoutEffect(() => {
    if (pathname === "/login") clearForm();
  }, [pathname]);

  useLayoutEffect(() => {
    const authed = session?.authenticated === true;
    if (wasAuthenticatedRef.current && !authed) clearForm();
    wasAuthenticatedRef.current = authed;
  }, [session?.authenticated]);

  const ready = phoneNumber.length === 8;

  useEffect(() => {
    if (!countryOpen) return undefined;
    function onPointerDown(event) {
      if (countryRef.current?.contains(event.target)) return;
      setCountryOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setCountryOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [countryOpen]);

  function onPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    setPhoneNumber(digits);
    if (toast) setToast("");
  }

  async function onLogin() {
    if (!ready || isLoading) return;
    const startedAt = Date.now();
    setIsLoading(true);
    setToast("");
    const res = await login(
      thirdPartyLoginForm({
        phone: phoneNumber,
        usePrefix: LOGIN_PHONE_USE_PREFIX_DEFAULT,
      }),
    );
    if (!res?.status) {
      setIsLoading(false);
      if (res?.message) setToast(res.message);
      return;
    }
    await ensureMinLoadingMs(startedAt);
    const prefixFlag = LOGIN_PHONE_USE_PREFIX_DEFAULT ? "1" : "0";
    navigate(
      `/verification?phone=${phoneNumber}&usePrefix=${prefixFlag}`,
      "replace",
    );
  }

  return (
    <div className="login-page relative">
      <div className="content-panel">
        <div className="content">
          <div className="login-logo-container">
            <div className="logo-circle">
              <img src="/images/lazy-company-logo.png" alt="Lazy" />
            </div>
          </div>

          <form
            className="login-form-container"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin();
            }}
          >
            <div className="phone-input-row">
              <div className="country-select-wrap" ref={countryRef}>
                <button
                  type="button"
                  className={`country-select${countryOpen ? " country-select--open" : ""}`}
                  aria-haspopup="listbox"
                  aria-expanded={countryOpen}
                  aria-label={`區號 ${HK.dial}`}
                  disabled={isLoading}
                  onClick={() => setCountryOpen((open) => !open)}
                >                                                                         
                  <img src={HK.flag} alt="" className="country-select-flag" />
                  <span className="country-select-dial">{HK.dial}</span>
                  <i className={`f7-icons country-select-chevron size-3 shrink-0${countryOpen ? " country-select-chevron--open" : ""}`} aria-hidden>chevron_down</i>
                </button>
                {countryOpen ? (
                  <ul className="country-dropdown" role="listbox" aria-label={`區號 ${HK.dial}`}>
                    <li role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected
                        aria-label={HK.dial}
                        className="country-dropdown-option country-dropdown-option--active"
                        onClick={() => setCountryOpen(false)}
                      >
                        <img src={HK.flag} alt="" className="country-dropdown-flag" />
                        <span className="country-dropdown-dial">{HK.dial}</span>
                        <img src={iconSrc["check"]} alt="" aria-hidden className="inline-block object-contain country-dropdown-check size-4 shrink-0" />
                      </button>
                    </li>
                  </ul>
                ) : null}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel-national"
                placeholder="電話號碼"
                value={phoneNumber}
                onChange={(event) => onPhone(event.target.value)}
                className="phone-input-field"
                maxLength={8}
                aria-label="電話號碼"
                disabled={isLoading}
              />
            </div>

            <div className="login-button-container">
              <button type="submit" className="login-button" disabled={!ready || isLoading}>
                {isLoading ? "發送中…" : "登入/註冊"}
              </button>
            </div>

            <button
              type="button"
              className="contact-lazy"
              disabled={isLoading}
              onClick={() => setToast("請透過 WhatsApp 聯絡 Lazy")}
            >
              聯絡Lazy
            </button>
          </form>
        </div>
      </div>
      <FullPageLoadingGate active={isLoading} label="發送中…" />
      <AuthToast
        message={toast}
        onDismiss={() => setToast("")}
        variant="light"
      />
    </div>
  );
}
