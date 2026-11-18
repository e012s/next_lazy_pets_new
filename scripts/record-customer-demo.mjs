import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { createRequire } from "module";

const require = createRequire("/tmp/lazy-demo-rec/package.json");
const puppeteer = require("puppeteer-core");

const BASE = "http://127.0.0.1:4317";
const ROOT = "/Users/ASUS/Documents/GitHub/lazy_pets_new";
const OUT = path.join(ROOT, "demo-out");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const UPLOAD = path.join(OUT, "upload.png");
const W = 390;
const H = 844;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sleepSync = (ms) => execSync(`python3 -c "import time; time.sleep(${ms / 1000})"`);

function restartDevServer() {
  try {
    const out = execSync("lsof -tiTCP:4317 -sTCP:LISTEN", { encoding: "utf8" }).trim();
    for (const pid of out.split(/\s+/).filter(Boolean)) {
      try { process.kill(Number(pid), "SIGTERM"); } catch {}
    }
  } catch {}
  sleepSync(1800);
  const log = path.join(OUT, "dev-server.log");
  const child = spawn("npm", ["run", "dev"], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", fs.openSync(log, "a"), fs.openSync(log, "a")],
    env: { ...process.env },
  });
  child.unref();
  for (let i = 0; i < 90; i++) {
    try {
      execSync("curl -sf -o /dev/null http://127.0.0.1:4317/login", { stdio: "ignore" });
      console.log("dev server ready");
      return;
    } catch { sleepSync(500); }
  }
  throw new Error("dev server failed to start");
}

async function launch() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: W, height: H, deviceScaleFactor: 2 },
    args: [`--window-size=${W},${H}`, "--no-first-run", "--disable-notifications", "--lang=zh-HK"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  page.setDefaultTimeout(30000);
  return { browser, page };
}

async function visible(page, selector) {
  const out = [];
  for (const el of await page.$$(selector)) {
    if (await page.evaluate((e) => {
      const r = e.getBoundingClientRect();
      const st = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none";
    }, el)) out.push(el);
  }
  return out;
}

async function startCapture(page, frameDir) {
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
  return {
    meta,
    async stop() {
      try { await client.send("Page.stopScreencast"); } catch {}
      await sleep(300);
    },
  };
}

