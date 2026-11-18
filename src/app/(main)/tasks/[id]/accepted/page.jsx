import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import AcceptSuccess from "@/pages/tasks/AcceptSuccess";
import { getTask, tasks } from "@/service/mock/tasks";
import { frame } from "@/lib/frame";

export const metadata = { title: "訂單詳情" };

export function generateStaticParams() {
  return tasks.map((task) => ({ id: task.id }));
}

export default function Page({ params }) {
  return frame("訂單詳情", "/", "載入中…", <Body params={params} />);
}

async function Body({ params }) {
  const { id } = await params;
  if (!getTask(id)) notFound();

  return (
    <Screen title="訂單詳情" backHref="/">
      <AcceptSuccess id={id} />
    </Screen>
  );
}
