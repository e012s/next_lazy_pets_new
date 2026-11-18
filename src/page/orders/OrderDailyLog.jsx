"use client";

import { getAssignment } from "@/service/mock/assignments";
import { RegisterDataPrompt, useNeedsRegistration } from "@/components/RegisteredData";
import ServiceReport from "@/components/ServiceReport";

/** 寄宿 更新日誌 */
export default function OrderDailyLog({ id }) {
  const assignment = id ? getAssignment(id) : undefined;
  const needsRegistration = useNeedsRegistration();
  if (needsRegistration) {
    return (
      <div className="px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看訂單。" />
      </div>
    );
  }
  if (!assignment || assignment.kind !== "boarding") {
    return <p className="px-4 py-8 text-sm text-[#797979]">找不到這張寄宿訂單。</p>;
  }
  const log = assignment.dailyLog ?? {};
  return (
    <ServiceReport
      variant="pet"
      id={assignment.id}
      bannerWhen={log.bannerWhen ?? assignment.schedule}
      statusBadge={log.statusBadge ?? "寄宿中"}
      bannerDetail={log.bannerDetail ?? assignment.subtitle}
      statusTone={log.pending === false ? "started" : "pending"}
      statusTitle={log.pending === false ? "今日已更新" : "今日未更新"}
      statusSubtitle="請於今晚 22:00 前最少更新 1 次"
      photoSectionTitle="上載相片／影片"
      photoRangeLabel="（1–4 個，必填）"
      photoHint="客人即時見到"
      photoLabels={["相片", "相片", "相片", "相片"]}
      minPhotos={1}
      placeholderPhotos
      allowVideo
      initialPhotos={log.initialPhotos ?? 0}
      messageLabel="給客人留言"
      messagePlaceholder="例如：今日食晒早晚餐，行咗兩次 30 分鐘。"
      defaultMessage={log.defaultMessage ?? ""}
      ctaLabel="發送今日日誌"
      footerHint={"客人即時收到 · 每日可更新多次\n退房後訂單先完成，入下月 7 號結算"}
      successTitle="日誌已發送"
      successBody={
        <>
          相片同留言已發送俾客人。
          <br />
          每日可更新多次，退房後訂單先完成。
        </>
      }
      backHref="/orders"
    />
  );
}
