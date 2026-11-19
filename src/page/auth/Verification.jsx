"use client";
import { useEffect, useRef, useState } from "react";
import useAuthenticate from "@/actions/Authenticate";
import { clearAuthStorage } from "@/lib/preferences";
import { loadSession, primeSessionCache } from "@/context/SessionContext";
import { navigate } from "@/lib/navigation";
import { AuthToast } from "@/components/AuthToast";
import { FullPageLoadingGate } from "@/components/FullPageLoadingGate";
import { ensureMinLoadingMs } from "@/hooks/useMinimumLoading";
import { localPhoneDigits } from "@/lib/phoneApi";
import { thirdPartyLoginForm } from "@/lib/thirdPartyLoginForm";

const REJECTED = "此電話號碼未能登入";

export default function Verification({ phone = "", usePhonePrefix = false }) {
    const { login, verification } = useAuthenticate();
    const digits = localPhoneDigits(phone);
    const validPhone = digits.length === 8;
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(28);
    const [toast, setToast] = useState(validPhone ? "" : REJECTED);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingLabel, setLoadingLabel] = useState("載入中…");
    const inputs = useRef([]);
    useEffect(() => {
        const id = window.setInterval(() => {
            setTimer((current) => (current <= 0 ? 0 : current - 1));
        }, 1000);
        return () => window.clearInterval(id);
    }, []);
    function focusAt(index) {
        inputs.current[index]?.focus();
    }
    async function finish(entered) {
        if (!validPhone || entered.length !== 6 || isLoading) {
            setToast(REJECTED);
            setCode(["", "", "", "", "", ""]);
            focusAt(0);
            return;
        }
        setLoadingLabel("驗證中…");
        // eslint-disable-next-line react-hooks/purity -- OTP submit handler, not render
        const startedAt = Date.now();
        setIsLoading(true);
        const result = await verification(
            thirdPartyLoginForm({
                phone: digits,
                code: entered,
                usePrefix: usePhonePrefix,
            }),
        );
        if (!result?.status) {
            setIsLoading(false);
            if (result?.message) setToast(result.message);
            setCode(["", "", "", "", "", ""]);
            focusAt(0);
            return;
        }
        /** The one profile call for login → home; `/` reuses it (5s window). */
        const session = await loadSession({ force: true });
        if (session?.authenticated !== true || !session?.next) {
            setIsLoading(false);
            if (result?.message) setToast(result.message);
            setCode(["", "", "", "", "", ""]);
            focusAt(0);
            return;
        }
        primeSessionCache(
            result?.message ? { ...session, authFlash: result.message } : session,
        );
        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();
        await ensureMinLoadingMs(startedAt);
        navigate(session.next, "replace");
    }
    function applyDigits(start, digitsInput) {
        const next = [...code];
        const chars = digitsInput.replace(/\D/g, "").slice(0, 6 - start);
        if (!chars)
            return;
        for (let offset = 0; offset < chars.length; offset += 1) {
            next[start + offset] = chars[offset] ?? "";
        }
        setCode(next);
        const joined = next.join("");
        if (joined.length === 6 && next.every(Boolean)) {
            finish(joined);
            return;
        }
        focusAt(Math.min(start + chars.length, 5));
    }
    function onKeyDown(event, index) {
        if (event.key !== "Backspace")
            return;
        event.preventDefault();
        if (code[index]) {
            const next = [...code];
            next[index] = "";
            setCode(next);
            return;
        }
        if (index > 0) {
            const next = [...code];
            next[index - 1] = "";
            setCode(next);
            focusAt(index - 1);
        }
    }
    async function resend() {
        if (timer > 0 || isLoading)
            return;
        if (!validPhone) {
            setToast(REJECTED);
            return;
        }
        setLoadingLabel("發送中…");
        setIsLoading(true);
        const res = await login(
            thirdPartyLoginForm({ phone: digits, usePrefix: usePhonePrefix }),
        );
        setIsLoading(false);
        if (!res?.status) {
            if (res?.message) setToast(res.message);
            return;
        }
        setTimer(28);
        if (res?.message) setToast(res.message);
    }
    const clock = timer.toString().padStart(2, "0");
    return (<div className="verification-page relative">
        <div className="verification-container">
            <div className="verification-header">
                驗證碼將以短訊形式
                <br />
                傳送到以下電話號碼
            </div>
            <div className="phone-number">+852 {digits || phone}</div>
            <div className="verification-prompt">請輸入短訊上的驗證碼</div>
            <div className="verification-input-container">
                {code.map((digit, index) => (<input key={index} ref={(node) => {
                    inputs.current[index] = node;
                }} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} value={digit} data-index={index} className="verification-input" aria-label={`驗證碼第 ${index + 1} 位`} disabled={isLoading} onChange={(event) => applyDigits(index, event.target.value)} onKeyDown={(event) => onKeyDown(event, index)} onPaste={(event) => {
                    event.preventDefault();
                    applyDigits(index, event.clipboardData.getData("text"));
                }} />))}
            </div>
            <button type="button" className="resend-button" onClick={resend} disabled={timer > 0 || isLoading}>
                重新發送驗證碼 (00:{clock})
            </button>
            <div className="help-text">
                如未能收到驗證碼，請重新
                <a
                  className="help-link"
                  href="/login/"
                  onClick={(event) => {
                    event.preventDefault();
                    clearAuthStorage();
                    navigate("/login", "replace");
                  }}
                >
                    輸入電話號碼
                </a>
            </div>
        </div>
        <FullPageLoadingGate active={isLoading} label={loadingLabel} />
        <AuthToast
            message={toast}
            onDismiss={() => setToast("")}
            variant="dark"
        />
    </div>);
}
