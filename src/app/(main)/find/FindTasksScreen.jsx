"use client";

import { Screen } from "@/components/Screen";
import { BottomNav } from "@/components/BottomNav";
import FindTasks from "@/pages/tasks/FindTasks";

export default function FindTasksScreen() {
  return (
    <Screen title="尋找任務" bottomNav={<BottomNav active="find" />}>
      <FindTasks initialTab="all" />
    </Screen>
  );
}
