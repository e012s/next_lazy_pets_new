const more = [
    ["inc-cl52280", "寄宿 2晚 · 豆豆", "9月3日", 275, 220, "boarding", "豆豆 · 柯基 · 兩晚寄宿，每日散步已完成。"],
    ["inc-cl52271", "散步 30分 · 黑糖", "9月4日", 225, 180, "walk", "黑糖 · 貴婦 · 30 分鐘慢步，有飲水。"],
    ["inc-cl52266", "上門照顧 · 米米", "9月5日", 325, 260, "visit", "米米 · 英短 · 上門餵食同清貓砂。"],
    ["inc-cl52260", "美容 局部 · 小型犬", "9月9日", 188, 150, "groom", "局部修剪腳毛同清耳朵。"],
    ["inc-cl52255", "寄宿 3晚 · 奶茶", "9月11日", 375, 300, "boarding", "奶茶 · 比熊 · 三晚，主人假期附加已計。"],
    ["inc-cl52248", "散步 60分 · 樂樂", "9月13日", 238, 190, "walk", "樂樂 · 唐狗 · 60 分鐘，精神良好。"],
    ["inc-cl52240", "上門照顧 · 布丁", "9月15日", 175, 140, "visit", "布丁 · 兔子 · 換水同檢查乾草。"],
    ["inc-cl52231", "美容 全套 · 貴婦", "9月18日", 250, 200, "groom", "全套洗剪，沒有皮膚紅腫。"],
    ["inc-cl52220", "散步 45分 · 芝麻", "9月21日", 155, 124, "walk", "芝麻 · 柴犬 · 45 分鐘，中途休息一次。"],
    ["inc-cl52211", "陪診 · 安安", "9月24日", 125, 100, "visit", "安安 · 貓 · 陪同覆診，已交回藥單。"],
].map(([id, title, when, orderAmount, payout, icon, summary]) => ({
    id: id,
    featured: false,
    icon: icon,
    title: title,
    meta: `${when} · 訂單 $${orderAmount}`,
    orderLabel: `訂單 $${orderAmount}`,
    orderAmount: orderAmount,
    payout: payout,
    status: "done",
    when: when,
    pet: title,
    summary: summary,
    payoutNote: "已計入 9 月結單，10月7日以 FPS 發放。",
}));
export const incomeRecords = [
    {
        id: "inc-cl52301",
        featured: true,
        icon: "walk",
        title: "散步 60分 • 多多",
        meta: "10月26日 • 訂單 $200",
        orderLabel: "訂單 $200",
        orderAmount: 200,
        payout: 160,
        status: "done",
        when: "10月26日",
        pet: "多多 · 柴犬 · 中型",
        summary: "散步 60 分鐘，精神良好，返屋企後有飲水。皮膚沒有抓到紅。",
        payoutNote: "已計入 10 月結單，11月7日以 FPS 發放。",
    },
    {
        id: "inc-cl52318",
        featured: true,
        icon: "groom",
        title: "美容 全套 • 中型犬",
        meta: "10月20日 • 訂單 $1,050",
        orderLabel: "訂單 $1,050",
        orderAmount: 1050,
        payout: 840,
        status: "done",
        when: "10月20日",
        pet: "金毛 · 中型 · 全套洗剪",
        summary: "全套洗剪完成，風筒用低溫。主人已確認可以交還。",
        payoutNote: "已計入 10 月結單，11月7日以 FPS 發放。",
    },
    {
        id: "inc-cl52346",
        featured: true,
        icon: "boarding",
        title: "寄宿 4晚 • 多多",
        meta: "10月1-5日 • 訂單 $2,420",
        orderLabel: "訂單 $2,420",
        orderAmount: 2420,
        payout: 1936,
        status: "pending",
        when: "10月1-5日",
        pet: "多多 · 柴犬 · 中型",
        summary: "寄宿 4 晚進行中，10月1日至10月5日。尚未完成全部住宿日，所以酬勞仍是待完成。",
        payoutNote: "未完成的日數未入帳，所以仍然是待完成。",
    },
    {
        id: "inc-cl52322",
        featured: false,
        icon: "visit",
        title: "上門照顧 · 貓貓波波",
        meta: "9月8日 · 訂單 $400（2次）",
        orderLabel: "訂單 $400（2次）",
        orderAmount: 400,
        payout: 320,
        status: "pending",
        when: "9月8日",
        pet: "波波 · 英短 · 兩次上門",
        summary: "第一次上門已完成。第二次尚未開始，所以酬勞仍是待完成。",
        payoutNote: "未完成的次數未入帳，所以仍然是待完成。",
    },
    ...more,
];
export const incomeSummary = {
    monthLabel: "10月已完成 • 11月7日發放",
    payout: 2864,
    doneCount: 12,
    pending: 1936,
    yearTotal: 24480,
    lastPayout: "2026/10/07 · $2,864",
    notice: "每月 7 號一次過 FPS 過數上月服務酬勞，唔使自己撳提款",
};
export const INCOME_STATEMENT_SAMPLE_PDF = "/samples/income-statement-sample.pdf";

