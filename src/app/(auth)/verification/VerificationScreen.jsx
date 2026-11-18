"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InPageLoading } from "@/components/Loading";
import Verification from "@/pages/auth/Verification";

function VerifyInner() {
  const searchParams = useSearchParams();
  const phone = (searchParams.get("phone") ?? "").replace(/\D/g, "").slice(0, 8);
  const usePhonePrefix = searchParams.get("usePrefix") === "1";
  return <Verification phone={phone} usePhonePrefix={usePhonePrefix} />;
}

export default function VerificationScreen() {
  return (
    <Suspense
      fallback={
        <InPageLoading label="載入驗證碼…" minHeight={false} className="min-h-[50vh]" />
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
