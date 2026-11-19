#!/usr/bin/env node
/**
 * Static export into `out/` for Capacitor (local pages only).
 * Temporarily moves Route Handlers out of `src/app` — they are incompatible with `output: "export"`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "src/app/api");
const stashDir = path.join(root, ".cap-build-stash");
const stashedApi = path.join(stashDir, "api");

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function stashApiRoutes() {
  rmrf(stashDir);
  fs.mkdirSync(stashDir, { recursive: true });
  if (!fs.existsSync(apiDir)) {
    console.warn("[build:cap] src/app/api missing — skip stash");
    return false;
  }
  fs.renameSync(apiDir, stashedApi);
  return true;
}

function restoreApiRoutes(stashed) {
  if (!stashed || !fs.existsSync(stashedApi)) return;
  rmrf(apiDir);
  fs.renameSync(stashedApi, apiDir);
  rmrf(stashDir);
}

const stashed = stashApiRoutes();

const buildEnv = {
  ...process.env,
  CAPACITOR_STATIC_EXPORT: "1",
};

console.log("[build:cap] next build (output: export)…");
const build = spawnSync("npx", ["next", "build"], {
  cwd: root,
  env: buildEnv,
  stdio: "inherit",
});

restoreApiRoutes(stashed);

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

console.log("[build:cap] npx cap sync…");
const sync = spawnSync("npx", ["cap", "sync"], {
  cwd: root,
  env: buildEnv,
  stdio: "inherit",
});

process.exit(sync.status ?? 0);