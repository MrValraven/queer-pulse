import type { GifResult } from "../../shared/api/gifs";

// Curated demo-mode GIF picker fallback. Used ONLY when demoMode is true (the
// live hook calls the real `gifProvider` — KLIPY — instead), so it needs no API
// key. URLs are real, verified-200 GIF CDN links; keep every url/previewUrl
// pointing at a working GIF — re-verify with `curl -sI <url> | head -1` before
// changing any entry.
//
// NOTE: these currently resolve via Tenor's media CDN, which still serves files
// even though the Tenor *API* is decommissioned — but it is at risk. When a
// KLIPY key is in place, prefer re-pointing these at KLIPY's CDN.
export const DEMO_GIFS: GifResult[] = [
  {
    id: "bravo-gif",
    description: "Bravo! Big round of applause",
    attachment: {
      url: "https://media.tenor.com/dk14TWjRq5AAAAAC/bravo-gif.gif",
      previewUrl: "https://media.tenor.com/dk14TWjRq5AAAAAc/bravo-gif.gif",
      width: 460,
      height: 498,
      provider: "klipy",
    },
  },
  {
    id: "clap-cat",
    description: "Cheerful cat clapping along",
    attachment: {
      url: "https://media.tenor.com/LFTQsK7LzBsAAAAC/clap-cat.gif",
      previewUrl: "https://media.tenor.com/LFTQsK7LzBsAAAAc/clap-cat.gif",
      width: 498,
      height: 498,
      provider: "klipy",
    },
  },
  {
    id: "excellent-clap-emoji",
    description: "Excellent! Approving clap emoji",
    attachment: {
      url: "https://media.tenor.com/fJp9FfbUQjoAAAAC/excellent-clap-emoji.gif",
      previewUrl: "https://media.tenor.com/fJp9FfbUQjoAAAAc/excellent-clap-emoji.gif",
      width: 369,
      height: 498,
      provider: "klipy",
    },
  },
  {
    id: "moti-hearts",
    description: "Sending love, hearts floating up",
    attachment: {
      url: "https://media.tenor.com/HfnJ0BMGqzcAAAAC/moti-hearts.gif",
      previewUrl: "https://media.tenor.com/HfnJ0BMGqzcAAAAc/moti-hearts.gif",
      width: 498,
      height: 376,
      provider: "klipy",
    },
  },
  {
    id: "pride",
    description: "Rainbow pride celebration",
    attachment: {
      url: "https://media.tenor.com/vv2kizE0NukAAAAC/pride.gif",
      previewUrl: "https://media.tenor.com/vv2kizE0NukAAAAc/pride.gif",
      width: 200,
      height: 356,
      provider: "klipy",
    },
  },
  {
    id: "cat-thumbs-up",
    description: "Cute cat giving a thumbs up",
    attachment: {
      url: "https://media.tenor.com/TsVXIAMBZXoAAAAC/cat-thumbs-up-thumbs-up.gif",
      previewUrl: "https://media.tenor.com/TsVXIAMBZXoAAAAc/cat-thumbs-up-thumbs-up.gif",
      width: 256,
      height: 240,
      provider: "klipy",
    },
  },
  {
    id: "hug",
    description: "Warm, comforting hug",
    attachment: {
      url: "https://media.tenor.com/aN5FmNADcYwAAAAC/hug.gif",
      previewUrl: "https://media.tenor.com/aN5FmNADcYwAAAAc/hug.gif",
      width: 446,
      height: 498,
      provider: "klipy",
    },
  },
  {
    id: "happy-dance",
    description: "Happy dancing celebration",
    attachment: {
      url: "https://media.tenor.com/ApaFfYh1hykAAAAC/bubu-dudu.gif",
      previewUrl: "https://media.tenor.com/ApaFfYh1hykAAAAc/bubu-dudu.gif",
      width: 457,
      height: 498,
      provider: "klipy",
    },
  },
  {
    id: "welcome",
    description: "Friendly welcome greeting",
    attachment: {
      url: "https://media.tenor.com/CevVS229lNoAAAAC/welcome-youre-welcome.gif",
      previewUrl: "https://media.tenor.com/CevVS229lNoAAAAc/welcome-youre-welcome.gif",
      width: 480,
      height: 340,
      provider: "klipy",
    },
  },
  {
    id: "high-five",
    description: "Enthusiastic high five",
    attachment: {
      url: "https://media.tenor.com/8_pmUi5_kD4AAAAC/high-five.gif",
      previewUrl: "https://media.tenor.com/8_pmUi5_kD4AAAAc/high-five.gif",
      width: 498,
      height: 401,
      provider: "klipy",
    },
  },
  {
    id: "confetti",
    description: "Confetti celebration burst",
    attachment: {
      url: "https://media.tenor.com/h0UpXlWwCXIAAAAC/confetti.gif",
      previewUrl: "https://media.tenor.com/h0UpXlWwCXIAAAAc/confetti.gif",
      width: 280,
      height: 498,
      provider: "klipy",
    },
  },
  {
    id: "congratulations",
    description: "Congratulations celebration",
    attachment: {
      url: "https://media.tenor.com/Ry5ZE__yV-4AAAAC/congratulations.gif",
      previewUrl: "https://media.tenor.com/Ry5ZE__yV-4AAAAc/congratulations.gif",
      width: 498,
      height: 371,
      provider: "klipy",
    },
  },
];
