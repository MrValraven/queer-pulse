#!/usr/bin/env node
/**
 * Runs the build's INDEPENDENT front-half steps concurrently, fail-fast.
 *
 * The full pipeline (see package.json `build`) is:
 *   node scripts/build-gates.mjs && vite build && pnpm prerender
 * and the four steps below all (a) depend on nothing but the source tree and
 * (b) must finish before `vite build` / `pnpm prerender`. Running them serially
 * summed their wall times; running them together collapses that to the slowest.
 *
 * The steps:
 *   - lint:a11y          — the jsx-a11y ratchet gate (must pass before we build)
 *   - typecheck (tsc -b) — the type gate (must pass before we build)
 *   - sitemap            — writes public/sitemap.xml, which `vite build` copies
 *                          into dist/, so it has to land before the bundle
 *   - prerender:browser  — `playwright install chromium`. Idempotent and ~0s
 *                          when the browser is already cached, but on a COLD
 *                          CI/Vercel cache it downloads the ~100MB browser.
 *                          Front-loading it here overlaps that download with
 *                          the typecheck, lint and (next) vite build instead of
 *                          paying for it serially right before `pnpm prerender`.
 *
 * FAIL-FAST: the moment any step exits non-zero, the rest are killed and this
 * process exits 1 — a type error must not wait out a browser download, and a
 * failed gate must fail the build. If every step exits 0, so do we.
 *
 * Commands run through a shell so node_modules/.bin (put on PATH by pnpm) and
 * the `pnpm`/`tsc` binaries resolve the same way they would in package.json.
 */
import { spawn } from "node:child_process";
import { delimiter, resolve } from "node:path";

// Resolve project-local binaries (tsc, vite, playwright) regardless of how this
// script was launched. `pnpm run build` already puts node_modules/.bin on PATH,
// but prepending it ourselves means `node scripts/build-gates.mjs` works too.
const childEnv = {
  ...process.env,
  PATH: `${resolve("node_modules/.bin")}${delimiter}${process.env.PATH ?? ""}`,
};

const STEPS = [
  { name: "lint:a11y", command: "pnpm lint:a11y" },
  { name: "typecheck", command: "tsc -b" },
  { name: "sitemap", command: "pnpm sitemap" },
  { name: "browser", command: "pnpm prerender:browser" },
];

const children = new Map();
let settled = false;

/** Prefix every line of a step's output so concurrent logs stay legible. */
function pipePrefixed(stream, name, sink) {
  let buffer = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) sink.write(`[${name}] ${line}\n`);
  });
  stream.on("end", () => {
    if (buffer.length > 0) sink.write(`[${name}] ${buffer}\n`);
  });
}

function killOthers(exceptName) {
  for (const [name, child] of children) {
    if (name !== exceptName) child.kill("SIGTERM");
  }
}

function finish(code) {
  if (settled) return;
  settled = true;
  process.exit(code);
}

console.log(`[build-gates] running ${STEPS.length} steps in parallel…`);

for (const step of STEPS) {
  const child = spawn(step.command, { shell: true, env: childEnv });
  children.set(step.name, child);
  pipePrefixed(child.stdout, step.name, process.stdout);
  pipePrefixed(child.stderr, step.name, process.stderr);

  child.on("exit", (code, signal) => {
    children.delete(step.name);
    // A step we deliberately SIGTERM'd after another step already failed is
    // not itself a failure — the fail-fast path has already set the exit code.
    if (settled) return;
    if (code === 0) {
      console.log(`[build-gates] ✓ ${step.name}`);
      if (children.size === 0) {
        console.log("[build-gates] all steps passed");
        finish(0);
      }
      return;
    }
    console.error(
      `[build-gates] ✗ ${step.name} failed (${signal ? `signal ${signal}` : `exit ${code}`}) — aborting the rest`,
    );
    killOthers(step.name);
    finish(1);
  });

  child.on("error", (error) => {
    if (settled) return;
    console.error(`[build-gates] ✗ ${step.name} could not start: ${error.message}`);
    killOthers(step.name);
    finish(1);
  });
}
