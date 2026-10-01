/**
 * Render the QueerPulse launch film to MP4.
 *
 *   node scripts/launch-video/render.mjs [--fps 30] [--workers 3] [--from 0 --to 64.8]
 *
 * Steps: serve the repo root, open scene.html in Chromium, render the score
 * (score.js) to a WAV, then step every frame through `window.seek(t)` in a few
 * parallel pages, piping PNG screenshots into one ffmpeg per page. The
 * segments are joined and muxed with the audio at the end.
 *
 * `--score-only` stops after writing the WAV, for working on the music.
 * `--variant pop` renders the upbeat cut (scene-pop.html + score-pop.js) to
 * out/queerpulse-launch-pop.mp4; without it, the original cut renders.
 *
 * Needs ffmpeg with libx264 on PATH (or FFMPEG=/path/to/ffmpeg). CHROMIUM_PATH
 * points Playwright at a specific Chromium binary when its own isn't installed.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = join(HERE, "out");
const FFMPEG = process.env.FFMPEG || "ffmpeg";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce(
      (pairs, a, i, all) =>
        a.startsWith("--") ? [...pairs, [a.slice(2), all[i + 1]]] : pairs,
      [],
    ),
);
const FPS = Number(args.fps || 30);
// Each cut is a scene + score pair; the original is the unnamed default.
const VARIANT = args.variant || "";
const SUFFIX = VARIANT ? `-${VARIANT}` : "";
const WORKERS = Number(args.workers || 3);

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  try {
    const file = join(
      ROOT,
      decodeURIComponent(new URL(req.url, "http://x").pathname),
    );
    if (!file.startsWith(ROOT)) throw new Error("outside root");
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const SCENE = `http://127.0.0.1:${server.address().port}/scripts/launch-video/scene${SUFFIX}.html`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--autoplay-policy=no-user-gesture-required"],
});

async function openScene() {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => console.error("[scene]", e.message));
  await page.goto(SCENE);
  await page.evaluate(() => window.ready());
  return page;
}

function run(cmd, argv, stdin) {
  const child = spawn(cmd, argv, {
    stdio: [stdin ? "pipe" : "ignore", "ignore", "inherit"],
  });
  const done = new Promise((ok, fail) =>
    child.on("close", (code) =>
      code === 0 ? ok() : fail(new Error(`${cmd} exited ${code}`)),
    ),
  );
  return { child, done };
}

await mkdir(OUT, { recursive: true });

/* ── Score ── */
{
  const page = await openScene();
  await page.addScriptTag({ path: join(HERE, `score${SUFFIX}.js`) });
  const t0 = Date.now();
  const wav = await page.evaluate(() => window.renderScore());
  await writeFile(join(OUT, `score${SUFFIX}.wav`), Buffer.from(wav, "base64"));
  console.log(`score rendered in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await page.close();
}
if ("score-only" in args) {
  await browser.close();
  server.close();
  process.exit(0);
}

/* ── Picture ── */
const probe = await openScene();
const duration = await probe.evaluate(() => window.DURATION);
await probe.close();
const from = Number(args.from || 0);
const to = Math.min(Number(args.to || duration), duration);
const first = Math.round(from * FPS);
const total = Math.round(to * FPS) - first;
const per = Math.ceil(total / WORKERS);
let rendered = 0;
const started = Date.now();

const segments = await Promise.all(
  Array.from({ length: WORKERS }, async (_, w) => {
    const a = first + w * per;
    const b = Math.min(first + total, a + per);
    if (a >= b) return null;
    const file = join(OUT, `seg${SUFFIX}-${w}.mp4`);
    const { child, done } = run(
      FFMPEG,
      [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "image2pipe",
        "-framerate",
        String(FPS),
        "-c:v",
        "png",
        "-i",
        "-",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "16",
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "high",
        "-color_primaries",
        "bt709",
        "-color_trc",
        "bt709",
        "-colorspace",
        "bt709",
        file,
      ],
      true,
    );
    const page = await openScene();
    for (let f = a; f < b; f++) {
      await page.evaluate((t) => window.seek(t), f / FPS);
      const png = await page.screenshot({ type: "png" });
      if (!child.stdin.write(png))
        await new Promise((ok) => child.stdin.once("drain", ok));
      rendered++;
      if (rendered % 60 === 0) {
        const rate = rendered / ((Date.now() - started) / 1000);
        console.log(
          `${rendered}/${total} frames · ${rate.toFixed(1)} fps · ~${Math.round((total - rendered) / rate)}s left`,
        );
      }
    }
    child.stdin.end();
    await done;
    await page.close();
    return file;
  }),
);
await browser.close();
server.close();

/* ── Join + mux ── */
const list = join(OUT, `segments${SUFFIX}.txt`);
await writeFile(
  list,
  segments
    .filter(Boolean)
    .map((f) => `file '${f}'`)
    .join("\n"),
);
const name =
  from === 0 && to === duration
    ? `queerpulse-launch${SUFFIX}.mp4`
    : `queerpulse-launch${SUFFIX}-${from}-${to}.mp4`;
await run(FFMPEG, [
  "-y",
  "-loglevel",
  "error",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  list,
  "-ss",
  String(from),
  "-t",
  String(to - from),
  "-i",
  join(OUT, `score${SUFFIX}.wav`),
  "-map",
  "0:v",
  "-map",
  "1:a",
  "-c:v",
  "copy",
  "-c:a",
  "aac",
  "-b:a",
  "256k",
  "-movflags",
  "+faststart",
  "-shortest",
  join(OUT, name),
]).done;
console.log(
  `wrote ${join(OUT, name)} in ${Math.round((Date.now() - started) / 1000)}s`,
);
