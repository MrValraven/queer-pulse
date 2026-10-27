#!/usr/bin/env node
/**
 * `pnpm dev:doctor`: a read-only health check of a local frontend checkout.
 *
 * Every check prints one line (`ok`, `warn`, `fail` or `info`), and every
 * `warn` / `fail` carries a one-line fix underneath. The process exits 1 when
 * any check fails, so `pnpm dev:setup` (and a curious human) can tell a broken
 * checkout from a merely unusual one.
 *
 * READ-ONLY BY CONTRACT: nothing here writes a file, installs a package, binds
 * a port or starts a server. The port check is a single connect attempt; the
 * backend check is one GET with a 2 second timeout; the pnpm probe has a
 * 5 second timeout. Secrets are never printed: env values are only ever
 * reported as "set" or "empty", with VITE_API_URL (a public origin) and the
 * backend's FRONTEND_URL allowlist as the only values echoed back.
 *
 * Node built-ins only, so it runs before `pnpm install` has ever happened.
 * dev-setup.mjs imports the version helpers below, which is why the checks only
 * run when this file is executed directly.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { connect } from "node:net";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(scriptDirectory, "..");
export const BACKEND_ROOT = resolve(PROJECT_ROOT, "../queerpulse-backend");
export const MINIMUM_NODE_VERSION = "24.0.0";
export const DEV_SERVER_PORT = 5173;
export const DEV_SERVER_ORIGIN = `http://localhost:${DEV_SERVER_PORT}`;
export const BACKEND_CLONE_COMMAND =
  "git clone https://github.com/MrValraven/queerpulse-backend.git ../queerpulse-backend";

const BACKEND_TIMEOUT_MS = 2000;
const PORT_PROBE_TIMEOUT_MS = 500;
const PNPM_PROBE_TIMEOUT_MS = 5000;

// Vite's dev-mode load order: later files win, and a VITE_* var already in
// process.env beats every file.
const ENV_FILES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.development.local",
];

/** "22.11.0" -> [22, 11, 0]; anything unparsable becomes zeros. */
export function parseVersion(versionText) {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(versionText ?? "");
  return match ? match.slice(1, 4).map(Number) : [0, 0, 0];
}

/** Negative when `left` is older than `right`, 0 when equal, positive when newer. */
export function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] - rightParts[index];
    }
  }
  return 0;
}

/** The pnpm version pinned by package.json `packageManager`, e.g. "9.15.0". */
export function readPinnedPnpmVersion() {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(PROJECT_ROOT, "package.json"), "utf8"),
    );
    const match = /^pnpm@(\d+\.\d+\.\d+)/.exec(
      packageJson.packageManager ?? "",
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * The pnpm that will actually run here: `{ version }` on success, or
 * `{ errorReason }` naming why it could not be read. Under `pnpm <script>` the
 * user agent already names it, which skips spawning a second pnpm.
 */
export function detectPnpmVersion() {
  const userAgentMatch = /^pnpm\/(\d+\.\d+\.\d+)/.exec(
    process.env.npm_config_user_agent ?? "",
  );
  if (userAgentMatch) return { version: userAgentMatch[1] };
  try {
    const output = execFileSync("pnpm", ["--version"], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      timeout: PNPM_PROBE_TIMEOUT_MS,
      stdio: ["ignore", "pipe", "ignore"],
      shell: process.platform === "win32",
      // Corepack would otherwise stop and ask before downloading the pinned pnpm.
      env: { ...process.env, COREPACK_ENABLE_DOWNLOAD_PROMPT: "0" },
    });
    return { version: output.trim() };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { errorReason: "pnpm is not on PATH" };
    }
    if (error.code === "ETIMEDOUT" || error.signal === "SIGTERM") {
      return {
        errorReason: `pnpm --version did not answer within ${PNPM_PROBE_TIMEOUT_MS / 1000}s (corepack may be waiting to download pnpm)`,
      };
    }
    return {
      errorReason: `pnpm --version exited with status ${error.status ?? "unknown"}`,
    };
  }
}

/** Parses dotenv text into a Map. Quotes are stripped; `#` starts a comment. */
export function parseEnvText(envText) {
  const values = new Map();
  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(
      line,
    );
    if (!match) continue;
    let value = match[2];
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.lastIndexOf(quote) > 0) {
      value = value.slice(1, value.lastIndexOf(quote));
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    values.set(match[1], value);
  }
  return values;
}

/**
 * Checks a VITE_API_URL value. Returns `{ isValid, problem, hasPath }` where
 * `problem` names the exact defect when the value is unusable.
 */
