"use client";

import { resolveListReview } from "@/service/orders/review";
import { getCompletedPageDetail } from "@/service/mock/orderCompleted";
import {
  CompletedContactButton,
  CompletedDetailHeader,
  CompletedInfoCard,
  CompletedReportsCard,
  CompletedReviewCard,
  CompletedStatsRow,
} from "@/components/orders/CompletedDetailSections";

function headerIconKey(kind) {
  if (kind === "boarding") return "pet-boarding";
  if (kind === "groom") return "pet-groom";
  return "pet-walk";
}

function fallbackDetail(assignment) {
  const done = assignment.doneList;
  const listReview = resolveListReview(done);
  const payNote = assignment.payNote ? `（${assignment.payNote}）` : "";
  return {
    headerMeta: assignment.packageMeta ?? assignment.headerSchedule ?? assignment.schedule,
    stats: [
      { label: `服務酬勞${payNote}`, value: assignment.payMain ?? "" },
      { label: "發放日", value: done?.payNote ?? "" },
    ],
    review: listReview
      ? {
          stars: listReview.stars,
          text: listReview.text,
          author: assignment.contactName,
        }
      : null,
    reportsTitle: null,
    reports: [],
    reportsFooter: "",
    previewCount: 2,
    infoRows: (assignment.detailRows ?? []).map((row) => ({
      icon: row.icon === "pin" || row.icon === "location" ? "pin" : row.icon === "plus" ? "plus" : "pet",
      label: row.label,
      value: row.value,
    })),
  };
}

export default function CompletedPetDetail({ assignment }) {
  const page = { ...fallbackDetail(assignment), ...getCompletedPageDetail(assignment) };

  return (
    <div className="flex flex-col gap-5 px-[15px] pt-5 pb-[30px]">
      <CompletedDetailHeader
        iconKey={headerIconKey(assignment.kind)}
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
        previewCount={page.previewCount ?? 2}
        footerLabel={page.reportsFooter}
      />
      <CompletedInfoCard rows={page.infoRows} />
      <CompletedContactButton orderId={assignment.id} phoneNumber={assignment.contactPhone} />
    </div>
  );
}
