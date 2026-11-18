import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import OrderDailyLog from "@/pages/orders/OrderDailyLog";
import { getAssignment, listMyOrders } from "@/service/mock/assignments";
import { frame } from "@/lib/frame";
import { petName } from "@/service/orders/report";
export const metadata = { title: "今日日誌" };
export function generateStaticParams() {
    return listMyOrders()
        .filter((order) => order.kind === "boarding")
        .map((order) => ({ id: order.id }));
}
export default function Page({ params }) {
    return frame("今日日誌", undefined, "載入日誌…", <Body params={params}/>);
}
async function Body({ params }) {
    const { id } = await params;
    const assignment = getAssignment(id);
    if (!assignment || assignment.kind !== "boarding")
        notFound();
    const name = petName(assignment);
    return (<Screen title={name ? `今日日誌 · ${name}寄宿` : "今日日誌"} backHref="/orders" showMenu flat headerClassName="h-[52px] px-[15px]" titleClassName="min-w-0 flex-1 truncate text-[16px] font-bold text-[#797979]">
      <OrderDailyLog id={id}/>
    </Screen>);
}