export function inspectApiUrl(apiUrl) {
  let parsedUrl;
  try {
    parsedUrl = new URL(apiUrl);
  } catch {
    return {
      isValid: false,
      problem: `"${apiUrl}" is not a URL (it needs a scheme and host, e.g. http://localhost:3000)`,
    };
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      isValid: false,
      problem: `"${apiUrl}" does not start with http:// or https://`,
    };
  }
  if (apiUrl.endsWith("/")) {
    return {
      isValid: false,
      problem: `"${apiUrl}" ends with a trailing slash, which doubles the slash in every API path`,
    };
  }
  return { isValid: true, hasPath: parsedUrl.pathname !== "/" };
}

/** Merges the env files Vite would load in dev, remembering which file set each key. */
function loadFrontendEnv() {
  const values = new Map();
  const sources = new Map();
  const presentFiles = [];
  for (const fileName of ENV_FILES) {
    const filePath = join(PROJECT_ROOT, fileName);
    if (!existsSync(filePath)) continue;
    presentFiles.push(fileName);
    for (const [key, value] of parseEnvText(readFileSync(filePath, "utf8"))) {
      values.set(key, value);
      sources.set(key, fileName);
    }
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("VITE_") && value !== undefined) {
      values.set(key, value);
      sources.set(key, "the shell environment");
    }
  }
  return { values, sources, presentFiles };
}

/** Where Playwright keeps browsers on this OS, honouring PLAYWRIGHT_BROWSERS_PATH. */
function playwrightCacheDirectory() {
  const overridePath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (overridePath && overridePath !== "0") return overridePath;
  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Caches", "ms-playwright");
  }
  if (process.platform === "win32") {
    return join(
      process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
      "ms-playwright",
    );
  }
  return join(
    process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"),
    "ms-playwright",
  );
}

/** The chromium-headless-shell revision the installed Playwright expects, if readable. */
function expectedHeadlessShellRevision() {
  try {
    const testPackageDirectory = realpathSync(
      join(PROJECT_ROOT, "node_modules", "@playwright", "test"),
    );
    const requireFromTest = createRequire(
      join(testPackageDirectory, "package.json"),
    );
    const requireFromPlaywright = createRequire(
      requireFromTest.resolve("playwright/package.json"),
    );
    const corePackagePath = requireFromPlaywright.resolve(
      "playwright-core/package.json",
    );
    const browsersManifest = JSON.parse(
      readFileSync(join(dirname(corePackagePath), "browsers.json"), "utf8"),
    );
    const headlessShell = browsersManifest.browsers.find(
      (browser) => browser.name === "chromium-headless-shell",
    );
    return headlessShell?.revision ?? null;
  } catch {
    return null;
  }
}

/** Resolves true when something accepts a TCP connection on localhost:port. */
function isPortAcceptingConnections(port) {
  return new Promise((resolvePromise) => {
    const socket = connect({ host: "localhost", port });
    const settle = (isOpen) => {
      socket.destroy();
      resolvePromise(isOpen);
    };
    socket.setTimeout(PORT_PROBE_TIMEOUT_MS, () => settle(false));
    socket.once("connect", () => settle(true));
    socket.once("error", () => settle(false));
  });
}

// ── Reporting ────────────────────────────────────────────────────────────────

const shouldUseColour = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const COLOUR_CODES = { ok: 32, warn: 33, fail: 31, info: 36, dim: 2 };

function paint(text, colourName) {
  return shouldUseColour
    ? `\u001b[${COLOUR_CODES[colourName]}m${text}\u001b[0m`
    : text;
}

const counts = { ok: 0, warn: 0, fail: 0, info: 0 };

function report(status, message, fix) {
  counts[status] += 1;
  console.log(`  ${paint(status.padEnd(4), status)}  ${message}`);
  if (fix) console.log(`        ${paint(`fix: ${fix}`, "dim")}`);
}

// ── Checks ───────────────────────────────────────────────────────────────────

function checkNode() {
  const nodeVersion = process.versions.node;
  if (compareVersions(nodeVersion, MINIMUM_NODE_VERSION) >= 0) {
    report("ok", `Node ${nodeVersion} (needs >= ${MINIMUM_NODE_VERSION})`);
    return;
  }
  report(
    "fail",
    `Node ${nodeVersion} found; this repo needs >= ${MINIMUM_NODE_VERSION}`,
    "nvm install (reads .nvmrc), or install Node 24 LTS from nodejs.org",
  );
}

function checkPnpm() {
  const pinnedVersion = readPinnedPnpmVersion() ?? "9.15.0";
  const pinnedMajor = parseVersion(pinnedVersion)[0];
  const detected = detectPnpmVersion();
  if (detected.errorReason) {
    report(
      "fail",
      `pnpm unavailable: ${detected.errorReason}`,
      `corepack enable (then pnpm resolves to the pinned pnpm@${pinnedVersion})`,
    );
    return;
  }
  if (parseVersion(detected.version)[0] !== pinnedMajor) {
    report(
      "fail",
      `pnpm ${detected.version} found; this repo pins pnpm@${pinnedVersion} (major ${pinnedMajor}) in package.json packageManager`,
      "corepack enable (corepack then runs the pinned version inside this repo)",
    );
    return;
  }
  report("ok", `pnpm ${detected.version} (pinned pnpm@${pinnedVersion})`);
}

