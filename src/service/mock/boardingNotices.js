/**
 * 寄宿通知 bottom sheets
 * Preview on /orders/CL52346-boarding?notice=extend|early|reschedule
 */
export const BOARDING_NOTICE_TYPES = ["extend", "early", "reschedule"];

export const boardingNotices = {
  extend: {
    type: "extend",
    illustration: "/icons/extend_time.svg",
    title: "客人已延長寄宿 1 晚",
    subtitle: "已自動確認，並已更新你的日曆",
    rows: [
      {
        icon: "pin",
        label: "新退房時間",
        detail: "10月6日（二）14:00 · 照常送返九龍灣",
      },
      {
        icon: "clock",
        label: "額外收入",
        detail: "+$408（寄宿 + 散步 1 晚，已扣平台費）",
      },
    ],
    action: "close",
    actionLabel: "查看訂單詳情",
  },
  early: {
    type: "early",
    illustration: "/icons/emergency.svg",
    title: "客人要求提早接回多多",
    subtitle: "寄宿第 2 晚 · 原因：行程提早結束",
    rows: [
      {
        icon: "pin",
        label: "接回安排",
        detail: "今日 · 盡快，客人到你住所接回",
      },
      {
        icon: "clock",
        label: "你的收入",
        detail: "按實際入住晚數計算",
      },
    ],
    action: "contact",
    actionLabel: "聯絡客人",
  },
  reschedule: {
    type: "reschedule",
    illustration: "/icons/leave.svg",
    title: "客人更改退房時間",
    subtitle: "已自動確認，並已更新你的日曆",
    rows: [
      {
        icon: "pin",
        label: "新退房時間",
        detail: "10月5日（一）11:00 · 原定 14:00",
      },
      {
        icon: "clock",
        label: "接送安排",
        detail: "11:00 前送返九龍灣 · 收入不變",
      },
    ],
    action: "close",
    actionLabel: "查看訂單詳情",
  },
};

/** @param {string | null | undefined} type */
export function getBoardingNotice(type) {
  if (!type) return null;
  return boardingNotices[type] ?? null;
}
