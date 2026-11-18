import { redirect } from "next/navigation";
import { repairJob } from "@/service/mock/repair";

export const metadata = { title: "提供報價" };

export function generateStaticParams() {
  return [{ id: repairJob.id }];
}

export default async function Page({ params }) {
  const { id } = await params;
  if (id !== repairJob.id) redirect("/");
  redirect(`/repair/${id}?quote=1`);
}
