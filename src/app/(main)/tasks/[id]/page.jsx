import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import OrderDetail from "@/pages/orders/OrderDetail";
import { getTask, tasks } from "@/service/mock/tasks";
import { frame } from "@/lib/frame";

export const metadata = { title: "訂單詳情" };

export function generateStaticParams() {
  return tasks.map((task) => ({ id: task.id }));
}

export default function Page({ params }) {
  return frame("訂單詳情", "/find", "載入訂單…", <Body params={params} />);
}

async function Body({ params }) {
  const { id } = await params;
  const task = getTask(id);
  if (!task) notFound();

  const variant = task.kind === "boarding" ? "boarding" : "pet";
  const screenTitle = variant === "boarding" ? "寄宿訂單詳情" : "訂單詳情";

  return (
    <Screen title={screenTitle} backHref="/find">
      <OrderDetail variant={variant} id={id} />
    </Screen>
  );
}
