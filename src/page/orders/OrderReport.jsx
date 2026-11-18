"use client";

import { getAssignment } from "@/service/mock/assignments";
import { RegisterDataPrompt, useNeedsRegistration } from "@/components/RegisteredData";
import ServiceReport from "@/components/ServiceReport";
import { petReportFields, repairReportFields } from "@/service/orders/report";
import { useOrderServiceLive } from "@/hooks/useOrderServiceLive";

export default function OrderReport({ id }) {
  const { apply: applyService } = useOrderServiceLive();
  const raw = id ? getAssignment(id) : undefined;
  const assignment = raw ? applyService(raw) : undefined;
  const needsRegistration = useNeedsRegistration();
  if (needsRegistration) {
    return (
      <div className="px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看訂單。" />
      </div>
    );
  }
  if (!assignment) {
    return <p className="px-4 py-8 text-sm text-[#797979]">找不到這張訂單。</p>;
  }
  if (assignment.kind === "repair") {
    return (
      <ServiceReport
        variant="repair"
        {...repairReportFields({ ...assignment, pay: assignment.pay ?? assignment.payMain })}
      />
    );
  }
  return <ServiceReport variant="pet" {...petReportFields(assignment)} />;
}