function encodeVideo(frameDir, meta, outMp4) {
  if (meta.length < 2) throw new Error("too few frames " + frameDir);
  const listPath = path.join(frameDir, "concat.txt");
  const lines = [];
  for (let i = 0; i < meta.length; i++) {
    const dur = i < meta.length - 1 ? Math.max(0.05, (meta[i + 1].ts - meta[i].ts) / 1000) : 0.7;
    lines.push(`file '${meta[i].file}'`);
    lines.push(`duration ${dur.toFixed(3)}`);
  }
  lines.push(`file '${meta[meta.length - 1].file}'`);
  fs.writeFileSync(listPath, lines.join("\n"));
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listPath}" -vf "scale=${W * 2}:${H * 2}:flags=lanczos,fps=30" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${outMp4}"`,
    { stdio: "inherit" },
  );
}

async function clickText(page, text, { exact = false } = {}) {
  await page.waitForFunction((t, ex) => {
    return Array.from(document.querySelectorAll("button, a, [role='tab']")).some((n) => {
      const s = (n.textContent || "").replace(/\s+/g, " ").trim();
      return (ex ? s === t : s.includes(t)) && !n.disabled && n.getClientRects().length > 0;
    });
  }, {}, text, exact);
  await page.evaluate((t, ex) => {
    const el = Array.from(document.querySelectorAll("button, a, [role='tab']")).find((n) => {
      const s = (n.textContent || "").replace(/\s+/g, " ").trim();
      return (ex ? s === t : s.includes(t)) && !n.disabled && n.getClientRects().length > 0;
    });
    el.scrollIntoView({ block: "center" });
    el.click();
  }, text, exact);
  await sleep(450);
}

async function loginVerify(page, phone) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(900);
  const phones = await visible(page, "input.phone-input-field");
  if (!phones.length) throw new Error("no phone field");
  await phones[0].click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await phones[0].type(phone, { delay: 45 });
  await sleep(500);
  await page.waitForFunction(() => {
    const b = document.querySelector("button.login-button");
    return b && !b.disabled;
  }, { timeout: 10000 });
  await page.click("button.login-button");
  try {
    await page.waitForFunction(() => location.pathname.includes("verification"), { timeout: 12000 });
  } catch {
    await page.click("button.login-button");
    await page.waitForFunction(() => location.pathname.includes("verification"), { timeout: 15000 });
  }
  await sleep(700);
  const boxes = await visible(page, "input.verification-input");
  if (boxes.length < 6) throw new Error("otp boxes " + boxes.length);
  for (let i = 0; i < 6; i++) {
    await boxes[i].click();
    await boxes[i].type(String(i + 1), { delay: 35 });
  }
  await page.waitForFunction(() => !location.pathname.includes("verification"), { timeout: 25000 });
  await sleep(1100);
  console.log("after verify", page.url());
}

async function logoutViaMenu(page) {
  await sleep(400);
  await page.click('button[aria-label="開啟選單"]');
  await sleep(800);
  await clickText(page, "登出", { exact: true });
  await page.waitForFunction(() => location.pathname.includes("login"), { timeout: 15000 });
  await sleep(900);
}

async function fillApplyWithErrorThenSubmit(page) {
  await page.waitForFunction(() => document.body.innerText.includes("你最主要做什麼"), { timeout: 25000 });
  await sleep(1000);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find(
      (x) => /寵物服務/.test(x.textContent || "") && x.querySelector("img") && x.getClientRects().length,
    );
    if (b) b.click();
  });
  await sleep(700);
  await clickText(page, "下一步");
  await page.waitForFunction(() => document.body.innerText.includes("出生日期"), { timeout: 20000 });
  await sleep(1200);

  for (const y of [200, 450, 750]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(650);
  }

  // intentional error: empty DOB
  await page.evaluate(() => window.scrollTo(0, 99999));
  await sleep(400);
  await page.evaluate(() => document.querySelector("button[type=submit]")?.click());
  await sleep(1000);
  await page.evaluate(() => document.querySelector("[role=alert]")?.scrollIntoView({ block: "center" }));
  await sleep(1800);
  console.log("error", await page.evaluate(() => document.querySelector("[role=alert]")?.textContent));

  // fill DOB
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  const dob = (await visible(page, 'input[autocomplete="bday"]'))[0];
  await dob.click();
  await page.keyboard.type("19900115", { delay: 40 });
  await sleep(400);

  // deselect boarding (default on), select 寵物服務
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button")).filter((b) => b.getClientRects().length);
    const board = btns.find((b) => (b.textContent || "").includes("寄宿服務") && /bg-\[#0091b2\]/.test(b.className || ""));
    if (board) board.click();
  });
  await sleep(350);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button")).filter((b) => b.getClientRects().length);
    const pet = btns.find((b) => (b.textContent || "").trim() === "寵物服務");
    if (pet && !/bg-\[#0091b2\]/.test(pet.className || "")) pet.click();
  });
  await sleep(400);

  // upload ID (and any other file inputs)
  for (const f of await page.$$('input[type="file"]')) {
    try { await f.uploadFile(UPLOAD); await sleep(120); } catch {}
  }
  await sleep(700);

  await page.evaluate(() => window.scrollTo(0, 99999));
  await sleep(400);
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="同意條款"]');
    if (b) b.click();
  });
  await sleep(500);
  await page.evaluate(() => document.querySelector("button[type=submit]")?.click());
  await page.waitForFunction(() => location.pathname.includes("submitted"), { timeout: 25000 });
  await sleep(2200);
  console.log("submitted", page.url());
}

async function flowRegistered(page) {
  await page.waitForFunction(
    () => document.body.innerText.includes("全部服務") || document.body.innerText.includes("儲值金"),
    { timeout: 25000 },
  );
  await sleep(1200);

  await clickText(page, "全部服務");
  await sleep(900);
  await clickText(page, "維修", { exact: true });
  await sleep(1100);
  await clickText(page, "寵物", { exact: true });
  await sleep(1100);
  await clickText(page, "全部服務");
  await sleep(900);

  // repair detail
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").includes("查看訂單詳情") && b.getClientRects().length,
    );
    if (btn) btn.click();
  });
  await sleep(2200);
  if (await page.$('button[aria-label="返回"]')) await page.click('button[aria-label="返回"]');
  else await page.goBack().catch(() => {});
  await sleep(1000);

  // repair accept / quote
  await clickText(page, "全部服務").catch(() => {});
  await sleep(500);
  await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll("article"));
    for (const a of articles) {
      if (/報價費|客人預算/.test(a.textContent || "")) {
        const btn = Array.from(a.querySelectorAll("button")).find((b) => (b.textContent || "").trim() === "接單");
        if (btn) { btn.click(); return; }
      }
    }
  });
  await sleep(1200);
  await page.waitForFunction(() => document.body.innerText.includes("提交報價") || document.body.innerText.includes("提供報價"), { timeout: 10000 }).catch(() => {});
  await sleep(500);
  // fill quote amount
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input")).filter((i) => i.offsetParent !== null);
    const target = inputs.find((i) => i.inputMode === "numeric" || i.inputMode === "decimal") || inputs[0];
    if (!target) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(target, "680");
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
  });
  for (const inp of await page.$$("input")) {
    const ok = await page.evaluate((el) => el.offsetParent && (el.inputMode === "numeric" || el.inputMode === "decimal"), inp);
    if (ok) { await inp.click({ clickCount: 3 }); await inp.type("680", { delay: 25 }); break; }
  }
  await sleep(400);
  await clickText(page, "提交報價").catch(() => {});
  await sleep(2000);
  await page.evaluate(() => {
    const b =
      document.querySelector('button[aria-label="關閉並返回尋找任務"]') ||
      document.querySelector('button[aria-label="關閉"]') ||
      Array.from(document.querySelectorAll("button")).find((x) => /返回尋找|完成/.test(x.textContent || "") && x.getClientRects().length);
    if (b) b.click();
  });
  await sleep(1000);

  // pet detail + accept
  await clickText(page, "寵物", { exact: true });
  await sleep(1000);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").includes("查看訂單詳情") && b.getClientRects().length,
    );
    if (btn) btn.click();
  });
  await sleep(2200);
  if (await page.$('button[aria-label="返回"]')) await page.click('button[aria-label="返回"]');
  else await page.goBack().catch(() => {});
  await sleep(1000);

  await clickText(page, "寵物", { exact: true }).catch(() => {});
  await sleep(600);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim() === "接單" && b.getClientRects().length,
    );
    if (btn) btn.click();
  });
  await sleep(2200);
  await page.evaluate(() => {
    const b =
      document.querySelector('button[aria-label="關閉並返回尋找任務"]') ||
      document.querySelector('button[aria-label="關閉"]') ||
      Array.from(document.querySelectorAll("button")).find((x) => /返回尋找/.test(x.textContent || "") && x.getClientRects().length);
    if (b) b.click();
  });
  await sleep(1000);

  // top-up
  await clickText(page, "全部服務").catch(() => {});
  await sleep(700);
  await clickText(page, "+ 增值");
  await page.waitForFunction(() => document.body.innerText.includes("選擇增值金額"), { timeout: 15000 });
  await sleep(1400);
  await clickText(page, "下一步");
  await page.waitForFunction(() => document.body.innerText.includes("確認付款"), { timeout: 15000 });
  await sleep(1500);
  await clickText(page, "確認付款");
  await page.waitForFunction(() => /成功/.test(document.body.innerText) || location.pathname.includes("success"), { timeout: 15000 });
  await sleep(2800);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  try {
    restartDevServer();
    let { browser, page } = await launch();
    let frameDir = path.join(OUT, "frames1");
    fs.rmSync(frameDir, { recursive: true, force: true });
    let cap = await startCapture(page, frameDir);
    try {
      await loginVerify(page, "91234567");
      await fillApplyWithErrorThenSubmit(page);
      await logoutViaMenu(page);
      await loginVerify(page, "91234567");
      await sleep(1600);
    } finally {
      await cap.stop();
      await browser.close();
    }
    encodeVideo(frameDir, cap.meta, path.join(OUT, "part1-register.mp4"));

    restartDevServer();
    ({ browser, page } = await launch());
    frameDir = path.join(OUT, "frames2");
    fs.rmSync(frameDir, { recursive: true, force: true });
    cap = await startCapture(page, frameDir);
    try {
      await loginVerify(page, "91234567");
      await flowRegistered(page);
    } finally {
      await cap.stop();
      await browser.close();
    }
    encodeVideo(frameDir, cap.meta, path.join(OUT, "part2-tasks-topup.mp4"));

    const list = path.join(OUT, "all.txt");
    fs.writeFileSync(
      list,
      `file '${path.join(OUT, "part1-register.mp4")}'\nfile '${path.join(OUT, "part2-tasks-topup.mp4")}'\n`,
    );
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${list}" -c copy "${path.join(OUT, "lazy-pets-customer-demo.mp4")}"`,
      { stdio: "inherit" },
    );
    console.log("DONE", path.join(OUT, "lazy-pets-customer-demo.mp4"));
  } finally {
    try { restartDevServer(); } catch (e) { console.warn("restore restart", e.message); }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
