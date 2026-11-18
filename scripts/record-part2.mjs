import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";
const require = createRequire("/tmp/lazy-demo-rec/package.json");
const puppeteer = require("puppeteer-core");

const BASE = "http://127.0.0.1:4317";
const OUT = "/Users/ASUS/Documents/GitHub/lazy_pets_new/demo-out";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const W = 390, H = 844;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function visible(page, selector) {
  const out = [];
  for (const el of await page.$$(selector)) {
    if (await page.evaluate((e) => e.getBoundingClientRect().width > 0, el)) out.push(el);
  }
  return out;
}

async function clickText(page, text, { exact = false, timeout = 12000 } = {}) {
  await page.waitForFunction((t, ex) => {
    return Array.from(document.querySelectorAll("button, a, [role='tab']")).some((n) => {
      const s = (n.textContent || "").replace(/\s+/g, " ").trim();
      return (ex ? s === t : s.includes(t)) && !n.disabled && n.getClientRects().length > 0;
    });
  }, { timeout }, text, exact);
  await page.evaluate((t, ex) => {
    const el = Array.from(document.querySelectorAll("button, a, [role='tab']")).find((n) => {
      const s = (n.textContent || "").replace(/\s+/g, " ").trim();
      return (ex ? s === t : s.includes(t)) && !n.disabled && n.getClientRects().length > 0;
    });
    el.scrollIntoView({ block: "center" });
    el.click();
  }, text, exact);
  await sleep(400);
}

async function loginVerify(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(800);
  const phones = await visible(page, "input.phone-input-field");
  await phones[0].click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await phones[0].type("91234567", { delay: 35 });
  await sleep(350);
  await page.click("button.login-button");
  await page.waitForFunction(() => location.pathname.includes("verification"), { timeout: 20000 });
  await sleep(500);
  const boxes = await visible(page, "input.verification-input");
  for (let i = 0; i < 6; i++) {
    await boxes[i].click();
    await boxes[i].type(String(i + 1), { delay: 25 });
  }
  await page.waitForFunction(() => !location.pathname.includes("verification"), { timeout: 25000 });
  await sleep(900);
  console.log("landed", page.url());
}

