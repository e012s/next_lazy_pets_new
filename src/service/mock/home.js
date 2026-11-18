export const homeExpert = {
  displayName: "陳師傅",
  acceptingOrders: true,
};

/** @typedef {{ id: string; orderId: string; unread?: boolean; icon: string; title: string; detail: string }} HomePendingItem */

export const homePending = [
  {
    id: "msg-1",
    orderId: "CL52345",
    unread: true,
    icon: "message",
    title: "客人傳來新訊息",
    detail: "寵物散步 · 多多 · 5 分鐘前",
  },
  {
    id: "reschedule-1",
    orderId: "CL52380",
    unread: true,
    icon: "calendar",
    title: "客人要求更改時間",
    detail: "冷氣更換 #CL52380 · 改至 11/01 10:00",
  },
  {
    id: "log-1",
    orderId: "CL52360",
    unread: false,
    icon: "log",
    title: "今日日誌未更新",
    detail: "寄宿 · 波波 · 今晚 22:00 前",
  },
];

export const homePendingTotal = 5;

export const homeUpcoming = [
  {
    id: "CL52345",
    orderId: "CL52345",
    status: "in_progress",
    schedule: "今日 09:00 – 10:00",
    badge: "進行中 23:41",
    badgeTone: "progress",
    kind: "walk",
    title: "寵物散步 60分鐘",
    subtitle: "多多 · 柴犬 · #CL52345",
    place: "九龍灣宏開道8號 12樓B",
    contactName: "王小姐",
    contactPhone: "9123123123",
    detailLabel: "查看訂單詳情",
  },
  {
    id: "CL52380",
    orderId: "CL52380",
    status: "accepted",
    schedule: "明日 14:00 – 16:00",
    badge: "已接單",
    badgeTone: "muted",
    kind: "ac",
    title: "冷氣更換",
    subtitle: "維修 · #CL52380",
    place: "沙田 · 約 3.2km",
    contactName: "李先生",
    contactPhone: "9123123123",
    detailLabel: "查看訂單詳情",
  },
];

export const homeUpcomingTotal = 4;
