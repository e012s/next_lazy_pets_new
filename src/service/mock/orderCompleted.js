import { resolveListReview } from "@/service/orders/review";

const SAMPLE_REPORT_PHOTO = "/images/sample-image.jpg";

function sampleReportPhotos(count) {
  return Array.from({ length: count }, () => ({ type: "photo", src: SAMPLE_REPORT_PHOTO }));
}


export const ORDER_DETAIL_DEMO_VIDEO = "/icons/order-detail.mov";

/** @typedef {{ type?: "video" | "photo"; src: string; duration?: string }} DailyLogMedia */

/** @typedef {{ dateLabel: string; dateNote?: string; updateBadge?: string; body?: string; footer?: string; media?: DailyLogMedia[] }} DailyLogEntry */

/** @typedef {{ title?: string; subtitle?: string; media: DailyLogMedia[] }} CompletionGallery */

/** @typedef {{ headerMeta?: string; stats?: { label: string; value: string }[]; review?: { stars: number; tags?: string[]; text: string; author: string; date: string }; completionGallery?: CompletionGallery; dailyLogs?: DailyLogEntry[] }} CompletedDetailMock */

export const defaultBoardingDailyLogs = [
  {
    dateLabel: "10月4日",
    dateNote: "(退房日)",
    updateBadge: "已更新 1 次",
    media: [
      { type: "video", src: ORDER_DETAIL_DEMO_VIDEO, duration: "0:16" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
      { type: "photo", src: "/icons/pet-groom.svg" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
    ],
    body: "「退房前沖身、執好行李，波波狀態良好。」",
    footer: "13:20 已發送 • 客人已讀",
  },
  {
    dateLabel: "10月3日",
    updateBadge: "已更新 3 次",
    media: [
      { type: "photo", src: "/icons/pet-boarding.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
      { type: "photo", src: "/icons/pet-groom.svg" },
      { type: "video", src: ORDER_DETAIL_DEMO_VIDEO, duration: "0:16" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
    ],
    body: "「今日散步 30 分鐘，食慾正常，午覺 2 小時。」",
    footer: "20:45 已發送 • 客人已讀",
  },
  {
    dateLabel: "10月2日",
    dateNote: "(今日)",
    updateBadge: "已更新 2 次",
    media: [
      { type: "video", src: ORDER_DETAIL_DEMO_VIDEO, duration: "0:16" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
      { type: "photo", src: "/icons/pet-groom.svg" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
    ],
    footer: "21:10 已發送 • 客人已讀",
  },
  {
    dateLabel: "10月1日",
    media: [
      { type: "video", src: ORDER_DETAIL_DEMO_VIDEO, duration: "0:16" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
      { type: "photo", src: "/icons/pet-groom.svg" },
    ],
    body: "「波波到咗，初頭有啲驚，飲水食飯正常，夜晚已安頓好。」",
    footer: "21:10 已發送 • 客人已讀",
  },
];

export const defaultWalkDailyLogs = [
  {
    dateLabel: "9月6日",
    dateNote: "(日)",
    updateBadge: "已更新 2 次",
    media: [
      { type: "video", src: ORDER_DETAIL_DEMO_VIDEO, duration: "0:16" },
      { type: "photo", src: "/icons/pet-walk.svg" },
      { type: "photo", src: "/icons/pet-groom.svg" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
      { type: "photo", src: "/icons/pet-groom.svg" },
    ],
    body: "「多多今日精神好，散步 45 分鐘，有飲水。」",
    footer: "10:05 已發送 • 客人已讀",
  },
];

export const defaultRepairCompletedDetail = {
  headerMeta: "完工相片 4 張 • 報告已發送",
  stats: [
    { label: "你的報價", value: "$1,280" },
    { label: "發放日", value: "2026/10/07" },
  ],
  review: {
    stars: 5,
    tags: ["準時", "相片報告詳細"],
    text: "「師傅好專業，上門好準時，換機好快，解釋清楚。」",
    author: "陳先生",
    date: "2026/09/13",
  },
  completionGallery: {
    title: "完工相片",
    subtitle: "報告已發送",
    media: [
      { type: "video", src: ORDER_DETAIL_DEMO_VIDEO, duration: "0:16" },
      { type: "photo", src: "/icons/pet-groom.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
      { type: "photo", src: "/icons/pet-boarding.svg" },
      { type: "photo", src: "/icons/pet-groom.svg" },
      { type: "photo", src: "/icons/pet-walk.svg" },
    ],
  },
};

export const boardingDetailRows = [
  { icon: "pet", label: "寵物資料", value: "波波 • 貴婦犬 • 小型 5kg • 4歲 • 女 • 已絕育" },
  { icon: "heart", label: "性格", value: "怕生 • 需要獨處空間" },
  { icon: "health", label: "健康狀況", value: "每日需服用皮膚保健品一顆 (隨早餐)" },
  { icon: "vet", label: "指定獸醫", value: "康健獸醫診所 • 9123 1231" },
  { icon: "phone", label: "緊急聯絡人", value: "陳先生 • 9123 1231" },
  { icon: "plus", label: "額外項目", value: "每日散步30分鐘 • 客人自行接送" },
];


export const walkCompletedDetail = {
  headerMeta: "8次套票 · 2026/09/06 – 09/13",
  stats: [
    { label: "服務酬勞（8 次）", value: "$1,280" },
    { label: "發放日", value: "2026/10/07" },
  ],
  review: {
    stars: 5,
    tags: ["準時", "相片報告詳細", "寵物好開心"],
    text: "「多多每次都好開心，報告好詳細，下次再指定你！」",
    author: "多多的主人",
    date: "2026/09/13",
  },
  reportsTitle: "已發送報告 · 8 份",
  reportsFooter: "9月6日 – 9月11日 · 第 1–6 次",
  previewCount: 2,
  reports: [
    { dateLabel: "9月13日（日）第 8 次", sentAt: "09:58", photoCount: 1, media: sampleReportPhotos(1), caption: "「最後一次散步，多多今日行咗 50 分鐘，好乖！多謝主人。」" },
    { dateLabel: "9月12日（六）第 7 次", sentAt: "10:03", photoCount: 3, media: sampleReportPhotos(3), caption: "「落雨行咗 35 分鐘，返嚟已抹乾腳。」" },
    { dateLabel: "9月11日（五）第 6 次", sentAt: "10:12", photoCount: 1, media: sampleReportPhotos(1), caption: "「多多今日行咗 40 分鐘，途中有飲水。」" },
    { dateLabel: "9月10日（四）第 5 次", sentAt: "09:50", photoCount: 1, media: sampleReportPhotos(1), caption: "「精神好，沿途都好乖。」" },
    { dateLabel: "9月9日（三）第 4 次", sentAt: "10:05", photoCount: 1, media: sampleReportPhotos(1), caption: "「今日行咗小山路，多多好興奮。」" },
    { dateLabel: "9月8日（二）第 3 次", sentAt: "09:48", photoCount: 1, media: sampleReportPhotos(1), caption: "「天氣熱，提早返，多多有休息。」" },
    { dateLabel: "9月7日（一）第 2 次", sentAt: "10:00", photoCount: 1, media: sampleReportPhotos(1), caption: "「散步順利，返嚟腳掌乾淨。」" },
    { dateLabel: "9月6日（日）第 1 次", sentAt: "10:05", photoCount: 1, media: sampleReportPhotos(1), caption: "「多多今日精神好，散步 45 分鐘，有飲水。」" },
  ],
  infoRows: [
    { icon: "pet", label: "寵物資料", value: "多多 · 柴犬 · 中型 10kg · 3歲" },
    { icon: "pin", label: "地址", value: "九龍灣宏開道8號 12樓B" },
    { icon: "plus", label: "額外項目", value: "餵藥服務 × 8" },
  ],
};

export const boardingCompletedDetail = {
  headerMeta: "2026/09/27 14:00 → 09/30 14:00",
  stats: [
    { label: "服務酬勞（3 晚）", value: "$1,080" },
    { label: "發放日", value: "2026/10/07" },
  ],
  review: {
    stars: 5,
    tags: ["準時", "日誌詳細", "寵物好開心"],
    text: "「多多住得好開心，每日日誌好詳細，下次再搵你！」",
    author: "多多的主人",
    date: "2026/09/30",
  },
  reportsTitle: "每日相片日誌 · 4 份",
  reportsFooter: "9月27日 – 9月28日 · 2 份",
  previewCount: 2,
  reports: [
    { dateLabel: "9月30日（三）退房日", sentAt: "13:20", photoCount: 1, media: sampleReportPhotos(1), caption: "「退房前沖咗涼，執好行李，多多狀態良好。」" },
    { dateLabel: "9月29日（二）", sentAt: "20:45", photoCount: 3, media: sampleReportPhotos(3), caption: "「食慾正常，晏晝瞓咗 2 個鐘。」" },
    { dateLabel: "9月28日（一）", sentAt: "21:05", photoCount: 1, media: sampleReportPhotos(1), caption: "「今日散步 30 分鐘，晚上已安頓。」" },
    { dateLabel: "9月27日（日）入住日", sentAt: "21:10", photoCount: 1, media: sampleReportPhotos(1), caption: "「多多到咗，初頭有啲緊張，之後已適應。」" },
  ],
  infoRows: [
    { icon: "pet", label: "寵物資料", value: "多多 · 柴犬 · 中型 10kg · 3歲" },
    { icon: "pin", label: "寄宿地址", value: "你的住所（九龍灣 · 已登記地址）" },
    { icon: "plus", label: "接送", value: "客人自行送往及接回" },
  ],
};

export const repairCompletedPageDetail = {
  headerMeta: "完工相片 4 張 · 報告已發送",
  stats: [
    { label: "你的報價", value: "$1,280" },
    { label: "發放日", value: "2026/10/07" },
  ],
  review: {
    stars: 5,
    tags: ["準時", "相片報告詳細"],
    text: "「師傅做嘢好專業，手腳又快，冷氣安裝得好好，服務態度亦都好好，整體非常滿意，值得推薦！👍」",
    author: "陳先生",
    date: "2026/09/13",
  },
  reportsTitle: "已發送報告",
  reports: [
    { dateLabel: "9月13日（日）", sentAt: "09:58", photoCount: 4, media: sampleReportPhotos(4) },
  ],
  infoRows: [
    { icon: "budget", label: "你的報價", amount: "$900 - 1200", note: "客人預算 $800 - 1200" },
    { icon: "clock", label: "指定服務日期", value: "2026/09/12 星期六 · 14:00 – 16:00" },
    { icon: "pin", label: "地區", value: "沙田（接單後顯示詳細地址）" },
    { icon: "plus", label: "維修詳情", value: "描述問題，例如：冷氣型號、更換原因 等等…" },
  ],
};

export const completedDetailById = {
  CL52347: walkCompletedDetail,
  CL52386: boardingCompletedDetail,
  CL52290: repairCompletedPageDetail,
};

export function getCompletedPageDetail(assignment) {
  const fromId = completedDetailById[assignment.id] ?? {};
  return { ...fromId, ...assignment.completedDetail };
}

function flattenCompletedSubtitle(text) {
  return String(text ?? "")
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}

function isEndedCompletedRepair(assignment) {
  return assignment.badge === "已結束" || Boolean(assignment.doneList?.compact);
}
export function buildRepairCompletedPageDetail(assignment) {
  const done = assignment.doneList ?? {};
  const ended = isEndedCompletedRepair(assignment);
  const rawSubtitle = done.subtitle ?? assignment.subtitle;
  const genericSubtitle = !rawSubtitle || rawSubtitle === "維修服務";
  const headerMeta = ended
    ? flattenCompletedSubtitle(rawSubtitle)
    : genericSubtitle
      ? (done.scheduleLine ?? assignment.schedule ?? "")
      : flattenCompletedSubtitle(rawSubtitle);

  const stats = ended
    ? []
    : [
        { label: done.payLabel ?? "你的報價", value: done.payMain ?? assignment.payMain ?? assignment.pay ?? "" },
        { label: "發放日", value: done.payNote ?? "" },
      ].filter((row) => row.value);

  const listReview = resolveListReview(done);
  let review = null;
  if (!ended) {
    if (listReview && (listReview.stars || listReview.text)) {
      review = {
        stars: listReview.stars,
        text: listReview.text,
        author: assignment.contactName || undefined,
        date: done.reviewDate || undefined,
        tags: done.reviewTags,
      };
    } else {
      review = { empty: true };
    }
  }

  const reports = Array.isArray(done.reports)
    ? done.reports
    : Array.isArray(assignment.reports)
      ? assignment.reports
      : [];
  const reportsTitle = reports.length ? (done.reportsTitle ?? "已發送報告") : "";

  const infoRows = [];
  const quoteAmount = assignment.quoteMain ?? assignment.payMain ?? assignment.pay;
  if (quoteAmount) {
    const row = { icon: "budget", label: "你的報價", amount: quoteAmount };
    if (assignment.quoteBudget) row.note = assignment.quoteBudget;
    infoRows.push(row);
  }
  const dateValue = assignment.scheduleDetail ?? done.scheduleLine ?? assignment.schedule;
  if (dateValue) {
    infoRows.push({ icon: "clock", label: "指定服務日期", value: dateValue });
  }
  const area = assignment.area ?? assignment.place;
  if (area) {
    infoRows.push({ icon: "pin", label: "地區", value: area });
  }
  const detail = assignment.repairDetailText ?? assignment.note;
  if (detail) {
    infoRows.push({ icon: "plus", label: "維修詳情", value: detail });
  }
  if (ended) {
    const blob = flattenCompletedSubtitle(rawSubtitle);
    if (blob.includes("未獲聘用") && !infoRows.some((row) => String(row.value ?? "").includes("未獲聘用"))) {
      infoRows.push({ icon: "plus", label: "結果", value: "未獲聘用" });
    }
  }

  return {
    headerMeta,
    stats,
    review,
    reportsTitle,
    reports,
    reportsFooter: done.reportsFooter ?? "",
    previewCount: done.previewCount ?? 1,
    infoRows,
    ended,
    showContact: !ended && Boolean(assignment.contactPhone),
  };
}
