import { Screen } from "@/components/Screen";
import ExpertProfile from "@/pages/profile/ExpertProfile";

export const metadata = { title: "我的專家檔案" };

export default function Page() {
  return (
    <Screen title="我的專家檔案" backHref="/">
      <ExpertProfile />
    </Screen>
  );
}
