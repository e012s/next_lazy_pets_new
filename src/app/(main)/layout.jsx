import { AuthFlashToast } from "@/components/AuthFlashToast";
import { AuthGate } from "@/components/AuthGate";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-dvh bg-[#f9fafc]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[500px] shadow-[0_0_40px_rgba(16,40,48,0.08)]">
        <AuthGate>{children}</AuthGate>
        <AuthFlashToast />
      </div>
    </div>
  );
}
