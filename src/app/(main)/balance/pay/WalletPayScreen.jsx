"use client";

import { useSearchParams } from "next/navigation";
import { Screen } from "@/components/Screen";
import WalletPay from "@/pages/wallet/WalletPay";
import { parseTopUp } from "@/service/mock/wallet";

export default function WalletPayScreen() {
  const searchParams = useSearchParams();
  const topup = parseTopUp(searchParams.get("amount"), searchParams.get("promo"));
  return (
    <Screen title="付款方式" backHref="/balance/topup">
      <WalletPay amount={topup.amount} bonus={topup.bonus} promoCode={topup.promoCode} />
    </Screen>
  );
}