export const historyMonths = [
    {
        id: "2026-10",
        title: "2026年10月",
        subtitle: "收入 $2,864 • 儲值金 +$300 / -$30",
        statement: "Lazy Pets 10月專家結單（預覽，未產生 PDF）\n收入 $2,864\n儲值金 +$300 / -$30\n9月服務酬勞已於 2026/10/07 以 FPS 過數",
        rows: [
            {
                id: "h-oct-q1",
                kind: "wallet",
                icon: "doc",
                title: "報價費 • 冷氣清洗",
                meta: "儲值金 • 10/12 14:20",
                amount: -30,
            },
            {
                id: "h-oct-pay",
                kind: "income",
                icon: "payout",
                title: "收入發放 • 9月服務酬勞",
                meta: "收入 • 10/07 FPS 過數 • 12 單",
                amount: 2864,
            },
            {
                id: "h-oct-top",
                kind: "wallet",
                icon: "topup",
                title: "增值 • 信用卡",
                meta: "儲值金 • 10/03 12:30",
                amount: 300,
            },
        ],
    },
    {
        id: "2026-09",
        title: "2026年9月",
        subtitle: "收入 $3,120 • 儲值金 -$90",
        statement: "Lazy Pets 9月專家結單（預覽，未產生 PDF）\n收入 $3,120\n儲值金 -$90\n8月服務酬勞已於 2026/09/07 以 FPS 過數",
        rows: [
            {
                id: "h-sep-q1",
                kind: "wallet",
                icon: "doc",
                title: "報價費 • 冷氣更換",
                meta: "儲值金 • 09/23 10:12",
                amount: -30,
            },
            {
                id: "h-sep-q2",
                kind: "wallet",
                icon: "doc",
                title: "報價費 • 更換食水喉",
                meta: "儲值金 • 09/10 18:40",
                amount: -30,
            },
            {
                id: "h-sep-pay",
                kind: "income",
                icon: "payout",
                title: "收入發放 • 8月服務酬勞",
                meta: "收入 • 09/07 FPS 過數 • 14 單",
                amount: 3120,
            },
        ],
    },
];
export function getIncome(id) {
    return incomeRecords.find((record) => record.id === id);
}
export function donePayoutTotal() {
    return incomeRecords
        .filter((record) => record.status === "done")
        .reduce((sum, record) => sum + record.payout, 0);
}
export function featuredIncomeRecords() {
    return incomeRecords.filter((record) => record.featured);
}
export const INCOME_TABS = [
    { id: "income", label: "收入" },
    { id: "wallet", label: "儲值金" },
    { id: "history", label: "過去紀錄" },
];
export const HISTORY_FILTERS = [
    { id: "all", label: "全部" },
    { id: "income", label: "收入" },
    { id: "wallet", label: "儲值金" },
];
export function normalizeIncomeTab(value) {
    return INCOME_TABS.some((item) => item.id === value) ? value : "income";
}
export function normalizeHistoryFilter(value) {
    return HISTORY_FILTERS.some((item) => item.id === value) ? value : "all";
}
