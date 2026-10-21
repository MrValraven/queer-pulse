import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setDemoModeRuntime } from "../../../shared/api/demoModeRuntime";
import {
  STUDIO_LYRIC_MAX_LINE_INDEX,
  findStudioLink,
  parseStudioLink,
  studioLinkPath,
  studioLyricTarget,
  textWithoutStudioLink,
} from "./studioLinkTarget";

/**
 * Lyric links (PRD-13) read the same in both link readers. The backend
 * (`queerpulse-backend/src/studio/studio-share-link.ts`) reads
 * `/studio/track?id&t&line` as a track with `lineIndex` and builds the
 * canonical path below; the frontend names the same link its `lyric` kind.
 * The backend spec's "lyric link parity rows" block holds this same table,
 * row for row: the query typed after the track id, the line and start both
 * sides read, and the canonical path both sides build. A null line is a
 * `line` neither side accepts, so the link stays a track link. Change a row
 * here and there together.
 */
const TRACK_ID = "0f8a3c2e-5b1d-4e6f-9a7b-1c2d3e4f5a6b";
const TRACK_URL = `https://queerpulse.com/studio/track?id=${TRACK_ID}`;

interface ParityRow {
  query: string;
  lineIndex: number | null;
  startAtSeconds: number | null;
  path: string;
}

const PARITY_ROWS: readonly ParityRow[] = [
  {
    query: "&line=7&t=42",
    lineIndex: 7,
    startAtSeconds: 42,
    path: "&t=42&line=7",
  },
  { query: "&line=0", lineIndex: 0, startAtSeconds: null, path: "&line=0" },
  {
    query: "&t=5&line=499",
    lineIndex: 499,
    startAtSeconds: 5,
    path: "&t=5&line=499",
  },
  { query: "&line=007", lineIndex: 7, startAtSeconds: null, path: "&line=7" },
  {
    query: "&line=3&line=5",
    lineIndex: 3,
    startAtSeconds: null,
    path: "&line=3",
  },
  { query: "&t=5&line=500", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
  { query: "&t=5&line=1000", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
  { query: "&t=5&line=-1", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
  { query: "&t=5&line=1.5", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
  { query: "&t=5&line=abc", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
  { query: "&t=5&line=", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
  { query: "&t=5&line=+3", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
  { query: "&t=5&line=1e2", lineIndex: null, startAtSeconds: 5, path: "&t=5" },
];

beforeEach(() => setDemoModeRuntime(false));
afterEach(() => setDemoModeRuntime(false));

describe("lyric link parity with the backend reader", () => {
  it("caps the line where the backend does", () => {
    expect(STUDIO_LYRIC_MAX_LINE_INDEX).toBe(499);
  });

  it.each(PARITY_ROWS)(
    "reads $query as the backend does",
    ({ query, lineIndex, startAtSeconds, path }) => {
      const target = parseStudioLink(`${TRACK_URL}${query}`);
      expect(target).not.toBeNull();
      if (!target) return;
      expect(target.kind).toBe(lineIndex === null ? "track" : "lyric");
      expect(target.id).toBe(TRACK_ID);
      expect(target.startAtSeconds).toBe(startAtSeconds);
      expect(target.lineIndex ?? null).toBe(lineIndex);
      expect(studioLinkPath(target)).toBe(
        `/studio/track?id=${TRACK_ID}${path}`,
      );
    },
  );

  it("ignores line on a release link, as the backend does", () => {
    const target = parseStudioLink(
      `https://queerpulse.com/studio/album?id=${TRACK_ID}&line=3`,
    );
    expect(target).toEqual({
      kind: "release",
      id: TRACK_ID,
      startAtSeconds: null,
    });
    expect(target && studioLinkPath(target)).toBe(
      `/studio/album?id=${TRACK_ID}`,
    );
  });

  it("takes a lyric link out of a note as the backend does", () => {
    const body = `this line (${TRACK_URL}&t=42&line=7) tonight`;
    const match = findStudioLink(body);
    expect(match?.url).toBe(`${TRACK_URL}&t=42&line=7`);
    expect(match && textWithoutStudioLink(body, match)).toBe(
      "this line tonight",
    );
  });
});

describe("studioLyricTarget", () => {
  it("starts the link at the line's whole second and round-trips", () => {
    const target = studioLyricTarget(TRACK_ID, 12, 83_750);
    expect(target).toEqual({
      kind: "lyric",
      id: TRACK_ID,
      startAtSeconds: 83,
      lineIndex: 12,
    });
    expect(studioLinkPath(target)).toBe(
      `/studio/track?id=${TRACK_ID}&t=83&line=12`,
    );
    expect(parseStudioLink(studioLinkPath(target))).toEqual(target);
  });

  it("carries the index only, never the words", () => {
    const path = studioLinkPath(studioLyricTarget(TRACK_ID, 3, 9_000));
    const parameterNames = [
      ...new URL(path, "https://queerpulse.com").searchParams.keys(),
    ];
    expect(parameterNames).toEqual(["id", "t", "line"]);
  });
});
