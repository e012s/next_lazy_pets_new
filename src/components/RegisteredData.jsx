"use client";

import { useSession } from "@/context/SessionContext";
import { navigate } from "@/lib/navigation";

export function useNeedsRegistration() {
  const session = useSession();
  return session?.authenticated === true && session?.registered !== true;
}

/** @param {string} afterRegistered Text after「完成註冊後」, e.g.「即可查看訂單。」 */
export function registrationPromptMessage(afterRegistered) {
  return `您尚未完成專家註冊，完成註冊後${afterRegistered}`;
}

export function RegisterDataPrompt({
  afterRegistered = "即可查看。",
  message,
  className,
}) {
  const text = message ?? registrationPromptMessage(afterRegistered);
  return (
    <div
      className={`rounded-2xl bg-white px-4 py-10 text-center shadow-[0_8px_24px_rgba(77,82,87,0.06)]${className}`}
    >
      <p className="text-sm text-[#797979]">{text}</p>
      <button
        type="button"
        onClick={() => navigate("/apply/role")}
        className={`mx-auto mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
      >
        註冊
      </button>
    </div>
  );
}

/** Renders children when registered; otherwise the prompt (for list / data blocks). */
export function RegisteredData({
  children,
  afterRegistered = "即可查看。",
  message,
  className,
}) {
  const needsRegistration = useNeedsRegistration();
  if (needsRegistration) {
    return (
      <RegisterDataPrompt
        afterRegistered={afterRegistered}
        message={message}
        className={className}
      />
    );
  }
  return children;
}
