import { Suspense } from "react";
import { InPageLoading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
export function frame(title, backHref, label, child, hideBack = false) {
  return (
    <Suspense
      fallback={
        <Screen title={title} backHref={hideBack ? undefined : backHref} hideBack={hideBack}>
          <InPageLoading label={label} />
        </Screen>
      }
    >
      {child}
    </Suspense>
  );
}
