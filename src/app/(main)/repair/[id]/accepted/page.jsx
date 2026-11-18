import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import RepairAcceptSuccess from "@/pages/repair/RepairAcceptSuccess";
import { repairJob } from "@/service/mock/repair";
import { frame } from "@/lib/frame";

export const metadata = { title: "訂單詳情" };

export function generateStaticParams() {
  return [{ id: repairJob.id }];
}

export default function Page({ params }) {
  return frame("訂單詳情", "/", "載入中…", <Body params={params} />);
}

async function Body({ params }) {
  const { id } = await params;
  if (id !== repairJob.id) notFound();

  return (
    <Screen title="訂單詳情" backHref="/">
      <RepairAcceptSuccess id={id} />
    </Screen>
  );
}
