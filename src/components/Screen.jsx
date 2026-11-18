"use client";
import { iconSrc } from "@/icons/sources";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { navigate } from "@/lib/navigation";

export function Screen({
  title,
  backHref,
  hideBack = false,
  children,
  headerClassName,
  titleClassName,
  bottomNav = null,
  showMenu = false,
  onMenu,
  flat = false,
}) {
  const router = useRouter();
  const session = useSession();
  const loggedIn = session?.authenticated === true;
  const registered = loggedIn && session.registered;

  function goBack() {
    if (backHref) navigate(backHref, "replace");
    else router.back();
  }

  return (
    <div className="relative min-h-dvh bg-[#f9fafc] ">
      <header
        className={`sticky top-0 z-20 flex items-center gap-2 bg-white px-2${flat ? " shadow-none" : " shadow-[0_3px_6px_rgba(16,40,48,0.16)]"} ${headerClassName ?? " h-14"}`}
      >
        {hideBack ? (
          <span className="w-2" />
        ) : (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex size-4 items-center justify-center rounded-full text-[#797979]"
            aria-label="返回"
          >
            <img 
              src={iconSrc["back"]}
              alt=""
              aria-hidden
              className="inline-block object-contain size-4"
            />
          </button>
        )}
        <h1
          className={
            titleClassName ??
            "min-w-0 flex-1 truncate text-nav font-medium text-[#4d5257]"
          }
        >
          {title}
        </h1>
        <div className={`flex items-center${showMenu ? " gap-[22px]" : " gap-0"}`}>
          <button
            type="button"
            onClick={() => navigate(loggedIn ? "/profile" : "/login")}
            className={`relative mr-1${showMenu ? " size-[30px]" : " size-8"}`}
            aria-label={loggedIn ? "我的專家檔案" : "登入"}
          >
            <img
              src={iconSrc["avatar"]}
              alt=""
              aria-hidden
              className={`inline-block object-contain${showMenu ? " size-[30px]" : " size-8"}`}
            />
            {registered ? null : (
              <span className="absolute -top-[3px] -right-[3px] size-2.5 rounded-full bg-[#d95959] ring-2 ring-white" />
            )}
          </button>
        </div>
      </header>
      {children}
      {bottomNav ? <div aria-hidden className="h-20" /> : null}
      {bottomNav}
    </div>
  );
}