function checkNodeModules() {
  const installMarker = join(PROJECT_ROOT, "node_modules", ".modules.yaml");
  if (!existsSync(installMarker)) {
    report(
      "fail",
      "node_modules is missing (dependencies were never installed here)",
      "pnpm install",
    );
    return;
  }
  const installedLockPath = join(
    PROJECT_ROOT,
    "node_modules",
    ".pnpm",
    "lock.yaml",
  );
  const lockfilePath = join(PROJECT_ROOT, "pnpm-lock.yaml");
  const isLockfileInSync =
    !existsSync(installedLockPath) ||
    !existsSync(lockfilePath) ||
    readFileSync(installedLockPath, "utf8") ===
      readFileSync(lockfilePath, "utf8");
  if (!isLockfileInSync) {
    report(
      "warn",
      "pnpm-lock.yaml changed since the last install (node_modules is out of date)",
      "pnpm install",
    );
    return;
  }
  report("ok", "node_modules installed and matches pnpm-lock.yaml");
}

/** Returns the resolved API URL when live mode can use it, otherwise null. */
function checkFrontendEnv(frontendEnv) {
  const { values, sources, presentFiles } = frontendEnv;
  const isDemoMode = values.get("VITE_DEMO") === "1";
  const apiUrl = values.get("VITE_API_URL") ?? "";

  if (presentFiles.length === 0) {
    report(
      isDemoMode ? "warn" : "fail",
      "no .env or .env.local in the frontend",
      "pnpm dev:setup (copies .env.example to .env), or cp .env.example .env",
    );
  } else {
    report("ok", `env files: ${presentFiles.join(", ")}`);
  }

  if (isDemoMode) {
    report(
      "info",
      apiUrl === ""
        ? `demo mode on (VITE_DEMO=1 from ${sources.get("VITE_DEMO")}): mock data, no backend`
        : `demo mode on (VITE_DEMO=1 from ${sources.get("VITE_DEMO")}): live by default, "Populate platform" toggles demo data`,
    );
  }

  if (apiUrl === "") {
    if (isDemoMode) return null;
    report(
      "fail",
      "VITE_API_URL is not set, and VITE_DEMO is not 1, so the app has neither a backend nor demo mode",
      "add VITE_API_URL=http://localhost:3000 to .env, or run VITE_DEMO=1 pnpm dev for UI work without a backend",
    );
    return null;
  }

  const inspection = inspectApiUrl(apiUrl);
  if (!inspection.isValid) {
    report(
      "fail",
      `VITE_API_URL in ${sources.get("VITE_API_URL")}: ${inspection.problem}`,
      "set it to the backend origin with no trailing slash, e.g. VITE_API_URL=http://localhost:3000",
    );
    return null;
  }
  if (inspection.hasPath) {
    report(
      "warn",
      `VITE_API_URL ${apiUrl} (from ${sources.get("VITE_API_URL")}) carries a path; the client expects a bare origin`,
      "drop the path, e.g. VITE_API_URL=http://localhost:3000",
    );
  } else {
    report(
      "ok",
      `VITE_API_URL ${apiUrl} (from ${sources.get("VITE_API_URL")})`,
    );
  }

  const klipyKey = values.get("VITE_KLIPY_KEY") ?? "";
  if (klipyKey === "") {
    report(
      "info",
      "VITE_KLIPY_KEY is empty: GIF search is off in live mode (demo uses a curated set)",
      "optional: a free key from https://klipy.com/developers in .env",
    );
  } else {
    report("ok", "VITE_KLIPY_KEY is set (GIF search on)");
  }
  return apiUrl;
}

async function checkBackendReachable(apiUrl) {
  const healthUrl = `${apiUrl}/health/live`;
  const isLocalBackend = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
    apiUrl,
  );
  try {
    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    if (response.ok) {
      report("ok", `backend answers at ${healthUrl}`);
    } else {
      report(
        "warn",
        `backend at ${healthUrl} answered HTTP ${response.status}`,
        "check the backend terminal for the startup error",
      );
    }
  } catch (error) {
    const reason =
      error.name === "TimeoutError"
        ? `no answer within ${BACKEND_TIMEOUT_MS / 1000}s`
        : (error.cause?.code ?? error.message);
    report(
      "warn",
      `backend unreachable at ${healthUrl} (${reason})`,
      isLocalBackend
        ? "start it with pnpm start:dev in ../queerpulse-backend"
        : `check that ${apiUrl} is up and reachable from this machine`,
    );
  }
}

