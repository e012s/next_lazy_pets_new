import "./auth.css";
export default function AuthLayout({ children }) {
    return (<div className="min-h-dvh bg-[#f9fafc]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[500px] pt-safe-top pb-safe-bottom shadow-[0_0_40px_rgba(16,40,48,0.08)]">
        {children}
      </div>
    </div>);
}
