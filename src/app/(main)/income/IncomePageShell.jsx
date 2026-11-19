import { Suspense } from "react";
import { Screen } from "@/components/Screen";
import { BottomNav } from "@/components/BottomNav";
import Income, { IncomeTabBar } from "@/pages/income/Income";

export function IncomePageShell() {
  return (
    <Screen
      title="我的收入"
      backHref="/"
      showMenu
      flat
      subHeader={
        <Suspense fallback={<div className="h-[46px] bg-[#4d5257]" aria-hidden />}>
          <IncomeTabBar />
        </Suspense>
      }
      bottomNav={<BottomNav active="income" />}
    >
      <Suspense fallback={<div className="px-4 py-4 text-sm text-[#797979]">載入中…</div>}>
        <Income />
      </Suspense>
    </Screen>
  );
}
