import { Screen } from "@/components/Screen";
import { BottomNav } from "@/components/BottomNav";
import MyOrders, { MyOrdersTabs } from "@/pages/orders/MyOrders";

export const metadata = { title: "我的訂單" };

export default function Page() {
  return (
    <Screen
      title="我的訂單"
      backHref="/"
      showMenu
      flat
      subHeader={<MyOrdersTabs />}
      bottomNav={<BottomNav active="orders" />}
    >
      <MyOrders />
    </Screen>
  );
}
