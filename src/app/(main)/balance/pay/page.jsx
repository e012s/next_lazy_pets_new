import WalletPayScreen from "./WalletPayScreen";
import { frame } from "@/lib/frame";

export const metadata = { title: "付款方式" };

export default function Page() {
  return frame("付款方式", "/balance/topup", "載入付款…", <WalletPayScreen />);
}
