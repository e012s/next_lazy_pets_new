import { notFound, redirect } from "next/navigation";
import { getAssignment, listMyOrders } from "@/service/mock/assignments";

export const metadata = { title: "提交報告" };

export function generateStaticParams() {
  return listMyOrders().map((order) => ({ id: order.id }));
}

export default async function Page({ params }) {
  const { id } = await params;
  if (!getAssignment(id)) notFound();
  redirect(`/orders/${id}/report`);
}
