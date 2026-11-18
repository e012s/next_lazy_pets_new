import { Screen } from "@/components/Screen";
import WalletTopUp from "@/pages/wallet/WalletTopUp";
export const metadata = { title: "增值儲值金" };
export default function Page() {
    return (<Screen title="增值儲值金" backHref="/balance">
      <WalletTopUp />
    </Screen>);
}
