# Lazy Pets 專家

Mobile expert app for Lazy Pets. One account covers 寵物 and 維修: find tasks, accept a pet job, quote a repair, file a report, check income, and top up stored value for quote fees. Copy is Traditional Chinese. Data is hardcoded in `src/data/mock`. There is no API.

The column is 390px wide. Brand colour is `#0091b2`.

Type tokens live in `src/app/type-tokens.css` (`text-nav`, `text-title`, `text-body`, `text-caption`, `text-micro`, `text-chip`, `text-field`, `text-amount`, `text-display`). Each utility sets size, line-height, and letter-spacing `0`; `@theme` in `globals.css` points at those variables. Edit `type-tokens.css` and save — no Tailwind rebuild needed. Weight stays on the element: 300 for the verify prompt, 400 body, 500 titles and the login button, 700 for the balance figure and the resend button. Auth sizes use the `--type-auth-*` variables in the same file.

Icons live in `public/icons/` with stable filenames (for example `apply-pet.svg`, `pet-walk.svg`). `src/icons/sources.js` maps each key to a path; `src/components/Icons.jsx` renders them with `img`. When you add or replace an asset, drop the file in `public/icons/` and update `sources.js` if the filename changes.

Pack or sync icons by merging. Unzip with `unzip -n` (skip existing files) or `rsync -a` without `--delete`, so a file that exists only on one side is kept. A fresh project zip includes every file under `public/icons/`, including `_user_saved/`.

## Layout

分层说明（类比家政预约 App、无 CMS）：见 [`docs/layers.md`](docs/layers.md)。

| 层 | Path | What lives here |
| --- | --- | --- |
| 路由壳 | `src/app` | App Router: `(main)` / `(auth)` / `api/`。只挂路由与 metadata，屏幕从 `src/page` 引入。 |
| 页面 / 流程 | `src/page` | 整屏 UI：找任务、订单、收入、钱包、申请、维修等。 |
| 组件 | `src/components` | 共享块：导航、卡片、报告表单、订单块等，不是整屏。 |
| **service**（目标） | `src/service` + 现 `src/data/mock` + 部分 `src/lib` | 订单/任务/支付/入驻等业务与 mock；从 `lib` 迁出的 `*Model`、`*Review`、筛选规则等。目录渐进建立，见 `docs/layers.md`。 |
| **lib** | `src/lib` | 薄基础设施：`navigation`、`frame`、Axios、会话同步、`format` 等，不含订单业务规则。 |
| **state** | `src/context`（可更名 `src/state`） | 登录会话、`MyOrders` Tab 等客户端状态。 |
| 服务端边界 | `src/server` | HttpOnly 会话、mock expert API；调用方在 `app/api`。 |

## Run locally

```bash
npm install
npm run dev
```

## iOS / Android (Capacitor)

App 内嵌 `out/` 静态页，API 直连 workspace（与 f7 工程相同），**不需要**配置远程 WebView 地址。

```bash
npm run build:cap
npx cap open ios
# 或
npx cap open android
```

浏览器开发仍用 `npm run dev`（走本机 `/api` BFF）。Workers 部署仍用 `npm run build:cf`。

## Cloudflare Workers (Next + OpenNext)

仓库已包含 `wrangler.jsonc`（Worker 名 **`next-lazy-pets-new`**，须与 Dashboard 里 Worker 名称一致）。

**Workers → Settings → Builds**（二选一，不要用 `npm run build` 当 Cloudflare 的 Build command）：

| 方案 | Build command | Deploy command |
| --- | --- | --- |
| A（推荐） | `npm run build:cf` | `npx wrangler deploy` |
| B（一步） | 留空 / `true` | `npm run cf:ci` |

`npm run build` 只做 `next build`，不会产生 `.open-next/`。若 Deploy 报 **`Could not find compiled Open Next config`**，把 Build 改成 **`npm run build:cf`**。

Worker 名须与 `wrangler.jsonc` 的 `name` / `WORKER_SELF_REFERENCE.service` 一致（当前：`next-lazy-pets-new`）。

