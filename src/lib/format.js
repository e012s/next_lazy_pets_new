export function money(amount) {
    const rounded = Math.round(amount);
    const sign = rounded < 0 ? "-" : "";
    const body = Math.abs(rounded)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${sign}$${body}`;
}

export function formatAmountInput(value) {
    const digits = String(value ?? "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function parseAmountInput(value) {
    const digits = String(value ?? "").replace(/\D/g, "");
    if (!digits) return NaN;
    return Number(digits);
}

const VISIT_WEEKDAY_ZH = ["日", "一", "二", "三", "四", "五", "六"];

export function formatVisitSchedule(dateSlash, startHHmm, endHHmm) {
    const match = String(dateSlash ?? "").trim().match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (!match || !startHHmm || !endHHmm) return "";
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const weekday = VISIT_WEEKDAY_ZH[new Date(year, month - 1, day).getDay()];
    return `${match[1]}/${match[2]}/${match[3]} 星期${weekday} · ${startHHmm} – ${endHHmm}`;
}
/** Join CSS class strings; skips falsy parts. */
export function classNames(...parts) {
    return parts.filter(Boolean).join(" ");
}
export function phone(value) {
    return value.replace(/(\d{4})(\d{4})/, "$1 $2");
}
function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
function sanitizeDobDigits(digits) {
    let d = digits.slice(0, 8);
    if (d.length >= 5 && d[4] > "1") {
        const monthLead = d[4];
        if (monthLead >= "2" && monthLead <= "9") {
            d = `${d.slice(0, 4)}0${monthLead}${d.slice(5)}`.slice(0, 8);
        }
        else {
            d = d.slice(0, 4);
        }
    }
    if (d.length >= 6) {
        const month = Number(d.slice(4, 6));
        if (month < 1 || month > 12)
            d = d.slice(0, 4);
    }
    if (d.length === 7) {
        const year = Number(d.slice(0, 4));
        const month = Number(d.slice(4, 6));
        const maxDay = daysInMonth(year, month);
        const dayLead = Number(d[6]);
        const maxLead = Math.min(3, Math.floor(maxDay / 10));
        if (dayLead < 0 || dayLead > maxLead)
            d = d.slice(0, 6);
    }
    if (d.length >= 8) {
        const year = Number(d.slice(0, 4));
        const month = Number(d.slice(4, 6));
        const day = Number(d.slice(6, 8));
        const maxDay = daysInMonth(year, month);
        if (day < 1 || day > maxDay)
            d = d.slice(0, 6);
    }
    return d;
}
/** Format typed digits as YYYY/MM/DD (max 8 digits). */
export function formatDobInput(value) {
    const digits = sanitizeDobDigits(String(value).replace(/\D/g, ""));
    if (digits.length <= 4)
        return digits;
    if (digits.length <= 6)
        return `${digits.slice(0, 4)}/${digits.slice(4)}`;
    return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}
export function validateDob(dob) {
    const match = String(dob).trim().match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (!match)
        return { ok: false, message: "請輸入完整出生日期（YYYY/MM/DD）。" };
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const maxYear = new Date().getFullYear();
    if (year < 1920 || year > maxYear)
        return { ok: false, message: "請輸入有效的出生年份。" };
    if (month < 1 || month > 12)
        return { ok: false, message: "月份須為 01–12。" };
    const maxDay = daysInMonth(year, month);
    if (day < 1 || day > maxDay)
        return { ok: false, message: `該月日期須為 01–${String(maxDay).padStart(2, "0")}。` };
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day)
        return { ok: false, message: "請輸入有效的出生日期。" };
    return { ok: true };
}
export function dobInputSuffix(digitCount) {
    if (digitCount <= 0)
        return "";
    if (digitCount <= 4)
        return "/MM/DD";
    if (digitCount === 5)
        return "M/DD";
    if (digitCount === 6)
        return "/DD";
    if (digitCount === 7)
        return "D";
    return "";
}