function checkBackendCors() {
  if (!existsSync(BACKEND_ROOT)) {
    report(
      "info",
      "no ../queerpulse-backend checkout next to this repo",
      `${BACKEND_CLONE_COMMAND} (or VITE_DEMO=1 pnpm dev for UI work without a backend)`,
    );
    return;
  }
  const backendEnvPath = join(BACKEND_ROOT, ".env");
  if (!existsSync(backendEnvPath)) {
    report(
      "warn",
      "../queerpulse-backend has no .env, so the backend cannot boot",
      "run pnpm dev:setup in ../queerpulse-backend (or cp .env.example .env there)",
    );
    return;
  }
  // Only FRONTEND_URL is looked at; every other backend value stays unread.
  const frontendUrlLine = readFileSync(backendEnvPath, "utf8")
    .split(/\r?\n/)
    .find((line) => /^\s*(?:export\s+)?FRONTEND_URL\s*=/.test(line));
  const frontendUrl = frontendUrlLine
    ? (parseEnvText(frontendUrlLine).get("FRONTEND_URL") ?? "")
    : "";
  if (frontendUrl === "") {
    report(
      "warn",
      "FRONTEND_URL is not set in ../queerpulse-backend/.env, so CORS blocks the dev server",
      `set FRONTEND_URL=${DEV_SERVER_ORIGIN} in ../queerpulse-backend/.env`,
    );
    return;
  }
  const allowedOrigins = frontendUrl.split(",").map((origin) => origin.trim());
  if (allowedOrigins.includes(DEV_SERVER_ORIGIN)) {
    report("ok", `backend FRONTEND_URL allows ${DEV_SERVER_ORIGIN}`);
    return;
  }
  report(
    "warn",
    `backend FRONTEND_URL (${allowedOrigins.join(", ")}) does not include ${DEV_SERVER_ORIGIN}, so CORS blocks the dev server`,
    `add ${DEV_SERVER_ORIGIN} to FRONTEND_URL in ../queerpulse-backend/.env (comma-separated), then restart the backend`,
  );
}

function checkPlaywrightChromium() {
  const cacheDirectory = playwrightCacheDirectory();
  const installFix =
    "pnpm prerender:browser (needed by pnpm build's prerender and pnpm test:e2e)";
  let installedEntries = [];
  try {
    installedEntries = readdirSync(cacheDirectory);
  } catch {
    report(
      "warn",
      `Playwright Chromium not installed (no ${cacheDirectory})`,
      installFix,
    );
    return;
  }
  const expectedRevision = expectedHeadlessShellRevision();
  if (expectedRevision) {
    const expectedEntry = `chromium_headless_shell-${expectedRevision}`;
    if (installedEntries.includes(expectedEntry)) {
      report(
        "ok",
        `Playwright Chromium headless shell r${expectedRevision} installed`,
      );
    } else {
      report(
        "warn",
        `Playwright expects chromium headless shell r${expectedRevision}, which is not in ${cacheDirectory}`,
        installFix,
      );
    }
    return;
  }
  const hasAnyHeadlessShell = installedEntries.some((entry) =>
    entry.startsWith("chromium_headless_shell-"),
  );
  if (hasAnyHeadlessShell) {
    report(
      "ok",
      `Playwright Chromium headless shell found in ${cacheDirectory}`,
    );
  } else {
    report(
      "warn",
      `Playwright Chromium headless shell not found in ${cacheDirectory}`,
      installFix,
    );
  }
}

async function checkDevServerPort() {
  if (await isPortAcceptingConnections(DEV_SERVER_PORT)) {
    report(
      "info",
      `port ${DEV_SERVER_PORT} is in use (a dev server is probably running already); a second pnpm dev moves to the next free port, which the backend's CORS allowlist does not include`,
    );
  } else {
    report("ok", `port ${DEV_SERVER_PORT} is free for pnpm dev`);
  }
}

async function runDoctor() {
  console.log("QueerPulse frontend doctor (read-only)\n");
  checkNode();
  checkPnpm();
  checkNodeModules();
  const frontendEnv = loadFrontendEnv();
  const liveApiUrl = checkFrontendEnv(frontendEnv);
  if (liveApiUrl) await checkBackendReachable(liveApiUrl);
  checkBackendCors();
  checkPlaywrightChromium();
  await checkDevServerPort();

  console.log(
    `\n${counts.ok} ok, ${counts.warn} warn, ${counts.fail} fail, ${counts.info} info`,
  );
  return counts.fail > 0 ? 1 : 0;
}

const isRunDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isRunDirectly) {
  runDoctor().then(
    (exitCode) => {
      process.exitCode = exitCode;
    },
    (error) => {
      console.error(`dev-doctor crashed: ${error.stack ?? error.message}`);
      process.exitCode = 1;
    },
  );
}
