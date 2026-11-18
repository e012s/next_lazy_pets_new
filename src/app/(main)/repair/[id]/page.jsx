import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import OrderDetail from "@/pages/orders/OrderDetail";
import { repairJob } from "@/service/mock/repair";
import { frame } from "@/lib/frame";

export const metadata = { title: "維修訂單詳情" };

export function generateStaticParams() {
  return [{ id: repairJob.id }];
}

export default function Page({ params }) {
  return frame("維修訂單詳情", "/find", "載入訂單…", <Body params={params} />);
}

async function Body({ params }) {
  const { id } = await params;
  if (id !== repairJob.id) notFound();

  return (
    <Screen title="訂單詳情" backHref="/find">
      <OrderDetail variant="repair" id={id} />
    </Screen>
  );
}
