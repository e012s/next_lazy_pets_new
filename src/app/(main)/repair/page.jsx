import { redirect } from "next/navigation";

/** Legacy URL — find tasks live on `/` with 全部服務 tab. */
export default function RepairFindTasksRedirect() {
  redirect("/");
}
