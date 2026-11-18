import { Screen } from "@/components/Screen";
import { BottomNav } from "@/components/BottomNav";
import MyOrders from "@/pages/orders/MyOrders";
export const metadata = { title: "我的訂單" };
export default function Page() {
    return (<Screen title="我的訂單" backHref="/" showMenu flat headerClassName="h-[52px] px-[15px] gap-[6px]" titleClassName="min-w-0 flex-1 truncate text-[16px] font-bold text-[#797979]" bottomNav={<BottomNav active="orders" />}>
      <MyOrders />
    </Screen>);
}
