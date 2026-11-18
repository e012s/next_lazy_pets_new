"use client";

import { getAssignment } from "@/service/mock/assignments";
import { RegisterDataPrompt, useNeedsRegistration } from "@/components/RegisteredData";
import CompletedPetDetail from "@/pages/orders/CompletedPetDetail";
import CompletedRepairDetail from "@/pages/orders/CompletedRepairDetail";

export default function PetCompletedDetail({ id }) {
  const needsRegistration = useNeedsRegistration();
  const assignment = id ? getAssignment(id) : undefined;

  if (needsRegistration) {
    return (
      <div className="px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看訂單。" />
      </div>
    );
  }

  if (!assignment || assignment.status !== "done") {
    return <p className="px-4 py-8 text-sm text-[#797979]">找不到這張已完成訂單。</p>;
  }

  if (assignment.kind === "repair") {
    return <CompletedRepairDetail assignment={assignment} />;
  }

  return <CompletedPetDetail assignment={assignment} />;
}
