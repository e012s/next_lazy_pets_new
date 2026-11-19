import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import ApplyExpertPet from "@/pages/apply/ApplyExpertPet";
import ApplyExpertRepair from "@/pages/apply/ApplyExpertRepair";

export const metadata = { title: "申請成為專家" };

export function generateStaticParams() {
  return [{ category: "pet" }, { category: "repair" }];
}

function ApplyCategoryFallback() {
  return (
    <div className="min-h-dvh bg-[#f9fafc]">
      <div
        className="mx-auto min-h-dvh w-full max-w-[500px] shadow-[0_0_40px_rgba(16,40,48,0.08)]"
        aria-hidden
      />
    </div>
  );
}

async function ApplyCategoryBody({ params }) {
  const { category: raw } = await params;
  if (raw !== "pet" && raw !== "repair") notFound();
  return (
    <Screen title="申請成為專家" backHref="/apply/role">
      {raw === "repair" ? <ApplyExpertRepair /> : <ApplyExpertPet />}
    </Screen>
  );
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<ApplyCategoryFallback />}>
      <ApplyCategoryBody params={params} />
    </Suspense>
  );
}
