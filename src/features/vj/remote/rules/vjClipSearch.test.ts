import { describe, expect, it } from "vitest";
import {
  VJ_SEARCH_MIN_CLIPS,
  filterVjClips,
  isVjSearchAvailable,
  normalizeVjSearch,
} from "./vjClipSearch";

interface TestClip {
  id: string;
  title: string;
  isFavorite: boolean;
}

const CLIPS: TestClip[] = [
  { id: "clip-1", title: "Coração Neon", isFavorite: false },
  { id: "clip-2", title: "Disco  Ball", isFavorite: true },
  { id: "clip-3", title: "CORACAO lento", isFavorite: true },
  { id: "clip-4", title: "Rainbow tunnel", isFavorite: false },
];

const ALL_CLIPS = { isFavoritesOnly: false };
const FAVORITES_ONLY = { isFavoritesOnly: true };

function idsOf(clips: readonly TestClip[]): string[] {
  return clips.map((clip) => clip.id);
}

describe("normalizeVjSearch", () => {
  it("strips accents, lowers case and collapses spaces", () => {
    expect(normalizeVjSearch("  Coração   NEON ")).toBe("coracao neon");
  });
});

describe("filterVjClips", () => {
  it("matches without accents or case", () => {
    expect(idsOf(filterVjClips(CLIPS, "coracao", ALL_CLIPS))).toEqual([
      "clip-1",
      "clip-3",
    ]);
    expect(idsOf(filterVjClips(CLIPS, "CORAÇÃO", ALL_CLIPS))).toEqual([
      "clip-1",
      "clip-3",
    ]);
  });

  it("matches every word of the query in any order", () => {
    expect(idsOf(filterVjClips(CLIPS, "ball disco", ALL_CLIPS))).toEqual([
      "clip-2",
    ]);
  });

  it("keeps pack order", () => {
    const reversedClips = [...CLIPS].reverse();
    expect(idsOf(filterVjClips(reversedClips, "o", ALL_CLIPS))).toEqual([
      "clip-4",
      "clip-3",
      "clip-2",
      "clip-1",
    ]);
  });

  it("favorites only drops the rest", () => {
    expect(idsOf(filterVjClips(CLIPS, "", FAVORITES_ONLY))).toEqual([
      "clip-2",
      "clip-3",
    ]);
    expect(idsOf(filterVjClips(CLIPS, "coracao", FAVORITES_ONLY))).toEqual([
      "clip-3",
    ]);
  });

  it("an empty query returns every clip", () => {
    expect(idsOf(filterVjClips(CLIPS, "", ALL_CLIPS))).toEqual(idsOf(CLIPS));
    expect(idsOf(filterVjClips(CLIPS, "   ", ALL_CLIPS))).toEqual(idsOf(CLIPS));
  });
});

describe("isVjSearchAvailable", () => {
  it("search shows at 25 clips and hides at 24", () => {
    expect(VJ_SEARCH_MIN_CLIPS).toBe(24);
    expect(isVjSearchAvailable(24)).toBe(false);
    expect(isVjSearchAvailable(25)).toBe(true);
  });
});
