"use client";

import { buildRepairCompletedPageDetail, getCompletedPageDetail } from "@/service/mock/orderCompleted";
import {
  CompletedContactButton,
  CompletedDetailHeader,
  CompletedInfoCard,
  CompletedReportsCard,
  CompletedReviewCard,
  CompletedStatsRow,
} from "@/components/orders/CompletedDetailSections";

export default function CompletedRepairDetail({ assignment }) {
  const page = { ...buildRepairCompletedPageDetail(assignment), ...getCompletedPageDetail(assignment) };

  return (
    <div className="flex flex-col gap-5 px-[15px] pt-5 pb-[30px]">
      <CompletedDetailHeader
        iconKey={assignment.listIcon ?? "repair-ac"}
        iconSize={60}
        title={assignment.title}
        code={assignment.code}
        subtitle={page.headerMeta}
        badge={assignment.badge ?? "已完成"}
      />
      <CompletedStatsRow stats={page.stats} />
      <CompletedReviewCard review={page.review} />
      <CompletedReportsCard
        title={page.reportsTitle}
        entries={page.reports}
        expandable={false}
      />
      <CompletedInfoCard rows={page.infoRows} />
      {page.showContact === false ? null : (
        <CompletedContactButton orderId={assignment.id} phoneNumber={assignment.contactPhone} />
      )}
    </div>
  );
}
