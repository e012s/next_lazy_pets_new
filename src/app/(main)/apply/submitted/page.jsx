import { Suspense } from "react";
import { Screen } from "@/components/Screen";
import ApplySubmitted from "@/pages/apply/ApplySubmitted";

export const metadata = { title: "申請成為專家" };

export default function Page() {
  return (
    <Screen title="申請成為專家" backHref="/apply/role">
      <Suspense fallback={null}>
        <ApplySubmitted />
      </Suspense>
    </Screen>
  );
}
