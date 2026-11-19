import { money } from "@/lib/format";

function text(value) {
  return String(value ?? "").trim();
}

function orderKey(group) {
  const id =
    group.first_order_id ??
    group.order_ids?.[0] ??
    group.order_group_id;
  return id != null ? String(id) : "";
}

function inferPetKind(group) {
  const blob = `${text(group.group_title)} ${text(group.service_item)} ${text(group.service_name)}`;
  if (/寄宿|寄養/.test(blob)) return "boarding";
  if (/美容|沖涼|修剪/.test(blob)) return "groom";
  return "walk";
}

function formatPetSubtitle(group) {
  const pet = group.pet;
  if (!pet || typeof pet !== "object") return text(group.service_item);
  const parts = [
    pet.name,
    pet.type,
    pet.breed,
    pet.size,
  ]
    .map(text)
    .filter(Boolean);
  return parts.join(" · ") || text(group.service_item);
}

function formatSchedule(group, kind) {
  const date = text(group.service_date);
  const time = text(group.service_time);
  const end = text(group.end_date);
  if (kind === "boarding" && date && end) {
    return `${date} 入住 · ${end} 退房${time ? ` · ${time}` : ""}`;
  }
  if (date && time) return `${date} · ${time}`;
  return date || time || text(group.service_day);
}

function formatArea(group) {
  const district = text(group.district);
  if (district) return `${district}（接單後顯示詳細地址）`;
  const address = text(group.address);
  if (address) return address;
  return "（接單後顯示詳細地址）";
}

function formatPetPay(group) {
  const income = group.total_income;
  const fees = group.total_fees;
  const pending = group.pending_orders;
  const unit = text(group.unit_label);

  let payMain = "";
  if (income != null && income !== "") {
    payMain = money(income);
    if (unit) {
      payMain = unit.startsWith("/") ? `${payMain}${unit}` : `${payMain}/${unit}`;
    }
  } else if (Array.isArray(group.orders) && group.orders[0]?.income != null) {
    payMain = money(group.orders[0].income);
  } else {
    payMain = "—";
  }

  const notes = [];
  if (pending != null && Number(pending) > 0) {
    notes.push(`${pending}次`);
  }
  if (fees != null && fees !== "") {
    notes.push(money(fees));
  }
  const payNote = notes.length ? notes.join(" · ") : text(group.commission_rate ? `抽成 ${group.commission_rate}%` : "固定價");

  return { payMain, payNote };
}

/** Map workspace `order_groups[]` entry → `TaskCard` task shape. */
export function mapPetOrderGroupToTask(group) {
  const kind = inferPetKind(group);
  const title =
    text(group.group_title) ||
    text(group.service_item) ||
    text(group.service_name) ||
    "寵物服務";
  const { payMain, payNote } = formatPetPay(group);
  const scheduleLabel = kind === "boarding" ? "入住／退房" : "服務日期";

  return {
    id: orderKey(group),
    orderGroupId: group.order_group_id ?? null,
    orderIds: Array.isArray(group.order_ids) ? group.order_ids.map(String) : [],
    service: "pet",
    kind,
    title,
    subtitle: formatPetSubtitle(group),
    publishedAt: text(group.created_at) ? `${text(group.created_at)} 發佈` : "",
    payMain,
    payNote,
    scheduleLabel,
    schedule: formatSchedule(group, kind),
    areaLabel: "地區",
    area: formatArea(group),
    raw: group,
  };
}

function repairBadge(group) {
  if (group.my_quote && typeof group.my_quote === "object") return "已報價";
  return "待接單";
}

/** Map workspace `order_groups[]` entry → `RepairJobCard` job shape. */
export function mapRepairOrderGroupToJob(group) {
  const title =
    text(group.group_title) ||
    text(group.service_item) ||
    text(group.service_name) ||
    "維修服務";
  const id = orderKey(group);
  const budget = text(group.budget_range) || "—";
  const quoteFee = group.quote_fee != null ? Number(group.quote_fee) : 0;
  const schedule = formatSchedule(group, "repair");
  const listDetail =
    text(group.customer_note) ||
    text(group.service_item) ||
    "—";

  return {
    id,
    orderGroupId: group.order_group_id ?? null,
    firstOrderId: group.first_order_id,
    title,
    badge: repairBadge(group),
    hasQuoted: Boolean(group.my_quote),
    published: text(group.created_at) ? `${text(group.created_at)} 發佈` : "",
    expires: "",
    budgetLabel: budget,
    quoteFee,
    schedule,
    area: formatArea(group),
    listDetail,
    quoteCount: group.quote_count,
    quoteLimit: group.quote_limit,
    raw: group,
  };
}