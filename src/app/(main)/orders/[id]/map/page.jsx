import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import OrderMap from "@/pages/orders/OrderMap";
import { getAssignment, listMyOrders } from "@/service/mock/assignments";
import { frame } from "@/lib/frame";
export const metadata = { title: "地圖" };
export function generateStaticParams() {
    return listMyOrders().map((order) => ({ id: order.id }));
}
export default function Page({ params }) {
    return frame("地圖", "/orders", "載入地圖…", <Body params={params}/>);
}
async function Body({ params }) {
    const { id } = await params;
    if (!getAssignment(id))
        notFound();
    return (<Screen title="地圖" backHref={`/orders/${id}`}>
      <OrderMap id={id}/>
    </Screen>);
}