async function dismiss(page) {
  await page.evaluate(() => {
    for (const sel of [
      'button[aria-label="關閉並返回尋找任務"]',
      'button[aria-label="關閉"]',
    ]) {
      document.querySelector(sel)?.click();
    }
    const b = Array.from(document.querySelectorAll("button")).find((x) =>
      /返回尋找任務|返回尋找/.test(x.textContent || ""),
    );
    b?.click();
  });
  await sleep(500);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: W, height: H, deviceScaleFactor: 2 },
    args: [`--window-size=${W},${H}`, "--lang=zh-HK"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);

  const frameDir = path.join(OUT, "frames2b");
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const client = await page.createCDPSession();
  let i = 0;
  const meta = [];
  client.on("Page.screencastFrame", async (frame) => {
    const file = path.join(frameDir, `f${String(i++).padStart(5, "0")}.jpg`);
    fs.writeFileSync(file, Buffer.from(frame.data, "base64"));
    meta.push({ file, ts: Date.now() });
    try { await client.send("Page.screencastFrameAck", { sessionId: frame.sessionId }); } catch {}
  });
  await client.send("Page.startScreencast", {
    format: "jpeg", quality: 72, everyNthFrame: 1, maxWidth: W * 2, maxHeight: H * 2,
  });

  try {
    await loginVerify(page);
    await page.waitForFunction(() => document.body.innerText.includes("全部服務"), { timeout: 20000 });
    await sleep(900);

    await clickText(page, "全部服務"); await sleep(800);
    await clickText(page, "維修", { exact: true }); await sleep(1000);
    await clickText(page, "寵物", { exact: true }); await sleep(1000);
    await clickText(page, "全部服務"); await sleep(800);

    // repair detail
    await page.evaluate(() => {
      Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").includes("查看訂單詳情") && b.getClientRects().length)?.click();
    });
    await sleep(2000);
    if (await page.$('button[aria-label="返回"]')) await page.click('button[aria-label="返回"]');
    else await page.goBack().catch(() => {});
    await sleep(900);

    // repair quote
    await clickText(page, "全部服務").catch(() => {});
    await sleep(400);
    await page.evaluate(() => {
      for (const a of document.querySelectorAll("article")) {
        if (/報價費|客人預算/.test(a.textContent || "")) {
          Array.from(a.querySelectorAll("button")).find((b) => (b.textContent || "").trim() === "接單")?.click();
          return;
        }
      }
    });
    await sleep(1000);
    await page.waitForFunction(() => /提交報價|提供報價/.test(document.body.innerText), { timeout: 10000 }).catch(() => {});
    for (const inp of await page.$$("input")) {
      const ok = await page.evaluate((el) => el.offsetParent && (el.inputMode === "numeric" || el.inputMode === "decimal"), inp);
      if (ok) { await inp.click({ clickCount: 3 }); await inp.type("680", { delay: 20 }); break; }
    }
    await sleep(300);
    await clickText(page, "提交報價").catch(() => {});
    await sleep(1800);
    await dismiss(page);

    // pet detail + accept
    await clickText(page, "寵物", { exact: true }); await sleep(800);
    await page.evaluate(() => {
      Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").includes("查看訂單詳情") && b.getClientRects().length)?.click();
    });
    await sleep(2000);
    if (await page.$('button[aria-label="返回"]')) await page.click('button[aria-label="返回"]');
    else await page.goBack().catch(() => {});
    await sleep(800);

    await clickText(page, "寵物", { exact: true }).catch(() => {});
    await sleep(400);
    await page.evaluate(() => {
      Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").trim() === "接單" && b.getClientRects().length)?.click();
    });
    await sleep(2000);
    await dismiss(page);

    // Top-up: show home all-tab, click +增值 (fallback navigate)
    await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
    await sleep(1000);
    await clickText(page, "全部服務").catch(() => {});
    await sleep(700);
    const hasTopUp = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button")).some((b) => (b.textContent || "").replace(/\s+/g, " ").trim() === "+ 增值" && b.getClientRects().length > 0),
    );
    console.log("hasTopUp", hasTopUp);
    if (hasTopUp) {
      await page.evaluate(() => {
        Array.from(document.querySelectorAll("button")).find((x) => (x.textContent || "").replace(/\s+/g, " ").trim() === "+ 增值")?.click();
      });
    }
    try {
      await page.waitForFunction(() => location.pathname.includes("topup") || document.body.innerText.includes("選擇增值金額"), { timeout: 8000 });
    } catch {
      await page.goto(`${BASE}/balance/topup`, { waitUntil: "networkidle2" });
    }
    await sleep(1300);
    await clickText(page, "下一步");
    await page.waitForFunction(() => location.pathname.includes("pay") || document.body.innerText.includes("確認付款"), { timeout: 15000 });
    await sleep(1200);
    // agree terms
    await page.evaluate(() => {
      const box = document.querySelector('button[role="checkbox"]');
      if (box && box.getAttribute("aria-checked") !== "true") box.click();
    });
    await sleep(500);
    await page.evaluate(() => {
      Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").includes("確認付款") && b.getClientRects().length)?.click();
    });
    await page.waitForFunction(() => location.pathname.includes("success") || /增值成功|成功/.test(document.body.innerText), { timeout: 15000 });
    await sleep(2800);
    console.log("part2 done", page.url(), (await page.evaluate(() => document.body.innerText)).slice(0, 120));
  } finally {
    try { await client.send("Page.stopScreencast"); } catch {}
    await sleep(300);
    await browser.close();
  }

  if (meta.length < 2) throw new Error("no frames");
  const listPath = path.join(frameDir, "concat.txt");
  const lines = [];
  for (let j = 0; j < meta.length; j++) {
    const dur = j < meta.length - 1 ? Math.max(0.05, (meta[j + 1].ts - meta[j].ts) / 1000) : 0.7;
    lines.push(`file '${meta[j].file}'`);
    lines.push(`duration ${dur.toFixed(3)}`);
  }
  lines.push(`file '${meta[meta.length - 1].file}'`);
  fs.writeFileSync(listPath, lines.join("\n"));
  const outMp4 = path.join(OUT, "part2-tasks-topup.mp4");
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -vf "scale=780:1688:flags=lanczos,fps=30" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${outMp4}"`, { stdio: "inherit" });
  console.log("WROTE", outMp4, meta.length);
})().catch((e) => { console.error(e); process.exit(1); });
