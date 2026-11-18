"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { tasks } from "@/service/mock/tasks";
import { BalanceBar } from "@/components/BalanceBar";
import { RepairJobCard } from "@/components/RepairJobCard";
import { ServiceChips } from "@/components/ServiceChips";
import { ShellNotice } from "@/components/ShellNotice";
import { TaskCard } from "@/components/TaskCard";
import { RegisteredData } from "@/components/RegisteredData";

const petNotice = "寵物任務為固定價，接單不扣儲值金，先到先得";

export default function FindTasks({ initialTab = "all" }) {
  const pathname = usePathname();
  const [tab, setTab] = useState(initialTab);

  useLayoutEffect(() => {
    setTab(initialTab);
  }, [pathname, initialTab]);

  const pets = tasks.filter((task) => task.service === "pet");
  const petList = pets;
  const showRepair = tab === "all" || tab === "repair";
  const showPet = tab === "all" || tab === "pet";

  return (
    <div>
      <section className="bg-brand-soft p-5">
        <BalanceBar showTopUp={tab !== "pet"} />
        <ServiceChips current={tab} onSelect={setTab} />
      </section>
      <div className="space-y-4 px-4 pb-6 pt-4">
        <RegisteredData afterRegistered="即可查看任務。">
          {showRepair ? (
            <>
              {tab === "all" ? <h2 className="px-1 text-title font-medium">維修</h2> : null}
              <RepairJobCard />
            </>
          ) : null}
          {showPet ? (
            <>
              {tab === "pet" ? <ShellNotice>{petNotice}</ShellNotice> : null}
              {tab === "all" ? <h2 className="px-1 text-title font-medium">寵物</h2> : null}
              {tab === "all" ? <ShellNotice>{petNotice}</ShellNotice> : null}
              {petList.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-10 text-center text-body font-normal text-muted">
                  暫時沒有寵物任務
                </p>
              ) : (
                petList.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </>
          ) : null}
        </RegisteredData>
      </div>
    </div>
  );
}
