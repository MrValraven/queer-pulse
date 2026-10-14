import type { StudioChapter, StudioStreamAnalysis } from "./studio.types";

/** The one owner demo track that measures loud, so the upload page's
 *  loudness note shows (Mariana's "Cidade dos santos", track 4). */
export const DEMO_LOUD_TRACK_ID = "demo-track-cidade-dos-santos-04";
export const DEMO_LOUD_TRACK_ANALYSIS: Pick<
  StudioStreamAnalysis,
  "loudnessLufs" | "peakDb"
> = { loudnessLufs: -7.8, peakDb: -0.1 };

/** LeChatDashinko's mix, long enough for chapters and the hour format. */
export const DEMO_MIX_RELEASE_ID = "demo-release-home-2";
export const DEMO_MIX_TRACK_ID = "demo-track-home-2-01";
export const DEMO_MIX_CLOCK = "1:04:12";

export const DEMO_MIX_CHAPTERS: StudioChapter[] = [
  { startSeconds: 0, title: "Lights up", artist: null },
  {
    startSeconds: 372,
    title: "Bicha, with love",
    artist: "Mateus F. & DJ Carrasco",
  },
  { startSeconds: 845, title: "Rua da Rosa", artist: "Rita Ferreira" },
  { startSeconds: 1290, title: "Second bottle", artist: null },
  {
    startSeconds: 1768,
    title: "Cantiga para a vizinha (edit)",
    artist: "Coro de Outubro",
  },
  { startSeconds: 2240, title: "Night bus", artist: "NIGHTFORM" },
  { startSeconds: 2815, title: "Salt water, slowly", artist: "NIGHTFORM" },
  { startSeconds: 3390, title: "The hour after", artist: null },
];

/** One time per line of DEMO_LYRICS split on "\n" (14 entries: twelve sung
 *  lines and the two blank lines between stanzas, which become gaps). The
 *  default track lasts 4:18. */
export const DEMO_SYNCED_LYRIC_TIMES_MS: readonly number[] = [
  12_000, 19_500, 27_000, 35_500, 44_000, 52_500, 61_000, 98_000, 107_000,
  116_500, 125_000, 133_000, 176_000, 186_000,
];
