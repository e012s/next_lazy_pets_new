import { repairJob } from "@/service/mock/repair";
import { getTask } from "@/service/mock/tasks";

/** @typedef {"pet" | "boarding" |"repair"} OrderDetailVariant */

/**
 * @param {OrderDetailVariant} variant
 * @param {string | undefined} id
 */
export function resolveOrderDetail(variant, id) {
  if (variant === "repair") {
    if (id && id !== repairJob.id) return null;
    const job = repairJob;
    return {
      title: job.title,
      code: job.id,
      headerIcon: "repair",
      metaLines: [`${job.published} • ${job.expires}`],
      notice: null,
      boardingDates: null,
      rows: job.rows,
      photoCount: job.photoCount,
      photos: job.photos,
      fee: null,
      confirmHref: `/repair/${job.id}/accepted`,
      notFoundMessage: "找不到這張維修訂單。",
    };
  }

  const task = id ? getTask(id) : undefined;
  if (!task) return null;
  if (variant === "boarding" && task.kind !== "boarding") return null;
  if (variant === "pet" && task.kind !== "walk") return null;

  return {
    title: task.title,
    code: task.id,
    headerIcon: task.kind === "boarding" ? "boarding" : "walk",
    metaLines:
      task.kind === "boarding"
        ? [task.subtitle, task.headline]
        : [task.headline],
    notice: null,
    boardingDates: null,
    rows: task.rows,
    photoCount: task.photoCount,
    photos: task.photos,
    fee: {
      orderTotal: task.orderTotal,
      orderTotalLabel: task.orderTotalLabel,
      platformFee: task.platformFee,
      income: task.income,
      incomeLabel: task.incomeLabel,
      incomeFormula: task.incomeFormula,
      payoutNote: task.payoutNote,
    },
    confirmHref: `/tasks/${task.id}/accepted`,
    notFoundMessage: "找不到這張寵物訂單。",
  };
}

/** @param {ReturnType<import("@/service/mock/assignments").getAssignment>} assignment */
export function resolveMyOrderDetailLayout(assignment) {
  if (!assignment) return null;
  if (assignment.detailLayout) return assignment.detailLayout;
  if (assignment.kind === "repair") return "repair";
  if (assignment.kind === "boarding") return "boarding";
  if (assignment.kind === "walk" && assignment.packageMeta) return "walkPackage";
  return "default";
}

const ADDRESS_AFTER_ACCEPT = /接單後顯示詳細地址/;

/** @param {ReturnType<import("@/service/mock/assignments").getAssignment>} assignment */
function resolveRepairArea(assignment) {
  const place = assignment.place ?? "";
  if (assignment.status === "done" || assignment.tab === "done") {
    return place;
  }
  if (place && !ADDRESS_AFTER_ACCEPT.test(place)) {
    return place;
  }
  return (
    assignment.areaDetail ??
    repairJob.rows.find((r) => r.label === "地區")?.value ??
    repairJob.area
  );
}

/** @param {ReturnType<import("@/service/mock/assignments").getAssignment>} assignment */
export function repairDetailFromAssignment(assignment) {
  return {
    metaLines: assignment.metaLines ?? [`${repairJob.published} • ${repairJob.expires}`],
    quoteMain: assignment.quoteMain ?? "$900 - 1200",
    quoteBudget: assignment.quoteBudget ?? "客人預算 $800 - 1200",
    schedule:
      assignment.scheduleDetail ??
      repairJob.rows.find((r) => r.label === "指定服務日期")?.value ??
      assignment.schedule,
    area: resolveRepairArea(assignment),
    repairDetailText:
      assignment.repairDetailText ?? repairJob.listDetail ?? repairJob.detail,
  };
}
