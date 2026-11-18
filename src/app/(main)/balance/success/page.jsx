import WalletSuccessScreen from "./WalletSuccessScreen";
import { frame } from "@/lib/frame";

export const metadata = { title: "增值成功" };

export default function Page() {
  return frame("增值成功", "/balance", "載入結果…", <WalletSuccessScreen />);
}
