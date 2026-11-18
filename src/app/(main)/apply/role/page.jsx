import { Screen } from "@/components/Screen";
import ApplyRole from "@/page/apply/ApplyRole";

export const metadata = { title: "你最主要做什麼" };

export default function Page() {
  return (
    <Screen title="申請成為專家">
      <ApplyRole />
    </Screen>
  );
}