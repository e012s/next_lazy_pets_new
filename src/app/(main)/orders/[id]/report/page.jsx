import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import OrderReport from "@/pages/orders/OrderReport";
import { getAssignment, listMyOrders } from "@/service/mock/assignments";
import { frame } from "@/lib/frame";
import { petShortTitle, reportScreenTitle } from "@/service/orders/report";
export const metadata = { title: "提交報告" };
export function generateStaticParams() {
    return listMyOrders().map((order) => ({ id: order.id }));
}
export default function Page({ params }) {
    return frame("今日服務", undefined, "載入報告…", <Body params={params}/>);
}
async function Body({ params }) {
    const { id } = await params;
    const assignment = getAssignment(id);
    if (!assignment)
        notFound();
    return (<Screen title={reportScreenTitle(assignment.kind === "repair" ? assignment.title : petShortTitle(assignment))} showMenu flat>
      <OrderReport id={id}/>
    </Screen>);
}
