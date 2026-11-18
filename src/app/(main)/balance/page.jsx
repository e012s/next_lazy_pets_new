import { Screen } from "@/components/Screen";
import WalletBalance from "@/pages/wallet/WalletBalance";
export const metadata = { title: "儲值金" };
export default function Page() {
    return (<Screen title="我的儲值金">
      <WalletBalance />
    </Screen>);
}
