"use client";
import { iconSrc } from "@/icons/sources";

import {
  findTaskCardClass,
  FindTaskCardRow,
  findTaskCardActionsClass,
  findTaskOutlineBtn,
  findTaskPrimaryBtn,
  findTaskRowListClass,
} from "@/components/findTasks/FindTaskCardRow";
import { navigate } from "@/lib/navigation";
function KindIcon({ kind }) {
  if (kind === "repair") return null;
  const key = kind === "boarding" ? "pet-boarding" : "pet-walk";
  return <img src={iconSrc[key]} alt="" aria-hidden className="size-12 shrink-0 object-contain" />;
}

export function TaskCard({ task }) {
  return (
    <article className={findTaskCardClass}>
      <div className="flex gap-3">
        <KindIcon kind={task.kind} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-title font-bold text-foreground">
              {task.title} • #{task.id}
            </h2>
            <span className="shrink-0 rounded-full bg-[#e5f6fb] px-2.5 py-1 text-caption font-medium text-brand">
              待接單
            </span>
          </div>
          <p className="mt-1 text-body font-normal text-muted">
            {task.subtitle.replaceAll(" · ", " • ")} • {task.publishedAt}
          </p>
        </div>
      </div>
      <ul className={findTaskRowListClass}>
        <FindTaskCardRow iconSrc={iconSrc["budget"]} label="服務酬勞">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-display font-bold text-brand">{task.payMain}</span>
            <span className="text-body font-normal text-muted">
              • {task.payNote.replaceAll(" · ", " • ")}
            </span>
          </div>
        </FindTaskCardRow>
        <FindTaskCardRow iconSrc={iconSrc["order-clock"]} label={task.scheduleLabel}>
          {task.schedule}
        </FindTaskCardRow>
        <FindTaskCardRow iconSrc={iconSrc["order-location"]} label={task.areaLabel}>
          {task.area}
        </FindTaskCardRow>
      </ul>
      <div className={findTaskCardActionsClass}>
        <button
          type="button"
          className={findTaskOutlineBtn}
          onClick={() => navigate(`/tasks/${task.id}`)}
        >
          查看訂單詳情
        </button>
        <button
          type="button"
          className={findTaskPrimaryBtn}
          onClick={() => navigate(`/tasks/${task.id}/accepted`, "replace")}
        >
          接單
        </button>
      </div>
    </article>
  );
}
