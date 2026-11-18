import { redirect } from "next/navigation";
import { repairJob } from "@/service/mock/repair";

export const metadata = { title: "報價餘額不足" };

export function generateStaticParams() {
  return [{ id: repairJob.id }];
}

export default async function Page({ params }) {
  const { id } = await params;
  if (id !== repairJob.id) redirect("/");
  redirect(`/repair/${id}?quote=1&lowBalance=1`);
}
