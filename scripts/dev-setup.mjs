#!/usr/bin/env node
/**
 * `pnpm dev:setup`: one-command onboarding for a fresh frontend checkout.
 *
 *   1. Node >= 22.11 and pnpm major 9 (the version pinned in packageManager)
 *   2. pnpm install
 *   3. .env from .env.example when missing (an existing .env is never touched)
 *   4. Playwright Chromium, only with --browsers
 *   5. where the backend checkout is, or how to get one
 *   6. pnpm dev:doctor, then the next steps
 *
 * Idempotent: a second run reinstalls nothing new, leaves .env alone and only
 * re-reports. `--dry-run` prints every action without taking it; the only
 * subprocesses it starts are read-only probes (`pnpm --version` and the doctor).
 *
 * Node built-ins only, so it runs on a checkout that has never been installed.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BACKEND_CLONE_COMMAND,
  BACKEND_ROOT,
  DEV_SERVER_ORIGIN,
  MINIMUM_NODE_VERSION,
  PROJECT_ROOT,
  compareVersions,
  detectPnpmVersion,
  parseEnvText,
  parseVersion,
  readPinnedPnpmVersion,
} from "./dev-doctor.mjs";

const HELP_TEXT = `Usage: pnpm dev:setup [--dry-run] [--browsers] [--help]

Sets up the QueerPulse frontend for local development: checks Node and pnpm,
installs dependencies, creates .env from .env.example when it is missing,
reports on the backend checkout, then runs pnpm dev:doctor.

Options:
  --dry-run   print every action without taking it (no install, no file writes)
  --browsers  also install Playwright Chromium (pnpm prerender:browser), which
              pnpm build's prerender step and pnpm test:e2e need
  --help      show this message
`;

const KNOWN_FLAGS = new Set(["--dry-run", "--browsers", "--help", "-h"]);
const commandLineFlags = process.argv.slice(2);
const unknownFlags = commandLineFlags.filter((flag) => !KNOWN_FLAGS.has(flag));
if (unknownFlags.length > 0) {
  console.error(
    `dev-setup: unknown option ${unknownFlags.join(", ")}. Known options: --dry-run, --browsers, --help`,
  );
  process.exit(2);
}
if (commandLineFlags.includes("--help") || commandLineFlags.includes("-h")) {
  process.stdout.write(HELP_TEXT);
  process.exit(0);
}

const isDryRun = commandLineFlags.includes("--dry-run");
const shouldInstallBrowsers = commandLineFlags.includes("--browsers");

function heading(stepNumber, title) {
  console.log(`\n[dev-setup] ${stepNumber}/6 ${title}`);
}

function note(message) {
  console.log(`  ${message}`);
}

/** Runs `pnpm <args>` with inherited stdio; exits the setup when it fails. */
function runPnpm(pnpmArguments) {
  const commandText = `pnpm ${pnpmArguments.join(" ")}`;
  if (isDryRun) {
    note(`would run: ${commandText}`);
    return;
  }
  note(`running: ${commandText}`);
  const result = spawnSync("pnpm", pnpmArguments, {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) {
    console.error(
      `[dev-setup] ${commandText} could not start: ${result.error.message}`,
    );
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(
      `[dev-setup] ${commandText} failed (${result.signal ? `signal ${result.signal}` : `exit ${result.status}`}); fix the error above and run pnpm dev:setup again`,
    );
    process.exit(1);
  }
}

function checkToolVersions() {
  heading(1, "Node and pnpm");
  const nodeVersion = process.versions.node;
  if (compareVersions(nodeVersion, MINIMUM_NODE_VERSION) < 0) {
    console.error(
      `[dev-setup] Node ${nodeVersion} found; this repo needs >= ${MINIMUM_NODE_VERSION}. Run nvm install (reads .nvmrc) or install Node 22 LTS, then corepack enable.`,
    );
    process.exit(1);
  }
  note(`Node ${nodeVersion} (needs >= ${MINIMUM_NODE_VERSION})`);

  const pinnedVersion = readPinnedPnpmVersion() ?? "9.15.0";
  const pinnedMajor = parseVersion(pinnedVersion)[0];
  const detected = detectPnpmVersion();
  if (detected.errorReason) {
    console.error(
      `[dev-setup] pnpm unavailable: ${detected.errorReason}. This repo needs pnpm@${pinnedVersion}; run corepack enable and try again.`,
    );
    process.exit(1);
  }
  if (parseVersion(detected.version)[0] !== pinnedMajor) {
    console.error(
      `[dev-setup] pnpm ${detected.version} found; this repo pins pnpm@${pinnedVersion} (major ${pinnedMajor}). Run corepack enable so the pinned version runs inside this repo, then try again.`,
    );
    process.exit(1);
  }
  note(`pnpm ${detected.version} (pinned pnpm@${pinnedVersion})`);
}

function prepareEnvFile() {
  heading(3, ".env");
  const envPath = join(PROJECT_ROOT, ".env");
  const examplePath = join(PROJECT_ROOT, ".env.example");
  if (!existsSync(envPath)) {
    if (!existsSync(examplePath)) {
      console.error(
        "[dev-setup] .env.example is missing from the repo root, so there is no template to copy into .env",
      );
      process.exit(1);
    }
    if (isDryRun) {
      note(
        "would copy .env.example to .env (VITE_API_URL=http://localhost:3000)",
      );
    } else {
      copyFileSync(examplePath, envPath);
      note(
        "created .env from .env.example (VITE_API_URL=http://localhost:3000)",
      );
    }
    return;
  }

  note(".env already exists; leaving it unchanged");
  const envValues = parseEnvText(readFileSync(envPath, "utf8"));
  const apiUrl = envValues.get("VITE_API_URL") ?? "";
  if (apiUrl === "") {
    note(
      "note: .env has no VITE_API_URL. Add VITE_API_URL=http://localhost:3000 for live mode (or set it in .env.local)",
    );
  } else if (apiUrl.endsWith("/")) {
    note(
      `note: VITE_API_URL in .env ends with a trailing slash (${apiUrl}); remove it, e.g. http://localhost:3000`,
    );
  }
}

function prepareBrowsers() {
  heading(4, "Playwright Chromium");
  if (shouldInstallBrowsers) {
    runPnpm(["prerender:browser"]);
    return;
  }
  note(
    "skipped: pnpm build's prerender and pnpm test:e2e need it; install with pnpm prerender:browser (or rerun with --browsers)",
  );
}

function reportBackend() {
  heading(5, "Backend");
  if (existsSync(BACKEND_ROOT)) {
    note(`found ../queerpulse-backend (${BACKEND_ROOT})`);
    note(
      "set it up with pnpm dev:setup inside that folder, then pnpm start:dev",
    );
    return;
  }
  note("no ../queerpulse-backend checkout next to this repo. Clone it with:");
  note(`  ${BACKEND_CLONE_COMMAND}`);
  note("for UI work without a backend, run demo mode: VITE_DEMO=1 pnpm dev");
}

function runDoctor() {
  heading(6, "Doctor (read-only)");
  const result = spawnSync(
    process.execPath,
    [join(PROJECT_ROOT, "scripts", "dev-doctor.mjs")],
    { cwd: PROJECT_ROOT, stdio: "inherit" },
  );
  if (result.error) {
    console.error(
      `[dev-setup] the doctor could not start: ${result.error.message}`,
    );
    return 1;
  }
  return result.status ?? 1;
}

function printNextSteps(doctorExitCode) {
  console.log("\n[dev-setup] Next steps");
  if (doctorExitCode !== 0) {
    note("fix the doctor's fail lines above first (pnpm dev:doctor rechecks)");
  }
  const nextSteps = [
    ["pnpm dev", `start the app at ${DEV_SERVER_ORIGIN}`],
    [
      "sign in",
      "admin@example.com, then the 6-digit code from the backend terminal log (needs EMAIL_CODE_DEV_LOG=true in the backend .env)",
    ],
    [
      "pnpm verify",
      "lint, typecheck, a11y, tokens, css-scale and tests before handing work over",
    ],
  ];
  for (const [label, description] of nextSteps) {
    note(`${label.padEnd(12)} ${description}`);
  }
}

if (isDryRun) {
  console.log("[dev-setup] dry run: printing actions only, changing nothing");
}
checkToolVersions();
heading(2, "Dependencies");
runPnpm(["install"]);
prepareEnvFile();
prepareBrowsers();
reportBackend();
const doctorExitCode = runDoctor();
printNextSteps(doctorExitCode);
process.exitCode = doctorExitCode === 0 ? 0 : 1;
