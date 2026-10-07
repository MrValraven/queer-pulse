/**
 * Render a QueerPulse marketing film to MP4 from the command line.
 *
 *   node scripts/launch-video/render.mjs [--video pro] [--format portrait] [--fps 30] [--workers 3] [--from 0 --to 48]
 *   node scripts/launch-video/render.mjs --video all --score-only   (pnpm film-scores)
 *
 * The films live in public/marketing-videos/ (<id>.html + <id>.scene.js +
 * <id>.score.js), the same files the admin dashboard's Marketing videos page
 * previews and renders in the browser. This script is the headless path.
 *
 * Steps: serve the repo root, open the film in Chromium, render its score to a
 * WAV, then step every frame through `window.seek(t)` in a few parallel pages,
 * piping screenshots into one ffmpeg per page. The segments are joined and
 * muxed with the audio at the end.
 *
 * Every score render also writes the preview's pre-rendered score,
 * public/marketing-videos/<id>.score.<hash>.m4a (see scoreHash below), and
 * deletes that film's older ones. The dashboard's preview plays that file and
 * synthesises the score itself only when the file is missing or stale.
 *
 * `--video cinematic|upbeat|pro|vouch` picks the film (cinematic by default;
 * the old `--variant pop|pro` names still work). `--score-only` stops after the
 * score, and with it `--video all` refreshes every film's score in one run.
 *
 * `--format landscape|portrait` picks the picture's shape: landscape (the
 * default) is the 1920x1080 film, portrait the 1080x1350 (4:5) Instagram feed
 * post, for films that offer one (pro). The picture pages open with
 * `?format=portrait` and the output names gain `-portrait`; the score is the
 * same in every shape, so its pages and WAV stay format-free.
 *
 * Needs ffmpeg with libx264 on PATH (or FFMPEG=/path/to/ffmpeg) for the
 * picture. The score's AAC file uses that ffmpeg too, or macOS's afconvert
 * when ffmpeg is missing. CHROMIUM_PATH points Playwright at a specific
 * Chromium binary when its own isn't installed.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import {
  access,
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = join(HERE, "out");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const AFCONVERT = "/usr/bin/afconvert";

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
// Each film is an <id>.html + <id>.scene.js + <id>.score.js set in
// public/marketing-videos.
const ALL_VIDEOS = ["cinematic", "upbeat", "pro", "vouch"];
const LEGACY = { pop: "upbeat", pro: "pro" };
const VIDEO = args.video || LEGACY[args.variant] || "cinematic";
const IS_SCORE_ONLY = "score-only" in args;
if (VIDEO === "all" && !IS_SCORE_ONLY) {
  console.error("--video all renders scores only: add --score-only.");
  process.exit(1);
}
const FILMS = join(ROOT, "public/marketing-videos");
// The picture's shape; each film's page reads it from `?format=`.
const FORMATS = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1350 },
};
const FORMAT = args.format || "landscape";
if (!Object.hasOwn(FORMATS, FORMAT)) {
  console.error(`--format ${FORMAT}: use landscape or portrait.`);
  process.exit(1);
}
const IS_PORTRAIT = FORMAT === "portrait";
const SUFFIX = `-${VIDEO}`;
// Picture outputs (segments, list, final file) name the shape; the score's
// WAV keeps SUFFIX alone, since every shape shares one score.
const PICTURE_SUFFIX = IS_PORTRAIT ? `${SUFFIX}-portrait` : SUFFIX;
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
const sceneUrl = (video, format = "landscape") =>
  `http://127.0.0.1:${server.address().port}/public/marketing-videos/${video}.html${
    format === "landscape" ? "" : `?format=${format}`
  }`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--autoplay-policy=no-user-gesture-required"],
});

/** The film's page; picture pages pass FORMAT, score pages keep the default. */
async function openScene(video = VIDEO, format = "landscape") {
  const page = await browser.newPage({
    viewport: FORMATS[format],
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => console.error("[scene]", e.message));
  await page.goto(sceneUrl(video, format));
  await page.evaluate(() => window.ready());
  return page;
}

/**
 * Stops the run when the film on `page` did not lay itself out in FORMAT. A
 * film without the asked-for shape ignores `?format=` and would render
 * 1920x1080 into the wrong frame. window.FORMAT says what it laid out; films
 * older than it only have the landscape shape.
 */
async function exitUnlessFormat(page) {
  const reported = await page.evaluate(() => window.FORMAT || null);
  const expected = FORMATS[FORMAT];
  const isWrongShape = reported
    ? reported.width !== expected.width || reported.height !== expected.height
    : IS_PORTRAIT;
  if (!isWrongShape) return;
  console.error(
    `${VIDEO} has no ${FORMAT} layout (window.FORMAT is ${JSON.stringify(reported)}).`,
  );
  await browser.close();
  server.close();
  process.exit(1);
}

// Check the shape before the score: a film without it must stop before the
// score render rewrites its .m4a files.
if (FORMAT !== "landscape" && !IS_SCORE_ONLY) {
  const formatProbe = await openScene(VIDEO, FORMAT);
  await exitUnlessFormat(formatProbe);
  await formatProbe.close();
}

function run(cmd, argv, stdin) {
  const child = spawn(cmd, argv, {
    stdio: [stdin ? "pipe" : "ignore", "ignore", "inherit"],
  });
  const done = new Promise((ok, fail) => {
    // A command that is not installed emits "error" (ENOENT).
    child.on("error", fail);
    child.on("close", (code) =>
      code === 0 ? ok() : fail(new Error(`${cmd} exited ${code}`)),
    );
  });
  return { child, done };
}

await mkdir(OUT, { recursive: true });

/* ── Score ── */

/**
 * The content hash in a pre-rendered score's file name: the first 12 hex
 * characters of SHA-256 over the exact bytes of <id>.score.js followed by the
 * exact bytes of <id>.scene.js. The score reads window.CUES, which the scene
 * defines, so editing either file changes the hash and the preview falls back
 * to synthesising until the file is rendered again. The preview computes the
 * same recipe in src/features/admin/marketingVideos/render/previewScore.ts
 * (scoreHash); keep the two identical.
 */
async function scoreHash(video) {
  const hash = createHash("sha256");
  hash.update(await readFile(join(FILMS, `${video}.score.js`)));
  hash.update(await readFile(join(FILMS, `${video}.scene.js`)));
  return hash.digest("hex").slice(0, 12);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function ffmpegRuns() {
  try {
    await run(FFMPEG, ["-version"]).done;
    return true;
  } catch {
    return false;
  }
}

/** Encodes the score WAV to AAC in an MP4 container (.m4a), 192 kbps. */
async function encodeScore(wavFile, m4aFile) {
  if (await ffmpegRuns()) {
    await run(FFMPEG, [
      "-y",
      "-loglevel",
      "error",
      "-i",
      wavFile,
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      m4aFile,
    ]).done;
    return "ffmpeg";
  }
  if (await exists(AFCONVERT)) {
    await run(AFCONVERT, [
      "-f",
      "m4af",
      "-d",
      "aac",
      "-b",
      "192000",
      wavFile,
      m4aFile,
    ]).done;
    return "afconvert";
  }
  throw new Error(
    `Encoding the score needs ffmpeg (on PATH or FFMPEG=/path/to/ffmpeg) or macOS's ${AFCONVERT}; found neither.`,
  );
}

async function renderScore(video) {
  const page = await openScene(video);
  await page.addScriptTag({ path: join(FILMS, `${video}.score.js`) });
  const t0 = Date.now();
  const wav = await page.evaluate(() => window.renderScore());
  const wavFile = join(OUT, `score-${video}.wav`);
  await writeFile(wavFile, Buffer.from(wav, "base64"));
  console.log(
    `${video}: score rendered in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
  await page.close();

  const fileName = `${video}.score.${await scoreHash(video)}.m4a`;
  const m4aFile = join(FILMS, fileName);
  const encoder = await encodeScore(wavFile, m4aFile);
  // Only the current hash ships: older files are stale by definition.
  for (const other of await readdir(FILMS)) {
    if (
      other !== fileName &&
      other.startsWith(`${video}.score.`) &&
      other.endsWith(".m4a")
    ) {
      await unlink(join(FILMS, other));
      console.log(`${video}: removed ${other}`);
    }
  }
  console.log(`${video}: wrote ${relative(ROOT, m4aFile)} with ${encoder}`);
}

for (const video of VIDEO === "all" ? ALL_VIDEOS : [VIDEO]) {
  await renderScore(video);
}
if (IS_SCORE_ONLY) {
  await browser.close();
  server.close();
  process.exit(0);
}

/* ── Picture ── */
const probe = await openScene(VIDEO, FORMAT);
// The landscape shape is checked here; other shapes passed the same check
// before the score.
await exitUnlessFormat(probe);
const duration = await probe.evaluate(() => window.DURATION);
// A scene full of grain or soft gradients can ask for JPEG frames: PNG
// encoding of noise is what makes such a render crawl.
const capture = await probe.evaluate(() => window.CAPTURE || "png");
const shot =
  capture === "jpeg" ? { type: "jpeg", quality: 95 } : { type: "png" };
// Motion blur: a scene with fast camera moves can ask for several sub-frames
// per frame. They are spread over half a frame (a 180° shutter) and ffmpeg
// averages them, so a whip pan smears the way it does on film.
const shutter = Math.max(
  1,
  Math.round(await probe.evaluate(() => window.SHUTTER || 1)),
);
const blur =
  shutter > 1
    ? [
        "-vf",
        `tmix=frames=${shutter},select=not(mod(n+1\\,${shutter})),setpts=N/(${FPS}*TB)`,
        "-r",
        String(FPS),
      ]
    : [];
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
    const file = join(OUT, `seg${PICTURE_SUFFIX}-${w}.mp4`);
    const { child, done } = run(
      FFMPEG,
      [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "image2pipe",
        "-framerate",
        String(FPS * shutter),
        "-c:v",
        capture === "jpeg" ? "mjpeg" : "png",
        "-i",
        "-",
        ...blur,
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
    const page = await openScene(VIDEO, FORMAT);
    for (let f = a; f < b; f++) {
      for (let k = 0; k < shutter; k++) {
        const off = shutter > 1 ? ((k + 0.5) / shutter - 0.5) * 0.5 : 0;
        const t = Math.max(0, (f + off) / FPS);
        await page.evaluate((t) => window.seek(t), t);
        const frame = await page.screenshot(shot);
        if (!child.stdin.write(frame))
          await new Promise((ok) => child.stdin.once("drain", ok));
      }
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
const list = join(OUT, `segments${PICTURE_SUFFIX}.txt`);
await writeFile(
  list,
  segments
    .filter(Boolean)
    .map((f) => `file '${f}'`)
    .join("\n"),
);
const name =
  from === 0 && to === duration
    ? `queerpulse${PICTURE_SUFFIX}.mp4`
    : `queerpulse${PICTURE_SUFFIX}-${from}-${to}.mp4`;
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
