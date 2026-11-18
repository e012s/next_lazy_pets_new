import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import IncomeDetail from "@/pages/income/IncomeDetail";
import { getIncome, incomeRecords } from "@/service/mock/income";
import { frame } from "@/lib/frame";
export const metadata = { title: "收入明細" };
export function generateStaticParams() {
    return incomeRecords.map((record) => ({ id: record.id }));
}
export default function Page({ params }) {
    return frame("收入明細", "/income", "載入明細…", <Body params={params}/>);
}
async function Body({ params }) {
    const { id } = await params;
    const record = getIncome(id);
    if (!record)
        notFound();
    return (<Screen title={record.status === "done" ? "收入明細" : "訂單詳情"} backHref="/income">
      <IncomeDetail id={id}/>
    </Screen>);
}