Open [http://127.0.0.1:4317/login](http://127.0.0.1:4317/login). A visit to `/` with no session is sent to login. The header menu reaches every screen once the expert is signed in and registered. Pet and repair chips also jump between the two find-task lists.

```bash
npm run lint
npm run build
```

## Routes

| Path                            | Screen                                 |
| ------------------------------- | -------------------------------------- |
| `/login`                        | 登入/註冊（電話 +852）                 |
| `/verification?phone=`          | 6 位短訊驗證碼                         |
| `/`                             | 尋找任務（預設全部服務；Tab 在頁內切換） |
| `/tasks/CL52345`                | 寵物訂單詳情                           |
| `/tasks/CL52346`                | 寄宿訂單詳情                           |
| `/tasks/CL52345/accepted`       | 已成功接單                             |
| `/orders`                       | 寵物我的訂單                           |
| `/orders/CL52345`               | 進行中訂單                             |
| `/orders/CL52301`               | 已完成訂單詳情                         |
| `/orders/CL52345/report`        | 寵物提交報告                           |
| `/orders/[id]/map`              | 地圖                                   |
| `/repair`                       | 維修尋找任務                           |
| `/repair/CL52345`               | 維修訂單詳情                           |
| `/repair/CL52345/quote`         | 提供報價                               |
| `/repair/CL52345/quote/low`     | 報價時餘額不足                         |
| `/repair/orders`                | 維修我的訂單                           |
| `/repair/orders/CL52380/report` | 維修提交報告                           |
| `/repair/orders/done`           | 維修已完成                             |
| `/income`                       | 我的收入                               |
| `/income/inc-cl52301`           | 收入明細                               |
| `/balance`                      | 儲值金餘額同紀錄                       |
| `/balance/topup`                | 增值儲值金                             |
| `/balance/pay`                  | 付款方式                               |
| `/balance/success`              | 增值成功                               |
| `/apply/role`                   | 你最主要做什麼（寵物或維修，兩邊共用） |
| `/apply`                        | 寵物申請成為專家                       |
| `/apply/repair`                 | 維修申請成為專家                       |
| `/apply/submitted`              | 申請已提交                             |

Login and the verify-code screen are shared. Two mock numbers are accepted; any other 8-digit number is rejected on 登入/註冊. Any 6-digit code works for those two numbers only. Verify signs the phone in. It does not by itself finish registration.

The browser never stores the session token in JavaScript. Verify and registration go through route handlers, which set HttpOnly cookies and call the mock expert API with `Authorization: Bearer <token>`.

| Cookie          | Flags                            | Meaning                                                               |
| --------------- | -------------------------------- | --------------------------------------------------------------------- |
| `lp_session`    | `HttpOnly; Secure; SameSite=Lax` | Signed bearer token for the signed-in phone. 登出 clears it.          |
| `lp_registered` | `HttpOnly; Secure; SameSite=Lax` | Signed list of phones that submitted apply. Logout does not clear it. |

| Method | Path                 | Body                  | Result                                                                                       |
| ------ | -------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/verify`   | `{ "phone", "code" }` | Sets `lp_session`. Returns `{ ok, registered, role, next }` and no token. Origin must match. |
| `GET`  | `/api/auth/session`  |                       | `{ authenticated, phone, role, registered, next }` or `{ authenticated: false }`.            |
| `POST` | `/api/auth/register` |                       | Marks the signed-in phone registered. Origin must match.                                     |
| `POST` | `/api/auth/logout`   |                       | Clears `lp_session`. Origin must match.                                                      |

Both phones start unregistered. A write without a matching `Origin` is rejected.

| Visit                                   | Result                                                  |
| --------------------------------------- | ------------------------------------------------------- |
| No session, `/` or any other app screen | `/login`                                                |
| Signed in, not registered, `/`          | `/apply/role`（你最主要做什麼）. Both phones.           |
| On that page, 寵物服務 then 下一步      | `/apply`                                                |
| On that page, 維修安裝服務 then 下一步  | `/apply/repair`                                         |
| Signed in and registered, `/`           | 尋找任務                                                |
| Signed in, open `/login` again          | Same decision as `/`, without asking for the code again |

The login button is `#01d3ea` and the verify screen is `#212429`, matching the cleaner auth screens. The rest of the app stays `#0091b2`.

Demo: open `/` and sign in as `91234567` with any 6-digit code. Verify lands on 你最主要做什麼, the same page as `98765432`. Pick 寵物服務 to open the pet form, or 維修安裝服務 to open the repair form. Submit that form, then open `/` to see 尋找任務. 登出, sign in as the same phone again, and verify lands on 尋找任務. The other phone stays unregistered until its own form is submitted.

Pet jobs are fixed price and do not deduct stored value. Repair quotes charge a $30 fee after the customer reviews the quote. The sample wallet balance is $170. Top-up amounts are $100 / $300 / $500 / $1,000. Code `LAZY50` adds $50 on $300 or more, so $300 becomes a $520 balance on the success screen.

## Copy onto a Mac

```bash
git clone https://origin.cursor.com/git/e012s-e012s/tmp-30852e5660fc3cf7.git /Users/ASUS/Documents/GitHub/lazy_pets_new
cd /Users/ASUS/Documents/GitHub/lazy_pets_new
npm install
npm run dev
```
