import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import MyOrderDetail from "@/pages/orders/MyOrderDetail";
import PetCompletedDetail from "@/pages/orders/PetCompletedDetail";
import { getAssignment, listMyOrders } from "@/service/mock/assignments";
import { frame } from "@/lib/frame";
export const metadata = { title: "訂單詳情" };
export function generateStaticParams() {
    return listMyOrders().map((order) => ({ id: order.id }));
}
export default function Page({ params }) {
    return frame("訂單詳情", undefined, "載入訂單…", <Body params={params} />);
}
async function Body({ params }) {
    const { id } = await params;
    const assignment = getAssignment(id);
    if (!assignment)
        notFound();
    const done = assignment.status === "done";
    return (<Screen title="訂單詳情">
        {done ? <PetCompletedDetail id={id} /> : <MyOrderDetail id={id} />}
    </Screen>);
}
