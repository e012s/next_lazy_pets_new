"use client";

import { useEffect, useState } from "react";
import { consumeAuthFlash } from "@/context/SessionContext";
import { AuthToast } from "@/components/AuthToast";

/** Brief post-login API message on home (and other `(main)` routes). */
export function AuthFlashToast() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const flash = consumeAuthFlash();
    if (flash) setMessage(flash);
  }, []);

  return (
    <AuthToast
      message={message}
      onDismiss={() => setMessage("")}
      variant="light"
      duration={1400}
    />
  );
}
