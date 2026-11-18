"use client";

import { useSearchParams } from "next/navigation";
import { Screen } from "@/components/Screen";
import WalletSuccess from "@/pages/wallet/WalletSuccess";
import { parseTopUp } from "@/service/mock/wallet";

export default function WalletSuccessScreen() {
  const searchParams = useSearchParams();
  const topup = parseTopUp(searchParams.get("amount"), searchParams.get("promo"));
  const payRaw = searchParams.get("pay");
  const paymentLabel =
    typeof payRaw === "string" ? decodeURIComponent(payRaw) : undefined;
  return (
    <Screen title="增值成功" backHref="/balance">
      <WalletSuccess
        amount={topup.amount}
        nextBalance={topup.nextBalance}
        paymentLabel={paymentLabel}
      />
    </Screen>
  );
}
